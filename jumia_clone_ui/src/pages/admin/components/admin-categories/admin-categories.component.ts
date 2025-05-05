// src/app/pages/admin/admin-categories/admin-categories.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { Category } from '../../../../models/admin';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { CommonModule } from '@angular/common';
import { Helpers } from '../../../../Utility/helpers';


@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent extends Helpers implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = '';
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;
  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadCategories();
  }
 // Pagination methods
 goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
    this.currentPage = page;
    this.loadCategories();
  }
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadCategories();
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadCategories();
  }
}

loadCategories(): void {
  this.isLoading = true;
  this.loadingService.show();
  
  // Update to include pagination parameters
  this.adminService.getCategories(this.currentPage, this.pageSize, this.searchTerm, this.statusFilter).subscribe({
    next: (response) => {
      // Check the structure of the response and handle accordingly
      
        // If response is an array, it's just the categories
        this.categories = response.data || [];
        this.totalItems = response.totalItems || 10;
        this.totalPages = this.Math.ceil(this.totalItems / this.pageSize);
      
      
      this.isLoading = false;
      this.loadingService.hide();
    },
    error: (error: Error) => {
      console.error('Error loading categories:', error);
      this.notificationService.showError('Failed to load categories');
      this.categories = []; // Ensure categories is always an array
      this.isLoading = false;
      this.loadingService.hide();
    }
  });
}

  onSearch(): void {
    this.loadCategories();
  }

  onFilterChange(): void {
    this.loadCategories();
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.loadingService.show();
      
      this.adminService.deleteCategory(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Category deleted successfully');
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category', error);
          this.notificationService.showError('Failed to delete category');
          this.loadingService.hide();
        }
      });
    }
  }



  getParentCategoryName(parentId?: number): string {
    if (!parentId) return 'None';
    const parent = this.categories.find(c => c.categoryId === parentId);
    return parent ? parent.name : 'Unknown';
  }
}