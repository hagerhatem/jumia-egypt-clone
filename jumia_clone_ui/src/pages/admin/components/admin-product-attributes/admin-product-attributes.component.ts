import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";

@Component({
  selector: 'app-admin-product-attributes',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule, 
    AdminHeaderComponent, 
    AdminSidebarComponent
  ],
  templateUrl: './admin-product-attributes.component.html',
  styleUrls: ['./admin-product-attributes.component.css']
})
export class AdminProductAttributesComponent implements OnInit {
  attributes: any[] = [];
  totalItems: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  loading: boolean = false;
  Math = Math;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadAttributes();
  }

  loadAttributes(): void {
    this.loading = true;
    this.adminService.getAllProductAttributes(this.pageNumber, this.pageSize, this.searchTerm)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.attributes = response.data.items || response.data;
            this.totalItems = response.totalItems || this.attributes.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          } else {
            this.notificationService.showError(response.message || 'Failed to load attributes');
          }
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to load attributes');
          console.error(error);
          this.loading = false;
        }
      });
  }

  deleteAttribute(id: number, attributeName: string): void {
    if (confirm(`Are you sure you want to delete attribute "${attributeName}"?`)) {
      this.adminService.deleteProductAttribute(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess(response.message || 'Attribute deleted successfully');
              this.loadAttributes(); // Reload the list
            } else {
              this.notificationService.showError(response.message || 'Failed to delete attribute');
            }
          },
          error: (error) => {
            this.notificationService.showError('Failed to delete attribute. It might be in use by products.');
            console.error(error);
          }
        });
    }
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadAttributes();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadAttributes();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadAttributes();
  }
}