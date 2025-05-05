import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../../services/products/product.service';
import { CartsService } from '../../../../../services/cart/carts.service';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { environment } from '../../../../../environments/environment';
import { Helpers } from '../../../../../Utility/helpers';
import { delay, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router , RouterModule } from '@angular/router';

interface ProductVariant {
  id: string | number;
  name: string;
  finalPrice: number;
  basePrice: number;
  discountPercentage: number;
  quantity: number;
  stock: number;
  updating: boolean;
}

@Component({
  selector: 'app-product-variant-modal',
  standalone: true,
  imports: [CommonModule ,RouterModule],
  templateUrl: './product-variant-modal.component.html',
  styleUrls: ['./product-variant-modal.component.css']
})
export class ProductVariantModalComponent extends Helpers implements OnInit {
  @Input() productId: number = 0;
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAddToCart = new EventEmitter<{success: boolean}>();

  product: any = null;
  variants: ProductVariant[] = [];
  unavailableVariants: string[] = [];
  selectedVariant: ProductVariant | null = null;
  
  loading: boolean = false;
  error: string | null = null;
  processingCart: boolean = false;


  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'warning' | 'error' = 'success';

  constructor(
    private productService: ProductService,
    private cartsService: CartsService,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.isOpen && this.productId) {
      this.loadProductVariants();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if isOpen changed to true and we have a productId
    if (changes['isOpen'] && changes['isOpen'].currentValue === true && this.productId) {
      this.loadProductVariants();
    }
    
    // Or if productId changed while modal is open
    if (changes['productId'] && changes['productId'].currentValue && this.isOpen) {
      this.loadProductVariants();
    }
  }

  loadProductVariants(): void {
    this.loading = true;
    this.error = null;
    console.log(`Loading variants for product ID: ${this.productId}`);
    
    // Get the product details with variants
    this.productService.getProductById(this.productId, true).subscribe({
      next: (response) => {
        console.log('Product API response:', response);
        
        if (response && response.success && response.data) {
          this.product = response.data;
          console.log('Product data:', this.product);
          
          // Check if we have any variant data in the response
          if (this.product.variants) {
            console.log('Product variants from API:', this.product.variants);
          } else {
            console.log('No variants found in API response, checking for other properties');
            
            // If no "variants" property exists, look for other common properties
            const possibleVariantProperties = ['sizes', 'options', 'configurations', 'productVariants'];
            
            for (const prop of possibleVariantProperties) {
              if (this.product[prop] && Array.isArray(this.product[prop])) {
                console.log(`Found potential variants in "${prop}" property:`, this.product[prop]);
                this.product.variants = this.product[prop];
                break;
              }
            }
          }
          
          // If still no variants, try to create some based on product attributes
          if (!this.product.variants) {
            // Common attributes that might represent variants
            const variantAttributes = ['size', 'color', 'material', 'style'];
            const foundAttributes = variantAttributes.filter(attr => this.product[attr]);
            
            if (foundAttributes.length > 0) {
              console.log('Creating variants from product attributes:', foundAttributes);
              
              // Create basic variant from product attributes
              this.product.variants = [];
              // Just create a single variant from the product itself as fallback
              this.createDefaultVariant();
            } else {
              // No variants and no attributes - create a default variant
              console.log('No variant data found, creating default variant');
              this.createDefaultVariant();
            }
          } else {
            this.processProductVariants();
          }
        } else {
          console.error('Invalid API response format:', response);
          this.error = 'Failed to load product details';
          
          // Create a mock variant for testing if needed
          this.createMockVariants();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product variants:', err);
        this.error = 'Failed to load product variants. Please try again.';
        this.loading = false;
        
        // Create a mock variant for testing
        this.createMockVariants();
      }
    });
  }

  createDefaultVariant(): void {
    // Create a single default variant based on the product
    let discountPercentage = 0;
    if (this.product.originalPrice && this.product.price && this.product.originalPrice > this.product.price) {
      discountPercentage = Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    
    this.variants = [{
      id: this.product.id,
      name: 'Default',
      finalPrice: this.product.price || 0,
      basePrice: this.product.originalPrice || this.product.price || 0,
      discountPercentage: discountPercentage,
      quantity: 0,
      stock: this.product.stock || 10,
      updating: false
    }];
    
    this.selectedVariant = this.variants[0];
    console.log('Created default variant:', this.variants[0]);
  }

  createMockVariants(): void {
    // Create mock variants for testing purposes
    console.log('Creating mock variants for testing');
    this.variants = [
      { 
        id: '1', 
        name: 'Size S', 
        finalPrice: 135.99, 
        basePrice: 169.99, 
        discountPercentage: 20, 
        quantity: 0,
        stock: 5,
        updating: false 
      },
      { 
        id: '2', 
        name: 'Size M', 
        finalPrice: 135.99, 
        basePrice: 169.99, 
        discountPercentage: 20, 
        quantity: 0,
        stock: 8,
        updating: false 
      },
      { 
        id: '3', 
        name: 'Size L', 
        finalPrice: 135.99, 
        basePrice: 169.99, 
        discountPercentage: 20, 
        quantity: 0,
        stock: 3,
        updating: false 
      }
    ];
    
    if (this.variants.length > 0) {
      this.selectedVariant = this.variants[0];
    }
    
    console.log('Mock variants created:', this.variants);
  }

  processProductVariants(): void {
    console.log('Processing product variants');
    // Clear existing variants
    this.variants = [];
    this.unavailableVariants = [];
    
    try {
      // Check if product has variants array
      if (this.product.variants && Array.isArray(this.product.variants) && this.product.variants.length > 0) {
        console.log(`Found ${this.product.variants.length} variants to process`);
        
        // Log first variant to understand structure
        if (this.product.variants.length > 0) {
          console.log('Sample variant structure:', this.product.variants[0]);
        }
        
        // Process available variants
        this.variants = this.product.variants
          .filter((variant: any) => {
            // Check if variant is in stock
            const inStock = variant.inStock !== false && (variant.stock === undefined || variant.stock > 0);
            return inStock;
          })
          .map((variant: any) => {
            // Calculate discount percentage if not provided
            let discountPercentage = variant.discountPercentage;
            const basePrice = variant.basePrice || variant.originalPrice || this.product.originalPrice || this.product.price;
            const finalPrice = variant.finalPrice || variant.price || this.product.price;
            
            if (!discountPercentage && basePrice && finalPrice && basePrice > finalPrice) {
              discountPercentage = Math.round(((basePrice - finalPrice) / basePrice) * 100);
            }
            
            // Create variant object with proper structure
            return {
              id: variant.id || variant.variantId || variant.sizeId || '',
              name: variant.name || variant.variantName || variant.size || variant.color || `Option ${variant.id || ''}`,
              finalPrice: finalPrice || 0,
              basePrice: basePrice || finalPrice || 0,
              discountPercentage: discountPercentage || 0,
              quantity: 0,
              stock: variant.stock || variant.quantity || 10,
              updating: false
            };
          });
        
        console.log(`Processed ${this.variants.length} available variants:`, this.variants);
        
        // Process unavailable variants
        this.unavailableVariants = this.product.variants
          .filter((variant: any) => variant.inStock === false || variant.stock === 0)
          .map((variant: any) => variant.name || variant.variantName || variant.size || `Option ${variant.id || ''}`);
        
        console.log(`Found ${this.unavailableVariants.length} unavailable variants:`, this.unavailableVariants);
      } else {
        console.log('No variants array or empty variants, creating default variant');
        // If no variants or empty variants array, create one based on the product itself
        this.createDefaultVariant();
      }
      
      // Set the first variant as the selected one for the top product display
      if (this.variants.length > 0) {
        this.selectedVariant = this.variants[0];
        console.log('Selected variant:', this.selectedVariant);
      } else {
        console.warn('No variants available after processing');
        // Create mock variants as fallback
        this.createMockVariants();
      }
    } catch (error) {
      console.error('Error processing variants:', error);
      // Create mock variants as fallback for error
      this.createMockVariants();
    }
  }

  override getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'assets/images/placeholder.png';
    
    // Check if the URL is already absolute
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Otherwise, prepend the API base URL
    return `${environment.apiUrl}/${imageUrl.replace(/^\//, '')}`;
  }



  // increaseQuantity(variant: ProductVariant): void {
  //   if (variant.quantity >= variant.stock || variant.updating) return;
    
  //   variant.updating = true;
    
  //   // Call the cart service to add item to cart
  //   this.cartsService.addItemToCart(this.productId, 1, Number(variant.id)).subscribe({
  //     next: (response) => {
  //       variant.quantity += 1;
        
  //       // If this is the first item added for this variant, update the selected variant
  //       if (variant.quantity === 1 && (!this.selectedVariant || this.selectedVariant.quantity === 0)) {
  //         this.selectedVariant = variant;
  //       }
        
  //       // Show success notification
  //       this.notificationService.success('Product added successfully');
  //       variant.updating = false;
  //     },
  //     error: (err) => {
  //       console.error('Error adding item to cart:', err);
  //       this.notificationService.error('Failed to add item to cart');
  //       variant.updating = false;
  //     }
  //   });
  // }
  
  // decreaseQuantity(variant: ProductVariant): void {
  //   if (variant.quantity <= 0 || variant.updating) return;
    
  //   variant.updating = true;
    
  //   // First we need to get the cart to find the cartItemId for this product+variant
  //   this.cartsService.getCart().subscribe({
  //     next: (cart) => {
  //       // Find the cart item for this product and variant
  //       const cartItem = cart.cartItems?.find(item => 
  //         item.productId === this.productId && 
  //         item.variantId === Number(variant.id)
  //       );
        
  //       if (cartItem) {
  //         // Use the correct ID property - cartItemId instead of id
  //         const cartItemId = cartItem.cartItemId; // Adjust this line based on your CartItem model
  
  //         if (cartItem.quantity > 1) {
  //           // Update quantity if more than 1
  //           this.cartsService.updateCartItem(cartItemId, cartItem.quantity - 1).subscribe({
  //             next: () => {
  //               variant.quantity -= 1;
  //               this.notificationService.warning('Product was removed from cart successfully');
  //               variant.updating = false;
                
  //               // If we've reduced this variant to 0, find the next variant with quantity > 0
  //               if (variant.quantity === 0 && this.selectedVariant === variant) {
  //                 const nextSelected = this.variants.find(v => v.quantity > 0);
  //                 this.selectedVariant = nextSelected || null;
  //               }
  //             },
  //             error: (err) => {
  //               console.error('Error updating cart item:', err);
  //               this.notificationService.error('Failed to remove item from cart');
  //               variant.updating = false;
  //             }
  //           });
  //         } else {
  //           // Remove item completely if quantity is 1
  //           this.cartsService.removeCartItem(cartItemId).subscribe({
  //             next: () => {
  //               variant.quantity -= 1;
  //               this.notificationService.warning('Product was removed from cart successfully');
  //               variant.updating = false;
                
  //               // If we've reduced this variant to 0, find the next variant with quantity > 0
  //               if (variant.quantity === 0 && this.selectedVariant === variant) {
  //                 const nextSelected = this.variants.find(v => v.quantity > 0);
  //                 this.selectedVariant = nextSelected || null;
  //               }
  //             },
  //             error: (err) => {
  //               console.error('Error removing cart item:', err);
  //               this.notificationService.error('Failed to remove item from cart');
  //               variant.updating = false;
  //             }
  //           });
  //         }
  //       } else {
  //         // Item not found in cart
  //         this.notificationService.error('Item not found in cart');
  //         variant.updating = false;
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error getting cart:', err);
  //       this.notificationService.error('Failed to get cart information');
  //       variant.updating = false;
  //     }
  //   });
  // }

  // Update the increaseQuantity method
increaseQuantity(variant: ProductVariant): void {
  if (variant.quantity >= variant.stock || variant.updating) return;
  
  variant.updating = true;
  
  // Call the cart service to add item to cart
  this.cartsService.addItemToCart(this.productId, 1, Number(variant.id)).subscribe({
    next: (response) => {
      variant.quantity += 1;
      
      // If this is the first item added for this variant, update the selected variant
      if (variant.quantity === 1 && (!this.selectedVariant || this.selectedVariant.quantity === 0)) {
        this.selectedVariant = variant;
      }
      
      // Show custom notification
      this.showCustomNotification('Product added successfully', 'success');
      variant.updating = false;
    },
    error: (err) => {
      console.error('Error adding item to cart:', err);
      this.showCustomNotification('Failed to add item to cart', 'error');
      variant.updating = false;
    }
  });
}

// Update the decreaseQuantity method
decreaseQuantity(variant: ProductVariant): void {
  if (variant.quantity <= 0 || variant.updating) return;
  
  variant.updating = true;
  
  // First we need to get the cart to find the cartItemId for this product+variant
  this.cartsService.getCart().subscribe({
    next: (cart) => {
      // Find the cart item for this product and variant
      const cartItem = cart.cartItems?.find(item => 
        item.productId === this.productId && 
        item.variantId === Number(variant.id)
      );
      
      if (cartItem) {
        // Get the cart item ID (adjust property name if needed)
        const cartItemId = cartItem.cartItemId || cartItem.cartItemId; // Try both properties
        
        if (cartItem.quantity > 1) {
          // Update quantity if more than 1
          this.cartsService.updateCartItem(cartItemId, cartItem.quantity - 1).subscribe({
            next: () => {
              variant.quantity -= 1;
              this.showCustomNotification('Product was removed from cart successfully', 'warning');
              variant.updating = false;
            },
            error: (err) => {
              console.error('Error updating cart item:', err);
              this.showCustomNotification('Failed to remove item from cart', 'error');
              variant.updating = false;
            }
          });
        } else {
          // Remove item completely if quantity is 1
          this.cartsService.removeCartItem(cartItemId).subscribe({
            next: () => {
              variant.quantity -= 1;
              this.showCustomNotification('Product was removed from cart successfully', 'warning');
              variant.updating = false;
            },
            error: (err) => {
              console.error('Error removing cart item:', err);
              this.showCustomNotification('Failed to remove item from cart', 'error');
              variant.updating = false;
            }
          });
        }
      } else {
        // Item not found in cart
        this.showCustomNotification('Item not found in cart', 'error');
        variant.updating = false;
      }
    },
    error: (err) => {
      console.error('Error getting cart:', err);
      this.showCustomNotification('Failed to get cart information', 'error');
      variant.updating = false;
    }
  });
}

/// Custom notification method
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

// Method to hide notification when close button is clicked
hideNotification(): void {
  this.showNotification = false;
}

  hasSelectedVariants(): boolean {
    return this.variants.some(v => v.quantity > 0);
  }

  addToCart(): void {
    const selectedVariants = this.variants.filter(v => v.quantity > 0);
    
    if (selectedVariants.length === 0) {
      this.notificationService.warning('Please select at least one variant');
      return;
    }
    
    this.processingCart = true;
    
    // Track how many cart operations we need to complete
    let completedOperations = 0;
    let successfulOperations = 0;
    const totalOperations = selectedVariants.length;
    
    selectedVariants.forEach(variant => {
      this.cartsService.addItemToCart(this.productId, variant.quantity, Number(variant.id)).subscribe({
        next: () => {
          successfulOperations++;
          completedOperations++;
          checkComplete();
        },
        error: (err) => {
          console.error('Error adding variant to cart:', err);
          completedOperations++;
          checkComplete();
        }
      });
    });
    
    const checkComplete = () => {
      if (completedOperations === totalOperations) {
        this.processingCart = false;
        
        if (successfulOperations === totalOperations) {
          this.notificationService.success(`${successfulOperations} item${successfulOperations > 1 ? 's' : ''} added to cart successfully`);
          this.onAddToCart.emit({success: true});
          this.close();
        } else if (successfulOperations > 0) {
          this.notificationService.warning(`Only ${successfulOperations} out of ${totalOperations} items were added to cart`);
          this.onAddToCart.emit({success: true});
          this.close();
        } else {
          this.notificationService.error('Failed to add items to cart. Please try again.');
          this.onAddToCart.emit({success: false});
        }
      }
    };
  }

  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }






  
}