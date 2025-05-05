// shared/banner/banner.component.ts
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="banner-container">
      <a [routerLink]="link">
        <img [src]="image" alt="Promotional banner" class="banner-image">
      </a>
    </div>
  `,
  styles: [`
    .banner-container {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .banner-image {
      width: 100%;
      height: auto;
      display: block;
    }
  `]
})
export class BannerComponent {
  @Input() image!: string;
  @Input() link!: string;
}