import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddressService } from '../../../../services/address/address-service.service';
import { AuthService } from '../../../../services/auth/auth.service';

interface Address {
  addressId: number;
  addressName: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-addressbook.component.html',
  styleUrls: ['./customer-addressbook.component.css'],
})
export class AddressBookComponent implements OnInit {
  addresses: Address[] = [];

  ngOnInit(): void {
    this.loadAddresses();
  }

  constructor(
    private addressService: AddressService,
    private router: Router,
    private authService: AuthService // Add AuthService
  ) {}

  loadAddresses() {
    const userId = this.authService.currentUserValue?.userId;
    
    if (!userId) {
      console.error('No authenticated user found');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.addressService.getAddresses(userId).subscribe({
      next: (response) => {
        if (response?.data?.items && Array.isArray(response.data.items)) {
          this.addresses = response.data.items;
        } else {
          console.error('Unexpected response format:', response);
          this.addresses = [];
        }
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.addresses = [];
      }
    });
  }

  setAsDefault(index: number): void {
    if (this.addresses[index].addressId) {
      const addressData = { ...this.addresses[index], isDefault: true };
      this.addressService
        .updateAddress(this.addresses[index].addressId!, addressData)
        .subscribe({
          next: () => {
            this.addresses.forEach((address) => (address.isDefault = false));
            this.addresses[index].isDefault = true;
          },
          error: (error) => {
            console.error('Error setting default address:', error);
          },
        });
    }
  }

  addNewAddress(): void {
    this.router.navigate(['/account/edit-address']); // Navigate to the add address page
  }

  editAddress(index: number): void {
    if (this.addresses[index].addressId) {
      this.addressService.getAddressById(this.addresses[index].addressId!).subscribe({
        next: (address) => {
          // This will be implemented with a form/dialog component
          console.log('Address to edit:', address);
        },
        error: (error) => {
          console.error('Error getting address details:', error);
        },
      });
    }
  }
  
  deleteAddress(id: number): void {
    // Add confirmation dialog
    const confirmDelete = confirm('Are you sure you want to delete this address?');
    
    if (confirmDelete) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          // Remove the deleted address from the local array
          this.addresses = this.addresses.filter(address => address.addressId !== id);
          // Show success message (optional)
          alert('Address deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          // Show error message to user
          alert('Failed to delete address. Please try again.');
        },
      });
    }
  }
}
