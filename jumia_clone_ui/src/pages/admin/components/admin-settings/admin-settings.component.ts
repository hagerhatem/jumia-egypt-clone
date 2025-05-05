// src/app/pages/admin/admin-settings/admin-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';


@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  generalForm: FormGroup;
  emailForm: FormGroup;
  paymentForm: FormGroup;
  notificationForm: FormGroup;
  isLoading = false;
  activeTab = 'general';

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.generalForm = this.createGeneralForm();
    this.emailForm = this.createEmailForm();
    this.paymentForm = this.createPaymentForm();
    this.notificationForm = this.createNotificationForm();
  }

  ngOnInit(): void {
    // In a real app, we'd load the settings from the backend
    // For now, we'll just use mock data
    this.loadMockSettings();
  }

  createGeneralForm(): FormGroup {
    return this.fb.group({
      siteName: ['', Validators.required],
      siteDescription: [''],
      currency: ['₦', Validators.required],
      logo: [''],
      favicon: [''],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      facebookUrl: [''],
      twitterUrl: [''],
      instagramUrl: [''],
      youtubeUrl: ['']
    });
  }

  createEmailForm(): FormGroup {
    return this.fb.group({
      smtpHost: ['', Validators.required],
      smtpPort: ['', Validators.required],
      smtpUsername: ['', Validators.required],
      smtpPassword: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      senderName: ['', Validators.required],
      enableSsl: [true]
    });
  }

  createPaymentForm(): FormGroup {
    return this.fb.group({
      enablePaystack: [true],
      paystackPublicKey: ['', Validators.required],
      paystackSecretKey: ['', Validators.required],
      enableFlutterwave: [false],
      flutterwavePublicKey: [''],
      flutterwaveSecretKey: [''],
      enableCashOnDelivery: [true],
      enableBankTransfer: [true],
      bankName: [''],
      accountNumber: [''],
      accountName: ['']
    });
  }

  createNotificationForm(): FormGroup {
    return this.fb.group({
      newOrderNotification: [true],
      orderStatusChangeNotification: [true],
      lowStockNotification: [true],
      stockThreshold: [10],
      newCustomerNotification: [true],
      newReviewNotification: [true]
    });
  }

  loadMockSettings(): void {
    // General settings
    this.generalForm.patchValue({
      siteName: 'Jumia Clone',
      siteDescription: 'An e-commerce platform for all your shopping needs',
      currency: '₦',
      logo: 'assets/images/logo.png',
      favicon: 'assets/images/favicon.ico',
      address: '123 Main Street, Lagos, Nigeria',
      phone: '+234 123 456 7890',
      email: 'info@jumiaclone.com',
      facebookUrl: 'https://facebook.com/jumiaclone',
      twitterUrl: 'https://twitter.com/jumiaclone',
      instagramUrl: 'https://instagram.com/jumiaclone',
      youtubeUrl: 'https://youtube.com/jumiaclone'
    });

    // Email settings
    this.emailForm.patchValue({
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUsername: 'noreply@jumiaclone.com',
      smtpPassword: 'password123',
      senderEmail: 'noreply@jumiaclone.com',
      senderName: 'Jumia Clone',
      enableSsl: true
    });

    // Payment settings
    this.paymentForm.patchValue({
      enablePaystack: true,
      paystackPublicKey: 'pk_test_1234567890',
      paystackSecretKey: 'sk_test_1234567890',
      enableFlutterwave: false,
      flutterwavePublicKey: '',
      flutterwaveSecretKey: '',
      enableCashOnDelivery: true,
      enableBankTransfer: true,
      bankName: 'First Bank',
      accountNumber: '1234567890',
      accountName: 'Jumia Clone Ltd'
    });

    // Notification settings
    this.notificationForm.patchValue({
      newOrderNotification: true,
      orderStatusChangeNotification: true,
      lowStockNotification: true,
      stockThreshold: 10,
      newCustomerNotification: true,
      newReviewNotification: true
    });
  }

  saveGeneralSettings(): void {
    if (this.generalForm.invalid) {
      this.generalForm.markAllAsTouched();
      this.notificationService.showWarning('Please fix the form errors');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    // In a real app, we'd save the settings to the backend
    // For now, we'll just simulate a delay
    setTimeout(() => {
      this.isLoading = false;
      this.loadingService.hide();
      this.notificationService.showSuccess('General settings saved successfully');
    }, 1000);
  }

  saveEmailSettings(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.notificationService.showWarning('Please fix the form errors');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    // In a real app, we'd save the settings to the backend
    // For now, we'll just simulate a delay
    setTimeout(() => {
      this.isLoading = false;
      this.loadingService.hide();
      this.notificationService.showSuccess('Email settings saved successfully');
    }, 1000);
  }

  savePaymentSettings(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.notificationService.showWarning('Please fix the form errors');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    // In a real app, we'd save the settings to the backend
    // For now, we'll just simulate a delay
    setTimeout(() => {
      this.isLoading = false;
      this.loadingService.hide();
      this.notificationService.showSuccess('Payment settings saved successfully');
    }, 1000);
  }

  saveNotificationSettings(): void {
    if (this.notificationForm.invalid) {
      this.notificationForm.markAllAsTouched();
      this.notificationService.showWarning('Please fix the form errors');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    // In a real app, we'd save the settings to the backend
    // For now, we'll just simulate a delay
    setTimeout(() => {
      this.isLoading = false;
      this.loadingService.hide();
      this.notificationService.showSuccess('Notification settings saved successfully');
    }, 1000);
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (!control) return '';
    
    if (control.errors?.['required']) {
      return 'This field is required';
    }
    
    if (control.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    
    return 'Invalid value';
  }
}