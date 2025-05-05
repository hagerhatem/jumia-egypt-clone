// src/app/pages/admin/admin-category-form/admin-category-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { Category } from '../../../../models/admin';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { Helpers } from '../../../../Utility/helpers';

@Component({
  selector: 'app-admin-category-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-category-form.component.html',
  styleUrls: ['./admin-category-form.component.css']
})
export class AdminCategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  isEditMode = false;
  categoryId: number | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.categoryForm = this.createCategoryForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.categoryId = parseInt(params['id']);
        this.isEditMode = true;
        this.loadCategory(this.categoryId);
      }
    });
  }

  createCategoryForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true, Validators.required],
      parentId: ['']
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error: Error) => {
        console.error('Error loading categories:', error);
        this.notificationService.showError('Failed to load categories');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  loadCategory(id: number | null): void {
    if (!id) return;
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getCategoryById(id).subscribe({
      next: (category) => {
        if (category) {
          this.categoryForm.patchValue({
            name: category.name,
            description: category.description || '',
            isActive: category.isActive,
            parentId: category.parentId || ''
          });
          
          // Set image preview if available
          if (category.imageUrl) {
            this.imagePreview = Helpers.getFullImageUrl2(category.imageUrl);
          }
        } else {
          this.notificationService.showError('Category not found');
          this.router.navigate(['/admin/categories']);
        }
        
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading category', error);
        this.notificationService.showError('Failed to load category');
        this.isLoading = false;
        this.loadingService.hide();
        this.router.navigate(['/admin/categories']);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.categoryForm.markAllAsTouched();
      this.notificationService.showWarning('Please fix the form errors');
      return;
    }
    
    // Check if image is required for new categories
    if (!this.isEditMode && !this.imageFile) {
      this.notificationService.showWarning('Please select an image for the category');
      return;
    }
    
    this.isLoading = true;
    this.loadingService.show();
    
    const formData = new FormData();
    
    // Add form values to FormData
    formData.append('Name', this.categoryForm.get('name')?.value);
    formData.append('Description', this.categoryForm.get('description')?.value || '');
    formData.append('IsActive', this.categoryForm.get('isActive')?.value.toString());
    
    if (this.categoryForm.get('parentId')?.value) {
      formData.append('ParentId', this.categoryForm.get('parentId')?.value);
    }
    
    // Add image file if available
    if (this.imageFile) {
      formData.append('ImageFile', this.imageFile);
    }
    
    if (this.isEditMode && this.categoryId) {
      // Add category ID for update
      formData.append('CategoryId', this.categoryId.toString());
      
      // Update existing category
      this.adminService.updateCategoryWithImage(this.categoryId, formData).subscribe({
        next: (category) => {
          this.notificationService.showSuccess('Category updated successfully');
          this.isLoading = false;
          this.loadingService.hide();
          this.router.navigate(['/admin/categories']);
        },
        error: (error) => {
          console.error('Error updating category', error);
          this.notificationService.showError('Failed to update category');
          this.isLoading = false;
          this.loadingService.hide();
        }
      });
    } else {
      // Create new category
      this.adminService.createCategoryWithImage(formData).subscribe({
        next: (category) => {
          this.notificationService.showSuccess('Category created successfully');
          this.isLoading = false;
          this.loadingService.hide();
          this.router.navigate(['/admin/categories']);
        },
        error: (error) => {
          console.error('Error creating category', error);
          this.notificationService.showError('Failed to create category');
          this.isLoading = false;
          this.loadingService.hide();
        }
      });
    }
  }


  // Helper methods for form validation
  get f() { 
    return this.categoryForm.controls; 
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const control = this.categoryForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  getErrorMessage(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);
    if (!control) return '';
    
    if (control.errors?.['required']) {
      return 'This field is required';
    }
    
    if (control.errors?.['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    
    return 'Invalid value';
  }

  // Filter out the current category from parent options to prevent circular references
  getParentOptions(): Category[] {
    if (!this.isEditMode) return this.categories;
    return this.categories.filter(category => category.categoryId !== this.categoryId);
  }
}