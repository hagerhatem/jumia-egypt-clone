import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CustomerUpdateDto {
  userId: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: File;
}

export interface CustomerDto {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  userType: string;
  isActive: boolean;
  profileImageUrl?: string;
}

export interface CustomerRegistrationDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage?: File;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
  }

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`; 

  constructor(private http: HttpClient) { }

  // Get customer profile by ID
//   getCustomerProfile(userId: number): Observable<CustomerDto> {
//     return this.http.get<CustomerDto>(`${this.apiUrl}/customers/${userId}`);
//   }

//   updateCustomerProfile(userId: number, updateDto: CustomerUpdateDto): Observable<CustomerDto> {
//     console.log('Service: Starting profile update', { userId, updateDto });
    
//     // Create form data
//     const formData = new FormData();
//     formData.append('userId', userId.toString());
//     formData.append('firstName', updateDto.firstName || '');
//     formData.append('lastName', updateDto.lastName || '');
//     formData.append('phoneNumber', updateDto.phoneNumber || '');

//     console.log('Service: Sending request to:', `${this.apiUrl}/customers/${userId}`);
    
//     return this.http.put<CustomerDto>(`${this.apiUrl}/customers/${userId}`, formData)
//       .pipe(
//         tap(response => console.log('Service: Update response:', response)),
//         catchError(error => {
//           console.error('Service: Update error:', error);
//           return throwError(() => error);
//         })
//       );
//     }
getCustomerProfile(userId: number): Observable<ApiResponse<CustomerDto>> {
    return this.http.get<ApiResponse<CustomerDto>>(`${this.apiUrl}/customers/${userId}`);
  }

  updateCustomerProfile(userId: number, updateDto: CustomerUpdateDto): Observable<ApiResponse<CustomerDto>> {
    return this.http.put<ApiResponse<CustomerDto>>(`${this.apiUrl}/customers/${userId}`, updateDto);
  }

  // Register new customer
  registerCustomer(registrationDto: CustomerRegistrationDto): Observable<CustomerDto> {
    const formData = new FormData();
    
    // Append registration data
    formData.append('email', registrationDto.email);
    formData.append('password', registrationDto.password);
    formData.append('firstName', registrationDto.firstName);
    formData.append('lastName', registrationDto.lastName);
    formData.append('phoneNumber', registrationDto.phoneNumber);
    
    // Append profile image if exists
    if (registrationDto.profileImage) {
      formData.append('profileImage', registrationDto.profileImage);
    }

    return this.http.post<CustomerDto>(`${this.apiUrl}/customers/register`, formData);
  }

  // Get all customers (admin only)
  getAllCustomers(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string): Observable<PaginatedResponse<CustomerDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PaginatedResponse<CustomerDto>>(`${this.apiUrl}/customers`, { params });
  }

  // Change password
  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Delete customer account
  deleteAccount(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}