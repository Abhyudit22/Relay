import { OrderStatus } from '../../types';

export async function notifyOrderStatusChange(
  orderId: string,
  status: OrderStatus,
  customerContact?: string
): Promise<void> {
  console.log(`[Notification Service] Order ${orderId} transitioned to ${status}. Alert sent to ${customerContact || 'customer'}`);
}
