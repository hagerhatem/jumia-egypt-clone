// src/app/pages/public/products/products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/categories/categories.service';
import { ProductService } from '../../../services/products/product.service';
import { CartsService } from '../../../services/cart/carts.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h1 class="mb-4">Product Categories</h1>
      
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading categories...</p>
      </div>
      
      <!-- Error Message -->
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <!-- Categories Display -->
      <div *ngIf="!loading && !error">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div *ngFor="let category of categories" class="col">
            <div class="card h-100">
              <!-- Only try to load image if URL seems valid -->
              <div class="card-img-wrapper">
                <img 
                  [src]="getImageUrl(category.imageUrl)" 
                  class="card-img-top" 
                  alt="{{ category.name }}"
                >
              </div>
              <div class="card-body">
                <h5 class="card-title text-capitalize">{{ category.name }}</h5>
                <p class="card-text">{{ category.description }}</p>
                <p class="badge bg-info">{{ category.subcategoryCount }} subcategories</p>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-sm">View Products</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination Controls -->
        <div class="d-flex justify-content-between align-items-center mt-4">
          <div>
            <span>Showing {{ categories.length }} categories</span>
          </div>
          <div>
            <div class="btn-group" role="group">
              <button 
                class="btn btn-outline-primary" 
                [disabled]="currentPage === 0"
                (click)="loadPage(currentPage - 1)"
              >
                <i class="fas fa-chevron-left"></i> Previous
              </button>
              <button 
                class="btn btn-outline-primary" 
                (click)="loadPage(currentPage + 1)"
              >
                Next <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-img-wrapper {
      height: 200px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }
    .card-img-top {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ProductsComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error = '';
  currentPage = 0;
  pageSize = 4;
  placeholderImage = 'assets/images/placeholder.png';
  
  constructor(private categoryService: CategoryService,private productsService: ProductService, private cartsService: CartsService) {}
  
  ngOnInit(): void {
    this.loadCategories();    
  }
  

  // loadProduct(id: number, includeDetails: boolean): void {
   
    
  //   this.productsService.getProductById(id, includeDetails).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         console.log('Product loaded successfully:', response.data);
  //       } else {
  //         this.error = response.message || 'Failed to load categories';
  //       }
  //     },
  //     error: (err) => {
  //       this.error = 'Error loading categories. Please try again later.';
  //       console.error('Error fetching categories:', err);
  //     }
  //   });
  // }

  loadCategories(): void {
    this.loading = true;
    this.error = '';
    
    this.categoryService.getCategories({
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      includeInactive: false
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
          this.loading = false;
        } else {
          this.error = response.message || 'Failed to load categories';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Error loading categories. Please try again later.';
        console.error('Error fetching categories:', err);
        this.loading = false;
      }
    });
  }
  
  loadPage(page: number): void {
    if (page >= 0) {
      this.currentPage = page;
      this.loadCategories();
      // Scroll to top after page change
      window.scrollTo(0, 0);
    }
  }
  
  // Helper method to determine the image URL
  getImageUrl(url: string): string {
    // Check if URL is empty, 'string', or doesn't start with http/https
    if (!url || url === 'string' || !(url.startsWith('http://') || url.startsWith('https://'))) {
      return '/images/notfoundcategory.png';
    }
    return url;
  }
}