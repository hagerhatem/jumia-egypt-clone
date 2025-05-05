import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { Helpers } from '../../../../Utility/helpers';

@Component({
  selector: 'app-admin-customer-form',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, AdminSidebarComponent, AdminHeaderComponent],
  standalone: true,
  templateUrl: './admin-customers-form.component.html',
  styleUrls: ['./admin-customers-form.component.css']
})
export class AdminCustomersFormComponent extends Helpers implements OnInit {
  customerId: number = 0;
  customerForm: FormGroup;
  loading: boolean = false;
  submitting: boolean = false;
  profileImagePreview: string | undefined = undefined;
  isEditMode: boolean = false;
  showPasswordFields: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    super();
    this.customerForm = this.fb.group({
      userId: [0],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.pattern(/^\+?[0-9\s-()]+$/)],
      profileImage: [null],
      isActive: [true],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }
  
  // Password match validator
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.customerId = +params['id'];
        this.isEditMode = true;
        this.showPasswordFields = false; // Default to not showing password fields in edit mode
        this.loadCustomerData();
      } else {
        this.isEditMode = false;
        this.showPasswordFields = true; // Always show password fields for new customers
        // Reset form for new customer
        this.customerForm.reset({
          userId: 0,
          isActive: true
        });
        
        // Make password fields required for new customers
        this.customerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.customerForm.get('confirmPassword')?.setValidators([Validators.required]);
        this.customerForm.get('password')?.updateValueAndValidity();
        this.customerForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }
  
  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    
    if (this.showPasswordFields) {
      // Add validators when showing password fields
      this.customerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.customerForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      // Remove validators when hiding password fields
      this.customerForm.get('password')?.clearValidators();
      this.customerForm.get('confirmPassword')?.clearValidators();
      // Reset password fields
      this.customerForm.get('password')?.setValue('');
      this.customerForm.get('confirmPassword')?.setValue('');
    }
    
    this.customerForm.get('password')?.updateValueAndValidity();
    this.customerForm.get('confirmPassword')?.updateValueAndValidity();
  }
  
  loadCustomerData(): void {
    this.loading = true;
    this.adminService.getCustomerById(this.customerId).subscribe({
      next: (response) => {
        if (response.success) {
          const customer = response.data;
          this.customerForm.patchValue({
            userId: customer.userId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            isActive: customer.isActive
          });
          
          if (customer.profileImageUrl) {
            this.profileImagePreview = this.getFullImageUrl(customer.profileImageUrl);
          }
        } else {
          this.notificationService.showError(response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load customer data');
        console.error(error);
        this.loading = false;
      }
    });
  }

  onProfileImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.customerForm.get('profileImage')?.setValue(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
      this.notificationService.showError('Please correct the errors in the form');
      return;
    }
  
    this.submitting = true;
    const formData = new FormData();
    
    // Append form values to FormData
    Object.keys(this.customerForm.value).forEach(key => {
      if (key !== 'profileImage') {
        // Only include password if showPasswordFields is true
        if ((key === 'password' || key === 'confirmPassword') && 
            (!this.showPasswordFields || !this.customerForm.get('password')?.value)) {
          return;
        }
        
        const value = this.customerForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });
    
    // Append files if they exist
    const profileImage = this.customerForm.get('profileImage')?.value;
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    if (this.isEditMode) {
      // Update existing customer
      this.adminService.updateCustomer(this.customerId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(response.message || 'Customer updated successfully');
            this.router.navigate(['/admin/customers']);
          } else {
            this.notificationService.showError(response.message || 'Failed to update customer');
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Update customer error:', error);
          let errorMessage = 'Failed to update customer';
          
          if (error.error && error.error.errors) {
            const errorDetails = Object.entries(error.error.errors)
              .map(([field, messages]) => {
                // Type check and handle messages appropriately
                const messageStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
                return `${field}: ${messageStr}`;
              })
              .join('; ');
            errorMessage += `. ${errorDetails}`;
          }
          
          this.notificationService.showError(errorMessage);
          this.submitting = false;
        }
      });
    } else {
      // Create new customer
      this.adminService.registerCustomer(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(response.message || 'Customer created successfully');
            this.router.navigate(['/admin/customers']);
          } else {
            this.notificationService.showError(response.message || 'Failed to create customer');
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Register customer error:', error);
          let errorMessage = 'Failed to create customer';
          
          if (error.error && error.error.errors) {
            const errorDetails = Object.entries(error.error.errors)
              .map(([field, messages]) => {
                // Type check and handle messages appropriately
                const messageStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
                return `${field}: ${messageStr}`;
              })
              .join('; ');
            errorMessage += `. ${errorDetails}`;
          }
          
          this.notificationService.showError(errorMessage);
          this.submitting = false;
        }
      });
    }
  }
}