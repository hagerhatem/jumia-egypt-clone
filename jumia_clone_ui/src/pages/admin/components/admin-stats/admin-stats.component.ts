// src/app/pages/admin/admin-stats/admin-stats.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../../../models/admin';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row">
      <!-- Total revenue card -->
      <div class="col-md-3 col-sm-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <div class="stats-icon bg-primary">
                  <i class="bi bi-currency-dollar text-white fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <h6 class="text-muted fw-normal mt-0">Total Revenue</h6>
                <h3 class="my-2">₦{{stats.revenue.toLocaleString()}}</h3>
                <p class="mb-0">
                  <span [ngClass]="stats.revenueChange >= 0 ? 'text-success' : 'text-danger'">
                    <i class="bi" [ngClass]="stats.revenueChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
                    {{Math.abs(stats.revenueChange)}}%
                  </span>
                  <span class="text-muted ms-1">from last month</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total orders card -->
      <div class="col-md-3 col-sm-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <div class="stats-icon bg-success">
                  <i class="bi bi-cart-check text-white fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <h6 class="text-muted fw-normal mt-0">Total Orders</h6>
                <h3 class="my-2">{{stats.orders.toLocaleString()}}</h3>
                <p class="mb-0">
                  <span [ngClass]="stats.ordersChange >= 0 ? 'text-success' : 'text-danger'">
                    <i class="bi" [ngClass]="stats.ordersChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
                    {{Math.abs(stats.ordersChange)}}%
                  </span>
                  <span class="text-muted ms-1">from last month</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total customers card -->
      <div class="col-md-3 col-sm-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <div class="stats-icon bg-info">
                  <i class="bi bi-people text-white fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <h6 class="text-muted fw-normal mt-0">Total Customers</h6>
                <h3 class="my-2">{{stats.customers.toLocaleString()}}</h3>
                <p class="mb-0">
                  <span [ngClass]="stats.customersChange >= 0 ? 'text-success' : 'text-danger'">
                    <i class="bi" [ngClass]="stats.customersChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
                    {{Math.abs(stats.customersChange)}}%
                  </span>
                  <span class="text-muted ms-1">from last month</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total products card -->
      <div class="col-md-3 col-sm-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <div class="stats-icon bg-warning">
                  <i class="bi bi-box-seam text-white fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <h6 class="text-muted fw-normal mt-0">Total Products</h6>
                <h3 class="my-2">{{stats.products.toLocaleString()}}</h3>
                <p class="mb-0">
                  <span [ngClass]="stats.productsChange >= 0 ? 'text-success' : 'text-danger'">
                    <i class="bi" [ngClass]="stats.productsChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
                    {{Math.abs(stats.productsChange)}}%
                  </span>
                  <span class="text-muted ms-1">from last month</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
  `]
})
export class AdminStatsComponent {
  @Input() stats!: DashboardStats;
  Math = Math;
}