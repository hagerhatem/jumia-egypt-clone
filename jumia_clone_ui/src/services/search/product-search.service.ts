// services/search/product-search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProductSearchResult {
  productId: number;
  name: string;
  finalPrice: number;
  basePrice: number;
  discountPercentage: number;
  mainImageUrl: string;
  averageRating: number;
  subcategoryName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductSearchService {
  private apiUrl = environment.apiUrl;
  private searchResultsSubject = new BehaviorSubject<ProductSearchResult[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) { }

  searchProducts(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.searchResultsSubject.next([]);
      return;
    }
    
    // Based on the Swagger UI, we need to use SearchTerm parameter with correct casing
    const params = new HttpParams()
      .set('SearchTerm', searchTerm.trim())
      .set('PageSize', '5') // Limit to 5 results for the dropdown
      .set('PageNumber', '1');

    this.http.get<any>(`${this.apiUrl}/api/Products`, { params })
      .pipe(
        tap(response => {
          if (response && response.data && response.data.products) {
            this.searchResultsSubject.next(response.data.products);
          } else {
            this.searchResultsSubject.next([]);
          }
        }),
        catchError(error => {
          console.error('Error searching products:', error);
          this.searchResultsSubject.next([]);
          return of({ message: "Error occurred", data: { products: [] } });
        })
      ).subscribe();
  }
  
  // For the full search page with all parameters
  getSearchResults(params: {
    searchTerm?: string,
    pageSize?: number,
    pageNumber?: number,
    categoryId?: number,
    subcategoryId?: number,
    minPrice?: number,
    maxPrice?: number,
    approvalStatus?: string,
    sortBy?: string,
    sortDirection?: string
  }): Observable<any> {
    
    let httpParams = new HttpParams();
    
    // Add parameters only if they are defined, with proper casing as shown in Swagger UI
    if (params.searchTerm) httpParams = httpParams.set('SearchTerm', params.searchTerm.trim());
    if (params.pageSize) httpParams = httpParams.set('PageSize', params.pageSize.toString());
    if (params.pageNumber) httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    if (params.categoryId) httpParams = httpParams.set('CategoryId', params.categoryId.toString());
    if (params.subcategoryId) httpParams = httpParams.set('SubcategoryId', params.subcategoryId.toString());
    if (params.minPrice) httpParams = httpParams.set('MinPrice', params.minPrice.toString());
    if (params.maxPrice) httpParams = httpParams.set('MaxPrice', params.maxPrice.toString());
    if (params.approvalStatus) httpParams = httpParams.set('ApprovalStatus', params.approvalStatus);
    if (params.sortBy) httpParams = httpParams.set('SortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('SortDirection', params.sortDirection);
    
    return this.http.get<any>(`${this.apiUrl}/api/Products`, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('Error getting search results:', error);
          return of({ message: "Error occurred", data: { products: [] } });
        })
      );
  }
  
  clearResults() {
    this.searchResultsSubject.next([]);
  }
}