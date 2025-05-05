import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductVariant } from '../../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartsService } from '../../services/cart/carts.service';
import { NotificationService } from '../../services/shared/notification.service';
import { environment } from '../../environments/environment';
import { ProductService } from '../../services/products/product.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router , RouterModule } from '@angular/router';
import { KeepShoppingComponent } from "../public/home-page/homeComponents/keepShoppingContainer/keep-shopping/keep-shopping.component";
import { UpArrowComponent } from "../public/home-page/homeComponents/upArrow/up-arrow/up-arrow.component";
import { WishlistService } from '../../services/wishlist/wishlist.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, KeepShoppingComponent, UpArrowComponent ,RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  product!: Product;
  selectedVariant: ProductVariant | null = null;
  selectedImage: string = '';
  quantity: number = 1;
  activeTab: string = 'reviews';
  isFollowing: boolean = false;
  selectedLocation: number = 1;
  freeDeliveryThreshold: number = 500;
  showToast: boolean = false;
  private addingToCart = false;


  // Custom notification properties
showNotification: boolean = false;
notificationMessage: string = '';
notificationType: 'success' | 'warning' | 'error' = 'success';

  

     deliveryLocations = [
      { id: 1, name: 'Select a Governorate' }, // General option appears first
      { id: 0, name: 'Al Beheira' },
      { id: 2, name: 'Alexandria' },
      { id: 3, name: 'Aswan' },
      { id: 4, name: 'Asyut' },
      { id: 5, name: 'Beni Suef' },
      { id: 6, name: 'Cairo' },
      { id: 7, name: 'Dakahlia' },
      { id: 8, name: 'Damietta' },
      { id: 9, name: 'Faiyum' },
      { id: 10, name: 'Gharbia' },
      { id: 11, name: 'Giza' },
      { id: 12, name: 'Ismailia' },
      { id: 13, name: 'Kafr El Sheikh' },
      { id: 14, name: 'Luxor' },
      { id: 15, name: 'Matrouh' },
      { id: 16, name: 'Minya' },
      { id: 17, name: 'Monufia' },
      { id: 18, name: 'New Valley' },
      { id: 19, name: 'North Sinai' },
      { id: 20, name: 'Port Said' },
      { id: 21, name: 'Qalyubia' },
      { id: 22, name: 'Qena' },
      { id: 23, name: 'Red Sea' },
      { id: 24, name: 'Sharqia' },
      { id: 25, name: 'Sohag' },
      { id: 26, name: 'South Sinai' }
    ];
  deliveryOptions = [
    { type: 'Pickup Station', fee: 45, leadDays: 2 },
    { type: 'Door Delivery', fee: 70, leadDays: 3 }
  ];

  returnPolicy: string = '30 days return policy';
  defectReportDays: number = 7;

  reviews = [ 
    { reviewer: 'Alice', rating: 5, comment: 'Great product!' },
    { reviewer: 'Bob', rating: 4, comment: 'Good quality, but a bit expensive.' },
    { reviewer: 'Charlie', rating: 3, comment: 'Average experience.' },
    { reviewer: 'David', rating: 2, comment: 'Not what I expected.' },
    { reviewer: 'Eve', rating: 1, comment: 'Very disappointed.' }
  ];


  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartsService,
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private wishlistService: WishlistService

  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(id)) {
      this.errorMessage = 'Invalid product ID';
      this.isLoading = false;
      return;

      this.loadWishlistStatus();

    }
  
    this.productService.getProductById(id, true).subscribe({
      next: (response) => {
        console.log('Product response:', response);
        if (response.success) {
          // Map the camelCase response to PascalCase interface
          console.log(response);
          this.product = {
            productId: response.data.productId,
            sellerId: response.data.sellerId,
            subcategoryId: response.data.subcategoryId,
            name: response.data.name,
            description: response.data.description,
            basePrice: response.data.basePrice,
            discountPercentage: response.data.discountPercentage,
            isAvailable: response.data.isAvailable,
            stockQuantity: response.data.stockQuantity,
            mainImageUrl: response.data.mainImageUrl,
            averageRating: response.data.averageRating,
            sellerName: response.data.sellerName,
            categoryId: response.data.categoryId,
            categoryName: response.data.categoryName,
            ratingCount: response.data.ratingCount,
            reviewCount: response.data.reviewCount,
            images: response.data.images?.map((img: any) => ({
              imageId: img.imageId,
              productId: img.productId,
              imageUrl: img.imageUrl,
              displayOrder: img.displayOrder
            })) || [],
            variants: response.data.variants?.map((variant: any) => ({
              variantId: variant.variantId,
              productId: variant.productId,
              variantName: variant.variantName,
              price: variant.price,
              discountPercentage: variant.discountPercentage,
              finalPrice: variant.finalPrice,
              stockQuantity: variant.stockQuantity,
              sku: variant.sku,
              variantImageUrl: variant.variantImageUrl,
              isDefault: variant.isDefault,
              isAvailable: variant.isAvailable,
              attributes: variant.attributes
            })) || [],
            attributeValues: response.data.attributeValues?.map((attr: any) => ({
              valueId: attr.valueId,
              productId: attr.productId,
              attributeId: attr.attributeId,
              attributeName: attr.attributeName,
              attributeType: attr.attributeType,
              value: attr.value
            })) || []
          };

          this.selectedImage = this.product.mainImageUrl;
          
          if (this.product.variants?.length > 0) {
            const defaultVariant = this.product.variants.find(v => v.isDefault);
            if (defaultVariant) {
              this.selectVariant(defaultVariant);
            }
          }
          
          this.isLoading = false;
        } else {
          this.errorMessage = response.message || 'Failed to load product';
          console.error('Error loading product:', response.message);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
        this.errorMessage = err.status === 0 
          ? 'Cannot connect to server' 
          : 'Failed to load product details';
      }
    });
  }

  public selectVariant(variant: ProductVariant): void {
    this.selectedVariant = variant;
    if (variant.variantImageUrl) {
      this.selectImage(variant.variantImageUrl);
    }
    this.quantity = 1; // Reset quantity when changing variants
  }

  get currentPrice(): number {
    return this.selectedVariant ? this.selectedVariant.finalPrice : this.product?.basePrice;
  }
  
  get currentDiscountPercentage(): number {
    return this.selectedVariant ? this.selectedVariant.discountPercentage : this.product?.discountPercentage;
  }


  public selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }
  public getFullImageUrl(imagePath: string): string {
    return `${environment.apiUrl}/${imagePath}`;
  }
  public getDeliveryDates(leadDays: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + leadDays);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }


   isAddedToCart: boolean = false;
   
  public addToCart(): void {
    // Prevent multiple clicks
    if (this.addingToCart) {
      return;
    }
    
    // Check if product exists
    if (!this.product) {
      this.notificationService.showWarning('Product not available');
      return;
    }
    
    // Check quantity validity first (faster check)
    if (this.quantity < 1) {
      this.notificationService.showWarning('Please select a valid quantity');
      return;
    }
    
    // Check available stock
    const currentStock = this.selectedVariant?.stockQuantity || this.product.stockQuantity;
    if (currentStock < 1) {
      this.notificationService.showWarning('This product is currently out of stock');
      return;
    }
    
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.notificationService.showError('You must be logged in to add items to your cart');
      const currentUrl = this.router.url;
      this.router.navigate(['auth/login'], {
        queryParams: { returnUrl: currentUrl },
        state: { errorMessage: 'You must be logged in to add items to your cart' }
      });
      return;
    }
  
    // Set loading state before starting async operations
    this.addingToCart = true;
  
    // Prepare data
    const productId = this.product.productId;
    const variantId = this.selectedVariant?.variantId;
  
    // First check if item already exists in cart
    this.cartService.checkItemInCart(productId, variantId).subscribe({
      next: (exists) => {
        if (exists) {
          this.notificationService.showInfo('This item is already in your cart', 'Already in Cart');
          this.addingToCart = false;
          return;
        }
  
        // If not in cart, proceed to add it
        this.cartService.addItemToCart(productId, this.quantity, variantId).subscribe({
          next: (response) => {
            if (response.success) {
              this.isAddedToCart = true;
              this.notificationService.showSuccess('Item added to cart successfully');
              this.showToast = true;
              setTimeout(() => {
                this.showToast = false;
              }, 3000);
            } else {
              this.notificationService.showError(response.message || 'Failed to add item to cart');
            }
            this.addingToCart = false;
          },
          error: (err) => {
            let errorMessage = 'Failed to add item to cart. Please try again later.';
            const currentUrl = this.router.url;
  
            if (err.status === 401) {
              errorMessage = 'Please log in first to add items to your cart';
              this.router.navigate(['auth/login'], {
                queryParams: { returnUrl: currentUrl },
                state: { errorMessage: errorMessage }
              });
            } else if (err.status === 404) {
              errorMessage = 'Product not found or has been removed';
            } else if (err.status === 409) {
              errorMessage = 'This item is already in your shopping cart';
            } else if (err.status === 429) {
              errorMessage = 'Too many requests. Please wait before trying again';
            } else if (err.message?.includes('network error')) {
              errorMessage = 'Network connection issue. Please check your internet connection';
            }
  
            if (err.error?.outOfStock) {
              errorMessage = 'This product is currently out of stock';
            }
  
            if (err.error?.invalidQuantity) {
              errorMessage = 'The requested quantity is not available';
            }
  
            this.notificationService.showError(errorMessage);
            console.error('Error adding item to cart:', {
              errorMessage: err.message,
              statusCode: err.status,
              timestamp: new Date().toISOString(),
              errorDetails: err.error
            });
            this.addingToCart = false;
          }
        });
      },
      error: (err) => {
        this.notificationService.showError('Could not verify cart status. Please try again.');
        this.addingToCart = false;
      }
    });


    // Show the toast notification
    this.showToast = true;

    // Hide the toast after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
  
  public setActiveTab(tab: string): void {
    this.activeTab = tab;
  }


// Add these methods for wishlist functionality
// Custom notification methods
showCustomNotification(message: string, type: 'success' | 'warning' | 'error'): void {
  this.notificationMessage = message;
  this.notificationType = type;
  this.showNotification = true;
  
  // Hide notification after 3 seconds if not manually closed
  setTimeout(() => {
    if (this.showNotification) {
      this.showNotification = false;
    }
  }, 3000);
}

// Method to hide notification when close button is clicked
hideNotification(): void {
  this.showNotification = false;
}

// Wishlist functionality
loadWishlistStatus(): void {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    return; // No need to load if not logged in
  }

  // Use wishlist service to check wishlist items
  this.wishlistService.getWishlist().subscribe({
    next: () => {
      // The service will keep track of product IDs internally
    },
    error: (err) => {
      console.error('Error loading wishlist status', err);
    }
  });
}

// Toggle wishlist item
toggleWishlist(event: Event, productId: number): void {
  if (event) {
    event.stopPropagation(); // Prevent other click events
  }
  
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    this.showCustomNotification('Please log in to add items to your wishlist', 'warning');
    return;
  }
  
  this.wishlistService.toggleWishlistItem(productId).subscribe({
    next: (response) => {
      // The service already updates its internal state
      if (this.wishlistService.isInWishlist(productId)) {
        this.showCustomNotification('Product added to wishlist', 'success');
      } else {
        this.showCustomNotification('Product removed from wishlist', 'warning');
      }
    },
    error: (error) => {
      console.error('Error toggling wishlist item:', error);
      this.showCustomNotification('Failed to update wishlist. Please try again.', 'error');
    }
  });
}

// Check if a product is in the wishlist
isInWishlist(productId: number): boolean {
  return this.wishlistService.isInWishlist(productId);
}

  
}