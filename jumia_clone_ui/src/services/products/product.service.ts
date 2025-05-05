import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginationParams } from '../../models/general';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ProductResponse } from '../../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
// Function to get all products from API
getAllProducts(page: number = 1, pageSize: number = 10): Observable<any> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/api/Products`, { params })
    .pipe(
      map(response => {
        console.log(response);
        // Check if response has a data property
        if (response && response.data) {
          return response.data;
        } else {
          // If response is already an array or another format
          return response;
        }
      }),
      catchError(err => {
        console.error('Error fetching all products:', err);
        throw err;
      })
    );
}

  getProductById(id: number, includeDetails: boolean): Observable<any> {
    const params = new HttpParams()
      .set('includeDetails', includeDetails.toString());
  
    return this.http.get<ProductResponse>(`${this.apiUrl}/api/Products/${id}`, { params })
      .pipe(
        map(response => {
          // Adjust based on your API response structure
          return response;
        }),
        catchError(err => {
          // Handle specific error cases
          if (err.status === 404) {
            throw new Error('Product not found');
          }
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
  getRandomCategoryProducts(Category:string , count:number=15): Observable<any> {
    const params = new HttpParams()
    .set('CategoryName', Category.toString())
    .set('count', count.toString());  
    return this.http.get<any>(`${this.apiUrl}/api/Products/random/Category`,{params})
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

  // Updated to match backend URL pattern with CategoryId as query parameter
  getProductsByCategory(categoryId: string, page: number = 0, pageSize: number = 80): Observable<any> {
    if (!categoryId) {
      console.error('Invalid categoryId provided:', categoryId);
      return throwError(() => new Error('Invalid categoryId'));
    }
    
    const params = new HttpParams()
      .set('PageSize', pageSize.toString())
      .set('PageNumber', page.toString())
      .set('CategoryId', categoryId);
    
    const url = `${this.apiUrl}/api/Products`;
    console.log('Making request to:', url, 'with params:', params.toString());
    
    return this.http.get<any>(url, { params })
      .pipe(
        catchError(err => {
          console.error('Error fetching products by category:', err);
          throw err;
        })
      );
  }

// Updated to match backend URL pattern with SubcategoryId as query parameter
getProductsBySubcategory(subcategoryId: string, page: number = 0, pageSize: number = 80): Observable<any> {
  const params = new HttpParams()
    .set('SubcategoryId', subcategoryId)
    .set('pageNumber', page.toString())
    .set('pageSize', pageSize.toString());
  
  return this.http.get<any>(`${this.apiUrl}/api/Products`, { params })
    .pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(err => {
        console.error('Error fetching products by subcategory:', err);
        throw err;
      })
    );
}

/**
 * Get subcategories for a specific category
 * @param categoryId The ID of the parent category
 * @returns Observable of Subcategory array
 */
getSubcategoriesByCategoryId(categoryId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/Subcategory/category/${categoryId}`);
}

/**
 * Get category details by ID
 * @param categoryId The ID of the category
 * @returns Observable of Category object
 */
getCategoryById(categoryId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/Categories/${categoryId}`);
}

/**
 * Get categoryId by category name
 * @param categoryName The name of the category
 * @returns Observable of Category object
 */
getCategoryByName(categoryName: string): Observable<any> {
  // Assuming your API has an endpoint to search categories by name
  // If not, you might need to get all categories and filter client-side
  const params = new HttpParams().set('name', categoryName);
  return this.http.get<any>(`${this.apiUrl}/api/Categories/Search`, { params })
    .pipe(
      catchError(err => {
        console.error('Error fetching category by name:', err);
        throw err;
      })
    );
}

// Alternative implementation if your API doesn't have a search by name endpoint
// This method gets all categories and filters by name client-side
getAllCategoriesAndFindByName(categoryName: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/Categories`)
    .pipe(
      map(response => {
        const categories = response.data || response;
        const foundCategory = categories.find((cat: any) => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        return { data: foundCategory || null };
      }),
      catchError(err => {
        console.error('Error fetching categories:', err);
        throw err;
      })
    );
}

}