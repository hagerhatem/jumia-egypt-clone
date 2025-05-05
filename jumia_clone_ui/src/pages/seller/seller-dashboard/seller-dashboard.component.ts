import { Component } from "@angular/core";
import { AuthService } from "../../../services/auth/auth.service";

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  template: `
    <div class="container">
      <h1>Seller Dashboard</h1>
      <p>Welcome, {{ authService.currentUserValue?.firstName }}!</p>
      <p>This page is only accessible to sellers.</p>
      <p>Your user type is: {{ authService.currentUserValue?.userType }}</p>
      <nav>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/seller/products">My Products</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/seller/orders">My Orders</a>
          </li>
        </ul>
      </nav>
    </div>
  `
})
export class SellerDashboardComponent {
  constructor(public authService: AuthService) {}
}