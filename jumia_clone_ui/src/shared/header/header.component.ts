// shared/header/header.component.ts
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, NavigationExtras } from '@angular/router';
import { CartsService } from '../../services/cart/carts.service';
import { ProductSearchService, ProductSearchResult } from '../../services/search/product-search.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChatbotComponent]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAccountDropdownOpen = false;
  isSearchResultsVisible = false;
  cartItemCount = 0;
  searchQuery = '';
  searchResults: ProductSearchResult[] = [];
  isLoading = false;
  private searchTerms = new Subject<string>();

  
  // Default fallback image path
  private fallbackImagePath = '/images/no-image-placeholder.png';
  
  private cartSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;
  private resultSubscription: Subscription | null = null;
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private cartService: CartsService,
    private searchService: ProductSearchService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    // Subscribe to the cartItemCount$ observable for real-time updates
    this.cartSubscription = this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // If user logs in, refresh the cart count
        this.cartService.refreshCartCount();
      } else {
        // If user logs out, reset the cart count
        this.cartItemCount = 0;
      }
    });
    
    // Set up search results subscription with loading state management
    this.resultSubscription = this.searchService.searchResults$.subscribe(results => {
      // Map and verify the image URLs in the results
      this.searchResults = results;
      this.isLoading = false;
      
      // Only show dropdown if we have a search query, regardless of results
      this.isSearchResultsVisible = this.searchQuery.trim().length > 0;
      
      console.log('Current search query:', this.searchQuery);
      console.log('Search results count:', results.length);
      console.log('Is search visible:', this.isSearchResultsVisible);
    });
    
    // Set up debounced search
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(400)
    ).subscribe(term => {
      if (term && term.trim().length >= 1) {
        this.isLoading = true;
        // Don't change visibility here, we already set it in onSearchInputChange
        this.searchService.searchProducts(term);
        console.log('Search triggered for term:', term);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.resultSubscription) {
      this.resultSubscription.unsubscribe();
    }
  }

  // Process the image URL to ensure it's valid
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return this.fallbackImagePath;
    }
    
    // If the URL is already an absolute URL with http/https, return it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative URL starting with '/', make it relative to the base URL
    if (imageUrl.startsWith('/')) {
      return `${environment.apiUrl}${imageUrl}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the API URL
    return `${environment.apiUrl}/${imageUrl}`;
  }
  
  // Handle image loading errors by setting a fallback
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.fallbackImagePath;
    imgElement.onerror = null; // Prevent infinite loop if fallback also fails
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { SearchTerm: this.searchQuery } });
      this.clearSearch();
    }
  }
  
  onSearchInputChange(term: string): void {
    console.log('Input changed to:', term);
    
    // Clear results and hide dropdown if the search is empty
    if (!term || term.trim() === '') {
      console.log('Term is empty, clearing search');
      this.clearSearch();
      return;
    }
    
    // Show loading indicator immediately for better UX
    console.log('Setting loading state and making search visible');
    this.isLoading = true;
    this.isSearchResultsVisible = true;
    
    // Send to search terms subject
    this.searchTerms.next(term);
  }

  navigateToProduct(productId: number): void {
    console.log('Navigating to product:', productId);
    
    // Store the route for navigation
    const url = `/Products/${productId}`;
    
    // Clear the search before navigation
    this.clearSearchAndNavigate(url);
  }
  
  /**
   * A new approach that handles the sequence of operations more reliably:
   * 1. First clear the search UI
   * 2. Then navigate with a forced reload to ensure component state is refreshed
   */
  clearSearchAndNavigate(url: string): void {
    // Clear the search UI state
    this.isSearchResultsVisible = false;
    this.searchResults = [];
    this.searchQuery = '';
    this.isLoading = false;
    
    // Clear the service cache
    this.searchService.clearResults();
    
    // Use NavigationExtras with skipLocationChange: false to ensure the URL updates
    // and onSameUrlNavigation: 'reload' to force component refresh
    const navigationExtras: NavigationExtras = {
      onSameUrlNavigation: 'reload' as any // Force reload even when URL is the same
    };
    
    // Use setTimeout to ensure UI updates before navigation
    setTimeout(() => {
      console.log('Navigating to:', url);
      
      // Navigate using the router (with optional replacementUrl to bypass history)
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        // Navigate to the target URL after a brief detour
        this.router.navigateByUrl(url, navigationExtras).then(success => {
          console.log('Navigation success:', success);
        }).catch(error => {
          console.error('Navigation error:', error);
        });
      });
    }, 0);
  }
  
  clearSearch(): void {
    console.log('Clearing search from:', new Error().stack);
    this.searchService.clearResults();
    this.searchResults = []; // Make sure to clear local results too
    this.isSearchResultsVisible = false;
    this.isLoading = false;
  }

  toggleAccountDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  closeAccountDropdown() {
    this.isAccountDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.cartItemCount = 0;
    this.closeAccountDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const isClickedInsideAccount = this.elementRef.nativeElement.querySelector('.account-section')?.contains(clickedElement);
    const isClickedInsideSearch = this.elementRef.nativeElement.querySelector('.search-box')?.contains(clickedElement);
    
    if (!isClickedInsideAccount) {
      this.closeAccountDropdown();
    }
    
    // Only clear search if clicking outside and we have results showing
    if (!isClickedInsideSearch && this.isSearchResultsVisible) {
      // Add a small delay to prevent race conditions with click events
      setTimeout(() => this.clearSearch(), 100);
    }
  }
}