// src/app/models/add-cart-item.model.ts
export interface AddCartItem {
  productId: number;
  quantity: number;
  variantId?: number;
  priceAtAddition?: number;
}