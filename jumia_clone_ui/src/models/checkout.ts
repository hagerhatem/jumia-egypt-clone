export interface PaymentResponse {
    success: boolean;
    paymentUrl: string;
    transactionId: string;
    message: string;
  }