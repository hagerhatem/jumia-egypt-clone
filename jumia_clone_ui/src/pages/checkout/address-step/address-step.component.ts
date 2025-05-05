import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/shared/notification.service';
import { AddressService } from '../../../services/address/address-service.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-address-step',
  imports: [CommonModule, FormsModule],
  templateUrl: './address-step.component.html',
  styleUrls: ['./address-step.component.css']
})
export class AddressStepComponent implements OnInit {
  @Input() currentStep: number = 0;
  @Output() editAddressEvent = new EventEmitter<void>();
  @Output() addressConfirmed = new EventEmitter<number>();  
  @Output() saveAddressEvent = new EventEmitter<number>();
  isStepCompleted = false;
  addresses: any[] = [];
  selectedAddress: any = null;
  isEditing = false;
  isCreatingNew = false;
  isLoadingAddresses = false;
  isLoadingCountries = false;
  isLoadingStates = false;
  isLoadingCities = false;
  selectedAddressId: number = 0;  

  
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  
  editingAddress: any = null;

  newAddress = {
    addressId: 0,
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    addressName: '',
    isDefault: false,
    userId: 0
  };

  constructor(
    private addressService: AddressService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAddresses();
    this.loadCountries();
    this.newAddress.userId = this.authService.currentUserValue?.userId || 0;
  }

  loadCountries() {
    this.isLoadingCountries = true;
    this.addressService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.isLoadingCountries = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load countries');
        this.isLoadingCountries = false;
      }
    });
  }

  onCountryChange(event: Event): void {
    const countryCode = (event.target as HTMLSelectElement).value;
    this.states = [];
    this.cities = [];
    this.newAddress.state = '';
    this.newAddress.city = '';
    this.newAddress.postalCode = '';
  
    if (countryCode) {
      this.isLoadingStates = true;
      this.addressService.getStates(countryCode).subscribe({
        next: (states) => {
          this.states = states;
          this.isLoadingStates = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to load states');
          this.isLoadingStates = false;
        }
      });
    }
  }
  
  onStateChange(event: Event): void {
    const state = (event.target as HTMLSelectElement).value;
    this.cities = [];
    this.newAddress.city = '';
    this.newAddress.postalCode = '';
  
    if (state && this.newAddress.country) {
      this.isLoadingCities = true;
      this.addressService.getCities(this.newAddress.country, state).subscribe({
        next: (cities) => {
          this.cities = cities;
          this.isLoadingCities = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to load cities');
          this.isLoadingCities = false;
        }
      });
    }
  }
  
  onCityChange(event: Event): void {
    const city = (event.target as HTMLSelectElement).value;
    if (city) {
      this.newAddress.city = city;
    }
  }

  loadAddresses() {
    this.isLoadingAddresses = true;
    this.addressService.getAddresses(this.authService.currentUserValue?.userId || 0)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.addresses = response.data.items;
            if (this.addresses.length > 0) {
              this.selectedAddress = this.addresses.find(addr => addr.isDefault) || this.addresses[0];
            }
          }
          this.isLoadingAddresses = false;
        },
        error: (error) => {
          this.notificationService.showError(error.error?.message || 'Failed to load addresses');
          this.isLoadingAddresses = false;
        }
      });
  }

  startNewAddress() {
    this.resetForm();
    this.isCreatingNew = true;
    this.isEditing = true;
  }

  editAddress(address: any, event: Event) {
    event.stopPropagation();
    this.isEditing = true;
    this.isCreatingNew = false;
    this.editingAddress = { ...address };
    this.newAddress = { ...address };

    if (this.newAddress.country) {
      this.isLoadingStates = true;
      this.addressService.getStates(this.newAddress.country).subscribe({
        next: (states) => {
          this.states = states;
          this.isLoadingStates = false;
          
          if (this.newAddress.state) {
            this.isLoadingCities = true;
            this.addressService.getCities(this.newAddress.country, this.newAddress.state).subscribe({
              next: (cities) => {
                this.cities = cities;
                this.isLoadingCities = false;
              },
              error: (error) => {
                this.notificationService.showError('Failed to load cities');
                this.isLoadingCities = false;
              }
            });
          }
        },
        error: (error) => {
          this.notificationService.showError('Failed to load states');
          this.isLoadingStates = false;
        }
      });
    }
  }

  saveAddress() {
    const addressData = { ...this.newAddress };
    
    if (this.isCreatingNew) {
      this.addressService.createAddress(addressData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Address created successfully');
            this.loadAddresses();
            this.resetForm();
          }
        },
        error: (error) => {
          this.notificationService.showError(error.error?.message || 'Failed to create address');
        }
      });
    } else {
      this.addressService.updateAddress(this.editingAddress.addressId, addressData).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Address updated successfully');
            this.loadAddresses();
            this.resetForm();
          }
        },
        error: (error) => {
          this.notificationService.showError(error.error?.message || 'Failed to update address');
        }
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isCreatingNew = false;
    this.editingAddress = null;
    this.newAddress = {
      addressId: 0,
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phoneNumber: '',
      addressName: '',
      isDefault: false,
      userId: this.authService.currentUserValue?.userId || 0
    };
  }
  onAddressConfirmed(addressId: number) {
    this.isStepCompleted = true;  
    this.selectedAddressId = addressId;
    alert(this.selectedAddressId);
    this.addressConfirmed.emit(addressId);  
  }
  confirmStep() {
    if (this.selectedAddress) {
      this.isStepCompleted = true;
      this.saveAddressEvent.emit(this.selectedAddress.addressId); // Pass the addressId
    } else {
      this.notificationService.showError('Please select an address to continue');
    }
  }

  selectAddress(address: any) {
    this.selectedAddress = address;
    this.selectedAddressId = address.addressId;
  }

  cancelEdit() {
    this.resetForm();
  }
}