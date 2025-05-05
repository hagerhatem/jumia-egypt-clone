// src/app/auth/register-seller/register-seller.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../shared/notification/notification.component';

@Component({
  selector: 'app-register-seller',
  templateUrl: './register-seller.component.html',
  styleUrls: ['./register-seller.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,NotificationComponent]
})
export class RegisterSellerComponent implements OnInit {
  sellerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  errorDetails: {
    message: string;
    type?: 'credentials' | 'server' | 'network' | 'form';
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
    this.sellerForm = this.formBuilder.group({
      user: this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]],
        userType: ['seller'] // Fixed value for seller registration
      }),
      seller: this.formBuilder.group({
        businessName: ['', Validators.required],
        businessDescription: ['', Validators.required],
        businessLogo: [''] // Optional for now
      })
    });
  }

  // Getter for easy access to form fields
  get f() { return this.sellerForm.controls; }
  get user() { return (this.f['user'] as FormGroup).controls; }
  get seller() { return (this.f['seller'] as FormGroup).controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.sellerForm.invalid) {
      return;
    }

    this.loading = true;
    
    this.authService.registerSeller(this.sellerForm.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate(['/seller/dashboard']);
        },
        error: error => {
          this.error = error;
          this.loading = false;
        }
      });
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
      this.user['email']?.setErrors({ emailExists: true });
    }
    else if (errorMessage.toLowerCase().includes('network')) {
      this.errorDetails.type = 'network';
    }

    setTimeout(() => this.errorDetails = null, 5000);
  }

  clearError(): void {
    this.errorDetails = null;
  }
}