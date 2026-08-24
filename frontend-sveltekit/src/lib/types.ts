export type OrderStatus =
  | 'DRAFT'
  | 'ORDER_CREATED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export type UserRole = 'guest' | 'customer' | 'merchant' | 'agent' | 'admin' | 'recipient';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token?: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
  orderType: string;
  paymentType: string;
  billableWeightKg: number;
  charges: {
    total: number;
    subtotal: number;
  };
}
