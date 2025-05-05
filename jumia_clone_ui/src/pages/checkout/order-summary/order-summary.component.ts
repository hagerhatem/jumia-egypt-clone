import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../../services/CheckoutService/CheckoutService';
import { NotificationService } from '../../../services/shared/notification.service';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { PaymentResponse } from '../../../models/checkout';
import { CartsService } from '../../../services/cart/carts.service';
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, PaymentModalComponent],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
})
export class OrderSummaryComponent {
  @Input() itemsTotal: number = 0.00;
  @Input() deliveryFee: number = 0.00;
  @Input() selectedDeliveryOption: string = '';
  @Input() addressId: number = 0;
  @Input() paymentMethod: string = '';
  @Output() orderConfirmed = new EventEmitter<void>();

  showPaymentModal = false;
  paymentResponse!: PaymentResponse;
  isProcessing = false;

  constructor(
    private ordersService: CheckoutService,
    private router: Router,
    private notificationService: NotificationService,
    private cartService: CartsService
  ) {
    this.loadCartTotal();
  }
  private loadCartTotal() {
    this.cartService.getCartSummary().subscribe({
      next: (response) => {
        this.itemsTotal = response.data.subTotal;
        console.log('Cart total:', response.data.subTotal);
      },
      error: (error) => {
        console.error('Error loading cart total:', error);
        this.notificationService.showError('Failed to load cart total');
      }
    });
  }
  get total(): number {
    return this.itemsTotal + this.deliveryFee;
  }

  confirmOrder() {
    if (!this.addressId) {
      this.notificationService.showError('Please select a delivery address');
      return;
    }

    if (!this.selectedDeliveryOption) {
      this.notificationService.showError('Please select a delivery option');
      return;
    }

    if (!this.paymentMethod) {
      this.notificationService.showError('Please select a payment method');
      return;
    }

    this.isProcessing = true;

    this.ordersService.completeOrderWithPayment(this.addressId, undefined, this.paymentMethod)
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          
          if (response.orderResponse.success) {
            if (response.paymentResponse && response.paymentResponse.success) {
              this.paymentResponse = response.paymentResponse;
              window.location.href = response.paymentResponse.paymentUrl;
              this.showPaymentModal = true;
            } else {
              this.notificationService.showError('Payment initiation failed');
            }
          } else {
            this.notificationService.showError(response.orderResponse.message || 'Failed to place order');
          }
        },
        error: (error) => {
          this.isProcessing = false;
          console.error('Error placing order:', error);
          this.notificationService.showError(error.message || 'Failed to place order');
        }
      });
  }

  onPaymentComplete(success: boolean) {
    this.showPaymentModal = false;
    
    if (success) {
      this.notificationService.showSuccess('Payment completed successfully!');
      this.orderConfirmed.emit();
      this.router.navigate(['/order-confirmation']);
    } else {
      this.notificationService.showError('Payment failed. Please try again.');
    }
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.notificationService.showWarning('Payment was cancelled');
  }
}