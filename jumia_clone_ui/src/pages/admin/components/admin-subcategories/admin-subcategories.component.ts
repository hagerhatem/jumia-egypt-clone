import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { Helpers } from '../../../../Utility/helpers';

@Component({
  selector: 'app-admin-subcategories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-subcategories.component.html',
  styleUrls: ['./admin-subcategories.component.css']
})
export class AdminSubcategoriesComponent extends Helpers implements OnInit {
  subcategories: any[] = [];
  categories: any[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  
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
    this.loadSubcategories();
  }

  loadCategories(): void {
    this.adminService.getBasicCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadSubcategories(): void {
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getSubcategories(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.statusFilter
      
    ).subscribe({
      next: (response) => {
        this.subcategories = response.data;
        console.log(response)
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.notificationService.showError('Failed to load subcategories');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.categoryId === categoryId);
    return category ? category.name : 'Unknown';
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadSubcategories();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadSubcategories();
  }

  deleteSubcategory(id: number): void {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.loadingService.show();
      
      this.adminService.deleteSubcategory(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Subcategory deleted successfully');
          this.loadSubcategories();
        },
        error: (error) => {
          console.error('Error deleting subcategory:', error);
          this.notificationService.showError('Failed to delete subcategory');
          this.loadingService.hide();
        }
      });
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadSubcategories();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSubcategories();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSubcategories();
    }
  }
}