from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class OrderStatus(str, Enum):
    DRAFT = "DRAFT"
    ORDER_CREATED = "ORDER_CREATED"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    RESCHEDULED = "RESCHEDULED"
    CANCELLED = "CANCELLED"

class UserRole(str, Enum):
    GUEST = "guest"
    CUSTOMER = "customer"
    MERCHANT = "merchant"
    AGENT = "agent"
    ADMIN = "admin"
    RECIPIENT = "recipient"

class OrderType(str, Enum):
    STANDARD = "STANDARD"
    EXPRESS = "EXPRESS"
    HYPERLOCAL = "HYPERLOCAL"
    SAME_DAY = "SAME_DAY"

class PaymentType(str, Enum):
    PREPAID = "PREPAID"
    COD = "COD"

class Dimensions(BaseModel):
    lengthCm: float = Field(..., gt=0)
    widthCm: float = Field(..., gt=0)
    heightCm: float = Field(..., gt=0)

class CustomerInfo(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    pincode: str
    zoneId: Optional[str] = None

class ChargeBreakdown(BaseModel):
    baseCharge: float
    weightSurcharge: float
    codFee: float
    fuelSurcharge: float
    handlingFee: float
    subtotal: float
    taxGst: float
    total: float

class StatusHistoryEntry(BaseModel):
    status: OrderStatus
    timestamp: str
    updatedBy: str
    note: Optional[str] = None
    location: Optional[str] = None

class Order(BaseModel):
    id: str
    trackingNumber: str
    orderType: OrderType
    paymentType: PaymentType
    codAmount: Optional[float] = None
    status: OrderStatus
    sender: CustomerInfo
    receiver: CustomerInfo
    actualWeightKg: float
    volumetricWeightKg: float
    billableWeightKg: float
    dimensions: Dimensions
    assignedAgentId: Optional[str] = None
    deliveryOtp: Optional[str] = None
    rescheduleCount: int = 0
    charges: ChargeBreakdown
    statusHistory: List[StatusHistoryEntry] = []
    createdAt: str
    estimatedDeliveryDate: str
    notes: Optional[str] = None

class RateCalculationRequest(BaseModel):
    pickupPincode: str
    deliveryPincode: str
    orderType: OrderType
    actualWeightKg: float
    dimensions: Dimensions
    paymentType: PaymentType
    declaredValue: Optional[float] = 0.0

class RateCalculationResponse(BaseModel):
    actualWeightKg: float
    volumetricWeightKg: float
    billableWeightKg: float
    chargeBreakdown: ChargeBreakdown
    zoneRelation: str
    pickupZoneId: str
    deliveryZoneId: str

class LoginRequest(BaseModel):
    emailOrPhone: str
    password: str
    role: Optional[UserRole] = UserRole.CUSTOMER

class SignUpRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: UserRole = UserRole.CUSTOMER
    pincode: Optional[str] = None
    vehicleType: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: UserRole
    token: str

class RescheduleRequestModel(BaseModel):
    orderId: str
    newDate: str
    newTimeSlot: str
    reason: str
    requestedBy: str

class UpdateStatusRequest(BaseModel):
    status: OrderStatus
    updatedBy: str
    otp: Optional[str] = None
    note: Optional[str] = None
    location: Optional[str] = None
