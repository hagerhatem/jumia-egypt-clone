import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/shared/notification.service';
import { PaymentService } from '../../../services/CheckoutService/payment.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-callback">
      <div class="loading-container" *ngIf="isProcessing">
        <div class="spinner"></div>
        <h2>Verifying your payment...</h2>
        <p>Please wait while we confirm your payment status.</p>
      </div>
      
      <div class="result-container" *ngIf="!isProcessing">
        <div *ngIf="isSuccess" class="success">
          <i class="fas fa-check-circle"></i>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully.</p>
          <button class="btn btn-primary" (click)="navigateToOrders()">View My Orders</button>
        </div>
        
        <div *ngIf="!isSuccess && !isProcessing" class="failure">
          <i class="fas fa-times-circle"></i>
          <h2>Payment Failed</h2>
          <p>{{ errorMessage }}</p>
          <button class="btn btn-primary" (click)="navigateToCheckout()">Try Again</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-callback {
      max-width: 600px;
      margin: 50px auto;
      padding: 30px;
      text-align: center;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .loading-container, .result-container {
      padding: 20px;
    }
    
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #f68b1e;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .success i, .failure i {
      font-size: 60px;
      margin-bottom: 20px;
    }
    
    .success i {
      color: #2ecc71;
    }
    
    .failure i {
      color: #e74c3c;
    }
    
    h2 {
      margin-bottom: 15px;
    }
    
    .btn {
      margin-top: 20px;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
    }
    
    .btn-primary {
      background-color: #f68b1e;
      color: white;
    }
  `]
})
export class PaymentCallbackComponent implements OnInit {
  isProcessing = true;
  isSuccess = false;
  errorMessage = 'An error occurred during payment processing.';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    // Get query parameters from the URL
    this.route.queryParams.subscribe(params => {
      const success = params['success'];
      const transactionId = params['transaction_id'];
      
      if (success === 'true' && transactionId) {
        this.verifyPayment(transactionId);
      } else {
        this.isProcessing = false;
        this.isSuccess = false;
        this.errorMessage = params['error_message'] || 'Payment was not completed.';
        this.paymentService.setPaymentStatus('failed');
      }
    });
  }
  
  verifyPayment(transactionId: string): void {
    this.paymentService.verifyPayment(transactionId).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.isSuccess = true;
          this.paymentService.setPaymentStatus('success');
          this.notificationService.showSuccess('Payment completed successfully!');
        } else {
          this.isSuccess = false;
          this.errorMessage = response.message || 'Payment verification failed.';
          this.paymentService.setPaymentStatus('failed');
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.isSuccess = false;
        this.errorMessage = error.message || 'An error occurred during payment verification.';
        this.paymentService.setPaymentStatus('failed');
      }
    });
  }
  
  navigateToOrders(): void {
    this.router.navigate(['/customer/orders']);
  }
  
  navigateToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}