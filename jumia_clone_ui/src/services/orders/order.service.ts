import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {
  Order,
  OrderStatus,
  SubOrder,
  ApiResponse,
} from '../../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  constructor(private http: HttpClient) {}

  getSellerOrders(pagination: {
    pageNumber: number;
    pageSize: number;
  }, sellerId: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString());

    return this.http
      .get<any>(`${this.apiUrl}/seller/${sellerId}`, {
        params,
      })
      .pipe(
        map((response) => {
          // Transform SubOrder data into Order format
          const transformedItems = response.data.items.map(
            (subOrder: SubOrder) => ({
              id: subOrder.orderId.toString(),
              orderId: subOrder.orderId,
              orderNumber: `ORD-${subOrder.orderId}`, // Generate an order number
              orderDate: new Date(subOrder.statusUpdatedAt || new Date()),
              status: subOrder.status,
              paymentMethod: 'N/A', // Add default values as needed
              price: subOrder.subtotal,
              itemCount: subOrder.orderItems?.length || 0,
              packedItems: 0,
              shipmentMethod: subOrder.shippingProvider || 'Standard',
              country: 'N/A',
              subOrders: [subOrder],
              selected: false,
              statusUpdatedAt: new Date(subOrder.statusUpdatedAt || new Date()),
              pendingSince: new Date(subOrder.statusUpdatedAt || new Date()),
              labels: [],
            })
          );

          return {
            success: response.success,
            message: response.message,
            data: {
              items: transformedItems,
              totalCount: response.data.totalCount,
            },
          };
        }),
        tap((response) => {
          console.log('Transformed Response:', response);
        }),
        catchError((error) => {
          console.error('API Error:', error);
          throw error;
        })
      );
  }

  getSubOrdersByStatus(
    status: string,
    pagination: { pageNumber: number; pageSize: number }
  ): Observable<ApiResponse<SubOrder>> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString());

    // Use the sub-orders status endpoint from your controller
    return this.http.get<ApiResponse<SubOrder>>(
      `${this.apiUrl}/sub-orders/status/${status}`,
      { params }
    );
  }

  updateSubOrderStatus(
    subOrderId: number,
    status: string
  ): Observable<ApiResponse<SubOrder>> {
    // Use the sub-orders update endpoint from your controller
    return this.http.put<ApiResponse<SubOrder>>(
      `${this.apiUrl}/sub-orders/${subOrderId}`,
      {
        suborderId: subOrderId,
        status: status,
      }
    );
  }

  getSubOrderById(id: number): Observable<ApiResponse<SubOrder>> {
    return this.http.get<ApiResponse<SubOrder>>(
      `${this.apiUrl}/api/sub-orders/${id}`
    );
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/api/${id}`);
  }

  getSubOrdersBySeller(
    sellerId: number,
    pagination: { pageNumber: number; pageSize: number }
  ): Observable<ApiResponse<Order>> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString());

    return this.http.get<ApiResponse<Order>>(
      `${this.apiUrl}/orders/seller/${sellerId}`,
      { params }
    );
  }

  getSubOrdersBySellerAndStatus(
    sellerId: number,
    status: string,
    pagination: { pageNumber: number; pageSize: number }
  ): Observable<ApiResponse<Order>> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber.toString())
      .set('pageSize', pagination.pageSize.toString())
      .set('status', status);

    return this.http.get<ApiResponse<Order>>(
      `${this.apiUrl}/orders/seller/${sellerId}`,
      { params }
    );
  }

  exportOrders(orders: Order[]): void {
    const csvContent = this.convertToCSV(orders);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  printOrderLabels(orders: Order[]): void {
    // Create a printable document with shipping labels
    const printContent = this.generateLabelsPrintContent(orders);
    this.printDocument(printContent, 'Shipping Labels');
  }

  printOrderInvoice(orders: Order[]): void {
    // Create a printable document with order invoices
    const printContent = this.generateInvoicePrintContent(orders);
    this.printDocument(printContent, 'Order Invoice');
  }

  printStockChecklist(orders: Order[]): void {
    // Create a printable document with stock checklist
    const printContent = this.generateStockChecklistContent(orders);
    this.printDocument(printContent, 'Stock Checklist');
  }

  private printDocument(content: string, title: string): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error(
        'Failed to open print window. Please check your popup blocker settings.'
      );
      return;
    }

    // Set the document content
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 20px; }
            .print-content { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .print-footer { text-align: center; font-size: 12px; margin-top: 30px; }
            @media print {
              .no-print { display: none; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <div class="print-content">
            ${content}
          </div>
          <div class="print-footer">
            <p>© ${new Date().getFullYear()} Jumia Clone. All rights reserved.</p>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">
              Print Document
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Focus the window for better user experience
    printWindow.focus();
  }

  private convertToCSV(orders: Order[]): string {
    const headers = [
      'Order Number',
      'Order Date',
      'Status',
      'Payment Method',
      'Price',
      'Items',
      'Tracking Number',
      'Shipping Provider',
    ];

    const rows = orders.map((order) => {
      const subOrder = order.subOrders?.[0];
      return [
        order.orderNumber,
        new Date(order.orderDate).toISOString(),
        subOrder?.status || order.status,
        order.paymentMethod,
        subOrder?.subtotal.toString() || order.price.toString(),
        subOrder?.orderItems?.length.toString() || order.itemCount.toString(),
        subOrder?.trackingNumber || '',
        subOrder?.shippingProvider || '',
      ];
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private generateLabelsPrintContent(orders: Order[]): string {
    let content = '<table>';
    content +=
      '<tr><th>Order #</th><th>Customer</th><th>Address</th><th>Shipping Method</th></tr>';

    orders.forEach((order) => {
      const subOrder = order.subOrders?.[0];
      content += `
        <tr>
          <td>${order.orderNumber}</td>
          <td>Customer Name</td>
          <td>123 Shipping Address, City, Country</td>
          <td>${subOrder?.shippingProvider || 'Standard'}</td>
        </tr>
        <tr>
          <td colspan="4">
            <div style="border: 2px dashed #000; padding: 15px; margin: 10px 0; text-align: center;">
              <h3>SHIPPING LABEL</h3>
              <p><strong>Order:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(
                order.orderDate
              ).toLocaleDateString()}</p>
              <p><strong>Items:</strong> ${order.itemCount}</p>
              <p><strong>Shipping Method:</strong> ${
                subOrder?.shippingProvider || 'Standard'
              }</p>
              <div style="margin-top: 15px; font-size: 12px;">
                <p>TO: Customer Name</p>
                <p>123 Shipping Address</p>
                <p>City, Country</p>
              </div>
              <div style="margin-top: 15px; border-top: 1px solid #000; padding-top: 10px;">
                <p>FROM: Seller Name</p>
                <p>Warehouse Address</p>
              </div>
            </div>
          </td>
        </tr>
        <tr><td colspan="4" style="border: none; height: 20px;"></td></tr>
      `;
    });

    content += '</table>';
    return content;
  }

  private generateInvoicePrintContent(orders: Order[]): string {
    let content = '';

    orders.forEach((order) => {
      const subOrder = order.subOrders?.[0];
      const orderItems = subOrder?.orderItems || [];

      content += `
        <div style="page-break-after: always;">
          <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
            <h2>INVOICE</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(
              order.orderDate
            ).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>
          
          <table style="width: 100%; margin-bottom: 20px; border: none;">
            <tr>
              <td style="width: 50%; vertical-align: top; border: none;">
                <h3>Seller Information</h3>
                <p>Seller Name</p>
                <p>Seller Address</p>
                <p>Tax ID: 123456789</p>
              </td>
              <td style="width: 50%; vertical-align: top; border: none;">
                <h3>Customer Information</h3>
                <p>Customer Name</p>
                <p>123 Shipping Address</p>
                <p>City, Country</p>
              </td>
            </tr>
          </table>
          
          <table>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
      `;

      // If we have order items, list them
      if (orderItems.length > 0) {
        orderItems.forEach((item) => {
          content += `
            <tr>
              <td>${item.productName || 'Product'}</td>
              <td>${item.quantity || 1}</td>
              <td>$${item.unitPrice?.toFixed(2) || '0.00'}</td>
              <td>$${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(
                2
              )}</td>
            </tr>
          `;
        });
      } else {
        // Fallback if no order items
        content += `
          <tr>
            <td>Order Items</td>
            <td>${order.itemCount}</td>
            <td>$${(order.price / order.itemCount).toFixed(2)}</td>
            <td>$${order.price.toFixed(2)}</td>
          </tr>
        `;
      }

      // Add totals
      content += `
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Subtotal</strong></td>
              <td>$${order.price.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Shipping</strong></td>
              <td>$0.00</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Tax</strong></td>
              <td>$0.00</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Total</strong></td>
              <td>$${order.price.toFixed(2)}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px;">
            <p><strong>Notes:</strong> Thank you for your purchase!</p>
          </div>
        </div>
      `;
    });

    return content;
  }

  private generateStockChecklistContent(orders: Order[]): string {
    let content = '<h2>Stock Checklist for Order Fulfillment</h2>';
    content += '<table>';
    content +=
      '<tr><th>Order #</th><th>Product</th><th>SKU</th><th>Quantity</th><th>Location</th><th>Checked</th></tr>';

    orders.forEach((order) => {
      const subOrder = order.subOrders?.[0];
      const orderItems = subOrder?.orderItems || [];

      if (orderItems.length > 0) {
        orderItems.forEach((item) => {
          content += `
            <tr>
              <td>${order.orderNumber}</td>
              <td>${item.productName || 'Product'}</td>
              <td>${item.sku || 'N/A'}</td>
              <td>${item.quantity || 1}</td>
              <td>Warehouse A</td>
              <td style="text-align: center;">□</td>
            </tr>
          `;
        });
      } else {
        // Fallback if no order items
        content += `
          <tr>
            <td>${order.orderNumber}</td>
            <td>Items in Order</td>
            <td>N/A</td>
            <td>${order.itemCount}</td>
            <td>Warehouse A</td>
            <td style="text-align: center;">□</td>
          </tr>
        `;
      }
    });

    content += '</table>';
    content += '<div style="margin-top: 20px;">';
    content += '<p><strong>Instructions:</strong></p>';
    content += '<ol>';
    content += '<li>Locate each item in the warehouse</li>';
    content += '<li>Check the quantity against the order</li>';
    content += '<li>Mark the checkbox when item is picked</li>';
    content += '<li>Bring all items to the packing station</li>';
    content += '</ol>';
    content += '</div>';

    return content;
  }
}
