import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../../../../services/navigations/navigation.services'; // Adjust the path as needed

@Component({
  selector: 'app-promo-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promo-slider.component.html',
  styleUrls: ['./promo-slider.component.css']
})
export class PromoSliderComponent implements OnInit {
  slides = [
    { 
      image: '/images/homeSlider1/homeSlider1.png', 
      alt: 'Electronics', 
      category: { name: 'Electronics', icon: 'tag', id: '1' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider2.png', 
      alt: 'Fashion', 
      category: { name: 'Fashion', icon: 'percent', id: '2' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider3.png', 
      alt: 'Home & Kitchen', 
      category: { name: 'Home & Kitchen', icon: 'flag', id: '3' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider4.png', 
      alt: 'Beauty & Health', 
      category: { name: 'Beauty & Health', icon: 'bolt', id: '4' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider5.png', 
      alt: 'Baby Products', 
      category: { name: 'Baby Products', icon: 'credit-card', id: '5' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider6.png', 
      alt: 'Phones & Tablets', 
      category: { name: 'Phones & Tablets', icon: 'store', id: '6' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider7.png', 
      alt: 'Computing', 
      category: { name: 'Computing', icon: 'gift', id: '7' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider8.png', 
      alt: 'Gaming', 
      category: { name: 'Gaming', icon: 'star', id: '8' } 
    },
    { 
      image: '/images/homeSlider1/homeSlider9.png', 
      alt: 'Grocery', 
      category: { name: 'Grocery', icon: 'fire', id: '9' } 
    },
  ];

  @ViewChild('slidesContainer') slidesContainerRef!: ElementRef;

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    // Initialization if needed
  }
  
  navigateToCategory(category: {name: string, icon: string, id: string}): void {
    // Store both the category name and ID in navigation service
    this.navigationService.setCategoryName(category.name);
    this.navigationService.setCategoryId(category.id);
    
    // Navigate using only the ID
    this.router.navigate(['/category', category.id]);
  }

  prevSlide() {
    const slideWidth = 190; // width + gap
    this.slidesContainerRef.nativeElement.scrollLeft -= slideWidth * 3;
  }

  nextSlide() {
    const slideWidth = 190; // width + gap
    this.slidesContainerRef.nativeElement.scrollLeft += slideWidth * 3;
  }
}