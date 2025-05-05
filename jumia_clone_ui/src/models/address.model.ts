export interface Address {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressName: string;  // Added
  streetAddress: string; // Changed from address
  postalCode: string;   // Added
  country: string;
  state: string;
  city: string;
  isDefaultAddress: boolean;
  userId: number;
}

export interface Location {
  id: string;
  name: string;
  code?: string;
}