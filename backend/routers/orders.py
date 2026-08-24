from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
import uuid
from datetime import datetime
from backend.models import (
    Order,
    OrderStatus,
    OrderType,
    PaymentType,
    CustomerInfo,
    Dimensions,
    ChargeBreakdown,
    StatusHistoryEntry,
    RescheduleRequestModel,
    UpdateStatusRequest,
)
from backend.services.order_service import is_valid_transition, ALLOWED_TRANSITIONS

router = APIRouter(prefix="/orders", tags=["Orders"])

# In-memory storage for demonstration
DEMO_ORDERS: List[Order] = [
    Order(
        id="ord_101",
        trackingNumber="TRK-892048",
        orderType=OrderType.EXPRESS,
        paymentType=PaymentType.COD,
        codAmount=450.0,
        status=OrderStatus.OUT_FOR_DELIVERY,
        sender=CustomerInfo(
            name="Zomato Kitchen Koramangala",
            phone="+91 98450 11223",
            address="12, 80 Feet Road, 4th Block",
            pincode="560034",
            zoneId="zone_blr_south"
        ),
        receiver=CustomerInfo(
            name="Arun Kumar",
            phone="+91 99887 76655",
            address="Flat 402, Sunset Heights, Indiranagar",
            pincode="560038",
            zoneId="zone_blr_east"
        ),
        actualWeightKg=1.2,
        volumetricWeightKg=0.8,
        billableWeightKg=1.5,
        dimensions=Dimensions(lengthCm=20.0, widthCm=15.0, heightCm=10.0),
        assignedAgentId="ag_01",
        deliveryOtp="7392",
        rescheduleCount=0,
        charges=ChargeBreakdown(
            baseCharge=120.0,
            weightSurcharge=60.0,
            codFee=35.0,
            fuelSurcharge=14.4,
            handlingFee=15.0,
            subtotal=244.4,
            taxGst=43.99,
            total=288.39
        ),
        statusHistory=[
            StatusHistoryEntry(
                status=OrderStatus.ORDER_CREATED,
                timestamp="2026-08-24T08:30:00Z",
                updatedBy="Customer Portal"
            ),
            StatusHistoryEntry(
                status=OrderStatus.PICKED_UP,
                timestamp="2026-08-24T09:15:00Z",
                updatedBy="Rahul (Rider #42)",
                location="Koramangala Hub"
            ),
            StatusHistoryEntry(
                status=OrderStatus.OUT_FOR_DELIVERY,
                timestamp="2026-08-24T10:00:00Z",
                updatedBy="Rahul (Rider #42)",
                location="Indiranagar Sector 2"
            )
        ],
        createdAt="2026-08-24T08:30:00Z",
        estimatedDeliveryDate="2026-08-24T11:30:00Z"
    )
]

@router.get("", response_model=List[Order])
async def list_orders(status: Optional[OrderStatus] = None):
    if status:
        return [o for o in DEMO_ORDERS if o.status == status]
    return DEMO_ORDERS

@router.get("/track/{tracking_number}", response_model=Order)
async def track_order(tracking_number: str):
    order = next((o for o in DEMO_ORDERS if o.trackingNumber.upper() == tracking_number.strip().upper()), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/transitions")
async def get_allowed_transitions():
    return {"transitions": ALLOWED_TRANSITIONS}

@router.post("/update-status/{order_id}", response_model=Order)
async def update_order_status(order_id: str, payload: UpdateStatusRequest):
    order = next((o for o in DEMO_ORDERS if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not is_valid_transition(order.status, payload.status):
        raise HTTPException(
            status_code=400,
            detail=f"Illegal transition from {order.status} to {payload.status}"
        )

    if payload.status == OrderStatus.DELIVERED:
        if order.deliveryOtp and payload.otp != order.deliveryOtp:
            raise HTTPException(status_code=400, detail="Invalid OTP code. Delivery handshake denied.")

    order.status = payload.status
    order.statusHistory.append(
        StatusHistoryEntry(
            status=payload.status,
            timestamp=datetime.utcnow().isoformat() + "Z",
            updatedBy=payload.updatedBy,
            note=payload.note,
            location=payload.location
        )
    )
    return order

@router.post("/reschedule", response_model=Order)
async def reschedule_order(payload: RescheduleRequestModel):
    order = next((o for o in DEMO_ORDERS if o.id == payload.orderId), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Completed orders cannot be rescheduled")

    order.status = OrderStatus.RESCHEDULED
    order.rescheduleCount += 1
    order.statusHistory.append(
        StatusHistoryEntry(
            status=OrderStatus.RESCHEDULED,
            timestamp=datetime.utcnow().isoformat() + "Z",
            updatedBy=payload.requestedBy,
            note=f"Rescheduled to {payload.newDate} ({payload.newTimeSlot}). Reason: {payload.reason}"
        )
    )
    return order
