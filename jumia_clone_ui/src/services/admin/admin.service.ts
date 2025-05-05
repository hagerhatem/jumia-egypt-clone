// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, map, catchError, throwError } from 'rxjs';
import { ApiResponse, BasicCategoiesInfo, BasicSellerInfo, BasicSubCategoriesInfo, Category, DashboardStats, Order, Product, ProductQueryParams, ProductsData, Review, Seller, User, SubcategoryAttribute } from '../../models/admin';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginationParams } from '../../models/general';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Categories
  getBasicCategories(): Observable<BasicCategoiesInfo[]> {
    return this.http.get<ApiResponse<BasicCategoiesInfo[]>>(`${this.apiUrl}/api/categories/basic-info`)
      .pipe(
        map(response => response.data)
      );
  }

getCategories(page: number = 1, pageSize: number = 10, searchTerm: string = '', status: string = ''): Observable<ApiResponse<Category[]>> {
  let params = new HttpParams()
    .set('pageNumber', page.toString())
    .set('pageSize', pageSize.toString());
    
  if (searchTerm) {
    params = params.set('searchTerm', searchTerm);
  }
  
  if (status) {
    params = params.set('status', status);
  }
  params = params.set("include_inactive", true);
  return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/api/categories`, { params })
    .pipe(
      map(response => response)
    );
}


// Get all subcategories with pagination
getSubcategories(page: number = 1, pageSize: number = 10, searchTerm: string = '', status: string = ''): Observable<any> {
  let params = new HttpParams()
    .set('pageNumber', page.toString())
    .set('pageSize', pageSize.toString());
    
  if (searchTerm) {
    params = params.set('searchTerm', searchTerm);
  }
  
  if (status) {
    params = params.set('status', status);
  }
  params = params.set("include_inactive", true);
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/subcategory`, { params })
    .pipe(
      map(response => response)
    );
}

// Get subcategory by ID
getSubcategoryById(id: number): Observable<any> {
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/subcategory/${id}`).pipe(
    map(response => response.data)
  );
}

// Create new subcategory
createSubcategory(formData: FormData): Observable<any> {
  return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/Subcategory`, formData).pipe(
    map(response => response.data)
  );
}

// Update existing subcategory
updateSubcategory(id: number, formData: FormData): Observable<any> {
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/subcategory/${id}`, formData).pipe(
    map(response => response.data)
  );
}

// Delete subcategory
deleteSubcategory(id: number): Observable<boolean> {
  return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/subcategory/${id}`).pipe(
    map(() => true)
  );
}
getCategoryById(id: number): Observable<Category | undefined> {
  return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/api/categories/${id}`)
    .pipe(
      map(response => response.data)
    );
}

  createCategory(categoryData: FormData): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/api/categories`, categoryData);
  }
updateCategoryWithImage(id: number, categoryData: FormData): Observable<Category> {
  return this.http.put<Category>(`${this.apiUrl}/api/categories/${id}`, categoryData);
}

createCategoryWithImage(categoryData: FormData): Observable<Category> {
  return this.http.post<Category>(`${this.apiUrl}/api/categories`, categoryData);
}
  updateCategory(id: number, categoryData: FormData): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/api/categories/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/api/Categories/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting category:', error);
        return throwError(() => new Error('Failed to delete category'));
      })
    );
  }

  // Subcategories
  getBasicSubcategoriesByCategory(categoryId: number): Observable<BasicSubCategoriesInfo[]> {
    return this.http.get<ApiResponse<BasicSubCategoriesInfo[]>>(`${this.apiUrl}/api/Subcategory/basic-info/${categoryId}`)
      .pipe(
        map(response => response.data)
      );
  }

  getSubcategoriesByCategory(categoryId: number, pageSize: number, pageNumber: number): Observable<any[]> {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('pageNumber', pageNumber.toString());
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/api/Subcategory/category/${categoryId}`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  getSubcategoryAttributes(subcategoryId: number): Observable<SubcategoryAttribute[]> {
    return this.http.get<ApiResponse<SubcategoryAttribute[]>>(`${this.apiUrl}/api/ProductAttributes/subcategory/${subcategoryId}`)
      .pipe(
        map(response => response.data)
      );
  }

  // Sellers

  getSellers(): Observable<Seller[]> {
    return this.http.get<ApiResponse<Seller[]>>(`${this.apiUrl}/api/api/Users/sellers`)
      .pipe(
        map(response => response.data)
      );
  }

  getBasicSellers(): Observable<BasicSellerInfo[]> {
    return this.http.get<ApiResponse<BasicSellerInfo[]>>(`${this.apiUrl}/api/Users/sellers/basic-info`)
      .pipe(
        map(response => response.data)
      );
  }

  updateSellerStatus(id: number, status: boolean): Observable<Seller> {
    return this.http.patch<ApiResponse<Seller>>(`${this.apiUrl}/api/api/Users/sellers/${id}/verify`, status)
      .pipe(
        map(response => response.data)
      );
  }

  updateVerificationStatus(id: number, status: 'verified' | 'rejected', rejectionReason?: string): Observable<Seller> {
    const data = {
      verificationStatus: status,
      ...(rejectionReason && { rejectionReason })
    };

    return this.http.patch<ApiResponse<Seller>>(`${this.apiUrl}/api/api/Users/sellers/${id}/verification`, data)
      .pipe(
        map(response => response.data)
      );
  }

  getAllSellers(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string, isVerified?: boolean): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    
    if (isVerified !== undefined) {
      params = params.set('isVerified', isVerified.toString());
    }
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/api/Users/sellers?nocache=${timestamp}`, { params });
  }

  getSellerById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/Users/sellers/${id}`);
  }
  registerSeller(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/Users/sellers/register`, formData)
      .pipe(
        catchError(error => {
          console.error('Error registering seller:', error);
          return throwError(() => new Error('Failed to register seller. Please try again.'));
        })
      );
  }
  updateSeller(id: number, sellerData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/Users/sellers/${id}`, sellerData);
  }

  verifySeller(id: number, verify: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/Users/sellers/${id}/verify`, verify);
  }

  // Add this method to the AdminService class
deleteSeller(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/api/Users/sellers/${id}`);
}


// Get all customers with pagination and search
getAllCustomers(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());
    
  if (searchTerm) {
    params = params.set('searchTerm', searchTerm);
  }
  
  return this.http.get<any>(`${this.apiUrl}/api/Users/customers`, { params });
}

// Get customer by ID
getCustomerById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/Users/customers/${id}`);
}

// Register new customer
registerCustomer(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/Users/customers/register`, formData);
}

// Update existing customer
updateCustomer(id: number, formData: FormData): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/Users/customers/${id}`, formData);
}

// Delete (deactivate) customer
deleteCustomer(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/api/Users/customers/${id}`);
}

  // Get products with pagination and filters
  getProducts(page: number = 1, pageSize: number = 10, filter?: any): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        if (filter[key] !== null && filter[key] !== undefined && filter[key] !== '') {
          params = params.set(key, filter[key].toString());
        }
      });
    }
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/products`, { params });
  }

  // Get product by ID
  getProductById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/products/${id}`);
  }

  // Create new product
  createProduct(formData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/products`, formData);
  }

  // Update existing product
  updateProduct(id: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/products/${id}`, formData);
  }

  // Delete product
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/products/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting product:', error);
        return throwError(() => new Error('Failed to delete product'));
      })
    );
  }


//product attributes 
getAllProductAttributes(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());
    
  if (searchTerm) {
    params = params.set('searchTerm', searchTerm);
  }
  
  return this.http.get<any>(`${this.apiUrl}/api/ProductAttributes`, { params });
}

// Get product attribute by ID
getProductAttributeById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/ProductAttributes/attribute/${id}`);
}

// Create new product attribute
createProductAttribute(attributeData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/ProductAttributes/attribute`, attributeData);
}

// Update existing product attribute
updateProductAttribute(id: number, attributeData: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/ProductAttributes/attribute/${id}`, attributeData);
}
getUserById(id: number): Observable<any> {
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/users/${id}`)
    .pipe(
      map(response => response.data)
    );
}

changePassword(id: number, changePasswordDto: { currentPassword: string; newPassword: string }): Observable<any> {
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/users/${id}/change-password`, changePasswordDto)
    .pipe(
      map(response => response),
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => new Error('Failed to change password. Please try again.'));
      })
    );
}

updateUserStatus(id: number, isActive: boolean): Observable<any> {
  return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/api/users/${id}/status`, { isActive })
    .pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating user status:', error);
        return throwError(() => new Error('Failed to update user status. Please try again.'));
      })
    );
}

deleteUser(id: number): Observable<any> {
  return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/users/${id}`)
    .pipe(
      map(response => response),
      catchError(error => {
        console.error('Error deleting user:', error);
        return throwError(() => new Error('Failed to delete user. Please try again.'));
      })
    );
}

// Get all orders with pagination and filters
getOrders(params: any): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/Orders`, { params })
    .pipe(
      map(response => response)
    );
}

// Get order by ID
getOrderById(id: number): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/Orders/${id}`)
    .pipe(
      map(response => response)
    );
}
cancelOrder(orderId: number): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/Orders/${orderId}/cancel`, {})
    .pipe(
      map(response => response)
    );
}

// Cancel a specific suborder
cancelSubOrder(subOrderId: number, sellerId: number): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/Orders/suborders/${subOrderId}/cancel?sellerId=${sellerId}`, {})
    .pipe(
      map(response => response)
    );
}

// Fix the updateOrderStatus method to use PUT instead of PATCH
updateOrderStatus(id: number, statusDto: any): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/Orders/${id}/status`, statusDto)
    .pipe(
      map(response => response)
    );
}

// Fix the updateSubOrderStatus method to use PUT instead of PATCH
updateSubOrderStatus(subOrderId: number, statusDto: any): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/Orders/suborders/${subOrderId}/status`, statusDto)
    .pipe(
      map(response => response)
    );
}

// Update order payment status
updateOrderPaymentStatus(id: number, paymentStatus: string): Observable<ApiResponse<any>> {
  return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/api/Orders/${id}/payment-status`, { paymentStatus })
    .pipe(
      map(response => response)
    );
}

// Delete product attribute
deleteProductAttribute(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/api/ProductAttributes/attribute/${id}`);
}
  // Mock data for dashboard stats
  private mockDashboardStats: DashboardStats = {
    revenue: 2567890,
    revenueChange: 12.5,
    orders: 3254,
    ordersChange: 8.3,
    customers: 15678,
    customersChange: 5.7,
    products: 4567,
    productsChange: -2.1,
    recentOrders: [],
    topProducts: []
  };

  // Mock categories data
  private mockCategories: Category[] = [
   
  ];

  // Mock orders data
  private mockOrders: Order[] = [
    ...this.mockDashboardStats.recentOrders,

  ];

  // Mock users data (customers)
  private mockCustomers: User[] = [
    
  ];

  // Mock sellers data
  private mockSellers: Seller[] = [
    
  ];

  // Mock reviews data
  private mockReviews: Review[] = [
    {
      id: 'REV-1',
      productId: 'PROD-1',
      productName: 'Smartphone X',
      customerId: 'CUST-2',
      customerName: 'Jane Smith',
      rating: 5,
      comment: 'Amazing phone with great battery life and camera quality!',
      createdAt: new Date(2025, 3, 5),
      status: 'approved'
    },
    {
      id: 'REV-2',
      productId: 'PROD-1',
      productName: 'Smartphone X',
      customerId: 'CUST-3',
      customerName: 'Michael Johnson',
      rating: 4,
      comment: 'Good phone but heats up a bit when playing games.',
      createdAt: new Date(2025, 3, 6),
      status: 'approved',
      response: {
        sellerId: 'SEL-1',
        sellerName: 'TechHub',
        comment: 'Thank you for your feedback. We recommend lowering graphic settings for intensive games.',
        createdAt: new Date(2025, 3, 7)
      }
    },
    {
      id: 'REV-3',
      productId: 'PROD-3',
      productName: 'Laptop Pro',
      customerId: 'CUST-4',
      customerName: 'Sarah Williams',
      rating: 5,
      comment: 'Perfect laptop for work and entertainment. Fast performance and beautiful display!',
      createdAt: new Date(2025, 3, 8),
      status: 'approved'
    },
    {
      id: 'REV-4',
      productId: 'PROD-4',
      productName: 'Wireless Earbuds',
      customerId: 'CUST-1',
      customerName: 'John Doe',
      rating: 4,
      comment: 'Great sound quality and comfortable fit. Battery could be better though.',
      createdAt: new Date(2025, 3, 9),
      status: 'approved'
    },
    {
      id: 'REV-5',
      productId: 'PROD-6',
      productName: 'Smart TV 43"',
      customerId: 'CUST-5',
      customerName: 'David Brown',
      rating: 3,
      comment: 'Good TV but the smart features are a bit slow sometimes.',
      createdAt: new Date(2025, 3, 10),
      status: 'approved',
      response: {
        sellerId: 'SEL-3',
        sellerName: 'HomeElectronics',
        comment: 'We appreciate your feedback. Try updating the firmware for improved performance.',
        createdAt: new Date(2025, 3, 11)
      }
    },
    {
      id: 'REV-6',
      productId: 'PROD-7',
      productName: 'Gaming Console',
      customerId: 'CUST-2',
      customerName: 'Jane Smith',
      rating: 5,
      comment: 'Best gaming experience ever! Fast loading times and amazing graphics.',
      createdAt: new Date(2025, 3, 12),
      status: 'pending'
    }
  ];

  // Dashboard methods
  getDashboardStats(): Observable<DashboardStats> {
    // Simulate API call with delay
    return of(this.mockDashboardStats).pipe(delay(800));
  }

  // Order methods



  // Customer methods
  getCustomers(filters?: any): Observable<User[]> {
    // TODO: Implement filtering logic
    return of(this.mockCustomers).pipe(delay(800));
  }



  updateCustomerStatus(id: number, status: User['status']): Observable<User> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }
    
    const updatedCustomer: User = {
      ...this.mockCustomers[index],
      status
    };
    
    // In a real application, we would update the array
    // this.mockCustomers[index] = updatedCustomer;
    
    return of(updatedCustomer).pipe(delay(800));
  }

  updateSellerVerification(id: number, status: Seller['verificationStatus'], rejectionReason?: string): Observable<Seller> {
    const index = this.mockSellers.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Seller not found');
    }
    
    const updatedSeller: Seller = {
      ...this.mockSellers[index],
      verificationStatus: status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined
    };
    
    // In a real application, we would update the array
    // this.mockSellers[index] = updatedSeller;
    
    return of(updatedSeller).pipe(delay(800));
  }

  // Review methods
  getReviews(filters?: any): Observable<Review[]> {
    // TODO: Implement filtering logic
    return of(this.mockReviews).pipe(delay(800));
  }

  getReviewById(id: string): Observable<Review | undefined> {
    const review = this.mockReviews.find(r => r.id === id);
    return of(review).pipe(delay(500));
  }

  updateReviewStatus(id: string, status: Review['status']): Observable<Review> {
    const index = this.mockReviews.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Review not found');
    }
    
    const updatedReview: Review = {
      ...this.mockReviews[index],
      status
    };
    
    // In a real application, we would update the array
    // this.mockReviews[index] = updatedReview;
    
    return of(updatedReview).pipe(delay(800));
  }

  // Analytics methods
  getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Observable<any> {
    // Mock analytics data based on period
    const today = new Date();
    const data: any[] = [];
    
    if (period === 'daily') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 500000) + 50000,
          orders: Math.floor(Math.random() * 100) + 10
        });
      }
    } else if (period === 'weekly') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7));
        data.push({
          week: `Week ${12 - i}`,
          sales: Math.floor(Math.random() * 3000000) + 300000,
          orders: Math.floor(Math.random() * 500) + 50
        });
      }
    } else if (period === 'monthly') {
      // Last 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthIndex = date.getMonth();
        data.push({
          month: monthNames[monthIndex],
          sales: Math.floor(Math.random() * 10000000) + 1000000,
          orders: Math.floor(Math.random() * 2000) + 200
        });
      }
    } else if (period === 'yearly') {
      // Last 5 years
      const currentYear = today.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        data.push({
          year: year.toString(),
          sales: Math.floor(Math.random() * 100000000) + 10000000,
          orders: Math.floor(Math.random() * 20000) + 2000
        });
      }
    }
    
    return of({ period, data }).pipe(delay(1000));
  }

  getTopSellingCategories(): Observable<any[]> {
    const topCategories = this.mockCategories.map(category => ({
      id: category.categoryId,
      name: category.name,
      sales: Math.floor(Math.random() * 5000000) + 500000,
      percentage: Math.floor(Math.random() * 30) + 5
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);
    
    return of(topCategories).pipe(delay(800));
  }

  getTopSellingSellers(): Observable<any[]> {
    const topSellers = this.mockSellers.map(seller => ({
      id: seller.id,
      name: seller.storeName,
      sales: Math.floor(Math.random() * 5000000) + 500000,
      orders: Math.floor(Math.random() * 1000) + 100
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);
    
    return of(topSellers).pipe(delay(800));
  }
}