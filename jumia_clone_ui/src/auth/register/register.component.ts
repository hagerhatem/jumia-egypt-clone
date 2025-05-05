// src/app/auth/register/register.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule,NotificationComponent]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  errorDetails: {
    message: string;
    type?: 'credentials' | 'server' | 'network' | 'external' | 'form';
  } | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect if already logged in
    if (this.authService.isAuthenticated() && !this.authService.isTokenExpired()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]]
    });
  }

  // Getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    const registerData = {
      ...this.registerForm.value,
      userType: 'Customer' // Default to customer for regular registration
    };

    this.authService.register(registerData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: error => {
          this.error = error;
          this.loading = false;
        }
      });
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
            this.error = 'Failed to get user data from Facebook';
            this.loading = false;
            return;
          }

          // Split the name into first and last name
          const nameParts = userData.name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          this.authService.externalAuth('FACEBOOK', response.authResponse!.accessToken, {
            email: userData.email,
            name: userData.name,
            firstName: firstName,
            lastName: lastName,
            photoUrl: userData.picture?.data?.url,
            userType: 'customer'  // Add user type for registration
          }, true)
          .pipe(first())
          .subscribe({
            next: () => {
              this.router.navigate(['/']);
            },
            error: error => {
              console.error('External auth error:', error);
              this.error = 'Registration failed. Please try again.';
              this.loading = false;
            }
          });
        });
      } else {
        this.error = 'Facebook login failed. Please try again.';
        this.loading = false;
      }
    }, { scope: 'email,public_profile' });
  }

















  private handleFormErrors(): void {
    this.errorDetails = {
      message: 'Please fix the form errors below',
      type: 'form'
    };
  }

  private handleRegisterError(error: any): void {
    const errorMessage = error.error?.message || error.message;
    
    this.errorDetails = {
      message: errorMessage,
      type: 'server'
    };

    if (errorMessage.toLowerCase().includes('email already exists')) {
      this.errorDetails = {
        message: 'This email is already registered. Try logging in or use a different email.',
        type: 'credentials'
      };
      this.registerForm.get('email')?.setErrors({ emailExists: true });
    }
    else if (errorMessage.toLowerCase().includes('network')) {
      this.errorDetails.type = 'network';
    }

    setTimeout(() => this.errorDetails = null, 5000);
  }








  private handleGoogleCallback(response: any): void {
    const payload = this.decodeJwtResponse(response.credential);
    
    // Split the name into first and last name
    const nameParts = payload.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    this.authService.externalAuth('GOOGLE', response.credential, {
      email: payload.email,
      name: payload.name,
      firstName: firstName,
      lastName: lastName,
      photoUrl: payload.picture,
      userType: 'Customer'  // Add user type for registration
    }, true)
    .pipe(first())
    .subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: error => {
        console.error('External auth error:', error);
        this.error = 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  private decodeJwtResponse(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
  private handleSocialError(error: Error, provider: string): void {
    console.error(`${provider} registration error:`, error);
    this.errorDetails = {
      message: this.getSocialErrorMessage(error, provider),
      type: 'external'
    };
    this.loading = false;
  }

  private getSocialErrorMessage(error: Error, provider: string): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('email')) {
      return `Email permission required for ${provider} registration`;
    }
    if (message.includes('popup closed')) {
      return `${provider} registration was canceled`;
    }
    if (message.includes('already exists')) {
      return `Account already exists. Please login instead.`;
    }
    return `Registration failed: ${error.message}`;
  }
  clearError(): void {
    this.errorDetails = null;
  }

}