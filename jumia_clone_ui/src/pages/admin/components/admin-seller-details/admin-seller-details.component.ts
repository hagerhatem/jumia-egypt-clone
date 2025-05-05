// src/app/pages/admin/admin-seller-details/admin-seller-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { Seller, Product } from '../../../../models/admin';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';

@Component({
  selector: 'app-admin-seller-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminSidebarComponent, AdminHeaderComponent],
  templateUrl: './admin-seller-details.component.html',
  styleUrls: ['./admin-seller-details.component.css']
})
export class AdminSellerDetailsComponent implements OnInit {
  seller: Seller | null = null;
  sellerProducts: Product[] = [];
  sellerId: number = 0;
  isLoading = false;
  activeTab = 'overview';
  rejectionReason = '';

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.sellerId = +params['id'];
        this.loadSellerDetails(this.sellerId);
      }
    });
  }

  loadSellerDetails(id: number): void {
    this.isLoading = true;
    this.loadingService.show();

    this.adminService.getSellerById(id).subscribe({
      next: (seller: Seller) => {
        this.seller = seller;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error: Error) => {
        console.error('Error loading seller details:', error);
        this.notificationService.showError('Failed to load seller details');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  updateSellerStatus(status: 'active' | 'inactive' | 'banned'): void {
    if (!this.sellerId) return;

    this.isLoading = true;
    this.loadingService.show();

    // Convert status string to boolean for the API
    const isActive = status === 'active';

    this.adminService.updateSellerStatus(this.sellerId, isActive).subscribe({
      next: (updatedSeller: Seller) => {
        this.seller = updatedSeller;
        this.notificationService.showSuccess(`Seller status updated to ${status} successfully`);
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error: Error) => {
        console.error('Error updating seller status:', error);
        this.notificationService.showError('Failed to update seller status');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  getFullName(seller: Seller | null): string {
    if (!seller) return '';
    return `${seller.firstName} ${seller.lastName}`;
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  updateVerificationStatus(status: 'verified' | 'rejected'): void {
    if (!this.sellerId) return;

    this.isLoading = true;
    this.loadingService.show();

    this.adminService.updateVerificationStatus(
      this.sellerId,
      status,
      status === 'rejected' ? this.rejectionReason : undefined
    ).subscribe({
      next: (updatedSeller: Seller) => {
        this.seller = updatedSeller;
        this.rejectionReason = '';
        this.notificationService.showSuccess('Seller verification status updated successfully');
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error: Error) => {
        console.error('Error updating seller verification status:', error);
        this.notificationService.showError('Failed to update seller verification status');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  getStatusBadgeClass(status: Seller['status']): string {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'banned':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getVerificationBadgeClass(status: Seller['verificationStatus']): string {
    switch (status) {
      case 'verified':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}