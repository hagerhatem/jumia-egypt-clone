import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-step.component.html',
  styleUrls: ['./payment-step.component.css', '../checkout/checkout.component.css']
})
export class PaymentStepComponent {
  isEditingPayment: boolean = false;
  @Input() currentStep: number = 0;
  @Input() isDeliveryConfirmed: boolean = false;
  @Output() nextStep = new EventEmitter<string>();

  selectedPaymentMethod: string = '';
  isStepCompleted: boolean = false;

  paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: 'fa-credit-card' },
    { id: 'vodafone', name: 'Vodafone Wallet', icon: 'fa-mobile-alt' },
    { id: 'paypal', name: 'PayPal', icon: 'fa-paypal' }
  ];

  onPaymentMethodChange() {
    if (this.isStepCompleted) {
      this.isStepCompleted = false;
    }
  }

  confirmPaymentMethod() {
    if (this.selectedPaymentMethod) {
      this.isStepCompleted = true;
      this.nextStep.emit(this.selectedPaymentMethod);
    }
  }

  editPayment() {
    this.isEditingPayment = true;
    this.isStepCompleted = false;
  }

  getSelectedPaymentMethod() {
    return this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
  }
}