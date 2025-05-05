// src/app/pages/admin/admin-reviews/admin-reviews.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { Review } from '../../../../models/admin';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';


@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = false;
  
  // Filtering and pagination
  searchTerm = '';
  statusFilter = '';
  ratingFilter = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Make Math available to template
  Math = Math;

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.totalItems = reviews.length;
        
        // Apply filtering
        if (this.searchTerm) {
          this.reviews = this.filterReviewsBySearchTerm(this.reviews);
        }
        
        if (this.statusFilter) {
          this.reviews = this.filterReviewsByStatus(this.reviews);
        }
        
        if (this.ratingFilter) {
          this.reviews = this.filterReviewsByRating(this.reviews);
        }
        
        // Apply sorting
        this.reviews = this.sortReviews(this.reviews);
        
        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.pageSize;
        this.reviews = this.reviews.slice(startIndex, startIndex + this.pageSize);
        
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading reviews', error);
        this.notificationService.showError('Failed to load reviews');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }
  
  filterReviewsBySearchTerm(reviews: Review[]): Review[] {
    return reviews.filter(review => 
      (review.productName?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      review.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  
  filterReviewsByStatus(reviews: Review[]): Review[] {
    return reviews.filter(review => review.status === this.statusFilter);
  }
  
  filterReviewsByRating(reviews: Review[]): Review[] {
    const rating = parseInt(this.ratingFilter);
    return reviews.filter(review => review.rating === rating);
  }
  
  sortReviews(reviews: Review[]): Review[] {
    return [...reviews].sort((a, b) => {
      let compareResult = 0;
      
      if (this.sortField === 'productName') {
        const aName = a.productName || '';
        const bName = b.productName || '';
        compareResult = aName.localeCompare(bName);
      } else if (this.sortField === 'customerName') {
        compareResult = a.customerName.localeCompare(b.customerName);
      } else if (this.sortField === 'rating') {
        compareResult = a.rating - b.rating;
      } else if (this.sortField === 'createdAt') {
        compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return this.sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadReviews();
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.loadReviews();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadReviews();
  }

  updateReviewStatus(id: string, status: Review['status']): void {
    this.loadingService.show();
    
    this.adminService.updateReviewStatus(id, status).subscribe({
      next: () => {
        this.notificationService.showSuccess('Review status updated successfully');
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error updating review status', error);
        this.notificationService.showError('Failed to update review status');
        this.loadingService.hide();
      }
    });
  }

  getStatusBadgeClass(status: Review['status']): string {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
  
  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
  
  getRatingColorClass(rating: number): string {
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-primary';
    if (rating >= 2) return 'text-warning';
    return 'text-danger';
  }
  
  hasPendingReviews(): boolean {
    return this.statusFilter === 'pending' || 
           (this.statusFilter === '' && this.reviews.some(review => review.status === 'pending'));
  }
  
  hasReviewImages(review: Review): boolean {
    return !!review.images && review.images.length > 0;
  }
  
  hasSellerResponse(review: Review): boolean {
    return !!review.response;
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