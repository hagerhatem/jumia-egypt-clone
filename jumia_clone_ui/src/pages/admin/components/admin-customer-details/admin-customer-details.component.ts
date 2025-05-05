// src/app/pages/admin/admin-customer-details/admin-customer-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { Order, User } from '../../../../models/admin';
import { AdminService } from '../../../../services/admin/admin.service';
import { LoadingService } from '../../../../services/shared/loading.service';
import { NotificationService } from '../../../../services/shared/notification.service';


@Component({
  selector: 'app-admin-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-customer-details.component.html'
})
export class AdminCustomerDetailsComponent implements OnInit {
  customerId: number | null = null;
  customer: User | null = null;
  customerOrders: Order[] = [];
  isLoading = false;
  activeTab = 'overview';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.customerId = params['id'];
        this.loadCustomer(this.customerId);
      } else {
        this.router.navigate(['/admin/customers']);
      }
    });
  }

  loadCustomer(id: number | null): void {
    if (!id) return;
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getCustomerById(id).subscribe({
      next: (customer) => {
        if (customer) {
          this.customer = customer;
          this.loadCustomerOrders(id);
        } else {
          this.notificationService.showError('Customer not found');
          this.router.navigate(['/admin/customers']);
        }
      },
      error: (error) => {
        console.error('Error loading customer', error);
        this.notificationService.showError('Failed to load customer');
        this.isLoading = false;
        this.loadingService.hide();
        this.router.navigate(['/admin/customers']);
      }
    });
  }

  loadCustomerOrders(customerId: number): void {
    this.adminService.getOrders({ customerId: this.customerId }).subscribe({
      next: (response) => {
        if (response.success) {
          // Access the data property of the ApiResponse and then filter
          this.customerOrders = response.data.items.filter((order: any) => 
            order.customerId === this.customerId
          );
        } else {
          this.notificationService.showError('Failed to load customer orders');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load customer orders');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  updateCustomerStatus(status: User['status']): void {
    if (!this.customerId) return;
    
    this.loadingService.show();
    
    this.adminService.updateCustomerStatus(this.customerId, status).subscribe({
      next: (updatedCustomer) => {
        if (this.customer) {
          this.customer.status = status;
        }
        this.notificationService.showSuccess('Customer status updated successfully');
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating customer status', error);
        this.notificationService.showError('Failed to update customer status');
        this.loadingService.hide();
      }
    });
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  getStatusBadgeClass(status: User['status']): string {
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

  getOrderStatusBadgeClass(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  calculateTotalSpent(): number {
    return this.customerOrders.reduce((total, order) => {
      if (order.status !== 'cancelled') {
        return total + order.amount;
      }
      return total;
    }, 0);
  }

  getFullName(customer: User): string {
    return `${customer.firstName} ${customer.lastName}`;
  }

  getDefaultAddress(): string {
    if (!this.customer || !this.customer.addresses || this.customer.addresses.length === 0) {
      return 'No address on file';
    }
    
    const defaultAddress = this.customer.addresses.find(a => a.isDefault) || this.customer.addresses[0];
    return `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.zipCode}, ${defaultAddress.country}`;
  }
}