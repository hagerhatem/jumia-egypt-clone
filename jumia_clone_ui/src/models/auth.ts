// src/app/models/auth.model.ts

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userType: 'customer' | 'seller' | 'admin';
  }
  
  export interface SellerRegisterRequest {
    user: RegisterRequest;
    seller: {
      businessName: string;
      businessDescription: string;
      businessLogo: string;
    };
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: UserData;
  }
  
  export interface UserData {
    userId: number;
    entityId: number;
    email: string;
    firstName: string;
    lastName: string;
    userType: 'Customer' | 'Seller' | 'Admin';
    token: string;
    refreshToken: string;
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string;
  }