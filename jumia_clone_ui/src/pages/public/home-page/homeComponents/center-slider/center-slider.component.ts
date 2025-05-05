// shared/center-slider/center-slider.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-center-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './center-slider.component.html',
  styleUrls: ['./center-slider.component.css']
})
export class CenterSliderComponent implements OnInit, OnDestroy {
  @Input() images: {image: string, link: string}[] = [
    { image: '/images/home/centerContainer/1.png', link: '/product/1' },
    { image: '/images/home/centerContainer/2.png', link: '/product/2' },
    { image: '/images/home/centerContainer/3.png', link: '/product/3' },
    { image: '/images/home/centerContainer/4.png', link: '/product/4' },
    { image: '/images/home/centerContainer/5.png', link: '/product/5' },
    { image: '/images/home/centerContainer/6.png', link: '/product/6' }
  ];
  
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
    const container = document.querySelector('.center-slider-container');
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