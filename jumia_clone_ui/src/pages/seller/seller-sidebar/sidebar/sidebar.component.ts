import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service'; // Add this import
import { SellerProfileService } from '../../../../services/seller/seller-profile.service'; // Add this import
import { Seller } from '../../../../models/seller.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  // Add these new properties
  seller: Seller | null = null;
  loading = true;
  error: string | null = null;

  // isCollapsed = signal<boolean>(false);
  // activeSection = signal<string>('');
  // activeSubSection = signal<string>('');
  // isProductsOpen = signal<boolean>(false);
  @Output() toggle = new EventEmitter<void>();
  @Input() collapsed = false;

  activeSection: string | null = null;
  activeSubSection: string | null = null;

  showProducts = false;
  // activeSection = 'products';
  // activeSubSection = 'Manage products';

  toggleProducts() {
    this.showProducts = !this.showProducts;
  }

  // setActiveSection(section: string) {
  //   this.activeSection = section;
  // }

  // setActiveSubSection(subSection: string) {
  //   this.activeSubSection = subSection;
  // }

  setActiveSection(section: string) {
    if (this.activeSection === section) {
      this.activeSection = null;
    } else {
      this.activeSection = section;
    }
    // Reset sub-section when changing main sections
    this.activeSubSection = null;
  }

  setActiveSubSection(subsection: string) {
    this.activeSubSection = subsection;
    // Set parent section as active when sub-section is selected
    this.activeSection = 'products';
  }
  // toggleProducts() {
  //   this.isProductsOpen.update((v) => !v);
  //   this.setActiveSection('products');
  // }

  // setActiveSection(section: string) {
  //   this.activeSection.set(section);
  //   if (section !== 'products') {
  //     this.isProductsOpen.set(false);
  //   }

  // setActiveSubSection(subSection: string) {
  //   this.activeSubSection.set(subSection);
  //   event?.stopPropagation();
  // }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.toggle.emit();
  }

  isSidebarExpanded = signal(true);

  constructor(
    private authService: AuthService,
    private router: Router,
    private sellerProfileService: SellerProfileService // Add this
  ) {
    this.loadSellerProfile();
  }

  // Add this new method
  private loadSellerProfile(): void {
    const userId = 1;
    if (!userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.sellerProfileService.getSellerProfile(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.seller = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load seller profile';
        this.loading = false;
      },
    });
  }

  // Add this new method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
