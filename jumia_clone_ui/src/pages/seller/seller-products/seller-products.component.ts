import { Component } from "@angular/core";

@Component({
  selector: 'app-seller-products',
  standalone: true,
  template: `
    <div class="container">
      <h1>My Products</h1>
      <p>This page is only accessible to sellers.</p>
      <p>Here you would manage your product listings.</p>
    </div>
  `
})
export class SellerProductsComponent {}