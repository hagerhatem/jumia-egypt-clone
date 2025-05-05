import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../../../services/navigations/navigation.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-two-images-bannar',
  imports: [CommonModule],
  templateUrl: './two-images-bannar.component.html',
  styleUrl: './two-images-bannar.component.css',
  standalone: true
})
export class TwoImagesBannarComponent {
  bannerItems = [
    {
      imgSrc: '/images/home/twoImagesBannar/1.PNG',
      category: {
        name: 'Fashion',
        icon: 'shoe-icon', // replace with actual icon if needed
        id: '2'
      }
    },
    {
      imgSrc: '/images/home/twoImagesBannar/2.PNG',
      category: {
        name: 'Beauty & Health',
        icon: 'makeup-icon', // replace with actual icon if needed
        id: '4'
      }
    }
  ];

  constructor(private navigationService: NavigationService, private router: Router) {}

  navigateToCategory(category: {name: string, icon: string, id: string}): void {
    // Store both the category name and ID in navigation service
    this.navigationService.setCategoryName(category.name);
    this.navigationService.setCategoryId(category.id);
    // Navigate using only the ID
    this.router.navigate(['/category', category.id]);
  }
}