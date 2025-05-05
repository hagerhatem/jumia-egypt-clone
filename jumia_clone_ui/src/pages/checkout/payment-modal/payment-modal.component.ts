import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { PaymentService } from '../../../services/CheckoutService/payment.service';
import { PaymentResponse } from '../../../models/checkout';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @Input() paymentResponse!: PaymentResponse;
  @Input() paymentMethod: string = 'card';
  @Output() paymentComplete = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<void>();

  iframeUrl!: SafeResourceUrl;
  isLoading = true;
  phoneNumber = '';
  errorMessage = '';
  private statusSubscription!: Subscription;

  constructor(
    private paymentService: PaymentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.paymentMethod === 'card') {
      this.iframeUrl = this.paymentService.getSanitizedPaymentUrl(this.paymentResponse.paymentUrl);
    }

    this.statusSubscription = this.paymentService.paymentStatus$.subscribe(status => {
      if (status === 'success') {
        this.paymentComplete.emit(true);
      } else if (status === 'failed') {
        this.paymentComplete.emit(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  submitMobilePayment(): void {
    if (!this.phoneNumber) {
      this.errorMessage = 'Please enter your phone number';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.processMobilePayment(this.phoneNumber, parseInt(this.paymentResponse.transactionId))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.paymentService.setPaymentStatus('success');
          } else {
            this.errorMessage = response.message || 'Payment failed';
            this.paymentService.setPaymentStatus('failed');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'An error occurred during payment';
          this.paymentService.setPaymentStatus('failed');
        }
      });
  }

  redirectToPaypal(): void {
    window.location.href = this.paymentResponse.paymentUrl;
  }

  handleClose(): void {
    this.closeModal.emit();
  }
}