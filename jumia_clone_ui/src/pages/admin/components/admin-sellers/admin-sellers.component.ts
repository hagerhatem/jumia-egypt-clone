import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";

@Component({
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    AdminHeaderComponent, 
    AdminSidebarComponent],
  templateUrl: './admin-sellers.component.html',
  styleUrls: ['./admin-sellers.component.css']
})
export class AdminSellersComponent implements OnInit {
  sellers: any[] = [];
  totalItems: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  isVerifiedFilter: boolean | undefined = undefined;
  loading: boolean = false;
Math=Math;
  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.loading = true;
    this.adminService.getAllSellers(this.pageNumber, this.pageSize, this.searchTerm, this.isVerifiedFilter)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.sellers = response.data.items;
            this.totalItems = response.data.totalCount;
            this.totalPages = response.data.totalPages;
          } else {
            this.notificationService.showError(response.message);
          }
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to load sellers');
          console.error(error);
          this.loading = false;
        }
      });
  }

  deleteSeller(id: number, sellerName: string): void {
    if (confirm(`Are you sure you want to deactivate seller "${sellerName}"? This will hide their account and products.`)) {
      this.adminService.deleteSeller(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess(response.message || 'Seller deactivated successfully');
              this.loadSellers(); // Reload the list
            } else {
              this.notificationService.showError(response.message || 'Failed to deactivate seller');
            }
          },
          error: (error) => {
            this.notificationService.showError('Failed to deactivate seller');
            console.error(error);
          }
        });
    }
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadSellers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadSellers();
  }

  setVerifiedFilter(value: boolean | undefined): void {
    this.isVerifiedFilter = value;
    this.pageNumber = 1;
    this.loadSellers();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadSellers();
  }

  verifySeller(id: number, verify: boolean): void {
    this.adminService.verifySeller(id, verify)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(response.message);
            this.loadSellers();
            
            // Find and update the seller
            const sellerIndex = this.sellers.findIndex(seller => seller.sellerId === id);
            if (sellerIndex !== -1) {
              this.sellers[sellerIndex] = {
                ...this.sellers[sellerIndex],
                isVerified: verify
              };
              // Force change detection
              this.cdr.detectChanges();
            }
          } else {
            this.notificationService.showError(response.message);
          }
        },
        error: (error) => {
          this.notificationService.showError('Failed to update seller verification status');
          console.error(error);
        }
      });
  }
  
}