// src/app/models/category.model.ts
export interface Category {
    categoryId: number;
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    subcategoryCount: number;
  }
  
  export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category[];
  }
  
