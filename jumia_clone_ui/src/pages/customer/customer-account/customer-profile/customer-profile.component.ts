import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, CustomerDto, CustomerUpdateDto } from '../../../../../src/services/customer/customer-profile.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  profileForm: FormGroup;
  customer: CustomerDto | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService // Add AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCustomerProfile();
  }

  loadCustomerProfile(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.userId) {
      this.errorMessage = 'No authenticated user found';
      return;
    }

    this.isLoading = true;
    console.log('Loading profile for user:', currentUser.userId);

    this.userService.getCustomerProfile(1).subscribe({
      next: (response: any) => {
        console.log('Loaded customer profile:', response);
        // Extract customer data from the response
        this.customer = response.data;
        
        // Patch form with the correct data
        this.profileForm.patchValue({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber
        });
        
        console.log('Form patched with values:', this.profileForm.value);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Profile loading error details:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile';
      }
    });
  }

  onSubmit(): void {
    console.log('Save button clicked');
    console.log('Form current state:', {
      valid: this.profileForm.valid,
      dirty: this.profileForm.dirty,
      touched: this.profileForm.touched,
      value: this.profileForm.value
    });

    if (this.profileForm.valid && this.customer) {
      console.log('Form is valid and customer exists');
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updateDto: CustomerUpdateDto = {
        userId: this.customer.userId,
        firstName: this.profileForm.get('firstName')?.value,
        lastName: this.profileForm.get('lastName')?.value,
        phoneNumber: this.profileForm.get('phoneNumber')?.value
      };

      console.log('Prepared update data:', updateDto);

      this.userService.updateCustomerProfile(this.customer.userId, updateDto)
        .subscribe({
          next: (response: any) => {
            console.log('API Response:', response);
            console.log('Response status:', response.success);
            console.log('Updated customer data:', response.data);
            
            this.customer = response.data;
            this.successMessage = 'Profile updated successfully';
            this.isLoading = false;
            this.profileForm.markAsPristine();
            console.log('Form state after update:', {
              pristine: this.profileForm.pristine,
              value: this.profileForm.value
            });
          },
          error: (error) => {
            console.error('Update error:', {
              status: error.status,
              message: error.message,
              error: error
            });
            this.errorMessage = 'Failed to update profile';
            this.isLoading = false;
          }
        });
    } else {
      console.warn('Form validation failed:', {
        formValid: this.profileForm.valid,
        customerExists: !!this.customer,
        formErrors: this.profileForm.errors,
        controls: {
          firstName: {
            valid: this.profileForm.get('firstName')?.valid,
            errors: this.profileForm.get('firstName')?.errors
          },
          lastName: {
            valid: this.profileForm.get('lastName')?.valid,
            errors: this.profileForm.get('lastName')?.errors
          },
          email: {
            valid: this.profileForm.get('email')?.valid,
            errors: this.profileForm.get('email')?.errors
          },
          phoneNumber: {
            valid: this.profileForm.get('phoneNumber')?.valid,
            errors: this.profileForm.get('phoneNumber')?.errors
          }
        }
      });
    }
  }
}
