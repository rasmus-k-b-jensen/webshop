export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum CreditTransactionType {
  REWARD = 'REWARD',
  PURCHASE = 'PURCHASE',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  priceInCredits: number;
  stock?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceInCreditsAtPurchase: number;
  product: Product;
}

export interface Order {
  id: string;
  customerId: string;
  totalCredits: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  isGift: boolean;
  giftMessage?: string;
  items: OrderItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreditTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: CreditTransactionType;
  reason: string;
  relatedOrderId?: string | null;
  createdAt: string;
  createdByUserId?: string | null;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  relatedOrder?: Order | null;
  balanceAfter?: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalCreditsIssued: number;
  totalCreditsSpent: number;
  totalCustomers: number;
  recentOrders: Order[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
