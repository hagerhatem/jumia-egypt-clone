import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressStepComponent } from '../address-step/address-step.component';
import { DeliveryStepComponent } from '../delivery-step/delivery-step.component';
import { PaymentStepComponent } from '../payment-step/payment-step.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CheckoutHeaderComponent } from '../checkout-header/checkout-header.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    AddressStepComponent,
    DeliveryStepComponent,
    PaymentStepComponent,
    OrderSummaryComponent,
    CheckoutHeaderComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  currentStep: number = 1;
  isAddressConfirmed: boolean = false;
  isDeliveryConfirmed: boolean = false;
  isPaymentConfirmed: boolean = false;
  selectedDeliveryOption: string = '';
  deliveryFee: number = 0;
  selectedPaymentMethod: string = '';
  selectedAddressId: number = 0;
  onPaymentConfirmed(paymentMethod: string) {
    this.isPaymentConfirmed = true;
    this.selectedPaymentMethod = paymentMethod;
  }
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/checkout' } 
      });
    }
  }

  onAddressConfirmed(addressId: number) {  
    this.isAddressConfirmed = true;
    this.selectedAddressId = addressId;  
    this.currentStep = 2;
  }

  onDeliveryConfirmed() {
    this.isDeliveryConfirmed = true;
    this.currentStep = 3;
  }


  onDeliveryOptionSelected(option: string) {
    this.selectedDeliveryOption = option;
    this.deliveryFee = option === 'Express Delivery' ? 100 : 50;
  }

  goToNextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

 
    goToPreviousStep() {
      this.router.navigate(['/home']);
    }
    
  }
