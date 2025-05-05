import { CartItem } from './cart-item.model';

export interface Cart {
  cartId: number;
  customerId: number;
  createdAt?: Date;
  updatedAt?: Date;
  cartItems: CartItem[];
}