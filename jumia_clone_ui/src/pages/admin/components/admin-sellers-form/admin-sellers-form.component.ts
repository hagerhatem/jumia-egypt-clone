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
  selector: 'app-admin-seller-form',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, AdminSidebarComponent, AdminHeaderComponent],
  standalone: true,
  templateUrl: './admin-sellers-form.component.html',
  styleUrls: ['./admin-sellers-form.component.css']
})
export class AdminSellersFormComponent extends Helpers implements OnInit {
  sellerId: number = 0;
  sellerForm: FormGroup;
  loading: boolean = false;
  submitting: boolean = false;
  profileImagePreview: string | undefined = undefined;
  businessLogoPreview: string | undefined = undefined;
  isEditMode: boolean = false;
  showPasswordFields: boolean = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notificationService: NotificationService  ) {
      super();
      this.sellerForm = this.fb.group({
        userId: [0],
        firstName: ['', [Validators.required, Validators.maxLength(100)]],
        lastName: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.pattern(/^\+?[0-9\s-()]+$/)],
        businessName: ['', [Validators.required, Validators.maxLength(255)]],
        businessDescription: [''],
        profileImage: [null],
        businessLogo: [null],
        isVerified: [false],
        isActive: [false],
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
        this.sellerId = +params['id'];
        this.isEditMode = true;
        this.showPasswordFields = false; // Default to not showing password fields in edit mode
        this.loadSellerData();
      } else {
        this.isEditMode = false;
        this.showPasswordFields = true; // Always show password fields for new sellers
        // Reset form for new seller
        this.sellerForm.reset({
          userId: 0,
          isVerified: false,
          isActive: false,
        });
        
        // Make password fields required for new sellers
        this.sellerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.sellerForm.get('confirmPassword')?.setValidators([Validators.required]);
        this.sellerForm.get('password')?.updateValueAndValidity();
        this.sellerForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }
  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    
    if (this.showPasswordFields) {
      // Add validators when showing password fields
      this.sellerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.sellerForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      // Remove validators when hiding password fields
      this.sellerForm.get('password')?.clearValidators();
      this.sellerForm.get('confirmPassword')?.clearValidators();
      // Reset password fields
      this.sellerForm.get('password')?.setValue('');
      this.sellerForm.get('confirmPassword')?.setValue('');
    }
    
    this.sellerForm.get('password')?.updateValueAndValidity();
    this.sellerForm.get('confirmPassword')?.updateValueAndValidity();
  }
  loadSellerData(): void {
    this.loading = true;
    this.adminService.getSellerById(this.sellerId).subscribe({
      next: (response) => {
        if (response.success) {
          const seller = response.data;
          this.sellerForm.patchValue({
            userId: seller.userId,
            firstName: seller.firstName,
            lastName: seller.lastName,
            email: seller.email,
            phoneNumber: seller.phoneNumber,
            businessName: seller.businessName,
            businessDescription: seller.businessDescription,
            isVerified: seller.isVerified,
            isActive: seller.isActive
          });
          
          if (seller.profileImageUrl) {
            this.profileImagePreview = this.getFullImageUrl(seller.profileImageUrl);
          }
          
          if (seller.businessLogo) {
            this.businessLogoPreview = this.getFullImageUrl(seller.businessLogo);
          }
        } else {
          this.notificationService.showError(response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load seller data');
        console.error(error);
        this.loading = false;
      }
    });
  }

  onProfileImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.sellerForm.get('profileImage')?.setValue(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onBusinessLogoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.sellerForm.get('businessLogo')?.setValue(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.businessLogoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.sellerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.sellerForm.controls).forEach(key => {
        this.sellerForm.get(key)?.markAsTouched();
      });
      this.notificationService.showError('Please correct the errors in the form');
      return;
    }
  
    this.submitting = true;
    const formData = new FormData();
    
    // Append form values to FormData
    Object.keys(this.sellerForm.value).forEach(key => {
      if (key !== 'profileImage' && key !== 'businessLogo') {
        // Only include password if showPasswordFields is true
        if ((key === 'password' || key === 'confirmPassword') && 
            (!this.showPasswordFields || !this.sellerForm.get('password')?.value)) {
          return;
        }
        
        const value = this.sellerForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });
    
    // Append files if they exist
    const profileImage = this.sellerForm.get('profileImage')?.value;
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    const businessLogo = this.sellerForm.get('businessLogo')?.value;
    if (businessLogo) {
      formData.append('businessLogo', businessLogo);
    }
    
    if (this.isEditMode) {
      // Update existing seller
      this.adminService.updateSeller(this.sellerId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(response.message || 'Seller updated successfully');
            this.router.navigate(['/admin/sellers']);
          } else {
            this.notificationService.showError(response.message || 'Failed to update seller');
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Update seller error:', error);
          let errorMessage = 'Failed to update seller';
          
          if (error.error && error.error.errors) {
            const errorDetails = Object.entries(error.error.errors)
              .map(([field, messages]) => `${field}: ${messages}`)
              .join('; ');
            errorMessage += `. ${errorDetails}`;
          }
          
          this.notificationService.showError(errorMessage);
          this.submitting = false;
        }
      });
    } else {
      // Create new seller
      this.adminService.registerSeller(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(response.message || 'Seller created successfully');
            this.router.navigate(['/admin/sellers']);
          } else {
            this.notificationService.showError(response.message || 'Failed to create seller');
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Register seller error:', error);
          let errorMessage = 'Failed to create seller';
          
          if (error.error && error.error.errors) {
            const errorDetails = Object.entries(error.error.errors)
              .map(([field, messages]) => `${field}: ${messages}`)
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