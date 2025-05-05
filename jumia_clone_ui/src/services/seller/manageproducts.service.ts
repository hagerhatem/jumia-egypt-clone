import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { product_manage, ProductFilter } from '../../models/product-manage';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  total: number; // Add this for total count
  pageSize: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class ManageProductsService {
  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getSellerIdFromAuth(): number {
    const userData = this.authService.currentUserValue;
    if (!userData || !userData.userId) {
      throw new Error('No authenticated seller found');
    }
    return 1;
  }

  getSellerProducts(
    pageNumber: number = 0,
    pageSize: number = 10,
    filter?: ProductFilter
  ): Observable<ApiResponse<product_manage[]>> {
    try {
      const sellerId = this.getSellerIdFromAuth();

      let params = new HttpParams()
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString());

      if (filter) {
        if (filter.searchTerm)
          params = params.set('searchTerm', filter.searchTerm);
        if (filter.approvalStatus)
          params = params.set('approvalStatus', filter.approvalStatus);
        if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
        if (filter.sortDirection)
          params = params.set('sortDirection', filter.sortDirection);
        if (filter.categoryId)
          params = params.set('categoryId', filter.categoryId.toString());
        if (filter.subcategoryId)
          params = params.set('subcategoryId', filter.subcategoryId.toString());
        if (filter.minPrice)
          params = params.set('minPrice', filter.minPrice.toString());
        if (filter.maxPrice)
          params = params.set('maxPrice', filter.maxPrice.toString());
      }

      return this.http
        .get<ApiResponse<product_manage[]>>(
          `${this.apiUrl}/seller/${sellerId}`,
          {
            params,
          }
        )
        .pipe(
          tap((response) => {
            console.log('API Response:', {
              url: `${this.apiUrl}/seller/${sellerId}`,
              params: params.toString(),
              response,
            });
          }),
          catchError((error) => {
            console.error('Error fetching seller products:', error);
            return throwError(() => new Error('Failed to fetch products'));
          })
        );
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteProduct(productId: number): Observable<ApiResponse<null>> {
    try {
      const sellerId = this.getSellerIdFromAuth();

      return this.http
        .delete<ApiResponse<null>>(`${this.apiUrl}/${productId}`)
        .pipe(
          catchError((error) => {
            console.error('Error deleting product:', error);
            return throwError(() => new Error('Failed to delete product'));
          })
        );
    } catch (error) {
      return throwError(() => error);
    }
  }

  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }

  updateProduct(id: number, productData: any) {
    return this.http.put<any>(`${this.apiUrl}/products/${id}`, productData);
  }
}
