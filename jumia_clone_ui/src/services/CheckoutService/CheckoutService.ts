import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { CartsService } from '../cart/carts.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PaymentService } from './payment.service';
import { PaymentResponse } from '../../models/checkout';
interface CreateOrderRequest {
  customerId: number;
  addressId: number;
  couponId?: number | null;
  paymentMethod: string;
  affiliateId?: number | null;
  affiliateCode?: string | null;
  orderItems: OrderItem[];
}

interface OrderItem {
  productId: number;
  quantity: number;
  variantId?: number | null;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/api/Orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cartService: CartsService,
    private paymentService: PaymentService
  ) {}
  completeOrderWithPayment(addressId: number, couponId?: number, paymentMethod: string = 'card'): Observable<{orderResponse: OrderResponse, paymentResponse: PaymentResponse}> {
    // Get the customer ID from the auth service
    const userData = this.authService.currentUserValue;
    if (!userData || userData.userType !== 'Customer') {
      throw new Error('User must be logged in as a customer to place an order');
    }
  
    // Get cart items and transform them into order items
    return this.cartService.getCartItems().pipe(
      map(cartItems => {
        const orderRequest: CreateOrderRequest = {
          customerId: userData.entityId, // Use entityId as customerId for customer users
          addressId: addressId,
          couponId: couponId || null,
          paymentMethod: paymentMethod,
          affiliateId: null,
          affiliateCode: null,
          orderItems: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null
          }))
        };
        return orderRequest;
      }),
      switchMap(orderRequest => {
        // First create the order
        return this.http.post<OrderResponse>(`${this.apiUrl}`, orderRequest).pipe(
          switchMap(orderResponse => {
            if (!orderResponse.success) {
              // Instead of returning null, create a failed payment response
              const failedPaymentResponse: PaymentResponse = {
                success: false,
                paymentUrl: '',
                transactionId: '',
                message: orderResponse.message || 'Order creation failed'
              };
              return of({ orderResponse, paymentResponse: failedPaymentResponse });
            }
            
            // Then initiate payment
            const paymentRequest: any = {
              amount: orderResponse.data.totalAmount,
              currency: 'EGP',
              orderId: orderResponse.data.orderId,
              paymentMethod: paymentMethod,
              returnUrl: `${window.location.origin}/payment-callback`
            };
            
            return this.paymentService.initiatePayment(paymentRequest).pipe(
              map(paymentResponse => {
                return { orderResponse, paymentResponse };
              }),
              catchError(error => {
                // If payment fails, cancel the order
                this.cancelOrder(orderResponse.data.orderId, 'Payment failed').subscribe();
                throw error;
              })
            );
          })
        );
      })
    );
  }
  completeOrder(addressId: number, couponId?: number, paymentMethod: string = 'CreditCard'): Observable<any> {
    // Get the customer ID from the auth service
    const userData = this.authService.currentUserValue;
    if (!userData || userData.userType !== 'Customer') {
      throw new Error('User must be logged in as a customer to place an order');
    }

    // Get cart items and transform them into order items
    return this.cartService.getCartItems().pipe(
      map(cartItems => {
        const orderRequest: CreateOrderRequest = {
          customerId: userData.entityId, // Use entityId as customerId for customer users
          addressId: addressId,
          couponId: couponId || null,
          paymentMethod: paymentMethod,
          affiliateId: null,
          affiliateCode: null,
          orderItems: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null
          }))
        };
        return orderRequest;
      }),
      switchMap(orderRequest => {
        return this.http.post<any>(`${this.apiUrl}`, orderRequest);
      })
    );
  }

  // Get order details
  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}`);
  }

  // Get customer orders
  getCustomerOrders(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customer`, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  // Cancel order
  cancelOrder(orderId: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/cancel`, { reason });
  }

  // Track order
  trackOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}/tracking`);
  }

  // Apply coupon
  applyCoupon(couponCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply-coupon`, { couponCode });
  }

  // Validate order before completion
  validateOrder(orderRequest: CreateOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validate`, orderRequest);
  }

  // Calculate order total with shipping and discounts
  calculateOrderTotal(addressId: number, couponCode?: string): Observable<any> {
    const params: any = { addressId };
    if (couponCode) {
      params.couponCode = couponCode;
    }
    return this.http.get<any>(`${this.apiUrl}/calculate-total`, { params });
  }
}