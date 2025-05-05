import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    AdminHeaderComponent, 
    AdminSidebarComponent],
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.css']
})
export class AdminCustomersComponent implements OnInit {
  customers: any[] = [];
  totalItems: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  loading: boolean = false;
  Math = Math;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.adminService.getAllCustomers(this.pageNumber, this.pageSize, this.searchTerm)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.customers = response.data.items;
            this.totalItems = response.data.totalCount;
            this.totalPages = response.data.totalPages;
          } else {
            this.notificationService.showError(response.message);
          }
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to load customers');
          console.error(error);
          this.loading = false;
        }
      });
  }

  deleteCustomer(id: number, customerName: string): void {
    if (confirm(`Are you sure you want to deactivate customer "${customerName}"? This will hide their account.`)) {
      this.adminService.deleteCustomer(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess(response.message || 'Customer deactivated successfully');
              this.loadCustomers(); // Reload the list
            } else {
              this.notificationService.showError(response.message || 'Failed to deactivate customer');
            }
          },
          error: (error) => {
            this.notificationService.showError('Failed to deactivate customer');
            console.error(error);
          }
        });
    }
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadCustomers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadCustomers();
  }
}