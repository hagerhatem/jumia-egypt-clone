// src/app/auth/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { NotificationComponent } from '../../shared/notification/notification.component';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
    FB: {
      login: (callback: (response: FacebookLoginResponse) => void, options: FacebookLoginOptions) => void;
      api: (path: string, params: object, callback: (response: FacebookUserData) => void) => void;
    };
  }
}

interface FacebookLoginResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
  };
  status?: string;
}

interface FacebookLoginOptions {
  scope: string;
}

interface FacebookUserData {
  email: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, NotificationComponent]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '/';
  showPassword = false;
  
  // Error handling properties
  errorDetails: {
    message: string;
    type?: 'credentials' | 'server' | 'network' | 'external';
  } | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated() && !this.authService.isTokenExpired()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorDetails = null;

    if (this.loginForm.invalid) return;

    this.loading = true;
    
    this.authService.login({
      email: this.f['email'].value.trim().toLowerCase(),
      password: this.f['password'].value
    }).pipe(first()).subscribe({
      next: (response) => {
        if(response.data.userType.toLowerCase()=="customer"){

          this.router.navigate([this.returnUrl]);
        } else if(response.data.userType.toLowerCase()=="admin"){
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/seller/manage-products'])
        }
      },
      error: (error: Error) => {
        this.handleLoginError(error);
        this.loginForm.get('password')?.reset();
        this.loading = false;
      }
    });
  }
  private handleLoginError(error: Error): void {
    const errorMessage = error.message.toLowerCase();
    
    this.errorDetails = {
      message: 'An error occurred during login',
      type: 'server'
    };
  
    // Specific error messages
    if (errorMessage.includes('invalid email')) {
      this.errorDetails.message = 'This email is not registered. Please check your email address.';
      this.errorDetails.type = 'credentials';
      this.loginForm.get('email')?.setErrors({ emailNotFound: true });
    } 
    else if (errorMessage.includes('incorrect password')) {
      this.errorDetails.message = 'The password you entered is incorrect. Please try again.';
      this.errorDetails.type = 'credentials';
      this.loginForm.get('password')?.setErrors({ invalidPassword: true });
    }
    else if (errorMessage.includes('credentials')) {
      this.errorDetails.message = 'Invalid email or password ';
      this.errorDetails.type = 'credentials';
    }
    else if (errorMessage.includes('network')) {
      this.errorDetails.message = 'Unable to connect. Please check your internet connection.';
      this.errorDetails.type = 'network';
    }
  
    setTimeout(() => this.errorDetails = null, 5000);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password');
    if (passwordField) {
      passwordField.setAttribute('type', this.showPassword ? 'text' : 'password');
    }
  }

  handleGoogleLogin(): void {
    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleGoogleCallback.bind(this)
    });
    window.google.accounts.id.prompt();
  }

  handleFacebookLogin(): void {
    window.FB.login((response: FacebookLoginResponse) => {
      if (response.authResponse?.accessToken) {
        window.FB.api('/me', { fields: 'email,name,picture' }, (userData: FacebookUserData) => {
          if (!userData || !userData.email) {
            this.handleSocialError(new Error('Failed to get user data from Facebook'), 'Facebook');
            return;
          }

          const nameParts = userData.name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          this.authService.externalAuth('FACEBOOK', response.authResponse!.accessToken, {
            email: userData.email,
            name: userData.name,
            firstName: firstName,
            lastName: lastName,
            photoUrl: userData.picture?.data?.url,
            userType: 'Customer'
          }, false)
          .pipe(first())
          .subscribe({
            next: () => this.router.navigate(['/']),
            error: error => this.handleSocialError(error, 'Facebook')
          });
        });
      } else {
        this.handleSocialError(new Error('Facebook login failed'), 'Facebook');
      }
    }, { scope: 'email,public_profile' });
  }

  private handleGoogleCallback(response: any): void {
    try {
      const payload = this.decodeJwtResponse(response.credential);
      const nameParts = payload.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      this.authService.externalAuth('GOOGLE', response.credential, {
        email: payload.email,
        name: payload.name,
        firstName: firstName,
        lastName: lastName,
        photoUrl: payload.picture,
        userType: 'Customer'
      }, true)
      .pipe(first())
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: error => this.handleSocialError(error, 'Google')
      });
    } catch (e) {
      this.handleSocialError(new Error('Invalid Google response'), 'Google');
    }
  }

  private decodeJwtResponse(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  private handleSocialError(error: Error, provider: string): void {
    console.error(`${provider} login error:`, error);
    this.errorDetails = {
      message: this.getSocialErrorMessage(error, provider),
      type: 'external'
    };
    this.loading = false;
    setTimeout(() => this.errorDetails = null, 5000);
  }

  private getSocialErrorMessage(error: Error, provider: string): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('email')) {
      return `Email permission required for ${provider} login`;
    }
    if (message.includes('popup closed')) {
      return `${provider} login was canceled`;
    }
    if (message.includes('account exists')) {
      return `Account already exists. Use email login instead.`;
    }
    return `Login failed: ${error.message}`;
  }

  getNotificationType(): 'error' | 'warning' | 'info' {
    switch(this.errorDetails?.type) {
      case 'credentials': return 'warning';
      case 'network': return 'info';
      default: return 'error';
    }
  }

  clearError(): void {
    this.errorDetails = null;
  }
}