export interface CartSummary {
    cartId: number;
    itemsCount: number;
    subTotal: number;
    lastUpdated?: Date;
  }