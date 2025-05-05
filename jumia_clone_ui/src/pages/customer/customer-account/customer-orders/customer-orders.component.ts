// orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { CustomerOrdersService } from '../../../../services/customer/customer-orders.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { OrderDto } from '../../../../models/order.model';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbNavModule, MatIconModule],
  templateUrl: './customer-orders.component.html',
  styleUrls: ['./customer-orders.component.css'],
})
export class CustomerOrdersComponent implements OnInit {
  active = 'ongoing';
  orders: OrderDto[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private ordersService: CustomerOrdersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const currentUser = this.authService.currentUserValue;
    console.log('Current User:', currentUser);

    if (!currentUser?.userId) {
      console.log('No user ID found');
      this.loading = false;
      return;
    }

    this.ordersService
      .getCustomerOrders(currentUser.entityId, this.page, this.pageSize) // Use actual userId instead of hardcoded 1
      .subscribe({
        next: (response) => {
          console.log('Orders API Response:', response);
          if (response.success) {
            this.orders = response.data.items;
            this.totalItems = response.data.totalCount;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.loading = false;
        },
      });
  }

  getOngoingOrdersCount(): number {
    return this.orders.filter((o) =>
      o.subOrders.some((so) => so.status !== 'Canceled')
    ).length;
  }

  getCanceledOrdersCount(): number {
    return this.orders.filter((o) =>
      o.subOrders.every((so) => so.status === 'Canceled')
    ).length;
  }

  getFilteredOrders(): OrderDto[] {
    return this.orders.filter((o) => {
      const allSubOrdersCanceled = o.subOrders.every(
        (so) => so.status === 'Canceled'
      );
      if (this.active === 'ongoing') {
        return !allSubOrdersCanceled;
      } else {
        return allSubOrdersCanceled;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'bg-warning',
      Processing: 'bg-info',
      Shipped: 'bg-primary',
      Delivered: 'bg-success',
      Canceled: 'bg-danger',
    };
    return statusMap[status] || 'bg-secondary';
  }

  getPaymentStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-warning',
      paid: 'bg-success',
      failed: 'bg-danger',
      refunded: 'bg-info',
      partially_refunded: 'bg-info',
    };
    return statusMap[status.toLowerCase()] || 'bg-secondary';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  getTotalItems(order: OrderDto): number {
    return order.subOrders.reduce(
      (total, subOrder) => total + subOrder.orderItems.length,
      0
    );
  }

  navigateToShop() {
    this.router.navigate(['/']);
  }
}
