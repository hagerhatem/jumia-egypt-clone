import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPhone,
  faUndo,
  faLock
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-checkout-header',
  templateUrl: './checkout-header.component.html',
  imports: [ FontAwesomeModule, RouterModule],
  styleUrls: ['./checkout-header.component.css']
})
export class CheckoutHeaderComponent {
  selectedLanguage: string = 'en'; // Default language is English

  constructor(private router: Router) {}
   // Font Awesome icons
   faPhoneAlt = faPhone;
   faUndoAlt = faUndo;
   faLock = faLock;

  // Handle language change
  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLanguage = selectElement.value;

    // Add logic to handle language change in your app
    // For example, you might use a translation service like ngx-translate
    console.log('Language changed to:', this.selectedLanguage);

    // Example: Update the app's language (pseudo-code)
    // this.translateService.use(this.selectedLanguage);
  }

  // Handle navigation link clicks
  navigateTo(link: string): void {
    switch (link) {
      case 'contact':
        // Redirect to contact page
        this.router.navigate(['/contact']);
        break;
      case 'returns':
        // Redirect to returns page
        this.router.navigate(['/returns']);
        break;
      case 'payments':
        // Redirect to payments info page
        this.router.navigate(['/payments']);
        break;
      default:
        console.log('Unknown navigation link:', link);
    }
  }
}