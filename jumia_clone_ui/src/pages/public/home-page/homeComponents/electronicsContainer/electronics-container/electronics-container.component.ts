
// Electronics-container.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../../../services/products/product.service';
import { Helpers } from '../../../../../../Utility/helpers';

interface Product {
  productId: number;
  name: string;
  description: string;
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  // stockQuantity: number;
  isAvailable: boolean;
  mainImageUrl: string;
  averageRating: number;
  sellerId: number;
  sellerName: string;
  subcategoryName: string;
  // Add other properties as needed
}

@Component({
  selector: 'app-electronics-container',
  imports: [CommonModule , RouterModule],
  templateUrl: './electronics-container.component.html',
  styleUrl: './electronics-container.component.css',
  standalone: true
})
export class ElectronicsContainerComponent extends Helpers implements OnInit, AfterViewInit {
  @ViewChild('productContainer') productContainer!: ElementRef;
  
  products: Product[] = [];
  hours: number = 12;
  minutes: number = 47;
  seconds: number = 33;
  timeLeft: string = '';
  showLeftArrow: boolean = false;
  showRightArrow: boolean = true;
  scrollAmount: number = 250;
  loading: boolean = true;
  error: string | null = null;
  
  constructor(
    private router: Router,
    private productService: ProductService
  ) { super(); }

  ngOnInit(): void {
    // Load products from API
    this.loadProductsFromApi();
    
    // Start the countdown timer
    this.startCountdown();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => this.checkScrollArrows(), 500);
  }
  
  loadProductsFromApi(): void {
    this.loading = true;
    this.error = null;
    
    this.productService.getRandomCategoryProducts("Electronics").subscribe({
      next: (data) => {
        console.log('API response data:', data);
        
        // Handle different response formats
        if (data && Array.isArray(data)) {
          this.products = data;
        } else if (data && typeof data === 'object' && data.products) {
          // In case API returns { products: [...] }
          this.products = data.products;
        } else if (data && typeof data === 'object') {
          // If API returns a single product or object with product properties
          this.products = [data];
        } else {
          console.error('Unexpected API response format:', data);
          this.error = 'Invalid data format received from API';
          this.products = []; // Initialize as empty array
        }
        
        console.log('Processed products:', this.products);
        this.loading = false;
        setTimeout(() => this.checkScrollArrows(), 100);
      },
      error: (err) => {
        console.error('Error loading flash sale products', err);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }
  
  startCountdown(): void {
    interval(1000).pipe(
      map(() => {
        if (this.seconds > 0) {
          this.seconds -= 1;
        } else {
          this.seconds = 59;
          if (this.minutes > 0) {
            this.minutes -= 1;
          } else {
            this.minutes = 59;
            if (this.hours > 0) {
              this.hours -= 1;
            } else {
              // Timer complete
              this.hours = 0;
              this.minutes = 0;
              this.seconds = 0;
            }
          }
        }
        
        this.timeLeft = `${this.hours}h : ${this.minutes}m : ${this.seconds}s`;
      }),
      takeWhile(() => this.hours > 0 || this.minutes > 0 || this.seconds > 0)
    ).subscribe();
  }
  
  scrollLeft(): void {
    if (this.productContainer) {
      this.productContainer.nativeElement.scrollLeft -= this.scrollAmount;
      setTimeout(() => this.checkScrollArrows(), 100);
    }
  }
  
  scrollRight(): void {
    if (this.productContainer) {
      this.productContainer.nativeElement.scrollLeft += this.scrollAmount;
      setTimeout(() => this.checkScrollArrows(), 100);
    }
  }
  
  checkScrollArrows(): void {
    if (!this.productContainer) return;
    
    const container = this.productContainer.nativeElement;
    this.showLeftArrow = container.scrollLeft > 0;
    this.showRightArrow = container.scrollWidth > container.clientWidth + container.scrollLeft;
  }
  
  navigateToProductDetails(productId: number): void {
    this.router.navigate(['/product', productId]);
  }
  
  calculateProgressBarWidth(available: number, total: number = 250): string {
    const percentage = (available / total) * 100;
    return `${percentage}%`;
  }
  
  getProgressBarColor(quantity: number): string {
    return quantity < 10 ? '#e41e23' : '#ff9900';
  }
}
