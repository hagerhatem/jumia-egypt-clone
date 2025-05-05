// src/app/pages/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../components/admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';
import { AdminStatsComponent } from '../components/admin-stats/admin-stats.component';
import { DashboardStats } from '../../../models/admin';
import { AdminService } from '../../../services/admin/admin.service';
import { LoadingService } from '../../../services/shared/loading.service';
import { NotificationService } from '../../../services/shared/notification.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminSidebarComponent,
    AdminHeaderComponent,
    AdminStatsComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.loadingService.show();
    
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading dashboard stats', error);
        this.notificationService.showError('Failed to load dashboard statistics');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }
}