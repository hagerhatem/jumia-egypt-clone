// src/app/pages/admin/admin-sidebar/admin-sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./admin-sidebar.component.css'],
  template: `
    <div class="sidebar-container p-3" style="height: 100vh;">
      <div class="d-flex align-items-center justify-content-center mb-4">
        <img src="/images/jumiaLogo.png" alt="Jumia Logo" height="40" class="jmlogo">
        <h4 class="text-white mb-0">Admin</h4>
      </div>
      
      <ul class="nav flex-column">
        <li class="nav-item mb-2" *ngFor="let item of menuItems">
          <a 
            class="nav-link d-flex align-items-center" 
            [routerLink]="item.route"
            routerLinkActive="active"
            [ngClass]="{'active': item.active}"
          >
            <i class="bi {{ item.icon }} me-2"></i>
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    /* Jumia Colors - Light Theme */
    :host {
      --jumia-orange: #f68b1e;
      --jumia-light-orange: #fff1e6;
      --jumia-text: #333333;
      --jumia-light-gray: #f8f9fa;
      --jumia-border: #e9ecef;
    }
    
    .sidebar-container {
      background-color: white;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      overflow-y: auto;
      border-right: 1px solid var(--jumia-border);
    }
    
    /* Logo styling */
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--jumia-border);
    }
    
    .logo-text {
      color: var(--jumia-orange);
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .jmlogo{
      width: 180px;
      height: 40px;
      margin-left: 60px;
      
    }
    
    /* User profile section */
    .user-profile {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: var(--jumia-light-gray);
      border-radius: 8px;
      border: 1px solid var(--jumia-border);
    }
    
    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--jumia-orange);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: white;
      font-size: 1.2rem;
    }
    
    .user-info {
      flex: 1;
    }
    
    .user-name {
      color: var(--jumia-text);
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .user-role {
      color: #6c757d;
      font-size: 0.75rem;
    }
    
    /* Navigation styling */
    .nav-item {
      margin-bottom: 0.5rem;
    }
    
    .nav-link {
      color: var(--jumia-text);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
    }
    
    .nav-link:hover {
      color: var(--jumia-orange);
      background-color: var(--jumia-light-orange);
    }
    
    .nav-link.active {
      color: var(--jumia-orange);
      background-color: var(--jumia-light-orange);
      font-weight: 600;
    }
    
    .menu-icon {
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
      margin-right: 12px;
      color: var(--jumia-orange);
    }
    
    .menu-text {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    /* Footer section */
    .sidebar-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--jumia-border);
    }
    
    .logout-link {
      display: flex;
      align-items: center;
      color: #6c757d;
      padding: 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .logout-link:hover {
      color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 4px;
    }
    
    ::-webkit-scrollbar-track {
      background: var(--jumia-light-gray);
    }
    
    ::-webkit-scrollbar-thumb {
      background: #ced4da;
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #adb5bd;
    }
  `]
})
export class AdminSidebarComponent {
  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'bi-house-fill', route: '/admin', active: true },
    { label: 'Products', icon: 'bi-box-seam', route: '/admin/products' },
    { label: 'Product Attributes', icon: 'bi-box-seam', route: '/admin/product-attributes' },
    { label: 'Categories', icon: 'bi-tags', route: '/admin/categories' },
    { label: 'Subcategories', icon: 'bi-list', route: '/admin/subcategories' },
    { label: 'Orders', icon: 'bi-cart-check', route: '/admin/orders' },
    { label: 'Customers', icon: 'bi-people', route: '/admin/customers' },
    { label: 'Sellers', icon: 'bi-shop', route: '/admin/sellers' },
    { label: 'Reviews', icon: 'bi-star', route: '/admin/reviews' },
    { label: 'Settings', icon: 'bi-gear', route: '/admin/settings' }
  ];
}