// shared/carousel/carousel.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="carousel-container">
      <div class="carousel-track" [style.transform]="'translateX(' + translateValue + 'px)'">
        <div *ngFor="let image of images" class="carousel-slide">
          <a [routerLink]="image.link">
            <img [src]="'/images/home/slider1.png'" alt="Promo banner">
          </a>
        </div>
      </div>
      <div class="carousel-controls">
        <button class="carousel-control prev" (click)="prevSlide()">
          &#10094;
        </button>
        <button class="carousel-control next" (click)="nextSlide()">
          &#10095;
        </button>
      </div>
      <div class="carousel-indicators">
        <span 
          *ngFor="let image of images; let i = index" 
          class="indicator" 
          [class.active]="i === currentSlide"
          (click)="goToSlide(i)">
        </span>
      </div>
    </div>
  `,
  styles: [`
    .carousel-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .carousel-track {
      display: flex;
      transition: transform 0.5s ease;
    }
    
    .carousel-slide {
      min-width: 100%;
      height: 300px;
    }
    
    .carousel-slide img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .carousel-controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
    
    .carousel-control {
      background-color: rgba(255, 255, 255, 0.5);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s;
    }
    
    .carousel-control:hover {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.8);
    }
    
    .carousel-indicators {
      position: absolute;
      bottom: 15px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    
    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .indicator.active {
      background-color: #f68b1e;
    }
    
    @media (max-width: 768px) {
      .carousel-slide {
        height: 180px;
      }
      
      .carousel-control {
        width: 30px;
        height: 30px;
        font-size: 16px;
      }
    }
  `]
})
export class CarouselComponent implements OnInit {
  @Input() images: {image: string, link: string}[] = [];
  currentSlide = 0;
  translateValue = 0;
  slideWidth = 0;
  interval: any;
  
  ngOnInit(): void {
    // Start automatic sliding
    this.startAutoSlide();
    
    // Calculate slide width on window resize
    window.addEventListener('resize', this.updateSlideWidth.bind(this));
    this.updateSlideWidth();
  }
  
  ngOnDestroy(): void {
    // Clear the interval when component is destroyed
    clearInterval(this.interval);
    window.removeEventListener('resize', this.updateSlideWidth.bind(this));
  }
  
  updateSlideWidth(): void {
    const container = document.querySelector('.carousel-container');
    if (container) {
      this.slideWidth = container.clientWidth;
      this.translateValue = -this.currentSlide * this.slideWidth;
    }
  }
  
  startAutoSlide(): void {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
  
  resetAutoSlide(): void {
    clearInterval(this.interval);
    this.startAutoSlide();
  }
  
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
    this.updateTranslateValue();
    this.resetAutoSlide();
  }
  
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.images.length) % this.images.length;
    this.updateTranslateValue();
    this.resetAutoSlide();
  }
  
  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateTranslateValue();
    this.resetAutoSlide();
  }
  
  updateTranslateValue(): void {
    this.translateValue = -this.currentSlide * this.slideWidth;
  }
}
