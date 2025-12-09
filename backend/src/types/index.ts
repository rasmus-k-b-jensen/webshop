export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum CreditTransactionType {
  REWARD = 'REWARD',
  PURCHASE = 'PURCHASE',
  ADJUSTMENT = 'ADJUSTMENT'
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'passwordHash'> {}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  priceInCredits: number;
  stock?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  totalCredits: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceInCreditsAtPurchase: number;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

// Credit Transaction Types
export interface CreditTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: CreditTransactionType;
  reason: string;
  relatedOrderId?: string | null;
  createdAt: Date;
  createdByUserId?: string | null;
}

export interface CreditTransactionWithDetails extends CreditTransaction {
  customer: User;
  createdBy?: User | null;
  relatedOrder?: Order | null;
}
