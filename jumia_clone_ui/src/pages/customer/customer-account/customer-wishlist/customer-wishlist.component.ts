// src/app/wishlist/wishlist.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistComponent } from '../../wishlist/wishlist/wishlist.component';

@Component({
  selector: 'app-account-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, WishlistComponent],
  templateUrl: './customer-wishlist.component.html',
  styleUrls: ['./customer-wishlist.component.css']
})
export class customerWishlistComponent {
  // You can add any logic for the wishlist here
  hasItems: boolean = false;
}