export interface Seller {
  sellerId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  businessName: string;
  businessLogo?: string;
  isVerified: boolean;
  isActive: boolean;
}