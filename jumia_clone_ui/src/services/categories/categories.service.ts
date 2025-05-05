// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PaginationParams } from '../../models/general';
import { CategoryResponse } from '../../models/category';
import { catchError, map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  getCategories(pagination: PaginationParams): Observable<CategoryResponse> {
    let params = new HttpParams()
      .set('PageSize', pagination.pageSize.toString())
      .set('PageNumber', pagination.pageNumber.toString())
      .set('include_inactive', (pagination.includeInactive || false).toString());
      
    return this.http.get<CategoryResponse>(`${this.apiUrl}/api/Categories`, { params });
  }

 // Get all categories
 getCategories1(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/api/Categories`)
    .pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(err => {
        console.error('Error fetching categories:', err);
        throw err;
      })
    );
}

// Get a single category by ID
getCategoryById(categoryId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/Categories/${categoryId}`)
    .pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(err => {
        console.error('Error fetching category details:', err);
        throw err;
      })
    );
}

// Get subcategories by parent category ID (updated to match your API endpoint)
getSubcategoriesByCategory(categoryId: string): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/api/Subcategory/category/${categoryId}`)
    .pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(err => {
        console.error('Error fetching subcategories:', err);
        throw err;
      })
    );
}

// Get subcategories by category name (assuming this endpoint exists)
getSubcategoriesByCategoryName(categoryName: string): Observable<any[]> {
  const params = new HttpParams().set('name', categoryName);
  
  return this.http.get<any>(`${this.apiUrl}/api/Subcategory/categories/subcategory`, { params })
    .pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(err => {
        console.error('Error fetching subcategories by category name:', err);
        throw err;
      })
    );
}

// Get subcategory by ID
getSubcategoryById(subcategoryId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/Subcategory/${subcategoryId}`)
    .pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(err => {
        console.error('Error fetching subcategory:', err);
        throw err;
      })
    );
}
getRandomSubCategoryProducts(subCategory:string , count:number=15): Observable<any> {
    const params = new HttpParams()
    .set('subCategoryName', subCategory.toString())
    .set('count', count.toString());  
    return this.http.get<any>(`${this.apiUrl}/api/Products/random/Subcategory`,{params})
      .pipe(
        map(response => {
          console.log (response);
          // Check if response has a data property
          if (response && response.data) {
            return response.data;
          } else {
            // If response is already an array or another format
            return response;
          }
        }),
        catchError(err => {
          console.error('Error fetching flash sale products:', err);
          throw err;
        })
      );
  }
}