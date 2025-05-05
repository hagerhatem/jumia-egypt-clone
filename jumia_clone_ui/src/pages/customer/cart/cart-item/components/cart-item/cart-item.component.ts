import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../../../../models/cart-item.model';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CartItemComponent implements OnInit {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<{
    id: number;
    quantity: number;
    onSuccess: () => void;
    onError: () => void;
  }>();
  @Output() onRemoveItem = new EventEmitter<{
    id: number;
    onSuccess: () => void;
    onError: () => void;
  }>();

  showRemoveConfirmation = false;
  quantityOptions: number[] = [];
  isQuantityLoading = false;
  isRemoveLoading = false;

  ngOnInit() {
    this.generateQuantityOptions();
  }

  generateQuantityOptions() {
    const maxQty = this.item.maxQuantity || 10;
    this.quantityOptions = Array.from(
      { length: maxQty },
      (_, i) => i + 1
    );
  }

  getAttributesDisplay(): string {
    if (!this.item.attributes) return '';
    return Object.entries(this.item.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  getStockMessage(): string {
    const maxQty = this.item.maxQuantity || 10;
    return this.item.quantity >= maxQty
      ? 'Maximum quantity reached'
      : `${maxQty - this.item.quantity} items left`;
  }
  
  decreaseQuantity() {
    if (this.item.quantity > 1 && !this.isQuantityLoading) {
      this.isQuantityLoading = true;
      this.quantityChange.emit({
        id: this.item.cartItemId,
        quantity: this.item.quantity - 1,
        onSuccess: () => this.handleQuantityUpdateSuccess(),
        onError: () => this.handleQuantityUpdateError()
      });
    }
  }

  increaseQuantity() {
    const maxQty = this.item.maxQuantity || 10;
    if (this.item.quantity < maxQty && !this.isQuantityLoading) {
      this.isQuantityLoading = true;
      this.quantityChange.emit({
        id: this.item.cartItemId,
        quantity: this.item.quantity + 1,
        onSuccess: () => this.handleQuantityUpdateSuccess(),
        onError: () => this.handleQuantityUpdateError()
      });
    }
  }

  onQuantityChange(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.isQuantityLoading = true;
    this.quantityChange.emit({
      id: this.item.cartItemId,
      quantity: value,
      onSuccess: () => this.handleQuantityUpdateSuccess(),
      onError: () => this.handleQuantityUpdateError()
    });
  }

  onRemove() {
    if (!this.isRemoveLoading) {
      this.showRemoveConfirmation = true;
    }
  }

  confirmRemove() {
    if (!this.isRemoveLoading) {
      this.isRemoveLoading = true;
      this.onRemoveItem.emit({
        id: this.item.cartItemId,
        onSuccess: () => this.handleRemoveSuccess(),
        onError: () => this.handleRemoveError()
      });
    }
  }

  cancelRemove() {
    this.showRemoveConfirmation = false;
  }

  handleQuantityUpdateSuccess() {
    this.isQuantityLoading = false;
  }

  handleQuantityUpdateError() {
    this.isQuantityLoading = false;
  }

  handleRemoveSuccess() {
    this.isRemoveLoading = false;
  }

  handleRemoveError() {
    this.isRemoveLoading = false;
    this.showRemoveConfirmation = false;
  }
}