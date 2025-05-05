// src/app/services/wishlist/wishlist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, mergeMap, switchMap, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CartsService } from '../cart/carts.service';


export interface WishlistItem {
  wishlistItemId: number;
  wishlistId: number;
  productId: number;
  name: string;
  description: string;
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  mainImageUrl: string;
  isAvailable: boolean;
  stockQuantity: number;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlistId: number;
    customerId: number;
    createdAt: string;
    customerName: string;
    itemsCount: number;
    wishlistItems: WishlistItem[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/api/Wishlists`;
  
  // Store wishlist product IDs in memory
  private wishlistProductIds: Set<number> = new Set<number>();
  
  // BehaviorSubject to notify subscribers when wishlist changes
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  public wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartsService: CartsService
  ) {
    // Initialize wishlist from localStorage or fetch from API when service is created
    this.loadWishlistIds();
  }

  private loadWishlistIds(): void {
    // Get current user
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      // If user is logged in, fetch from API
      this.getWishlist().subscribe({
        next: (response: any) => {
          if (response?.success && response?.data?.wishlistItems) {
            // Clear existing set
            this.wishlistProductIds.clear();
            
            // Add product IDs to the set
            response.data.wishlistItems.forEach((item: WishlistItem) => {
              this.wishlistProductIds.add(item.productId);
            });
            
            // Update count
            this.wishlistCountSubject.next(this.wishlistProductIds.size);
          }
        },
        error: (error) => {
          console.error('Error loading wishlist IDs from API', error);
        }
      });
    }
  }

  getWishlist(): Observable<WishlistResponse> {
    const timestamp = new Date().getTime();
    return this.http.get<WishlistResponse>(`${this.apiUrl}?nocache=${timestamp}`).pipe(
      tap((response: WishlistResponse) => {
        if (response.success && response.data) {
          // Update the product IDs cache
          this.wishlistProductIds.clear();
          response.data.wishlistItems.forEach(item => {
            this.wishlistProductIds.add(item.productId);
          });
          this.wishlistCountSubject.next(this.wishlistProductIds.size);
        }
      }),
      catchError(error => {
        console.error('Error fetching wishlist', error);
        return of({
          success: false,
          message: 'Failed to fetch wishlist',
          data: { wishlistId: 0, customerId: 0, createdAt: '', customerName: '', itemsCount: 0, wishlistItems: [] }
        });
      })
    );
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, { productId }).pipe(
      tap(response => {
        // Add to local cache
        this.wishlistProductIds.add(productId);
        this.wishlistCountSubject.next(this.wishlistProductIds.size);
      }),
      catchError(error => {
        console.error('Error adding item to wishlist', error);
        return of({ success: false, message: 'Failed to add item to wishlist' });
      })
    );
  }

  removeFromWishlist(productId: number): Observable<any> {
    // Use wishlistItemId instead of productId in the URL
    // Since error shows we're trying to access /items/{id} where id seems to be productId
    // Let's first try to find the wishlistItemId for this product
    return this.getWishlist().pipe(
      map(response => {
        if (response?.success && response?.data?.wishlistItems) {
          const item = response.data.wishlistItems.find(item => item.productId === productId);
          if (item) {
            // If we found the item, use the correct wishlistItemId
            return this.http.delete(`${this.apiUrl}/items/${item.wishlistItemId}`).pipe(
              tap(response => {
                // Remove from local cache
                this.wishlistProductIds.delete(productId);
                this.wishlistCountSubject.next(this.wishlistProductIds.size);
              }),
              catchError(error => {
                console.error('Error removing item from wishlist', error);
                return of({ success: false, message: 'Failed to remove item from wishlist' });
              })
            );
          }
        }
        // If we couldn't find the item or the response was not successful
        return of({ success: false, message: 'Item not found in wishlist' });
      }),
      catchError(error => {
        console.error('Error getting wishlist to remove item', error);
        return of({ success: false, message: 'Failed to remove item from wishlist' });
      }),
      // Flatten the observable
      switchMap(result => result instanceof Observable ? result : of(result))
    );
  }

  clearWishlist(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      tap(response => {
        // Clear local cache
        this.wishlistProductIds.clear();
        this.wishlistCountSubject.next(0);
      }),
      catchError(error => {
        console.error('Error clearing wishlist', error);
        return of({ success: false, message: 'Failed to clear wishlist' });
      })
    );
  }

  moveToCart(productId: number): Observable<any> {
    return this.getWishlist().pipe(
      switchMap(response => {
        if (response?.success && response?.data?.wishlistItems) {
          const item = response.data.wishlistItems.find(item => item.productId === productId);
          
          if (item) {
            // Step 1: Add the item to cart using cart service
            // We'll use a default quantity of 1 - adjust as needed
            return this.cartsService.addItemToCart(item.productId, 1).pipe(
              switchMap(cartResponse => {
                if (cartResponse?.success) {
                  // Step 2: If cart add was successful, remove from wishlist
                  return this.http.delete(`${this.apiUrl}/items/${item.wishlistItemId}`).pipe(
                    tap(() => {
                      // Update local state
                      this.wishlistProductIds.delete(productId);
                      this.wishlistCountSubject.next(this.wishlistProductIds.size);
                      
                      // Refresh cart count
                      this.cartsService.refreshCartCount();
                    }),
                    map(() => ({
                      success: true,
                      message: 'Item successfully moved to cart'
                    })),
                    catchError(error => {
                      console.error('Error removing item from wishlist after adding to cart', error);
                      return of({ 
                        success: true, // Still return success since item was added to cart
                        message: 'Item added to cart but could not be removed from wishlist automatically'
                      });
                    })
                  );
                } else {
                  return of({
                    success: false,
                    message: cartResponse?.message || 'Failed to add item to cart'
                  });
                }
              }),
              catchError(error => {
                console.error('Error adding item to cart', error);
                return of({
                  success: false,
                  message: error?.error?.message || 'Failed to add item to cart'
                });
              })
            );
          }
        }
        return of({
          success: false,
          message: 'Item not found in wishlist'
        });
      }),
      catchError(error => {
        console.error('Error getting wishlist to move item to cart', error);
        return of({
          success: false,
          message: 'Failed to move item to cart'
        });
      })
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.has(productId);
  }

  getWishlistCount(): number {
    return this.wishlistProductIds.size;
  }

  toggleWishlistItem(productId: number): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  // Refresh wishlist data from server
  refreshWishlist(): void {
    this.loadWishlistIds();
  }
}