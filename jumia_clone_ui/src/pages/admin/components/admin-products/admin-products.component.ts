// src/app/pages/admin/admin-products/admin-products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { BasicCategoiesInfo, Product, ProductQueryParams } from '../../../../models/admin';
import { AdminService } from '../../../../services/admin/admin.service';
import { ProductsService } from '../../../../services/admin/products.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { Helpers } from '../../../../Utility/helpers';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent extends Helpers implements OnInit {
  products: Product[] = [];
  isLoading = false;
  
  // Filtering and pagination
  searchTerm = '';
  categoryFilter = '';
  statusFilter: 'pending' | 'approved' | 'rejected' | 'deleted' | 'pending_review' | null = null;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  categories: BasicCategoiesInfo[] = [];
  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  approvalStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'pending_review', label: 'Pending Review' }
  ];
  // Make Math available to template
  Math = Math;

  constructor(
    private adminService: AdminService,
    private productsService: ProductsService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {super()}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }
  loadCategories(): void {
    this.adminService.getBasicCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories', error);
        this.notificationService.showError('Failed to load categories');
      }
    });
  }
  loadProducts(): void {
    this.isLoading = true;
    this.loadingService.show();
    
    // Create filter object for the service method
    const filter = {
      searchTerm: this.searchTerm || undefined,
      categoryId: this.categoryFilter ? parseInt(this.categoryFilter) : undefined,
      sortBy: this.sortField,
      sortDirection: this.sortDirection,
      approvalStatus: this.statusFilter || undefined,
      _: new Date().getTime() 
    };
  
    this.adminService.getProducts(this.currentPage - 1, this.pageSize, filter).subscribe({
      
      next: (response) => {
        this.products = response.data.products;
        this.totalItems = response.data.totalItems;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.notificationService.showError('Failed to load products');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }
  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }
  onPageSizeChange(): void {
    this.currentPage = 1; 
    this.loadProducts();
  }
  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  
    this.loadProducts();
  }
  getVariantDisplayName(variant: any): string {
    if (!variant) return '';
    return `${variant.variantName} - ${variant.sku} (${variant.stockQuantity} in stock)`;
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loadingService.show();
      
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Product deleted successfully');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product', error);
          this.notificationService.showError('Failed to delete product');
          this.loadingService.hide();
        }
      });
    }
  }

  updateProductStatus(id: number, status: 'pending' | 'approved' | 'rejected' | 'deleted' | 'pending_review'): void {
    this.loadingService.show();
    
    this.productsService.updateProductStatus(id, { approvalStatus: status }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Product status updated successfully');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product status', error);
        this.notificationService.showError('Failed to update product status');
        this.loadingService.hide();
      }
    });
  }

  toggleAvailability(id: number, isAvailable: boolean): void {
    this.loadingService.show();
    
    this.productsService.updateProductAvailabilty(id, { isAvailable: !isAvailable }).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Product ${isAvailable ? 'disabled' : 'enabled'} successfully`);
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product availability', error);
        this.notificationService.showError('Failed to update product');
        this.loadingService.hide();
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const categories: Record<number, string> = {
      1: 'Electronics',
      2: 'Accessories',
      3: 'Computer Hardware',
      4: 'Fashion',
      5: 'Home & Kitchen',
      6: 'Beauty & Health'
    };
    return categories[categoryId] || 'Unknown';
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}