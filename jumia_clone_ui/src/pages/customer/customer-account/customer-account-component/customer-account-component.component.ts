import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from '../customer-profile-sidebar/customer-profile-sidebar/customer-profile-sidebar.component';
import { AccountOverviewComponent } from '../Account-overview/account-overview/account-overview.component';
import { CustomerOrdersComponent } from '../customer-orders/customer-orders.component'; // Make sure to create this component


@Component({
  selector: 'app-customer-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
  ],
  templateUrl: './customer-account-component.component.html',
  styleUrls: ['./customer-account-component.component.css'],
})
export class CustomerAccountComponent {}
