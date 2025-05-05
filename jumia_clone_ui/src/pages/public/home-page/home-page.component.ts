import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { CarouselComponent } from '../../../shared/carousel/carousel.component';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { BannerComponent } from '../../../shared/banner/banner.component';
import { HttpClient } from '@angular/common/http';
import { PromoSliderComponent } from "./homeComponents/promoSlider/promo-slider.component";
import { StaticContainerComponent } from "./homeComponents/static-container/static-container.component";
import { CenterSliderComponent } from "./homeComponents/center-slider/center-slider.component";
import { TwoImagesBannarComponent } from "./homeComponents/twoImagesBannar/two-images-bannar/two-images-bannar.component";
import { FlashSalesBannerComponent } from "./homeComponents/flashSaleBannar/components/flash-sales-bannar/flash-sales-bannar.component";
import { TopPicksContainerComponent } from "./homeComponents/TopPicksContainer/top-picks-container/top-picks-container.component";
import { TrendyOutfitsContainerComponent } from "./homeComponents/trendyOutfitsContainer/trendy-outfits-container/trendy-outfits-container.component";
import { KitchenContainerComponent } from "./homeComponents/KitchenContainer/kitchen-container/kitchen-container.component";
import { PhonesContainerComponent } from "./homeComponents/PhonesContainer/phones-container/phones-container.component";
import { ComputingContainerComponent } from "./homeComponents/computingContainer/computing-container/computing-container.component";
import { DecorContainerComponent } from "./homeComponents/decorContainer/decor-container/decor-container.component";
import { KeepShoppingComponent } from "./homeComponents/keepShoppingContainer/keep-shopping/keep-shopping.component";
import { ElectronicsContainerComponent } from "./homeComponents/electronicsContainer/electronics-container/electronics-container.component";
import { TopSellingComponent } from "./homeComponents/topSellingContainer/top-selling/top-selling.component";
import { InfoComponent } from "./homeComponents/infoContainer/info/info.component";
import { UpArrowComponent } from "./homeComponents/upArrow/up-arrow/up-arrow.component";
import { Router,RouterModule } from '@angular/router';
import { NavigationService } from '../../../services/navigations/navigation.services';
import { ChatbotComponent } from '../../../shared/chatbot/chatbot.component';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    // CarouselComponent,
    // ProductCardComponent,
    // BannerComponent,
    PromoSliderComponent,
    StaticContainerComponent,
    CenterSliderComponent,
    TwoImagesBannarComponent,
    FlashSalesBannerComponent,
    TopPicksContainerComponent,
    TrendyOutfitsContainerComponent,
    KitchenContainerComponent,
    PhonesContainerComponent,
    ComputingContainerComponent,
    DecorContainerComponent,
    KeepShoppingComponent,
    ElectronicsContainerComponent,
    TopSellingComponent,
    InfoComponent,
    UpArrowComponent,
    ChatbotComponent,
    RouterModule
],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})

export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  topDeals: Product[] = [];
  categories: Category[] = [];
  banners: {image: string, link: string}[] = [];
  isLoading = true;
  errorMessage = '';
  

  
  // Side menu categories
  sidebarCategories = [
    { name: 'Fashion', icon: 'fas fa-tshirt', id: '2' },
    { name: 'Phones & Tablets', icon: 'fas fa-mobile-alt', id: '1' },
    { name: 'Health & Beauty', icon: 'fas fa-heartbeat', id: '4' },
    { name: 'Home & Furniture', icon: 'fas fa-couch', id: '3' },
    { name: 'Appliances', icon: 'fas fa-blender', id: '3' },
    { name: 'Televisions & Audio', icon: 'fas fa-tv', id: '1' },
    { name: 'Baby Products', icon: 'fas fa-baby', id: '5' },
    { name: 'Supermarket', icon: 'fas fa-shopping-basket', id: '9' },
    { name: 'Computing', icon: 'fas fa-laptop', id: '1' },
    { name: 'Sporting Goods', icon: 'fas fa-running', id: '10' },
    { name: 'Gaming', icon: 'fas fa-gamepad', id: '8' },
    { name: 'Other categories', icon: 'fas fa-ellipsis-h', id: '1' }
  ];
  
 

  // // Right sidebar options
  // sidebarOptions = [
  //   { 
  //     title: 'Join Jumia', 
  //     subtitle: 'as a Sales Consultant', 
  //     icon: 'star-icon' 
  //   },
  //   { 
  //     title: 'Sell on JUMIA', 
  //     subtitle: 'And Grow Your Business', 
  //     icon: 'money-icon' 
  //   },
  //   { 
  //     title: 'Warranty', 
  //     subtitle: 'On Your Purchases', 
  //     icon: 'warranty-icon' 
  //   }
  // ];

  
  
  // Main banner carousel current slide index
  currentSlide: number = 0;

  constructor(private http: HttpClient, private router: Router,
    private navigationService: NavigationService) { }

  ngOnInit(): void {
    // Load categories from API
    this.fetchCategories();
    
    // Mock data for products - in a real app, these would come from a service
    this.featuredProducts = [];

    this.topDeals = [];
    
    this.banners = [
      { image: 'assets/images/banners/banner1.jpg', link: '/promotions/sale' },
      { image: 'assets/images/banners/banner2.jpg', link: '/category/electronics' },
      { image: 'assets/images/banners/banner3.jpg', link: '/flash-sale' }
    ];
    
    // Start automatic banner slider
    this.startSlideShow();
  }

  

  fetchCategories(): void {
    this.isLoading = true;
    this.http.get<{success: boolean, message: string, data: Category[]}>('api/categories')
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Filter only active categories
            this.categories = response.data.filter(category => category.isActive);
            this.isLoading = false;
          } else {
            this.errorMessage = response.message;
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load categories. Please try again later.';
          this.isLoading = false;
          console.error('Error fetching categories:', error);
          
          // Fallback to mock data for development purposes
          this.loadMockCategories();
        }
      });
  }

  loadMockCategories(): void {
    // Mock data for categories in case API fails
    this.categories = [
      { 
        categoryId: 1, 
        name: 'Supermarket', 
        description: 'Groceries and daily needs', 
        imageUrl: 'assets/images/categories/supermarket.png', 
        isActive: true, 
        subcategoryCount: 8 
      },
      { 
        categoryId: 2, 
        name: 'Fashion', 
        description: 'Clothing, shoes and accessories', 
        imageUrl: 'assets/images/categories/fashion.png', 
        isActive: true, 
        subcategoryCount: 12 
      },
      { 
        categoryId: 3, 
        name: 'Electronics', 
        description: 'TVs, audio, cameras and more', 
        imageUrl: 'assets/images/categories/electronics.png', 
        isActive: true, 
        subcategoryCount: 10 
      },
      { 
        categoryId: 4, 
        name: 'Phones & Tablets', 
        description: 'Mobile phones and accessories', 
        imageUrl: 'assets/images/categories/phones.png', 
        isActive: true, 
        subcategoryCount: 6 
      },
      { 
        categoryId: 5, 
        name: 'Home & Office', 
        description: 'Furniture and home appliances', 
        imageUrl: 'assets/images/categories/home.png', 
        isActive: true, 
        subcategoryCount: 15 
      },
      { 
        categoryId: 6, 
        name: 'Health & Beauty', 
        description: 'Personal care and wellness products', 
        imageUrl: 'assets/images/categories/beauty.png', 
        isActive: true, 
        subcategoryCount: 9 
      }
    ];
  }
  
  startSlideShow(): void {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 7; // Assuming 7 slides based on the dots in the UI
    }, 5000); // Change slide every 5 seconds
  }

  setCurrentSlide(index: number): void {
    this.currentSlide = index;
  }

  navigateToCategory(category: {name: string, icon: string, id: string}): void {
    // Store both the category name and ID in navigation service
    this.navigationService.setCategoryName(category.name);
    this.navigationService.setCategoryId(category.id);
    
    // Navigate using only the ID
    this.router.navigate(['/category', category.id]);
  }
}