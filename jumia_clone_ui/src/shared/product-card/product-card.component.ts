import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product';

// components/product-card/product-card.component.t

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product: any;

  // Format currency
  formatPrice(price: number): string {
    return price.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  }

  // Calculate discount percentage (rounded)
  getDiscountPercent(): number {
    return Math.round(this.product.discount_percentage);
  }
}