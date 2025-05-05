export interface product_manage {
  productId: number;
  name: string;
  description: string;
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  isAvailable: boolean;
  approvalStatus: string;
  createdAt: Date;
  updatedAt: Date;
  mainImageUrl: string;
  averageRating: number;
  sellerId: number;
  sellerName: string;
  subcategoryId: number;
  subcategoryName: string;
  categoryId: number;
  categoryName: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  attributeValues?: ProductAttributeValue[];
  ratingCount?: number;
  reviewCount?: number;
}

export interface ProductImage {
  imageId: number;
  productId: number;
  imageUrl: string;
  displayOrder: number;
}

export interface ProductVariant {
  variantId: number;
  productId: number;
  variantName: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  sku: string;
  variantImageUrl: string;
  isDefault: boolean;
  isAvailable: boolean;
  attributes?: VariantAttribute[];
}

export interface VariantAttribute {
  variantAttributeId: number;
  variantId: number;
  attributeName: string;
  attributeValue: string;
}

export interface ProductAttributeValue {
  valueId: number;
  productId: number;
  attributeId: number;
  attributeName: string;
  value: string;
  attributeType: string;
}

export interface ProductFilter {
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  approvalStatus?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
