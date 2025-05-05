// src/services/customer/customer-orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerOrder } from '../../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerOrdersService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getCustomerOrders(
    customerId: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<any>(`${this.apiUrl}/customer/${customerId}`, {
      params,
    });
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/status`, {
      status: 'cancelled',
    });
  }
}
