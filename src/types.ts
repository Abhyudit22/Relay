export type UserRole = 'customer' | 'merchant' | 'agent' | 'admin' | 'guest';

export type OrderType = 'B2B' | 'B2C';
export type PaymentType = 'PREPAID' | 'COD';

export type OrderStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export type ZoneRelation = 'INTRA' | 'INTER';

export interface Zone {
  id: string;
  name: string;
  code: string;
  city: string;
  description: string;
}

export interface ZoneArea {
  pincode: string;
  areaName: string;
  zoneId: string;
}

export interface RateCard {
  id: string;
  orderType: OrderType;
  zoneRelation: ZoneRelation;
  baseWeightKg: number;
  baseRate: number;
  additionalPerKgRate: number;
  estimatedDeliveryHours: number;
}

export interface CodSurchargeConfig {
  orderType: OrderType;
  surchargeType: 'FLAT' | 'PERCENTAGE';
  surchargeValue: number; // Flat currency or %
  minSurcharge: number;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  zoneId: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  maxCapacity: number;
  currentActiveDeliveries: number;
  vehicleType: 'BIKE' | 'VAN' | 'ELECTRIC_SCOOTER';
  rating: number;
  completedCount: number;
}

export interface StatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string; // ISO string
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  remarks?: string;
  location?: string;
  failureReason?: string;
}

export interface RescheduleRequest {
  id: string;
  orderId: string;
  originalFailureReason: string;
  requestedDate: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
  customerNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface OrderDimensions {
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
}

export interface ChargeBreakdown {
  billableWeightKg: number;
  volumetricWeightKg: number;
  actualWeightKg: number;
  weightBasis: 'ACTUAL' | 'VOLUMETRIC';
  zoneRelation: ZoneRelation;
  pickupZoneName: string;
  dropZoneName: string;
  baseFreightCharge: number;
  extraWeightCharge: number;
  codSurcharge: number;
  handlingFee: number;
  totalCharge: number;
}

export interface Order {
  id: string;
  trackingNumber: string; // e.g. TRK-892048
  orderType: OrderType;
  paymentType: PaymentType;
  codAmountDue: number; // If COD, amount customer pays
  status: OrderStatus;
  
  // Customer details
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  // Pickup Details
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderPincode: string;
  pickupZoneId: string;

  // Delivery Details
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientPincode: string;
  dropZoneId: string;

  // Package & Rate Details
  itemDescription: string;
  dimensions: OrderDimensions;
  charges: ChargeBreakdown;

  // Logistics & Assignment
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentPhone?: string;

  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate: string;

  // Associated History & Reschedule
  history: StatusHistoryEntry[];
  rescheduleRequest?: RescheduleRequest;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  trackingNumber: string;
  channel: 'EMAIL' | 'WEBSOCKET_PUSH' | 'SMS';
  recipient: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  title: string;
  message: string;
  timestamp: string;
}

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  businessType?: 'B2B' | 'B2C' | 'INDIVIDUAL';
  address?: string;
  pincode?: string;
  agentId?: string; // If agent
  vehicleType?: 'BIKE' | 'VAN' | 'ELECTRIC_SCOOTER';
  zoneId?: string;
  avatar?: string;
  joinedDate?: string;
}
