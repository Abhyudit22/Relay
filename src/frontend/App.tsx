import React, { useState, useEffect } from 'react';
import {
  Order,
  OrderStatus,
  Agent,
  Zone,
  ZoneArea,
  RateCard,
  CodSurchargeConfig,
  NotificationLog,
  UserRole,
  ActiveUser,
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_AGENTS,
  INITIAL_ZONES,
  INITIAL_ZONE_AREAS,
  INITIAL_RATE_CARDS,
  INITIAL_COD_SURCHARGE_CONFIGS,
  INITIAL_NOTIFICATIONS,
} from './data/initialData';
import {
  updateOrderStatusWithHistory,
  findBestAvailableAgent,
  assignAgentToOrder,
  processCustomerReschedule,
} from '../backend/services/orderService';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { RecipientPortal } from './components/customer/RecipientPortal';
import { AgentConsole } from './components/agent/AgentConsole';
import { AdminCommandCenter } from './components/admin/AdminCommandCenter';
import { RescheduleModal } from './components/common/RescheduleModal';
import { TrackingTimeline } from './components/common/TrackingTimeline';
import { ToastContainer, ToastMessage } from './components/common/ToastContainer';
import { AuthView } from './components/auth/AuthView';
import { DeliveryBackgroundAnimation } from './components/common/DeliveryBackgroundAnimation';
import { X, Package } from 'lucide-react';

const AppInner: React.FC = () => {
  // Global State - Fresh dataset by default (empty orders and notifications)
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [zoneAreas, setZoneAreas] = useState<ZoneArea[]>(INITIAL_ZONE_AREAS);
  const [rateCards, setRateCards] = useState<RateCard[]>(INITIAL_RATE_CARDS);
  const [codConfigs, setCodConfigs] = useState<CodSurchargeConfig[]>(
    INITIAL_COD_SURCHARGE_CONFIGS
  );
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Fetch orders from backend on mount (syncs with Neon Postgres if configured)
  useEffect(() => {
    fetch('/api/orders')
      ? fetch('/api/orders')
          .then((res) => res.json())
          .then((data) => {
            if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
              setOrders(data.orders);
            }
          })
          .catch((err) => console.log('Could not fetch orders from backend:', err))
      : null;
  }, []);

  const handleLoadDemoData = () => {
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    addToast({
      type: 'success',
      title: 'Demo Dataset Loaded',
      message: 'Sample test orders and notification logs have been loaded successfully.',
    });
  };

  // Active Role & Persona (Starts as Guest with no active session until authenticated)
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);

  // Auth Modal State
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
    role: UserRole;
  } | null>(null);

  // Modals & Interactive Drawers
  const [selectedRescheduleOrder, setSelectedRescheduleOrder] = useState<Order | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', role: UserRole = 'customer') => {
    setAuthModal({
      isOpen: true,
      mode,
      role: role === 'guest' ? 'customer' : role,
    });
  };

  // Safe Role Selector: Asks for credentials if not logged in as the requested role
  const handleRoleSelection = (targetRole: UserRole) => {
    if (targetRole === 'guest') {
      setCurrentRole('guest');
      return;
    }

    // If user is already logged in as this exact role, navigate directly
    if (currentUser && currentUser.role === targetRole) {
      setCurrentRole(targetRole);
      return;
    }

    // Prompt for credentials for the requested role
    handleOpenAuth('login', targetRole);
  };

  const handleAuthSuccess = (user: ActiveUser, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setAuthModal(null);

    // If agent registered/logged in, ensure agent list includes them or is matched
    if (role === 'agent' && user.agentId) {
      setAgents((prev) => {
        const exists = prev.some((a) => a.id === user.agentId);
        if (!exists) {
          const newAgent: Agent = {
            id: user.agentId!,
            name: user.name,
            phone: user.phone || '+1 (555) 782-9930',
            email: user.email,
            zoneId: user.zoneId || 'zone-north',
            status: 'AVAILABLE',
            maxCapacity: 15,
            currentActiveDeliveries: 0,
            vehicleType: user.vehicleType || 'ELECTRIC_SCOOTER',
            rating: 5.0,
            completedCount: 0,
          };
          return [newAgent, ...prev];
        }
        return prev;
      });
    }

    addToast({
      type: 'success',
      title: `Welcome, ${user.name}!`,
      message: `Successfully authenticated into the ${role.toUpperCase()} operations terminal.`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('guest');
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Session closed. Returned to public consignment tracker & rate engine.',
    });
  };

  // 1. Status Update Handler (Courier / Admin / System)
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    options?: { remarks?: string; location?: string; failureReason?: string; forceOverride?: boolean }
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const actor = {
      id: currentRole === 'agent' ? 'agt-042' : currentRole === 'admin' ? 'admin-master' : currentUser.id,
      name: currentRole === 'agent' ? 'Rahul Sharma' : currentRole === 'admin' ? 'Dispatch Admin' : currentUser.name,
      role: currentRole,
    };

    try {
      const { updatedOrder } = updateOrderStatusWithHistory(targetOrder, newStatus, actor, options);

      // Update orders collection
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

      // If selected in tracking drawer, update it too
      if (selectedTrackingOrder?.id === orderId) {
        setSelectedTrackingOrder(updatedOrder);
      }

      // Add push notification
      const newNotif: NotificationLog = {
        id: `notif-${Date.now()}`,
        orderId: updatedOrder.id,
        trackingNumber: updatedOrder.trackingNumber,
        channel: 'WEBSOCKET_PUSH',
        recipient: updatedOrder.customerEmail,
        status: 'DELIVERED',
        title: `Status: ${newStatus.replace(/_/g, ' ')}`,
        message: options?.remarks || `Shipment ${updatedOrder.trackingNumber} updated to ${newStatus}`,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Add Toast Feedback
      addToast({
        type: newStatus === 'DELIVERED' ? 'success' : newStatus === 'FAILED' ? 'warning' : 'info',
        title: `Order ${updatedOrder.trackingNumber} Updated`,
        message: options?.remarks || `Status transitioned to ${newStatus}`,
        trackingNumber: updatedOrder.trackingNumber,
      });

      // Update Courier load count if state became terminal
      if (newStatus === 'DELIVERED' && targetOrder.assignedAgentId) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === targetOrder.assignedAgentId
              ? {
                  ...a,
                  currentActiveDeliveries: Math.max(0, a.currentActiveDeliveries - 1),
                  completedCount: a.completedCount + 1,
                }
              : a
          )
        );
      }
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Transition Blocked',
        message: err.message || 'Illegal state transition',
      });
    }
  };

  // 2. Auto-Assign Unassigned Orders (Admin Trigger)
  const handleAutoAssignAll = () => {
    let assignedCount = 0;
    let updatedOrders = [...orders];
    let updatedAgents = [...agents];

    updatedOrders = updatedOrders.map((ord) => {
      if (!ord.assignedAgentId && ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED') {
        const bestAgent = findBestAvailableAgent(ord.pickupZoneId, updatedAgents);
        if (bestAgent) {
          const { updatedOrder } = assignAgentToOrder(ord, bestAgent, {
            id: 'system',
            name: 'Intelligent Auto-Dispatch Engine',
            role: 'system',
          });

          // Increase agent load in local simulation
          updatedAgents = updatedAgents.map((a) =>
            a.id === bestAgent.id
              ? { ...a, currentActiveDeliveries: a.currentActiveDeliveries + 1 }
              : a
          );

          assignedCount++;
          return updatedOrder;
        }
      }
      return ord;
    });

    setOrders(updatedOrders);
    setAgents(updatedAgents);

    addToast({
      type: 'success',
      title: 'Auto-Dispatch Complete',
      message: `Intelligently routed and assigned ${assignedCount} shipments across available courier fleet.`,
    });
  };

  // 3. Manual Courier Assignment (Admin)
  const handleManualAssignAgent = (orderId: string, agentId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const targetAgent = agents.find((a) => a.id === agentId);
    if (!targetOrder || !targetAgent) return;

    const { updatedOrder } = assignAgentToOrder(targetOrder, targetAgent, {
      id: 'admin-master',
      name: 'Dispatch Admin Override',
      role: 'admin',
    });

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    if (selectedTrackingOrder?.id === orderId) {
      setSelectedTrackingOrder(updatedOrder);
    }

    addToast({
      type: 'info',
      title: 'Courier Assigned',
      message: `${targetAgent.name} assigned to order ${updatedOrder.trackingNumber}`,
      trackingNumber: updatedOrder.trackingNumber,
    });
  };

  // 4. Customer Reschedule Handler
  const handleConfirmReschedule = (
    orderId: string,
    rescheduleData: {
      requestedDate: string;
      timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
      customerNotes?: string;
    }
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const { updatedOrder, assignedAgent } = processCustomerReschedule(
      targetOrder,
      rescheduleData,
      agents,
      { id: currentUser.id, name: currentUser.name }
    );

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    if (selectedTrackingOrder?.id === orderId) {
      setSelectedTrackingOrder(updatedOrder);
    }

    addToast({
      type: 'reschedule',
      title: 'Delivery Rescheduled & Reassigned',
      message: `Confirmed for ${rescheduleData.requestedDate} (${rescheduleData.timeSlot} slot). ${
        assignedAgent ? `Courier ${assignedAgent.name} assigned.` : ''
      }`,
      trackingNumber: updatedOrder.trackingNumber,
    });
  };

  // 5. New Order Created (Customer or Admin)
  const handleOrderCreated = (newOrder: Order) => {
    // Try instant auto-assignment on creation
    const matchingAgent = findBestAvailableAgent(newOrder.pickupZoneId, agents);
    let finalOrder = newOrder;

    if (matchingAgent) {
      const { updatedOrder } = assignAgentToOrder(newOrder, matchingAgent, {
        id: 'system',
        name: 'Auto-Dispatch Engine',
        role: 'system',
      });
      finalOrder = updatedOrder;

      setAgents((prev) =>
        prev.map((a) =>
          a.id === matchingAgent.id
            ? { ...a, currentActiveDeliveries: a.currentActiveDeliveries + 1 }
            : a
        )
      );
    }

    setOrders((prev) => [finalOrder, ...prev]);

    addToast({
      type: 'success',
      title: 'Shipment Booked Successfully',
      message: `Consignment ${finalOrder.trackingNumber} registered with verified rate calculation.`,
      trackingNumber: finalOrder.trackingNumber,
    });
  };

  // 6. Courier Availability Toggle
  const handleToggleAgentAvailability = (
    agentId: string,
    newStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  ) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: newStatus } : a))
    );
    addToast({
      type: 'info',
      title: 'Courier Status Updated',
      message: `Status set to ${newStatus}`,
    });
  };

  // Switch Active Agent identity for Agent Console
  const activeAgent = agents.find((a) => a.id === 'agt-042') || agents[0];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col relative overflow-hidden">
      {/* Dynamic Animated Delivery Background (Trucks, Bikes, Drones) - Landing Page Only */}
      {currentRole === 'guest' && <DeliveryBackgroundAnimation />}

      {/* Universal Top Navigation Header */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleSelection}
        notifications={notifications}
        isWsConnected={true}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main App Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10">
        {/* Role View Routing */}
        {currentRole === 'guest' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentRole === 'customer' && (
          <RecipientPortal
            currentUser={
              currentUser || {
                id: 'cust-recipient-01',
                name: 'Rohan Mehta',
                email: 'rohan.mehta@example.in',
                role: 'customer',
                phone: '+91 98450 44332',
                address: 'Apt 4B, 742 80ft Road, Koramangala',
                pincode: '560034',
              }
            }
            orders={orders}
            zones={zones}
            onOpenRescheduleModal={(ord) => setSelectedRescheduleOrder(ord)}
            onSelectOrderToTrack={(ord) => setSelectedTrackingOrder(ord)}
          />
        )}

        {currentRole === 'merchant' && (
          <CustomerPortal
            currentUser={
              currentUser || {
                id: 'cust-001',
                name: 'Priya Sharma',
                email: 'priya.sharma@example.in',
                role: 'merchant',
                phone: '+91 98450 11223',
                companyName: 'Sharma Enterprises & Retail',
                businessType: 'B2B',
                address: '402 Innovation Blvd, Indiranagar',
                pincode: '560038',
              }
            }
            orders={orders}
            zones={zones}
            zoneAreas={zoneAreas}
            rateCards={rateCards}
            codConfigs={codConfigs}
            onOrderCreated={handleOrderCreated}
            onOpenRescheduleModal={(ord) => setSelectedRescheduleOrder(ord)}
            onSelectOrderToTrack={(ord) => setSelectedTrackingOrder(ord)}
            selectedTrackingOrder={selectedTrackingOrder}
            onCloseTrackingModal={() => setSelectedTrackingOrder(null)}
          />
        )}

        {currentRole === 'agent' && (
          <AgentConsole
            currentAgent={activeAgent}
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onToggleAvailability={handleToggleAgentAvailability}
            onSelectOrderToTrack={(ord) => setSelectedTrackingOrder(ord)}
          />
        )}

        {currentRole === 'admin' && (
          <AdminCommandCenter
            orders={orders}
            agents={agents}
            zones={zones}
            zoneAreas={zoneAreas}
            rateCards={rateCards}
            codConfigs={codConfigs}
            onAutoAssignAll={handleAutoAssignAll}
            onManualAssignAgent={handleManualAssignAgent}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOrderCreated={handleOrderCreated}
            onUpdateRateCards={(updated) => setRateCards(updated)}
            onUpdateCodConfigs={(updated) => setCodConfigs(updated)}
            onToggleAgentStatus={handleToggleAgentAvailability}
            onSelectOrderToTrack={(ord) => setSelectedTrackingOrder(ord)}
          />
        )}
      </main>

      {/* Customer Reschedule Recovery Modal */}
      {selectedRescheduleOrder && (
        <RescheduleModal
          order={selectedRescheduleOrder}
          isOpen={true}
          onClose={() => setSelectedRescheduleOrder(null)}
          onConfirmReschedule={handleConfirmReschedule}
        />
      )}

      {/* Consignment Audit Trail & Live Tracking Modal (Admin, Merchant, Courier, Recipient) */}
      {selectedTrackingOrder && (
        <div
          id="consignment-audit-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl my-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-black">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Consignment Audit & Live Radar</span>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {selectedTrackingOrder.trackingNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Live telemetry, doorstep OTP, courier route & timestamped audit log
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-audit-modal-btn"
                onClick={() => setSelectedTrackingOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-800 transition-colors"
                title="Close Audit Modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 sm:p-4">
              <TrackingTimeline
                order={selectedTrackingOrder}
                onOpenRescheduleModal={(ord) => setSelectedRescheduleOrder(ord)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Authentication & Onboarding Modal (Login / Sign Up) */}
      {authModal?.isOpen && (
        <AuthView
          isModal={true}
          initialMode={authModal.mode}
          initialRole={authModal.role}
          zones={zones}
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setAuthModal(null)}
        />
      )}

      {/* Global Real-Time Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
};

export default App;
