import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../../../../services/wishlist/wishlist.service';
import { Subscription } from 'rxjs';

// Updated interface to match the actual API response
export interface WishlistItem {
  wishlistItemId: number;
  wishlistId: number;
  productId: number;
  productName: string;
  productDescription: string;
  basePrice: number;
  discountPercentage: number;
  currentPrice: number;
  mainImageUrl: string;
  isAvailable: boolean;
  stockQuantity: number;
  addedAt: string;
}
import { NotificationService } from '../../../../services/notification/notification.service';
import { CartsService } from '../../../../services/cart/carts.service';
import { environment } from '../../../../environments/environment';
import { Helpers } from '../../../../Utility/helpers';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent extends Helpers implements OnInit, OnDestroy {
  wishlistItems: WishlistItem[] = [];
  loading = true;
  error: string | null = null;
  movingToCart: { [productId: number]: boolean } = {};
  private wishlistSubscription: Subscription | null = null;

  // Custom notification properties
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'warning' | 'error' = 'success';
  
  // Clear wishlist confirmation properties
  showClearWishlistConfirmation = false;
  
  constructor(
    private wishlistService: WishlistService,
    private cartsService: CartsService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadWishlistItems();
    
    // Subscribe to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlistCount$.subscribe(() => {
      // Reload wishlist items whenever the wishlist count changes
      // this.loadWishlistItems();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
  }

  loadWishlistItems(): void {
    this.loading = true;
    this.error = null;

    this.wishlistService.getWishlist().subscribe({
      next: (response: any) => {
        if (response && response.success && response.data && response.data.wishlistItems) {
          this.wishlistItems = response.data.wishlistItems;
          
          // Initialize movingToCart for each item
          this.wishlistItems.forEach(item => {
            this.movingToCart[item.productId] = false;
          });
          
          console.log('Wishlist items loaded:', this.wishlistItems);
        } else {
          this.wishlistItems = [];
          this.error = response.message || 'No items in your wishlist';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading wishlist', err);
        this.error = 'Failed to load wishlist. Please try again.';
        this.loading = false;
      }
    });
  }

  // Custom notification methods
  showCustomNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Hide notification after 5 seconds if not manually closed
    setTimeout(() => {
      if (this.showNotification) {
        this.showNotification = false;
      }
    }, 5000);
  }

  hideNotification(): void {
    this.showNotification = false;
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.wishlistItems = this.wishlistItems.filter(item => item.productId !== productId);
          // Show custom notification instead of using notification service
          this.showCustomNotification('Item removed from wishlist', 'warning');
        } else {
          this.showCustomNotification(response.message || 'Failed to remove item from wishlist', 'error');
        }
      },
      error: (err) => {
        console.error('Error removing from wishlist', err);
        this.showCustomNotification('Failed to remove item from wishlist', 'error');
      }
    });
  }

  // Navigate to product details page
  navigateToProduct(productId: number, event: MouseEvent): void {
    // Check if the click was on a button or link
    const target = event.target as HTMLElement;
    if (target && (
      target.tagName === 'BUTTON' || 
      target.closest('button') || 
      target.tagName === 'A' || 
      target.closest('a')
    )) {
      // If clicked on a button or link, don't navigate
      return;
    }
    
    // Navigate to product details page
    this.router.navigate(['/Products', productId]);
  }

  moveToCart(productId: number): void {
    // If already processing, skip
    if (this.movingToCart[productId]) {
      return;
    }

    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      this.showCustomNotification('Please log in to add items to your cart', 'warning');
      return;
    }

    // Mark as processing
    this.movingToCart[productId] = true;

    // Use the updated service method that leverages cartsService
    this.wishlistService.moveToCart(productId).subscribe({
      next: (response) => {
        if (response && response.success) {
          // Remove item from wishlist display
          this.wishlistItems = this.wishlistItems.filter(item => item.productId !== productId);
          this.showCustomNotification('Item added to cart successfully', 'success');
          
          // No need to refresh cart, the service already did that
        } else {
          this.showCustomNotification(response.message || 'Failed to add item to cart', 'error');
          // If there was a partial success (item added to cart but not removed from wishlist)
          if (response.message?.includes('but could not be removed')) {
            // Refresh the wishlist to show correct state
            setTimeout(() => this.loadWishlistItems(), 300);
          }
        }
        this.movingToCart[productId] = false;
      },
      error: (err) => {
        console.error('Error moving item to cart', err);
        this.showCustomNotification('Failed to add item to cart. Please try again later.', 'error');
        this.movingToCart[productId] = false;
        
        // Make sure to refresh the wishlist to maintain consistency
        setTimeout(() => this.loadWishlistItems(), 500);
      }
    });
  }

  // Show confirmation dialog for clearing wishlist
  showClearConfirmation(): void {
    this.showClearWishlistConfirmation = true;
  }

  // Cancel clearing wishlist
  cancelClearWishlist(): void {
    this.showClearWishlistConfirmation = false;
  }

  // Confirm clearing wishlist
  confirmClearWishlist(): void {
    this.wishlistService.clearWishlist().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.wishlistItems = [];
          this.showCustomNotification('Wishlist cleared successfully', 'success');
        } else {
          this.showCustomNotification(response.message || 'Failed to clear wishlist', 'error');
        }
        this.showClearWishlistConfirmation = false;
      },
      error: (err) => {
        console.error('Error clearing wishlist', err);
        this.showCustomNotification('Failed to clear wishlist', 'error');
        this.showClearWishlistConfirmation = false;
      }
    });
  }
}