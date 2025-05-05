import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-step.component.html',
  styleUrls: ['./delivery-step.component.css']
})
export class DeliveryStepComponent {
  @Input() currentStep: number = 0;
  @Input() isAddressConfirmed: boolean = false;
  @Output() deliveryOptionSelected = new EventEmitter<string>();
  @Output() nextStep = new EventEmitter<void>();

  isStepCompleted = false;
  isEditingDelivery = false;
  selectedDeliveryOption: string = '';
  deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 50,
      time: '3-5 business days',
      description: 'Regular delivery service with standard tracking'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 100,
      time: '1-2 business days',
      description: 'Fast delivery service with priority handling'
    }
  ];

  selectDeliveryOption(option: any) {
    if (!this.isAddressConfirmed || this.isStepCompleted) return;
    
    this.selectedDeliveryOption = option.id;
    this.deliveryOptionSelected.emit(option.name);
  }

  getSelectedOption() {
    return this.deliveryOptions.find(opt => opt.id === this.selectedDeliveryOption);
  }

  confirmDelivery() {
    if (this.selectedDeliveryOption) {
      this.isStepCompleted = true;
      this.nextStep.emit();
    }
  }

  editDelivery() {
    if (this.isStepCompleted) {
      this.isStepCompleted = false;
      this.isEditingDelivery = true;
    }
  }
}