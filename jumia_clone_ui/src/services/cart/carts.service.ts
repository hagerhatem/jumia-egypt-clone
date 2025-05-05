import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart } from '../../models/cart.model';
import { CartSummary } from '../../models/cart-summary.model';
import { CartItem } from '../../models/cart-item.model';
import { AddCartItem } from '../../models/add-cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartsService {
  private apiUrl = `${environment.apiUrl}/api/Carts`;
  
  // Add a BehaviorSubject to track the cart item count
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();
  
  constructor(private http: HttpClient) {
    // Initialize the cart count if the user is logged in
    this.refreshCartCount();
  }
  
  // Method to refresh the cart count
  refreshCartCount(): void {
    // Only proceed if we have a token (user is logged in)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.getCartItemCount().subscribe({
        next: (count) => {
          this.cartItemCountSubject.next(count);
        },
        error: () => {
          this.cartItemCountSubject.next(0);
        }
      });
    } else {
      this.cartItemCountSubject.next(0);
    }
  }
  
  // Get the user's cart
  getCart(): Observable<Cart> {
    const timestamp = new Date().getTime();
  return this.http.get<any>(`${this.apiUrl}?nocache=${timestamp}`).pipe(
      map(response => {
        // Check if response has the wrapper structure
        const cart = response && response.success && response.data ? response.data : response;
        
        // Update the cart count after successful fetch
        if (cart && cart.cartItems) {
          const count = cart.cartItems.reduce((sum: any, item: { quantity: any; }) => sum + (item.quantity || 1), 0);
          this.cartItemCountSubject.next(count);
        }
        
        return cart;
      }),
      catchError(error => {
        console.error('Error fetching cart:', error);
        return throwError(() => error);
      })
    );
  }

  // Get cart summary (count, total, etc.)
  getCartSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`).pipe(
      map(response => {
        // Update cart count if summary contains the item count
        if (response && response.itemsCount !== undefined) {
          this.cartItemCountSubject.next(response.itemsCount);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching cart summary:', error);
        return throwError(() => error);
      })
    );
  }

  // Get cart items
  getCartItems(): Observable<CartItem[]> {
    const timestamp = new Date().getTime();
    return this.http.get<any>(`${this.apiUrl}?nocache=${timestamp}`).pipe(
      map(response => {
        const items = response.data?.cartItems || [];
        
        // Update cart count
        const count = items.reduce((sum: any, item: { quantity: any; }) => sum + (item.quantity || 1), 0);
        this.cartItemCountSubject.next(count);
        
        return items;
      }),
      catchError(error => {
        console.error('Error fetching cart items:', error);
        return throwError(() => error);
      })
    );
  }

  // Add a new item to the cart
  addItemToCart(productId: number, quantity: number, variantId?: number): Observable<any> {
    const cartItem: AddCartItem = {
      productId,
      quantity,
      variantId: variantId || undefined
    };
  
    return this.http.post<any>(`${this.apiUrl}/items`, cartItem).pipe(
      map(response => {
        // Update cart count after adding an item
        this.getCartItemCount().subscribe(count => {
          this.cartItemCountSubject.next(count);
        });
        return response;
      }),
      catchError(error => {
        console.error('Error adding item to cart:', error);
        return throwError(() => error);
      })
    );
  }

  // Update an item in the cart
  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    // Create a proper object for the request body with both cartItemId and quantity
    const updateData = {
      cartItemId: cartItemId,
      quantity: quantity
    };
    
    return this.http.put(`${this.apiUrl}/items/${cartItemId}`, updateData).pipe(
      map(response => {
        // Get updated cart count after modifying an item
        this.getCartItemCount().subscribe(count => {
          this.cartItemCountSubject.next(count);
        });
        return response;
      }),
      catchError(error => {
        console.error('Error updating cart item:', error);
        return throwError(() => error);
      })
    );
  }

  // Remove an item from the cart
  removeCartItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${cartItemId}`).pipe(
      map(response => {
        // Update cart count after removing an item
        this.getCartItemCount().subscribe(count => {
          this.cartItemCountSubject.next(count);
        });
        return response;
      }),
      catchError(error => {
        console.error('Error removing cart item:', error);
        return throwError(() => error);
      })
    );
  }

  // Clear the entire cart
  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      map(response => {
        // Reset cart count to zero
        this.cartItemCountSubject.next(0);
        return response;
      }),
      catchError(error => {
        console.error('Error clearing cart:', error);
        return throwError(() => error);
      })
    );
  }

  // Get the total number of items in cart
  getCartItemCount(): Observable<number> {
    return this.getCart().pipe(
      map((cart: Cart) => {
        if (cart && cart.cartItems) {
          const count = cart.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
          return count;
        }
        return 0;
      }),
      catchError(error => {
        console.error('Error calculating cart item count:', error);
        return throwError(() => error);
      })
    );
  }

  // Calculate the total price of items in cart
  getCartTotal(): Observable<number> {
    return this.getCart().pipe(
      map((cart: Cart) => {
        if (cart && cart.cartItems) {
          return cart.cartItems.reduce(
            (sum: number, item: { discountedPrice: number; quantity: number; }) => 
              sum + ((item.discountedPrice || 0) * (item.quantity || 1)), 
            0
          );
        }
        return 0;
      }),
      catchError(error => {
        console.error('Error calculating cart total:', error);
        return throwError(() => error);
      })
    );
  }

  // Check if a product is already in the cart
  checkItemInCart(productId: number, variantId?: number): Observable<boolean> {
    return this.getCart().pipe(
      map((cart: Cart) => {
        const items = cart?.cartItems || [];
        return items.some(item => 
          item.productId === productId && 
          (!variantId || item.variantId === variantId)
        );
      }),
      catchError(error => {
        console.error('Error checking item in cart:', error);
        return throwError(() => error);
      })
    );
  }
  
updateCartItemQuantity(productId: number, quantity: number, variantId?: number): Observable<{ success: boolean; message?: string }> {
  const body = { quantity };
  const url = variantId
    ? `${this.apiUrl}/items/${productId}?variantId=${variantId}`
    : `${this.apiUrl}/items/${productId}`;
  return this.http.put<{ success: boolean; message?: string }>(url, body, { withCredentials: true }).pipe(
    map(response => {
      // Update cart count after updating the quantity
      this.getCartItemCount().subscribe(count => {
        this.cartItemCountSubject.next(count);
      });
      return response;
    }),
    catchError(error => {
      console.error('Error updating cart item quantity:', error);
      return throwError(() => error);
    })
  );
}
}