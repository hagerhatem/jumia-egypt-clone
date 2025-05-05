// export interface CartItem {
//   cartItemId: number;
//   cartId: number;
//   productId: number;
//   productName: string;
//   productImage: string;
//   priceAtAddition?: number;
//   quantity: number;
//   totalPrice?: number;
//   variantId?: number;
//   variantName?: string;
  

//   // UI component expected properties
//   name?: string;
//   imageUrl?: string;
//   discountedPrice: number;
//   originalPrice?: number | null;
//   percentOff?: number | null;
//   isJumiaExpress?: boolean;
//   maxQuantity: number;
//   attributes?: {[key: string]: string};
// }

export interface CartItem {
  // API response properties
  cartItemId: number;
  cartId: number;
  productId: number;
  productName?: string;
  productImage?: string;
  quantity: number;
  priceAtAddition?: number;
  totalPrice?: number;
  variantId?: number;
  variantName?: string;
  
  // UI component expected properties
  name?: string;
  imageUrl?: string;
  discountedPrice: number; // Keep this required
  originalPrice?: number | null;
  percentOff?: number | null;
  isJumiaExpress?: boolean;
  maxQuantity: number;
  attributes?: {[key: string]: string};
}