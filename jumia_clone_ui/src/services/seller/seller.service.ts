import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Product } from '../../models/product';
import {
  BasicCategoiesInfo,
  BasicSubCategoriesInfo,
  SubcategoryAttribute,
} from '../../models/admin';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getSellerIdFromAuth(): number {
    const userData = this.authService.currentUserValue;
    if (!userData || !userData.userId) {
      throw new Error('No authenticated seller found');
    }
    return userData.userId;
  }

  // Get product by ID
  getProductById(productId: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/api/products/${productId}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching product:', error);
          return throwError(() => new Error('Failed to fetch product'));
        })
      );
  }

  // Create new product
  createProduct(formData: FormData): Observable<Product> {
    try {
      const sellerId = this.getSellerIdFromAuth();

      return this.http
        .post<ApiResponse<Product>>(`${this.apiUrl}/api/products`, formData)
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            console.error('Error creating product:', error);
            return throwError(() => new Error('Failed to create product'));
          })
        );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Update existing product
  updateProduct(productId: number, formData: FormData): Observable<Product> {
    try {
      return this.http
        .put<ApiResponse<Product>>(
          `${this.apiUrl}/api/products/${productId}`,
          formData
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            console.error('Error updating product:', error);
            return throwError(() => new Error('Failed to update product'));
          })
        );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Get categories
  getCategories(): Observable<BasicCategoiesInfo[]> {
    // Add authentication token to ensure the request is authorized
    return this.http
      .get<ApiResponse<BasicCategoiesInfo[]>>(
        `${this.apiUrl}/api/categories/basic-info`,
        { headers: { 'Cache-Control': 'no-cache' } } // Add cache control to prevent stale data
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching categories:', error);
          return throwError(() => new Error('Failed to fetch categories'));
        })
      );
  }

  // Get subcategories by category ID
  getSubcategories(categoryId: number): Observable<BasicSubCategoriesInfo[]> {
    return this.http
      .get<ApiResponse<BasicSubCategoriesInfo[]>>(
        `${this.apiUrl}/api/Subcategory/basic-info/${categoryId}`
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching subcategories:', error);
          return throwError(() => new Error('Failed to fetch subcategories'));
        })
      );
  }

  // Get subcategory attributes
  getSubcategoryAttributes(
    subcategoryId: number
  ): Observable<SubcategoryAttribute[]> {
    return this.http
      .get<ApiResponse<SubcategoryAttribute[]>>(
        `${this.apiUrl}/api/ProductAttributes/subcategory/${subcategoryId}`
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching subcategory attributes:', error);
          return throwError(
            () => new Error('Failed to fetch subcategory attributes')
          );
        })
      );
  }

  // Delete product
  deleteProduct(productId: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/api/products/${productId}`)
      .pipe(
        catchError((error) => {
          console.error('Error deleting product:', error);
          return throwError(() => new Error('Failed to delete product'));
        })
      );
  }

  // Update product availability
  updateProductAvailability(
    productId: number,
    isAvailable: boolean
  ): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(
        `${this.apiUrl}/api/products/${productId}/availability`,
        {
          isAvailable,
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating product availability:', error);
          return throwError(
            () => new Error('Failed to update product availability')
          );
        })
      );
  }
}
