import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../../../../services/navigations/navigation.services'; // Adjust path as needed

@Component({
  selector: 'app-static-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './static-container.component.html',
  styleUrls: ['./static-container.component.css']
})
export class StaticContainerComponent implements OnInit {
  // Updated slides array with category information
  slides = [
    { 
      image: '/images/home/staticContainer/staticContainer1.png', 
      alt: 'Fashion', 
      category: { name: 'Fashion', icon: 'tag', id: '2' }
    },
    { 
      image: '/images/home/staticContainer/staticContainer2.png', 
      alt: 'Fashion', 
      category: { name: 'Fashion', icon: 'percent', id: '2' }
    },
    { 
      image: '/images/home/staticContainer/staticContainer3.png', 
      alt: 'Electronics', 
      category: { name: 'Electronics', icon: 'flag', id: '1' }
    },
    { 
      image: '/images/home/staticContainer/staticContainer4.png', 
      alt: 'Beauty & Health', 
      category: { name: 'Beauty & Health', icon: 'zap', id: '4' }
    },
    { 
      image: '/images/home/staticContainer/staticContainer5.png', 
      alt: 'Home & Kitchen', 
      category: { name: 'Home & Kitchen', icon: 'credit-card', id: '3' }
    },
    { 
      image: '/images/home/staticContainer/staticContainer6.png', 
      alt: 'Home & Kitchen', 
      category: { name: 'Home & Kitchen ', icon: 'shield', id: '3' }
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

  // Updated to use the navigateToCategory function
  navigateToCategory(category: {name: string, icon: string, id: string}): void {
    // Store both the category name and ID in navigation service
    this.navigationService.setCategoryName(category.name);
    this.navigationService.setCategoryId(category.id);
    
    // Navigate using only the ID
    this.router.navigate(['/category', category.id]);
  }
}