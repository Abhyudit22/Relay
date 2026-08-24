import {
  Order,
  OrderStatus,
  Agent,
  StatusHistoryEntry,
  UserRole,
  RescheduleRequest,
} from '../../types';

/**
 * Valid state transition map: enforces deterministic lifecycle rules
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  FAILED: ['RESCHEDULED', 'CANCELLED'],
  RESCHEDULED: ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
};

/**
 * Checks if a transition is legal
 */
export function isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
  // Admin override might allow any transition, but business logic validates standard flow
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Single source of truth for updating order status and appending immutable audit history
 */
export function updateOrderStatusWithHistory(
  order: Order,
  newStatus: OrderStatus,
  actor: { id: string; name: string; role: UserRole | 'system' },
  options?: {
    remarks?: string;
    location?: string;
    failureReason?: string;
    forceOverride?: boolean;
  }
): { updatedOrder: Order; historyEntry: StatusHistoryEntry } {
  if (!options?.forceOverride && !isValidTransition(order.status, newStatus)) {
    throw new Error(
      `Illegal status transition from ${order.status} to ${newStatus}. Permitted next states: ${ALLOWED_TRANSITIONS[order.status].join(', ')}`
    );
  }

  const now = new Date().toISOString();
  const historyEntry: StatusHistoryEntry = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    status: newStatus,
    timestamp: now,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    remarks: options?.remarks || `Status transitioned to ${newStatus}`,
    location: options?.location,
    failureReason: options?.failureReason,
  };

  const updatedOrder: Order = {
    ...order,
    status: newStatus,
    updatedAt: now,
    // Strictly append-only: never mutate existing history records
    history: [...order.history, historyEntry],
  };

  return { updatedOrder, historyEntry };
}

/**
 * Intelligent Auto-Assignment Engine
 * Looks for AVAILABLE agents in the pickup zone first, selects the one with the lowest active load.
 */
export function findBestAvailableAgent(pickupZoneId: string, agents: Agent[]): Agent | null {
  const eligibleInZone = agents.filter(
    (a) => a.zoneId === pickupZoneId && a.status !== 'OFFLINE' && a.currentActiveDeliveries < a.maxCapacity
  );

  if (eligibleInZone.length > 0) {
    // Prefer AVAILABLE status over BUSY, then lowest load
    return eligibleInZone.sort((a, b) => {
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;
      return a.currentActiveDeliveries - b.currentActiveDeliveries;
    })[0];
  }

  // If no one in exact zone, check adjacent active agents with capacity
  const anyEligible = agents.filter(
    (a) => a.status !== 'OFFLINE' && a.currentActiveDeliveries < a.maxCapacity
  );
  if (anyEligible.length > 0) {
    return anyEligible.sort((a, b) => a.currentActiveDeliveries - b.currentActiveDeliveries)[0];
  }

  return null;
}

/**
 * Assigns an agent to an order and updates status history
 */
export function assignAgentToOrder(
  order: Order,
  agent: Agent,
  actor: { id: string; name: string; role: UserRole | 'system' }
): { updatedOrder: Order; historyEntry: StatusHistoryEntry } {
  const now = new Date().toISOString();
  const historyEntry: StatusHistoryEntry = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    status: order.status,
    timestamp: now,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    remarks: `Courier ${agent.name} (${agent.vehicleType}) assigned to delivery route.`,
  };

  const updatedOrder: Order = {
    ...order,
    assignedAgentId: agent.id,
    assignedAgentName: agent.name,
    assignedAgentPhone: agent.phone,
    updatedAt: now,
    history: [...order.history, historyEntry],
  };

  return { updatedOrder, historyEntry };
}

/**
 * Handles Customer Reschedule Flow for Failed deliveries
 */
export function processCustomerReschedule(
  order: Order,
  rescheduleData: {
    requestedDate: string;
    timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
    customerNotes?: string;
  },
  availableAgents: Agent[],
  customerActor: { id: string; name: string }
): { updatedOrder: Order; assignedAgent?: Agent } {
  if (order.status !== 'FAILED') {
    throw new Error('Only orders in FAILED state can be rescheduled by the customer.');
  }

  const now = new Date().toISOString();
  const rescheduleRequest: RescheduleRequest = {
    id: `resched-${Date.now()}`,
    orderId: order.id,
    originalFailureReason:
      order.history.find((h) => h.status === 'FAILED')?.failureReason || 'Delivery Unsuccessful',
    requestedDate: rescheduleData.requestedDate,
    timeSlot: rescheduleData.timeSlot,
    customerNotes: rescheduleData.customerNotes,
    createdAt: now,
  };

  // Re-run Auto Assignment for the new slot
  const newAgent = findBestAvailableAgent(order.pickupZoneId, availableAgents);

  const historyEntry: StatusHistoryEntry = {
    id: `hist-${Date.now()}-resched`,
    orderId: order.id,
    status: 'RESCHEDULED',
    timestamp: now,
    actorId: customerActor.id,
    actorName: customerActor.name,
    actorRole: 'customer',
    remarks: `Rescheduled for ${rescheduleData.requestedDate} (${rescheduleData.timeSlot} slot). ${
      rescheduleData.customerNotes ? `Customer Note: "${rescheduleData.customerNotes}"` : ''
    }${newAgent ? ` Courier ${newAgent.name} reassigned.` : ''}`,
  };

  const updatedOrder: Order = {
    ...order,
    status: 'RESCHEDULED',
    updatedAt: now,
    estimatedDeliveryDate: `${rescheduleData.requestedDate}T16:00:00Z`,
    rescheduleRequest,
    assignedAgentId: newAgent ? newAgent.id : order.assignedAgentId,
    assignedAgentName: newAgent ? newAgent.name : order.assignedAgentName,
    assignedAgentPhone: newAgent ? newAgent.phone : order.assignedAgentPhone,
    history: [...order.history, historyEntry],
  };

  return { updatedOrder, assignedAgent: newAgent || undefined };
}
