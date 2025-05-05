// address-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService } from '../../../../services/address/address-service.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Address, Location } from '../../../../../src/models/address.model'; // Adjust the import path as necessary

@Component({
  selector: 'app-customer-add-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-add-address.component.html',
  styleUrls: ['./customer-add-address.component.css']
})
export class CustomerAddAddressComponent implements OnInit {
  addressForm!: FormGroup;
  countries: Location[] = [];
  states: Location[] = [];
  cities: Location[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private router: Router,
    private authService: AuthService  // Add AuthService
  ) {
    this.initForm();
    this.setupFormSubscriptions();
  }

  private initForm(): void {
    this.addressForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      addressName: ['', [Validators.required]], // Added
      streetAddress: ['', [Validators.required, Validators.minLength(5)]], // Changed from address
      postalCode: ['', [Validators.required]], // Added
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      isDefaultAddress: [false]
    });
  }

  private setupFormSubscriptions(): void {
    this.addressForm.get('country')?.valueChanges.subscribe(countryCode => {
      if (countryCode) {
        this.loadStates(countryCode);
        this.addressForm.patchValue({ state: '', city: '' });
      }
    });

    this.addressForm.get('state')?.valueChanges.subscribe(state => {
      if (state) {
        this.loadCities(this.addressForm.get('country')?.value, state);
        this.addressForm.patchValue({ city: '' });
      }
    });
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  private loadCountries(): void {
    this.isLoading = true;
    this.addressService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load countries';
        this.isLoading = false;
        console.error('Error loading countries:', error);
      }
    });
  }

  private loadStates(countryCode: string): void {
    this.isLoading = true;
    this.addressService.getStates(countryCode).subscribe({
      next: (states) => {
        this.states = states;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load states';
        this.isLoading = false;
        console.error('Error loading states:', error);
      }
    });
  }

  private loadCities(countryCode: string, state: string): void {
    this.isLoading = true;
    this.addressService.getCities(countryCode, state).subscribe({
      next: (cities) => {
        this.cities = cities;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load cities';
        this.isLoading = false;
        console.error('Error loading cities:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.errorMessage = 'You must be logged in to add an address';
        return;
      }

      this.isLoading = true;
      const addressData: Address = {
        ...this.addressForm.value,
        userId: currentUser.userId // Use the actual user ID from AuthService
      };

      this.addressService.createAddress(addressData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/customer/addresses']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create address';
          console.error('Error creating address:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.addressForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
