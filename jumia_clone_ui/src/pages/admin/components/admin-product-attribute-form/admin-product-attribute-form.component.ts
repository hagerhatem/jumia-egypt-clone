import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { BasicSubCategoriesInfo } from '../../../../models/admin';

@Component({
  selector: 'app-admin-product-attribute-form',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    AdminHeaderComponent, 
    AdminSidebarComponent
  ],
  templateUrl: './admin-product-attribute-form.component.html',
  styleUrls: ['./admin-product-attribute-form.component.css']
})
export class AdminProductAttributeFormComponent implements OnInit {
  attributeForm: FormGroup;
  attributeId: number = 0;
  isEditMode: boolean = false;
  loading: boolean = false;
  submitting: boolean = false;
  subcategories: BasicSubCategoriesInfo[] = [];
  attributeTypes: string[] = [
    'text', 'number', 'decimal', 'date', 'dropdown', 
    'multiselect', 'radio', 'checkbox', 'color', 'size', 
    'material', 'range'
  ];
  
  // Types that require possible values
  typesRequiringValues: string[] = ['dropdown', 'multiselect', 'radio', 'text'];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.attributeForm = this.fb.group({
      subcategoryId: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['text', Validators.required],
      possibleValuesArray: this.fb.array([this.createPossibleValueControl()]),
      isRequired: [false],
      isFilterable: [true]
    });
  }
  
  ngOnInit(): void {
    this.loadSubcategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.attributeId = +params['id'];
        this.isEditMode = true;
        this.loadAttributeData();
      }
    });
    
    // Listen for type changes to manage possible values
    this.attributeForm.get('type')?.valueChanges.subscribe(type => {
      this.handleTypeChange(type);
    });
  }
  
  loadSubcategories(): void {
    this.adminService.getBasicSubcategoriesByCategory(0) // Get all subcategories
      .subscribe({
        next: (response) => {
          if (response) {
            this.subcategories = response;
          } else {
            this.notificationService.showError('Failed to load subcategories');
          }
        },
        error: (error) => {
          this.notificationService.showError('Failed to load subcategories');
          console.error(error);
        }
      });
  }
  
  loadAttributeData(): void {
    this.loading = true;
    this.adminService.getProductAttributeById(this.attributeId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            const attribute = response.data;
            
            // Clear existing possible values
            this.possibleValuesArray.clear();
            
            // Set form values
            this.attributeForm.patchValue({
              subcategoryId: attribute.subcategoryId,
              name: attribute.name,
              type: attribute.type,
              isRequired: attribute.isRequired,
              isFilterable: attribute.isFilterable
            });
            
            // Handle possible values if they exist
            if (attribute.possibleValues) {
              const values = attribute.possibleValues.split(', ');
              values.forEach((value: string) => {
                this.possibleValuesArray.push(this.fb.control(value, Validators.required));
              });
            } else {
              // Add at least one empty control
              this.possibleValuesArray.push(this.createPossibleValueControl());
            }
            
            // Update form based on type
            this.handleTypeChange(attribute.type);
          } else {
            this.notificationService.showError(response.message || 'Failed to load attribute data');
          }
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to load attribute data');
          console.error(error);
          this.loading = false;
          this.router.navigate(['/admin/product-attributes']);
        }
      });
  }
  
  handleTypeChange(type: string): void {
    const requiresValues = this.typesRequiringValues.includes(type);
    
    if (requiresValues) {
      // Ensure at least one possible value exists
      if (this.possibleValuesArray.length === 0) {
        this.addPossibleValue();
      }
    }
  }
  
  get possibleValuesArray(): FormArray {
    return this.attributeForm.get('possibleValuesArray') as FormArray;
  }
  
  createPossibleValueControl() {
    return this.fb.control('', Validators.required);
  }
  
  addPossibleValue(): void {
    this.possibleValuesArray.push(this.createPossibleValueControl());
  }
  
  removePossibleValue(index: number): void {
    if (this.possibleValuesArray.length > 1) {
      this.possibleValuesArray.removeAt(index);
    }
  }
  
  needsPossibleValues(): boolean {
    const type = this.attributeForm.get('type')?.value;
    return this.typesRequiringValues.includes(type);
  }

  getSubcategoryName(subcategoryId: number): string {
    if (!subcategoryId || !this.subcategories) return 'Unknown Subcategory';
    
    const subcategory = this.subcategories.find(s => s.subcategoryId === +subcategoryId);
    if (subcategory) {
      return `${subcategory.name} (${subcategory.categoryName})`;
    }
    return 'Unknown Subcategory';
  }
  
  onSubmit(): void {
    if (this.attributeForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.attributeForm.controls).forEach(key => {
        const control = this.attributeForm.get(key);
        control?.markAsTouched();
      });
      
      // Mark all possible values as touched
      if (this.possibleValuesArray) {
        for (let i = 0; i < this.possibleValuesArray.length; i++) {
          this.possibleValuesArray.at(i).markAsTouched();
        }
      }
      
      this.notificationService.showError('Please correct the errors in the form');
      return;
    }
    
    this.submitting = true;
    
    // Prepare the data
    const formData = { ...this.attributeForm.value };
    
    // Join possible values if they exist
    if (this.possibleValuesArray.length > 0) {
      formData.possibleValues = this.possibleValuesArray.value.join(', ');
    } else {
      formData.possibleValues = '';
    }
    
    // Remove the array from the data
    delete formData.possibleValuesArray;
    
    if (this.isEditMode) {
      // Update existing attribute
      this.adminService.updateProductAttribute(this.attributeId, formData)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess(response.message || 'Attribute updated successfully');
              this.router.navigate(['/admin/product-attributes']);
            } else {
              this.notificationService.showError(response.message || 'Failed to update attribute');
            }
            this.submitting = false;
          },
          error: (error) => {
            this.notificationService.showError('Failed to update attribute');
            console.error(error);
            this.submitting = false;
          }
        });
    } else {
      // Create new attribute
      this.adminService.createProductAttribute(formData)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess(response.message || 'Attribute created successfully');
              this.router.navigate(['/admin/product-attributes']);
            } else {
              this.notificationService.showError(response.message || 'Failed to create attribute');
            }
            this.submitting = false;
          },
          error: (error) => {
            this.notificationService.showError('Failed to create attribute');
            console.error(error);
            this.submitting = false;
          }
        });
    }
  }
}