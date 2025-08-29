export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  profitPercentage: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expirationDate?: string;
  imageUrl?: string; // Campo agregado para URLs de imágenes
  createdAt: string;
  updatedAt: string;
}

export interface KardexEntry {
  id: string;
  productId: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  operationNumber?: string;
  customerName?: string;
  customerDocument?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'yape' | 'plin' | 'other';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'admin' | 'supervisor' | 'cashier';

export interface CashSession {
  id: string;
  userId: string;
  startAmount: number;
  currentAmount: number;
  totalSales: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
}

export interface Alert {
  id: string;
  type: 'expiration' | 'low_stock' | 'over_stock';
  productId: string;
  productName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}