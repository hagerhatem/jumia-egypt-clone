// First, make sure you have Font Awesome installed in your Angular project

// up-arrow.component.ts
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-up-arrow',
  template: `
    <div 
      class="up-arrow-container" 
      [class.visible]="isVisible" 
      (click)="scrollToTop()">
      <i class="fas fa-chevron-up"></i>
    </div>
  `,
  styles: [`
    .up-arrow-container {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background-color: white;
      border: 2px solid #FF9800;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .up-arrow-container.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .up-arrow-container:hover {
      background-color: #FFF3E0;
    }
    
    .fa-chevron-up {
      color: #FF9800;
      font-size: 20px;
    }
  `]
})
export class UpArrowComponent {
  isVisible = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    // Show the button when the user scrolls down 300px from the top
    this.isVisible = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}