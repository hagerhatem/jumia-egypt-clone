export interface Product {
    productId: number;
    sellerId: number;
    subcategoryId: number;
    name: string;
    description: string;
    basePrice: number;
    discountPercentage: number;
    isAvailable: boolean;
    stockQuantity: number;
    mainImageUrl: string;
    averageRating: number;
    sellerName: string;
    categoryId: number;
    categoryName: string;
    ratingCount: number;
    reviewCount: number;
    images: ProductImage[];
    variants: ProductVariant[];
    attributeValues: ProductAttribute[];
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
    attributes: VariantAttribute[];
}

export interface VariantAttribute {
    attributeId: number;
    name: string;
    value: string;
}

export interface ProductAttribute {
    valueId: number;
    productId: number;
    attributeId: number;
    attributeName: string;
    attributeType: string;
    value: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    basePrice: number;
    discountPercentage: number;
    stockQuantity: number;
    mainImageUrl: string;
    categoryId: number;
    sellerId: number;
    hasVariants: boolean;
    isAvailable: boolean;
    approvalStatus: string;
    variants?: ProductVariantFormData[];
    attributeValues?: ProductAttributeFormData[];
}

export interface ProductVariantFormData {
    variantName: string;
    price: number;
    discountPercentage: number;
    stockQuantity: number;
    sku: string;
    variantImageUrl?: string;
    isDefault: boolean;
    isAvailable: boolean;
    attributes: VariantAttributeFormData[];
}

export interface VariantAttributeFormData {
    name: string;
    value: string;
}

export interface ProductAttributeFormData {
    attributeId: number;
    value: string;
}

export interface ProductResponse {
    success: boolean;
    message: string;
    data: Product;
}
