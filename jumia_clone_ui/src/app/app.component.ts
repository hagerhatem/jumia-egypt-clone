// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../shared/header/header.component';
import { NotificationComponent } from '../shared/notification/notification.component';
import { FooterComponent } from '../shared/footer/footer.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Jumia Clone';
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';
  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Listen for navigation events to clear notifications
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.clearNotification();
    });
  }
  getCurrentUrl(): string {
    
    return this.router.url;
  }



  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => this.clearNotification(), 5000);
  }
  
  clearNotification(): void {
    this.notificationMessage = null;
  }
}