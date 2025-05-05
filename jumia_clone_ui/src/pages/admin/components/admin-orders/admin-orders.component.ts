import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading: boolean = false;
  totalCount: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  
  // Filters
  statusFilter: string = '';
  paymentStatusFilter: string = '';
  
  // Status options
  orderStatuses: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  paymentStatuses: string[] = ['pending', 'paid', 'failed', 'refunded'];

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    
    // Build query parameters
    const params: any = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
    
    // Add filters if selected
    if (this.statusFilter) {
      params.status = this.statusFilter;
    }
    
    if (this.paymentStatusFilter) {
      params.paymentStatus = this.paymentStatusFilter;
    }
    
    this.adminService.getOrders(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data.items;
          this.totalCount = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          this.notificationService.showError('Failed to load orders');
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load orders');
        console.error(error);
        this.loading = false;
      }
    });
  }
  
  applyFilters(): void {
    this.pageNumber = 1; // Reset to first page when applying filters
    this.loadOrders();
  }
  
  resetFilters(): void {
    this.statusFilter = '';
    this.paymentStatusFilter = '';
    this.pageNumber = 1;
    this.loadOrders();
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.pageNumber = page;
    this.loadOrders();
  }
  
  // Helper method to count total items in an order
  getTotalItems(order: any): number {
    let totalItems = 0;
    if (order.subOrders) {
      order.subOrders.forEach((subOrder: any) => {
        if (subOrder.orderItems) {
          subOrder.orderItems.forEach((item: any) => {
            totalItems += item.quantity;
          });
        }
      });
    }
    return totalItems;
  }
  
  // Helper method to count suborders
  getSubOrderCount(order: any): number {
    return order.subOrders ? order.subOrders.length : 0;
  }
}