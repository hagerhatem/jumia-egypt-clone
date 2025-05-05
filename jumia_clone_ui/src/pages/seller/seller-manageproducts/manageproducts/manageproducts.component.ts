import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../seller-sidebar/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ManageProductsService } from '../../../../services/seller/manageproducts.service';
import { product_manage, ProductFilter } from '../../../../models/product-manage';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manageproducts',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, MatIconModule],
  templateUrl: './manageproducts.component.html',
  styleUrl: './manageproducts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageproductsComponent implements OnInit {
  protected readonly Math = Math;

  readonly tableHeaders = [
    'Name',
    'Product ID',
    'Price',
    'Sale Price',
    'Currency',
    'Quantity',
    'Status',
    'isAvailable',
    'Actions',
  ];

  readonly statusFilters = [
    'All',
    'pending',
    'approved',
    'rejected',
    'suspended',
    'archived',
  ];

  // UI State
  searchSid = signal('');
  searchSku = signal('');
  selectedCountry = signal('');
  activeStatus = signal('All');
  showDropdown = signal(false);
  activeStatuses = signal<string[]>(['All']);
  loading = signal(false);
  error = signal<string | null>(null);

  // Products state
  products = signal<product_manage[]>([]);
  filteredProducts = signal<product_manage[]>([]);

  // Pagination state
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  constructor(
    private manageProductsService: ManageProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Update initialization to handle query params
    this.route.queryParams.subscribe((params) => {
      this.currentPage.set(Number(params['page']) || 0);
      this.pageSize.set(Number(params['size']) || 10);
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    const filter: ProductFilter = {
      searchTerm: this.searchSid(),
      // Only include approvalStatus if "All" is not selected
      approvalStatus: this.activeStatuses().includes('All')
        ? undefined
        : this.activeStatuses().length === 1
        ? this.activeStatuses()[0]
        : undefined,
    };

    console.log('Requesting products with filter:', filter);

    this.manageProductsService
      .getSellerProducts(this.currentPage(), this.pageSize(), filter)
      .subscribe({
        next: (response) => {
          console.log('Component received response:', response);
          if (response.success) {
            this.products.set(response.data);
            this.totalItems.set(response.total);
            this.totalPages.set(Math.ceil(response.total / response.pageSize));
            this.filterProducts();
            console.log('Products updated:', this.products());
          } else {
            this.error.set('Failed to load products');
            console.error('API returned success: false', response);
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('API error:', error);
          this.error.set(
            error.message || 'An error occurred while loading products'
          );
          this.loading.set(false);
        },
      });
  }

  // Update filterProducts to work with the API data
  filterProducts() {
    const sid = this.searchSid().toLowerCase();
    const sku = this.searchSku().toLowerCase();
    const activeStatuses = this.activeStatuses();

    let filtered = this.products().filter((product) => {
      // Handle "All" status
      if (
        !activeStatuses.includes('All') &&
        !activeStatuses.includes(product.approvalStatus)
      ) {
        return false;
      }

      // Apply name search filter
      if (sid && !product.name.toLowerCase().includes(sid)) {
        return false;
      }

      // Search by product ID (as SKU)
      if (sku && !product.productId.toString().includes(sku)) {
        return false;
      }

      return true;
    });

    this.filteredProducts.set(filtered);
  }

  // Update existing methods to work with the new Product interface
  toggleStatus(status: string): void {
    if (status === 'All') {
      // When 'All' is selected, clear other selections
      this.activeStatuses.set(['All']);
    } else {
      const currentActive = this.activeStatuses();
      const newStatuses = currentActive.filter((s) => s !== 'All');

      if (currentActive.includes(status)) {
        // Remove the status if it's already selected
        const filteredStatuses = newStatuses.filter((s) => s !== status);
        // If no statuses left, select 'All'
        this.activeStatuses.set(
          filteredStatuses.length ? filteredStatuses : ['All']
        );
      } else {
        // Add the new status
        this.activeStatuses.set([...newStatuses, status]);
      }
    }

    this.loadProducts();
  }

  // Handle input changes
  onSearchSidChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSid.set(value);
    this.filterProducts();
  }

  onSearchSkuChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSku.set(value);
    this.filterProducts();
  }

  onCountryChange(value: string) {
    this.selectedCountry.set(value);
    this.filterProducts();
    this.showDropdown.set(false);
  }

  // Toggle dropdown
  toggleDropdown(): void {
    this.showDropdown.update((value) => !value);
  }

  // For clearing search
  clearSearch(field: 'sid' | 'sku') {
    if (field === 'sid') {
      this.searchSid.set('');
    } else {
      this.searchSku.set('');
    }
    this.filterProducts();
  }

  // Handle import/export action
  handleImportExport(action: 'import' | 'export'): void {
    if (action === 'export') {
      this.exportProducts();
    } else {
      // Trigger file input click
      document.getElementById('fileInput')?.click();
    }
  }

  // Toggle language dropdown
  toggleLanguage() {
    console.log('Toggle language selection');
  }

  isStatusActive(status: string): boolean {
    return this.activeStatuses().includes(status);
  }

  getStatusDisplay(status: string): string {
    // Convert status to display format
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      pending_review: 'status-pending',
      deleted: 'status-deleted',
      suspended: 'status-suspended',
      archived: 'status-archived',
    };
    return statusMap[status] || '';
  }

  getAvailabilityIcon(isAvailable: boolean): string {
    return isAvailable ? 'visibility' : 'visibility_off';
  }

  getAvailabilityText(isAvailable: boolean): string {
    return isAvailable ? 'Visible' : 'Hidden';
  }

  getAvailabilityClass(isAvailable: boolean): string {
    return isAvailable ? 'available' : 'unavailable';
  }

  exportProducts(): void {
    const dataToExport = this.filteredProducts().map((product) => ({
      Name: product.name,
      SKU: product.productId,
      Price: product.basePrice,
      'Sale Price': product.finalPrice,
      Currency: 'EGP', // Or use dynamic currency
      Quantity: product.stockQuantity,
      Status: product.approvalStatus,
      Visible: product.isAvailable ? 'Yes' : 'No',
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Generate buffer
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Save file
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  importProducts(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      console.log('Imported data:', data);
      // TODO: Implement API call to import products
      alert('Import functionality will be implemented with API integration');
    };
    reader.readAsBinaryString(file);
  }

  // Add pagination methods
  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: page,
        size: this.pageSize(),
      },
      queryParamsHandling: 'merge',
    });
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const size = parseInt(target.value, 10);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 0,
        size: size,
      },
      queryParamsHandling: 'merge',
    });
  }

  getPages(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pages: number[] = [];

    // Show max 5 page numbers
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);

    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(0, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onEditProduct(product: product_manage) {
    // Navigate to edit product page with the product ID
    this.router.navigate(['/seller/products/edit', product.productId]);
  }

  onDeleteProduct(product: product_manage) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.loading.set(true);
      this.error.set(null);

      this.manageProductsService.deleteProduct(product.productId).subscribe({
        next: (response) => {
          if (response.success) {
            // Remove the product from the local array
            const updatedProducts = this.products().filter(
              (p) => p.productId !== product.productId
            );
            this.products.set(updatedProducts);
            this.filterProducts(); // Refresh the filtered products

            // Show success message (you might want to add a toast service for this)
            alert('Product deleted successfully');
          } else {
            this.error.set('Failed to delete product');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.error.set(
            error.message || 'An error occurred while deleting the product'
          );
          this.loading.set(false);
        },
      });
    }
    
  }


  isSidebarExpanded = signal(true);



@Input() sidebarCollapsed = false;
  


isCollapsed = false;

toggleSidebar() {
  this.isCollapsed = !this.isCollapsed;
}

showSidebar = false;
toggleSidebarVisibility() {
  this.showSidebar = !this.showSidebar;
}
}
