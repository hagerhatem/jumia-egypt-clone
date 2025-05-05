import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/shared/notification.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-details.component.html',
  styleUrls: ['./admin-order-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AdminSidebarComponent,
    AdminHeaderComponent
  ]
})
export class AdminOrderDetailsComponent implements OnInit {
  orderId: number = 0;
  order: any = null;
  loading: boolean = false;
  submitting: boolean = false;
  
  // Status options
  orderStatuses: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  subOrderStatuses: string[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  paymentStatuses: string[] = ['pending', 'paid', 'failed', 'refunded'];
  
  // Selected statuses for updates
  selectedOrderStatus: string = '';
  selectedPaymentStatus: string = '';
  selectedSubOrderStatuses: { [key: number]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.orderId = +params['id'];
        this.loadOrderDetails();
      }
    });
  }
// In your component class

cancelOrder(): void {
  if (confirm('Are you sure you want to cancel this entire order?')) {
    this.submitting = true;
    this.adminService.cancelOrder(this.order.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Order cancelled successfully');
          // Refresh order data
          this.loadOrderDetails();
        } else {
          this.notificationService.showError(response.message || 'Failed to cancel order');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to cancel order');
        console.error(error);
        this.submitting = false;
      }
    });
  }
}

cancelSubOrder(subOrderId: number): void {
  if (confirm('Are you sure you want to cancel this suborder?')) {
    this.submitting = true;
    const subOrder = this.order.subOrders.find((so: any) => so.suborderId === subOrderId);
    if (!subOrder) {
      this.notificationService.showError('Suborder not found');
      this.submitting = false;
      return;
    }
    
    this.adminService.cancelSubOrder(subOrderId, subOrder.sellerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Suborder cancelled successfully');
          // Refresh order data
          this.loadOrderDetails();
        } else {
          this.notificationService.showError(response.message || 'Failed to cancel suborder');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to cancel suborder');
        console.error(error);
        this.submitting = false;
      }
    });
  }
}
  loadOrderDetails(): void {
    this.loading = true;
    this.adminService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data;
          this.selectedOrderStatus = this.order.orderStatus;
          this.selectedPaymentStatus = this.order.paymentStatus;
          
          // Initialize suborder statuses
          if (this.order.subOrders) {
            this.order.subOrders.forEach((subOrder: any) => {
              this.selectedSubOrderStatuses[subOrder.suborderId] = subOrder.status;
            });
          }
        } else {
          this.notificationService.showError('Failed to load order details');
          this.router.navigate(['/admin/orders']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load order details');
        console.error(error);
        this.loading = false;
        this.router.navigate(['/admin/orders']);
      }
    });
  }
  
  updateOrderStatus(): void {
    if (this.selectedOrderStatus === this.order.orderStatus) {
      this.notificationService.showInfo('No changes to save');
      return;
    }
    
    this.submitting = true;
    const statusDto = { status: this.selectedOrderStatus };
    
    this.adminService.updateOrderStatus(this.orderId, statusDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Order status updated successfully');
          this.order.orderStatus = this.selectedOrderStatus;
        } else {
          this.notificationService.showError(response.message || 'Failed to update order status');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to update order status');
        console.error(error);
        this.submitting = false;
      }
    });
  }
  
  updatePaymentStatus(): void {
    if (this.selectedPaymentStatus === this.order.paymentStatus) {
      this.notificationService.showInfo('No changes to save');
      return;
    }
    
    this.submitting = true;
    
    this.adminService.updateOrderPaymentStatus(this.orderId, this.selectedPaymentStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Payment status updated successfully');
          this.order.paymentStatus = this.selectedPaymentStatus;
        } else {
          this.notificationService.showError(response.message || 'Failed to update payment status');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to update payment status');
        console.error(error);
        this.submitting = false;
      }
    });
  }
  
  updateSubOrderStatus(subOrderId: number): void {
    const newStatus = this.selectedSubOrderStatuses[subOrderId];
    const subOrder = this.order.subOrders.find((so: any) => so.suborderId === subOrderId);
    
    if (!subOrder || newStatus === subOrder.status) {
      this.notificationService.showInfo('No changes to save');
      return;
    }
    
    this.submitting = true;
    const statusDto = { status: newStatus };
    
    this.adminService.updateSubOrderStatus(subOrderId, statusDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Suborder status updated successfully');
          subOrder.status = newStatus;
        } else {
          this.notificationService.showError(response.message || 'Failed to update suborder status');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to update suborder status');
        console.error(error);
        this.submitting = false;
      }
    });
  }

  
  // Export order as PDF
  exportOrderAsPdf(): void {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Order #${this.order.orderId}`, 14, 22);
    
    // Add order details
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(this.order.createdAt).toLocaleString()}`, 14, 32);
    doc.text(`Customer ID: ${this.order.customerId}`, 14, 38);
    doc.text(`Customer: ${this.order.customerName}`, 14, 44);
    doc.text(`Address: ${this.order.address}`, 14, 50);
    doc.text(`Status: ${this.order.orderStatus}`, 14, 56);
    doc.text(`Payment Status: ${this.order.paymentStatus}`, 14, 62);
    
    // Add financial details
    doc.text(`Subtotal: $${this.order.totalAmount.toFixed(2)}`, 14, 68);
    doc.text(`Discount: $${this.order.discountAmount.toFixed(2)}`, 14, 74);
    doc.text(`Shipping: $${this.order.shippingFee.toFixed(2)}`, 14, 78);
    doc.text(`Tax: $${this.order.taxAmount.toFixed(2)}`, 14, 84);
    doc.text(`Total: $${this.order.finalAmount.toFixed(2)}`, 14, 90);
    
    // Add suborders
    doc.setFontSize(14);
    doc.text('Suborders', 14, 96);
    
    let yPos = 104;
    
    this.order.subOrders.forEach((subOrder: any, index: number) => {
      doc.setFontSize(12);
      doc.text(`Suborder #${subOrder.suborderId} - Seller: (${subOrder.sellerId}) ${subOrder.sellerName}`, 14, yPos);
      doc.text(`Status: ${subOrder.status}`, 14, yPos + 6);
      
      // Create table for order items
      const tableColumn = ["Product", "Variant", "Quantity", "Price", "Total"];
      const tableRows: any[] = [];
      
      subOrder.orderItems.forEach((item: any) => {
        const itemData = [
          `${item.productId}-${item.productName}` ,
          item.variantId ?`${item.variantId}-${item.variantName}` : 'N/A',
          item.quantity,
          `$${item.priceAtPurchase.toFixed(2)}`,
          `$${item.totalPrice.toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
      
      // Add the table
      autoTable(doc, {
        startY: yPos + 10,
        head: [tableColumn],
        body: tableRows,
      });
      
      // Update Y position for next suborder
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Add page if needed
      if (yPos > 250 && index < this.order.subOrders.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Save the PDF
    doc.save(`Order-${this.order.orderId}.pdf`);
  }
  
  // Export suborder as PDF
  exportSubOrderAsPdf(subOrder: any): void {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Suborder #${subOrder.suborderId}`, 14, 22);
    
    // Add suborder details
    doc.setFontSize(12);
    doc.text(`Order ID: ${subOrder.orderId}`, 14, 32);
    doc.text(`Seller: (${subOrder.sellerId}) ${subOrder.sellerName}`, 14, 38);
    doc.text(`Status: ${subOrder.status}`, 14, 44);
    doc.text(`Date: ${new Date(subOrder.statusUpdatedAt).toLocaleString()}`, 14, 50);
    doc.text(`Customer: (${this.order.customerId}) ${this.order.customerName}`, 14, 56);
    
    if (subOrder.trackingNumber) {
      doc.text(`Tracking: ${subOrder.trackingNumber} (${subOrder.shippingProvider})`, 14, 56);
    }
    
    doc.text(`Subtotal: $${subOrder.subtotal.toFixed(2)}`, 14, 66);
    
    // Create table for order items
    const tableColumn = ["Product", "Variant", "Quantity", "Price", "Total"];
    const tableRows: any[] = [];
    
    subOrder.orderItems.forEach((item: any) => {
      const itemData = [
        `${item.productId}-${item.productName}` ,
        item.variantId ?`${item.variantId}-${item.variantName}` : 'N/A',
        item.quantity,
        `$${item.priceAtPurchase.toFixed(2)}`,
        `$${item.totalPrice.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });
    
    // Add the table
    autoTable(doc, {
      startY: 76,
      head: [tableColumn],
      body: tableRows,
    });
    
    // Save the PDF
    doc.save(`Suborder-${subOrder.suborderId}.pdf`);
  }
}