from typing import Dict, List, Set
from datetime import datetime
from backend.models import OrderStatus

ALLOWED_TRANSITIONS: Dict[OrderStatus, List[OrderStatus]] = {
    OrderStatus.DRAFT: [OrderStatus.ORDER_CREATED, OrderStatus.CANCELLED],
    OrderStatus.ORDER_CREATED: [OrderStatus.PICKUP_SCHEDULED, OrderStatus.CANCELLED],
    OrderStatus.PICKUP_SCHEDULED: [OrderStatus.PICKED_UP, OrderStatus.RESCHEDULED, OrderStatus.CANCELLED],
    OrderStatus.PICKED_UP: [OrderStatus.IN_TRANSIT, OrderStatus.RESCHEDULED, OrderStatus.CANCELLED],
    OrderStatus.IN_TRANSIT: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.RESCHEDULED],
    OrderStatus.OUT_FOR_DELIVERY: [OrderStatus.DELIVERED, OrderStatus.RESCHEDULED, OrderStatus.IN_TRANSIT],
    OrderStatus.RESCHEDULED: [OrderStatus.PICKUP_SCHEDULED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
    OrderStatus.DELIVERED: [],
    OrderStatus.CANCELLED: [],
}

def is_valid_transition(current_status: OrderStatus, next_status: OrderStatus) -> bool:
    allowed = ALLOWED_TRANSITIONS.get(current_status, [])
    return next_status in allowed
