import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Seller } from '../../models/seller.model';

@Injectable({
  providedIn: 'root',
})
export class SellerProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSellerProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/users/sellers/${userId}`);
  }

  updateSellerProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/api/users/sellers/${userId}`,
      profileData
    );
  }
}
