import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartItem } from '../../../models/cart-item.model';
import { CartItemComponent } from './cart-item/components/cart-item/cart-item.component';
import { CartSummaryComponent } from './cart-summary/components/cart-summary/cart-summary.component';
import { CartsService } from '../../../services/cart/carts.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subscription } from 'rxjs';
import { Cart } from '../../../models/cart.model';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../../services/shared/notification.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [CommonModule, CartItemComponent, CartSummaryComponent, RouterModule],
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoading: boolean = false;
  isProcessing: boolean = false;
  error: string | null = null;
  totalAmount: number = 0;
  itemCount: number = 0;
  hasExpressItems: boolean = false;
  showClearCartConfirmation: boolean = false;
  private cartCountSubscription: Subscription | null = null;

  constructor(
    private cartService: CartsService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.loadCart();
    this.cartCountSubscription = this.cartService.cartItemCount$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(count => {
        if (count !== this.itemCount && !this.isLoading && !this.isProcessing) {
          this.loadCart();
        }
      });
  }

  ngOnDestroy() {
    if (this.cartCountSubscription) {
      this.cartCountSubscription.unsubscribe();
    }
  }

  loadCart() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;
    
    this.cartService.getCart().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (cart: Cart) => {
        if (cart && cart.cartItems) {
          this.cartItems = cart.cartItems.map(item => {
            const attributes: {[key: string]: string} = {};
            if (item.variantName) {
              attributes['Variant'] = item.variantName;
            }
            
            let imageUrl = item.productImage || '';
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `${environment.apiUrl}/${imageUrl}`;
            }
            
            return {
              ...item,
              name: item.productName || '',
              imageUrl: imageUrl,
              productImage: imageUrl,
              discountedPrice: item.priceAtAddition || 0,
              originalPrice: item.originalPrice || null,
              percentOff: item.percentOff || null,
              isJumiaExpress: item.productId % 3 === 0,
              maxQuantity: item.maxQuantity || 10,
              attributes: attributes,
              quantity: item.quantity || 1
            };
          });
          
          this.calculateCartTotals();
          this.checkForExpressItems();
          this.notificationService.showSuccess("Cart Loaded successfully!");
        } else {
          this.resetCart();
        }
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error = 'Failed to load your cart. Please try again.';
        this.resetCart();
      },
    });
  }

  private resetCart() {
    this.cartItems = [];
    this.totalAmount = 0;
    this.itemCount = 0;
    this.hasExpressItems = false;
  }

  calculateCartTotals() {
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + ((item.discountedPrice || 0) * (item.quantity || 1)), 
      0
    );
    
    this.itemCount = this.cartItems.reduce(
      (sum, item) => sum + (item.quantity || 1), 
      0
    );
  }

  checkForExpressItems() {
    this.hasExpressItems = this.cartItems.some(item => item.isJumiaExpress);
  }

  updateItemQuantity(event: { id: number; quantity: number; onSuccess: () => void; onError: () => void }) {
    const itemIndex = this.cartItems.findIndex(item => item.cartItemId === event.id);
    if (itemIndex === -1) {
      console.error(`Item with ID ${event.id} not found in cart`);
      event.onError();
      return;
    }
    
    const item = this.cartItems[itemIndex];
    const maxQty = item.maxQuantity || 10;
    let quantity = event.quantity;
    
    if (quantity < 1) {
      quantity = 1;
    } else if (quantity > maxQty) {
      quantity = maxQty;
    }
    
    if (quantity === item.quantity) {
      event.onSuccess();
      return;
    }
    
    const originalQuantity = this.cartItems[itemIndex].quantity;
    this.cartItems[itemIndex].quantity = quantity;
    this.calculateCartTotals();
    
    this.isProcessing = true;
    
    this.cartService.updateCartItem(event.id, quantity).pipe(
      finalize(() => {
        this.isProcessing = false;
      }),
      catchError(err => {
        console.error('Error updating item quantity:', err);
        this.error = 'Failed to update item quantity. Please try again.';
        this.cartItems[itemIndex].quantity = originalQuantity;
        this.calculateCartTotals();
        event.onError();
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        console.log(`Quantity updated successfully to ${quantity}`);
        event.onSuccess();
      } else {
        event.onError();
      }
    });
  }

  removeItem(event: { id: number; onSuccess: () => void; onError: () => void }) {
    const itemIndex = this.cartItems.findIndex(item => item.cartItemId === event.id);
    if (itemIndex === -1) {
      event.onError();
      return;
    }
    
    const removedItem = this.cartItems[itemIndex];
    this.cartItems.splice(itemIndex, 1);
    this.calculateCartTotals();
    this.checkForExpressItems();
    
    this.isProcessing = true;
    
    this.cartService.removeCartItem(event.id).pipe(
      finalize(() => {
        this.isProcessing = false;
      }),
      catchError(err => {
        console.error('Error removing item:', err);
        this.error = 'Failed to remove item from cart. Please try again.';
        this.cartItems.splice(itemIndex, 0, removedItem);
        this.calculateCartTotals();
        this.checkForExpressItems();
        event.onError();
        return of(null);
      })
    ).subscribe({
      next: () => {
        event.onSuccess();
      },
      error: () => {
        event.onError();
      }
    });
  }

  // clearCart() {
  //   if (this.cartItems.length === 0) return;
    
  //   const originalItems = [...this.cartItems];
  //   this.resetCart();
    
  //   this.isProcessing = true;
    
  //   this.cartService.clearCart().pipe(
  //     finalize(() => this.isProcessing = false),
  //     catchError(err => {
  //       console.error('Error clearing cart:', err);
  //       this.error = 'Failed to clear your cart. Please try again.';
  //       this.cartItems = originalItems;
  //       this.calculateCartTotals();
  //       this.checkForExpressItems();
  //       return of(null);
  //     })
  //   ).subscribe();
  // }

  getCartItemCount(): number {
    return this.itemCount;
  }

  getTotalPrice(): number {
    return this.totalAmount;
  }

  hasJumiaExpressItems(): boolean {
    return this.hasExpressItems;
  }

  refreshCart() {
    this.loadCart();
  }

  checkout() {
    if (this.cartItems.length === 0) {
      this.error = 'Your cart is empty. Please add items before checkout.';
      return;
    }
    
    console.log('Proceeding to checkout with total amount:', this.totalAmount);
    this.router.navigate(['/checkout']);
  }



  onClearCart() {
    if (this.cartItems.length === 0) return;
    this.showClearCartConfirmation = true;
  }

  cancelClearCart() {
    this.showClearCartConfirmation = false;
  }

  confirmClearCart() {
    this.clearCart();
    this.showClearCartConfirmation = false;
  }

  clearCart() {
    if (this.cartItems.length === 0) return;
    
    const originalItems = [...this.cartItems];
    this.resetCart();
    
    this.isProcessing = true;
    
    this.cartService.clearCart().pipe(
      finalize(() => {
        this.isProcessing = false;
        this.notificationService.showSuccess("Cart cleared successfully!");
      }),
      catchError(err => {
        console.error('Error clearing cart:', err);
        this.error = 'Failed to clear your cart. Please try again.';
        this.cartItems = originalItems;
        this.calculateCartTotals();
        this.checkForExpressItems();
        return of(null);
      })
    ).subscribe();
  }
}