// src/app/pages/admin/admin-header/admin-header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { NotificationService } from '../../../../services/shared/notification.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="jumia-header">
      <div class="header-container">
        <div class="search-container">
          <div class="search-input">
            <span class="search-icon">
              <i class="bi bi-search"></i>
            </span>
            <input type="text" class="search-field" placeholder="Search in admin panel..." [(ngModel)]="searchQuery">
          </div>
        </div>
        
        <div class="header-actions">
          <!-- Notifications dropdown -->
          <div class="dropdown notification-dropdown">
            <button class="notification-button" type="button" id="notificationsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-bell"></i>
              <span class="notification-badge" *ngIf="unreadNotifications > 0">
                {{unreadNotifications}}
              </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end notification-menu" aria-labelledby="notificationsDropdown">
              <li class="notification-header">
                <h6>Notifications</h6>
                <a href="#" class="mark-all-read">Mark all as read</a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li *ngFor="let notification of notifications">
                <a class="notification-item" [class.unread]="!notification.read" href="#">
                  <div class="notification-icon">
                    <div class="icon-circle">
                      <i class="bi {{notification.icon}}"></i>
                    </div>
                  </div>
                  <div class="notification-content">
                    <p class="notification-message">{{notification.message}}</p>
                    <span class="notification-time">{{notification.time | date:'short'}}</span>
                  </div>
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="view-all" href="#">View All Notifications</a></li>
            </ul>
          </div>
          
          <!-- User dropdown -->
          <div class="dropdown user-dropdown">
            <button class="user-button" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="/images/admin.png" class="user-avatar" alt="Admin Avatar">
              <span class="user-name">Admin User</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end user-menu" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
              <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item logout-link" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      --jumia-orange: #f68b1e;
      --jumia-light-orange: #fff1e6;
      --jumia-text: #333333;
      --jumia-light-gray: #f8f9fa;
      --jumia-border: #e9ecef;
    }

    .jumia-header {
      background-color: white;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
    }

    .search-container {
      flex: 1;
      max-width: 500px;
    }

    .search-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #888;
    }

    .search-field {
      width: 100%;
      padding: 10px 10px 10px 35px;
      border: 1px solid var(--jumia-border);
      border-radius: 4px;
      background-color: var(--jumia-light-gray);
      color: var(--jumia-text);
      font-size: 0.9rem;
    }

    .search-field:focus {
      outline: none;
      border-color: var(--jumia-orange);
      box-shadow: 0 0 0 2px rgba(246, 139, 30, 0.2);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .notification-button {
      background: none;
      border: none;
      position: relative;
      padding: 5px;
      font-size: 1.2rem;
      color: var(--jumia-text);
      cursor: pointer;
    }

    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: var(--jumia-orange);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-menu {
      width: 320px;
      padding: 0;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--jumia-border);
      border-radius: 4px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
    }

    .notification-header h6 {
      margin: 0;
      font-weight: 600;
      color: var(--jumia-text);
    }

    .mark-all-read {
      color: var(--jumia-orange);
      font-size: 0.8rem;
      text-decoration: none;
    }

    .notification-item {
      display: flex;
      padding: 12px 15px;
      text-decoration: none;
      color: var(--jumia-text);
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: var(--jumia-light-gray);
    }

    .notification-item.unread {
      background-color: var(--jumia-light-orange);
    }

    .notification-icon {
      margin-right: 12px;
    }

    .icon-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--jumia-orange);
      color: white;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #888;
    }

    .view-all {
      display: block;
      text-align: center;
      padding: 10px;
      color: var(--jumia-orange);
      text-decoration: none;
      font-weight: 500;
    }

    .user-button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      // border-radius: 50%;
      margin-right: 8px;
      // border: 2px solid var(--jumia-light-orange);
    }

    .user-name {
      font-weight: 500;
      color: var(--jumia-text);
      margin-right: 5px;
    }

    .user-menu {
      min-width: 200px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--jumia-border);
    }

    .user-menu .dropdown-item {
      padding: 10px 15px;
      color: var(--jumia-text);
    }

    .user-menu .dropdown-item:hover {
      background-color: var(--jumia-light-orange);
    }

    .logout-link {
      color: #dc3545 !important;
      cursor: pointer;
    }

    .dropdown-divider {
      margin: 0;
      border-top: 1px solid var(--jumia-border);
    }
  `]
})
export class AdminHeaderComponent {
  searchQuery: string = '';
  unreadNotifications: number = 3;
  
  notifications = [
    { 
      message: 'New order #1234 has been placed', 
      time: new Date(), 
      read: false,
      icon: 'bi-cart'
    },
    { 
      message: 'New seller registration request', 
      time: new Date(Date.now() - 3600000), 
      read: false,
      icon: 'bi-shop' 
    },
    { 
      message: 'Product inventory is low for 5 items', 
      time: new Date(Date.now() - 7200000), 
      read: false,
      icon: 'bi-exclamation-triangle'
    },
    { 
      message: 'Monthly sales report is ready', 
      time: new Date(Date.now() - 86400000), 
      read: true,
      icon: 'bi-graph-up'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  logout(): void {
    this.authService.logout();
    this.notificationService.showSuccess('You have been logged out successfully');
    this.router.navigate(['/auth/login']);
  }
}