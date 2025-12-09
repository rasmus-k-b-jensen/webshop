import { Role, CreditTransactionType } from './index';

// Auth DTOs
export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    creditBalance: number;
  };
  token: string;
}

// Product DTOs
export interface CreateProductDTO {
  name: string;
  description: string;
  imageUrl?: string;
  priceInCredits: number;
  stock?: number | null;
  isActive?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  imageUrl?: string;
  priceInCredits?: number;
  stock?: number | null;
  isActive?: boolean;
}

// Order DTOs
export interface CreateOrderDTO {
  productId: string;
  quantity?: number;
  shippingAddressId?: string; // Use existing address
  shippingAddress?: {         // Or provide new address
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  isGift?: boolean;
  giftMessage?: string;
}

// Credit DTOs
export interface AdjustCreditsDTO {
  customerId: string;
  amount: number;
  type: CreditTransactionType.REWARD | CreditTransactionType.ADJUSTMENT;
  reason: string;
}

export interface CreditTransactionQuery {
  customerId?: string;
  type?: CreditTransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
