// src/pages/seller/seller-orders/orders/orders.component.ts
import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { NgbModule, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../services/auth/auth.service';
import { NotificationService } from '../../../../services/notification/notification.service';
import {
  Order,
  OrderStatus,
  SubOrder,
  ApiResponse,
  FilterState,
  OrderAction,
  StatusTab,
  Column,
} from '../../../../models/order.model';
import { OrderService } from '../../../../services/orders/order.service';
import { SidebarComponent } from '../../seller-sidebar/sidebar/sidebar.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    NgbModule,
    SidebarComponent
  ],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Order>;

  private searchQuerySignal = signal('');
  searchQuery = computed(() => this.searchQuerySignal());

  protected readonly filters = signal<FilterState>({
    country: '',
    dateRange: {
      start: new Date('2023-01-01'),
      end: new Date('2025-12-31'),
    },
    printed: 'All',
    paymentMethod: 'All',
    shippingInfo: 'All',
  });

  statusTabs = [
    { name: 'All', active: false, count: null },
    { name: 'Pending', active: true, count: 0 },
    { name: 'Ready to Ship', active: false, count: null },
    { name: 'Shipped', active: false, count: null },
    { name: 'Delivered', active: false, count: null },
    { name: 'Canceled', active: false, count: null },
    { name: 'Delivery Failed', active: false, count: null },
    { name: 'Returned', active: false, count: null },
  ];

  columns: Column[] = [
    {
      name: 'Order Number',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
    {
      name: 'Order Date',
      sortable: true,
      sortDirection: 'desc',
      filterable: undefined,
    },
    {
      name: 'Pending Since',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
    {
      name: 'Payment Method',
      sortable: false,
      sortDirection: undefined,
      filterable: true,
    },
    {
      name: 'Price',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
    {
      name: '#',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
    {
      name: 'Packed Items',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
    {
      name: 'Labels',
      sortable: false,
      sortDirection: undefined,
      filterable: true,
    },
    {
      name: 'Shipment Method',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
    {
      name: 'Actions',
      sortable: false,
      sortDirection: undefined,
      filterable: undefined,
    },
  ];

  private itemsPerPageSignal = signal(100);
  itemsPerPage = computed(() => this.itemsPerPageSignal());
  itemsPerPageOptions = [25, 50, 100];
  currentPage = 1;
  totalItems = 0;

  orders: Order[] = [];
  filteredOrders: Order[] = [];

  Math = Math;

  isLoading = false;
  selectedOrders: Order[] = [];
  showFilters = false;

  dateFilter = {
    start: new Date('2023-01-01'),
    end: new Date('2025-12-31'),
  };

  countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Australia'];
  selectedCountry: string | null = null;

  orderActions: OrderAction[] = [
    {
      name: 'Print labels for selected items',
      icon: 'bi-printer',
      action: 'print',
    },
    {
      name: 'Print invoice for selected items',
      icon: 'bi-receipt',
      action: 'invoice',
    },
    { name: 'Print stock checklist', icon: 'bi-list-check', action: 'stock' },
    {
      name: 'Set status to ready to ship',
      icon: 'bi-box-seam',
      action: 'ready',
    },
    { name: 'Cancel selected items', icon: 'bi-x-circle', action: 'cancel' },
  ];

  isSidebarOpen = false;
  currentFilter: 'country' | 'date' | 'all' | null = null;

  filterOptions = {
    printed: ['All', 'Printed', 'Not Printed'],
    paymentMethod: [
      'All',
      'Credit Card',
      'Cash on Delivery',
      'PayPal',
      'Bank Transfer',
    ],
    shippingInfo: ['All', 'Standard', 'Express', 'Next Day'],
  };

  protected readonly countryFilter = computed(() => this.filters().country);
  protected readonly dateRangeFilter = computed(() => this.filters().dateRange);
  protected readonly printedFilter = computed(() => this.filters().printed);
  protected readonly paymentMethodFilter = computed(
    () => this.filters().paymentMethod
  );
  protected readonly shippingInfoFilter = computed(
    () => this.filters().shippingInfo
  );

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders() {
    this.isLoading = true;

    this.orderService
      .getSellerOrders({
        pageNumber: this.currentPage,
        pageSize: 10,
      }, this.authService.currentUserValue?.entityId)
      .subscribe({
        next: (response) => {
          console.log('Full API Response:', response);
          if (response.success) {
            this.orders = response.data.items;
            this.filteredOrders = [...this.orders]; // Initialize filtered orders
            this.totalItems = response.data.totalCount;
            this.updateTabCounts(); // Update the counts after loading orders
            console.log('Processed Orders:', this.orders);
          } else {
            console.error('API returned success: false', response.message);
            this.notificationService.error(
              response.message || 'Failed to load orders'
            );
          }
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.notificationService.error('Failed to load orders');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private updateTabCounts(): void {
    const statusCounts = new Map<string, number>();

    // Initialize counts
    this.statusTabs.forEach((tab) => {
      statusCounts.set(tab.name, 0);
    });

    // Count orders by status
    this.orders.forEach((order) => {
      const status = order.subOrders?.[0]?.status || order.status;
      const currentCount = statusCounts.get(status) || 0;
      statusCounts.set(status, currentCount + 1);
    });

    // Update tab counts
    this.statusTabs = this.statusTabs.map((tab) => ({
      ...tab,
      count:
        tab.name === 'All'
          ? this.orders.length
          : statusCounts.get(tab.name) || 0,
    }));
  }

  selectTab(index: number): void {
    this.statusTabs = this.statusTabs.map((tab, i) => ({
      ...tab,
      active: i === index,
    }));
    this.filterOrders(); // Call filterOrders instead of loadOrders
  }

  filterOrders(): void {
    let filtered = [...this.orders];

    // Apply status filter
    const activeTab = this.statusTabs.find((tab) => tab.active);
    if (activeTab && activeTab.name !== 'All') {
      filtered = filtered.filter(
        (order) =>
          order.subOrders?.[0]?.status === activeTab.name ||
          order.status === activeTab.name
      );
    }

    // Apply country filter
    if (this.filters().country) {
      filtered = filtered.filter(
        (order) => order.country === this.filters().country
      );
    }

    // Apply date range filter
    const { start, end } = this.filters().dateRange;
    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= start && orderDate <= end;
    });

    // Apply payment method filter
    if (this.filters().paymentMethod !== 'All') {
      filtered = filtered.filter(
        (order) => order.paymentMethod === this.filters().paymentMethod
      );
    }

    // Apply shipping info filter
    if (this.filters().shippingInfo !== 'All') {
      filtered = filtered.filter(
        (order) => order.shipmentMethod === this.filters().shippingInfo
      );
    }

    // Apply search filter
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.paymentMethod.toLowerCase().includes(query)
      );
    }

    this.filteredOrders = filtered;
    this.totalItems = filtered.length;
  }

  exportOrders(): void {
    if (this.selectedOrders.length > 0) {
      this.orderService.exportOrders(this.selectedOrders);
      this.notificationService.success('Selected orders exported successfully');
    } else {
      this.orderService.exportOrders(this.filteredOrders);
      this.notificationService.success(
        'All filtered orders exported successfully'
      );
    }
  }

  executeOrderAction(action: OrderAction['action'], order: Order): void {
    // Handle actions that don't require a subOrder first
    switch (action) {
      case 'print':
        this.orderService.printOrderLabels([order]);
        this.notificationService.success(
          `Printed labels for order ${order.orderNumber}`
        );
        return;
      case 'invoice':
        this.orderService.printOrderInvoice([order]);
        this.notificationService.success(
          `Printed invoice for order ${order.orderNumber}`
        );
        return;
      case 'stock':
        this.orderService.printStockChecklist([order]);
        this.notificationService.success(
          `Printed stock checklist for order ${order.orderNumber}`
        );
        return;
    }

    // For status update actions, we need a valid subOrder
    if (!order.subOrders?.[0]?.suborderId) {
      console.error(`No sub-order ID found for order ${order.orderNumber}`);
      this.notificationService.error(
        `Cannot update status for order ${order.orderNumber}: No sub-order found`
      );
      return;
    }

    const subOrder = order.subOrders[0];

    switch (action) {
      case 'ready':
        this.updateOrderStatus(subOrder.suborderId, 'Ready to Ship');
        break;
      case 'ship':
        this.updateOrderStatus(subOrder.suborderId, 'Shipped');
        break;
      case 'cancel':
        this.updateOrderStatus(subOrder.suborderId, 'Canceled');
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        this.notificationService.warning(`Unknown action: ${action}`);
    }
  }

  private updateOrderStatus(subOrderId: number, newStatus: OrderStatus) {
    this.notificationService.info(`Updating order status to ${newStatus}...`);

    this.orderService.updateSubOrderStatus(subOrderId, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          const order = this.orders.find(
            (o) => o.subOrders?.[0]?.suborderId === subOrderId
          );
          if (order && order.subOrders?.[0]) {
            order.subOrders[0].status = newStatus;
            order.status = newStatus;
            this.notificationService.success(
              `Order status updated to ${newStatus}`
            );
          }
          this.updateTabCounts();
          this.filterOrders();
        } else {
          this.notificationService.error(
            response.message || 'Failed to update order status'
          );
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.notificationService.error(
          error.message || `Failed to update order to ${newStatus}`
        );
      },
    });
  }

  // Track By Functions
  trackByOrderNumber(index: number, order: Order): string {
    return order.orderNumber;
  }

  trackByStatusTab(index: number, tab: StatusTab): string {
    return tab.name;
  }

  trackByAction(index: number, action: OrderAction): string {
    return action.name;
  }

  trackByColumn(index: number, column: Column): string {
    return column.name;
  }

  trackByLabel(index: number, label: string): string {
    return label;
  }

  // Filter Updates
  updateFilterValue(key: keyof FilterState, value: any) {
    this.filters.update((state) => ({
      ...state,
      [key]: value,
    }));
    this.filterOrders();
  }

  updateDateRange(start: Date, end: Date) {
    this.updateFilterValue('dateRange', { start, end });
  }

  updateSearchQuery(value: string) {
    this.searchQuerySignal.set(value);
    this.filterOrders();
  }

  updateCountry(value: string) {
    this.updateFilterValue('country', value);
  }

  updatePrinted(value: string) {
    this.updateFilterValue('printed', value);
  }

  updatePaymentMethod(value: string) {
    this.updateFilterValue('paymentMethod', value);
  }

  updateShippingInfo(value: string) {
    this.updateFilterValue('shippingInfo', value);
  }

  // Sidebar Controls
  toggleSidebar(filterType: 'country' | 'date' | 'all' | null = null) {
    this.currentFilter = filterType;
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.currentFilter = null;
  }

  applyFilters() {
    this.filterOrders();
    this.closeSidebar();
  }

  clearFilters() {
    this.filters.set({
      country: '',
      dateRange: {
        start: new Date('2023-01-01'),
        end: new Date('2025-12-31'),
      },
      printed: 'All',
      paymentMethod: 'All',
      shippingInfo: 'All',
    });
    this.filterOrders();
  }

  // Add missing methods for template
  openCountryFilter(): void {
    this.toggleSidebar('country');
  }

  openDateFilter(): void {
    this.toggleSidebar('date');
  }

  executeBulkAction(action: OrderAction['action']): void {
    const selectedOrders = this.orders.filter((order) => order.selected);
    if (selectedOrders.length === 0) {
      this.notificationService.warning('Please select orders first');
      return;
    }

    // For print actions, we can process all selected orders at once
    if (action === 'print' || action === 'invoice' || action === 'stock') {
      switch (action) {
        case 'print':
          this.orderService.printOrderLabels(selectedOrders);
          this.notificationService.success(
            `Printed labels for ${selectedOrders.length} orders`
          );
          return;
        case 'invoice':
          this.orderService.printOrderInvoice(selectedOrders);
          this.notificationService.success(
            `Printed invoices for ${selectedOrders.length} orders`
          );
          return;
        case 'stock':
          this.orderService.printStockChecklist(selectedOrders);
          this.notificationService.success(
            `Printed stock checklist for ${selectedOrders.length} orders`
          );
          return;
      }
    }

    // For status update actions, we need valid subOrders
    const validOrders = selectedOrders.filter(
      (order) =>
        order.subOrders &&
        order.subOrders.length > 0 &&
        order.subOrders[0].suborderId
    );

    if (validOrders.length === 0) {
      this.notificationService.warning(
        'No valid orders selected for this action'
      );
      return;
    }

    if (validOrders.length < selectedOrders.length) {
      this.notificationService.info(
        `Processing ${validOrders.length} of ${selectedOrders.length} selected orders. Some orders cannot be processed.`
      );
    }

    validOrders.forEach((order) => {
      this.executeOrderAction(action, order);
    });
  }

  searchOrders(): void {
    this.filterOrders();
  }

  selectAll(event: any): void {
    const checked = event.target.checked;
    this.filteredOrders.forEach((order) => {
      order.selected = checked;
    });
    this.selectedOrders = checked ? [...this.filteredOrders] : [];
  }

  sortOrders(columnName: string): void {
    const column = this.columns.find((col) => col.name === columnName);
    if (!column?.sortable) return;

    // Reset other columns
    this.columns.forEach((col) => {
      if (col.name !== columnName) {
        col.sortDirection = undefined;
      }
    });

    // Toggle sort direction
    column.sortDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';

    // Sort the orders
    this.filteredOrders.sort((a, b) => {
      let aValue: any = this.getOrderValue(a, columnName);
      let bValue: any = this.getOrderValue(b, columnName);

      if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (column.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  private getOrderValue(order: Order, columnName: string): any {
    switch (columnName) {
      case 'Order Date':
        return new Date(order.orderDate);
      case 'Pending Since':
        return new Date(order.statusUpdatedAt || order.orderDate);
      default:
        return (order as any)[columnName.toLowerCase().replace(/\s+/g, '')];
    }
  }

  getCurrentPageOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  toggleOrderSelection(order: Order): void {
    order.selected = !order.selected;
    if (order.selected) {
      this.selectedOrders.push(order);
    } else {
      const index = this.selectedOrders.findIndex(
        (o) => o.orderNumber === order.orderNumber
      );
      if (index > -1) {
        this.selectedOrders.splice(index, 1);
      }
    }
  }

  changeItemsPerPage(value: number): void {
    this.itemsPerPageSignal.set(value);
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page < 1 || page > Math.ceil(this.totalItems / this.itemsPerPage())) {
      return;
    }
    this.currentPage = page;
    this.loadOrders();
  }
  isCollapsed = false;
  showSidebar = false;
toggleSidebarVisibility() {
  this.showSidebar = !this.showSidebar;
}
}