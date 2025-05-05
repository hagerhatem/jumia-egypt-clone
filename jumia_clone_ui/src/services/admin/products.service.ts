import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  ApiResponse, 
  Product, 
  ProductsData, 
  ProductQueryParams, 
  ProductVariant 
} from '../../models/admin';
import { PaginationParams } from '../../models/general';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) { }

  // Error handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || 'Server error';
    }
    return throwError(() => new Error(errorMessage));
  }

  // GET: api/products
  getProducts(params: ProductQueryParams): Observable<ProductsData> {
    let httpParams = new HttpParams()
      .set('pageSize', params.pageSize.toString())
      .set('pageNumber', params.pageNumber.toString());

    if (params.categoryId !== undefined) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }
    if (params.subcategoryId !== undefined) {
      httpParams = httpParams.set('subcategoryId', params.subcategoryId.toString());
    }
    if (params.sellerId !== undefined) {
      httpParams = httpParams.set('sellerId', params.sellerId.toString());
    }
    if (params.minPrice !== undefined) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.approvalStatus) {
      httpParams = httpParams.set('approvalStatus', params.approvalStatus);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<ApiResponse<ProductsData>>(this.apiUrl, { params: httpParams }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // GET: api/products/{id}
  getProductById(id: number, includeDetails: boolean = true): Observable<ApiResponse<Product>> {
    const params = new HttpParams().set('includeDetails', includeDetails.toString());
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`, { params }).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  // POST: api/products
  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, productData).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
// PUT: api/products/{id}
updateProduct(id: number, productData: any): Observable<Product> {
  return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, productData).pipe(
    map(response => response.data),
    catchError(this.handleError)
  );
}
  // PUT: api/products/{id}/approval-status
  updateProductStatus(id: number, productData: any): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}/approval-status`, productData).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
// PUT: api/products/{id}/available
  updateProductAvailabilty(id: number, isAvailable: any): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}/available`, isAvailable).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // DELETE: api/products/{id}
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  // PUT: api/products/{id}/approval-status
  updateProductApprovalStatus(id: number, status: string, adminNotes?: string): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}/approval-status`, {
      approvalStatus: status,
      adminNotes: adminNotes
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // GET: api/products/pending-approval
  getPendingApprovalProducts(pagination: PaginationParams): Observable<Product[]> {
    const params = new HttpParams()
      .set('pageSize', pagination.pageSize.toString())
      .set('pageNumber', pagination.pageNumber.toString());

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/pending-approval`, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // GET: api/products/{id}/statistics
  getProductStatistics(id: number, startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/statistics`, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // GET: api/products/{id}/related
  getRelatedProducts(id: number, count: number = 5): Observable<Product[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/${id}/related`, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // GET: api/products/trending
  getTrendingProducts(categoryId?: number, subcategoryId?: number, count: number = 10): Observable<Product[]> {
    let params = new HttpParams().set('count', count.toString());
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (subcategoryId) params = params.set('subcategoryId', subcategoryId.toString());

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/trending`, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Variant Management
  // POST: api/products/{id}/variants
  addVariant(productId: number, variantData: FormData): Observable<ProductVariant> {
    return this.http.post<ApiResponse<ProductVariant>>(`${this.apiUrl}/${productId}/variants`, variantData).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // PUT: api/products/variants/{variantId}
  updateVariant(variantId: number, variantData: FormData): Observable<ProductVariant> {
    return this.http.put<ApiResponse<ProductVariant>>(`${this.apiUrl}/variants/${variantId}`, variantData).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // DELETE: api/products/variants/{variantId}
  deleteVariant(variantId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/variants/${variantId}`).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  // Stock Management
  // POST: api/products/{id}/stock
  updateProductStock(productId: number, newStock: number): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/${productId}/stock`, { newStock }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // POST: api/products/variants/{variantId}/stock
  updateVariantStock(variantId: number, newStock: number): Observable<ProductVariant> {
    return this.http.post<ApiResponse<ProductVariant>>(`${this.apiUrl}/variants/${variantId}/stock`, { newStock }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Random Products
  // GET: api/products/random/category
  getRandomProductsByCategory(categoryName: string, count: number = 5): Observable<Product[]> {
    const params = new HttpParams()
      .set('categoryName', categoryName)
      .set('count', count.toString());

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/random/category`, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // GET: api/products/random/subcategory
  getRandomProductsBySubcategory(subcategoryName: string, count: number = 5): Observable<Product[]> {
    const params = new HttpParams()
      .set('subcategoryName', subcategoryName)
      .set('count', count.toString());

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/random/subcategory`, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
