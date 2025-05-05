import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.css'], })
export class CartSummaryComponent {
  @Input() totalPrice: number = 0;
  @Input() hasExpressItems: boolean = false;
  @Input() itemCount: number = 0;
  @Output() refreshCart = new EventEmitter<void>();
  @Output() proceedToCheckout = new EventEmitter<void>();

  qualifiesForFreeShipping(): boolean {
    return this.totalPrice >= 250; // Assuming free shipping threshold is 250
  }

  onRefreshCart() {
    this.refreshCart.emit();
  }

  onProceedToCheckout() {
    this.proceedToCheckout.emit();
  }
}