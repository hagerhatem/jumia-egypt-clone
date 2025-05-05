import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { Helpers } from '../../../../Utility/helpers';

@Component({
  selector: 'app-admin-subcategory-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-subcategory-form.component.html',
  styleUrls: ['./admin-subcategory-form.component.css']
})
export class AdminSubcategoryFormComponent implements OnInit {
  subcategoryForm: FormGroup;
  categories: any[] = [];
  isLoading = false;
  isEditMode = false;
  subcategoryId: number | null = null;
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
    this.subcategoryForm = this.createSubcategoryForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.subcategoryId = parseInt(params['id']);
        this.isEditMode = true;
        this.loadSubcategory(this.subcategoryId);
      }
    });
  }

  createSubcategoryForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true, Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  loadCategories(): void {
    this.adminService.getBasicCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.notificationService.showError('Failed to load categories');
      }
    });
  }

  loadSubcategory(id: number): void {
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getSubcategoryById(id).subscribe({
      next: (subcategory) => {
        if (subcategory) {
          this.subcategoryForm.patchValue({
            name: subcategory.name,
            description: subcategory.description || '',
            isActive: subcategory.isActive,
            categoryId: subcategory.categoryId
          });
          
          if (subcategory.imageUrl) {
            this.imagePreview = Helpers.getFullImageUrl2(subcategory.imageUrl);
          }
        }
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading subcategory:', error);
        this.notificationService.showError('Failed to load subcategory');
        this.isLoading = false;
        this.loadingService.hide();
        this.router.navigate(['/admin/subcategories']);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  onSubmit(): void {
    if (this.subcategoryForm.invalid) {
      this.subcategoryForm.markAllAsTouched();
      this.notificationService.showWarning('Please fix the form errors');
      return;
    }
    
    if (!this.isEditMode && !this.imageFile) {
      this.notificationService.showWarning('Please select an image for the subcategory');
      return;
    }
    
    this.isLoading = true;
    this.loadingService.show();
    
    const formData = new FormData();
    if (this.isEditMode && this.subcategoryId) {
      formData.append('SubcategoryId', this.subcategoryId.toString());
    }
    formData.append('SubcategoryId', this.subcategoryForm.get('name')?.value);
    formData.append('Name', this.subcategoryForm.get('name')?.value);
    formData.append('Description', this.subcategoryForm.get('description')?.value || '');
    formData.append('IsActive', this.subcategoryForm.get('isActive')?.value.toString());
    formData.append('CategoryId', this.subcategoryForm.get('categoryId')?.value);
    
    if (this.imageFile) {
      formData.append('ImageFile', this.imageFile);
    }
    
    const request = this.isEditMode ? 
      this.adminService.updateSubcategory(this.subcategoryId!, formData) :
      this.adminService.createSubcategory(formData);

    request.subscribe({
      next: () => {
        this.notificationService.showSuccess(
          this.isEditMode ? 'Subcategory updated successfully' : 'Subcategory created successfully'
        );
        this.router.navigate(['/admin/subcategories']);
      },
      error: (error) => {
        console.error('Error saving subcategory:', error);
        this.notificationService.showError('Failed to save subcategory');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  get f() { 
    return this.subcategoryForm.controls; 
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const control = this.subcategoryForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  getErrorMessage(fieldName: string): string {
    const control = this.subcategoryForm.get(fieldName);
    if (!control) return '';
    
    if (control.errors?.['required']) {
      return 'This field is required';
    }
    
    if (control.errors?.['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    
    return 'Invalid value';
  }
}