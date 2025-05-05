export interface Order {
  id: string;
  orderId: number;
  orderNumber: string;
  orderDate: Date;
  status: OrderStatus;
  paymentMethod: string;
  price: number;
  itemCount: number;
  packedItems: number;
  shipmentMethod: string;
  country: string;
  subOrders: SubOrder[];
  selected?: boolean;
  statusUpdatedAt?: Date;
  pendingSince?: Date;
  labels?: string[];
}

export interface SubOrder {
  suborderId: number;
  orderId: number;
  sellerId: number;
  subtotal: number;
  status: string;
  statusUpdatedAt?: Date;
  trackingNumber?: string;
  shippingProvider?: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  orderItemId: number;
  suborderId: number;
  productId: number;
  quantity: number;
  price: number;
  totalPrice: number;
  productName?: string;
  unitPrice?: number;
  sku?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Delivered'
  | 'Canceled'
  | 'Delivery Failed'
  | 'Returned';

export interface OrderFilter {
  status?: OrderStatus | 'All';
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  sellerId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    totalCount: number;
  };
}

export interface FilterState {
  country: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  printed: string;
  paymentMethod: string;
  shippingInfo: string;
}

export interface OrderAction {
  name: string;
  icon: string;
  action: 'print' | 'invoice' | 'stock' | 'ready' | 'ship' | 'cancel';
}

export interface StatusTab {
  name: string;
  active: boolean;
  count: number | null;
}

export interface Column {
  name: string;
  sortable: boolean;
  sortDirection?: 'asc' | 'desc' | undefined;
  filterable?: boolean | undefined;
}

export interface CustomerOrder {
  orderId: number;
  date: string;
  amount: number;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  items: OrderItem[];
}

export interface OrderDto {
  orderId: number;
  customerId: number;
  addressId: number;
  couponId?: number;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  affiliateId?: number;
  affiliateCode?: string;
  subOrders: SubOrderDto[];
}

export interface SubOrderDto {
  suborderId: number;
  orderId: number;
  sellerId: number;
  subtotal: number;
  status: string;
  statusUpdatedAt: string;
  trackingNumber?: string;
  shippingProvider?: string;
  orderItems: OrderItemDto[];
}

export interface OrderItemDto {
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  totalPrice: number;
  variantId?: number;
}

