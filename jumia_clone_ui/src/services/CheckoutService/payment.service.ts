import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: number;
  paymentMethod: string;
  returnUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl: string;
  transactionId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/Payment`;
  private paymentStatusSubject = new BehaviorSubject<'pending' | 'success' | 'failed' | null>(null);
  
  paymentStatus$ = this.paymentStatusSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  initiatePayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/initiate`, request);
  }

  getSanitizedPaymentUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setPaymentStatus(status: 'pending' | 'success' | 'failed'): void {
    this.paymentStatusSubject.next(status);
  }

  resetPaymentStatus(): void {
    this.paymentStatusSubject.next(null);
  }

  // For mobile payments like Vodafone Wallet
  processMobilePayment(phoneNumber: string, orderId: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/mobile-payment`, {
      phoneNumber,
      orderId
    });
  }

  // Verify payment status
  verifyPayment(transactionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify/${transactionId}`);
  }
}