# System Design Document: Last-Mile Delivery Tracker & Logistics Engine

## 1. Executive Summary & Architecture Overview
The **Relay Last-Mile Delivery Platform** is built as an event-driven, role-gated logistics management system that orchestrates dynamic pricing, automated courier dispatching, real-time lifecycle tracking, and doorstep cryptographic verification.

The platform architecture comprises:
1. **Frontend Presentation Tier**: Responsive React/Tailwind client providing role-segregated views for Customers (B2B/B2C merchants & recipients), Couriers (mobile delivery run sheet), and Central Dispatch HQ (fleet command).
2. **Backend API & Processing Engine**: Modular service tier exposing RESTful endpoints for rate calculation, order lifecycle mutations, dynamic zone lookups, agent assignment, and notifications.
3. **Persistent Data Tier**: Normalized relational/document store modeling immutable audit timelines, rate cards, pincode zone mappings, and driver capacity.

---

## 2. Rate Calculation Engine

### 2.1 Core Formula & Volumetric Logic
Logistics pricing uses the standard IATA volumetric cubic conversion:
$$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Breadth (cm)} \times \text{Height (cm)}}{5000}$$

The **Billable Weight** is strictly resolved as:
$$\text{Billable Weight} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$

### 2.2 Dynamic Tariff Matrix
Pricing is never hardcoded. When an order is quoted:
1. **Zone Resolution**: Determines if the shipment is **Intra-Zone** (Origin Zone == Destination Zone) or **Inter-Zone** (Origin Zone != Destination Zone).
2. **Segment Rate Card Lookup**: Loads active rate cards matching the customer segment (**B2B** vs. **B2C**).
   - **Base Tariff**: Covers the initial base weight slab (e.g., first 0.5 kg for B2C, first 5.0 kg for B2B).
   - **Incremental Slabs**: Pro-rata charge per additional 0.5 kg / 1.0 kg above the base threshold.
3. **COD Surcharge**: For Cash-on-Delivery orders, calculates $\max(\text{Fixed Minimum COD Fee}, \text{Order Value} \times \text{COD Surcharge \%})$.
4. **Final Quotation**: $\text{Total} = \text{Base Rate} + \text{Incremental Weight Charge} + \text{Inter-Zone Surcharge} + \text{COD Fee} + \text{GST (18\%)}$.

The transparent cost breakdown is returned to the client and locked before order confirmation.

---

## 3. Zone Detection Approach

Urban geography is organized into logical logistics clusters:
- **Central Core (Zone A)**
- **East IT Corridor (Zone B)**
- **North Suburban (Zone C)**
- **South Tech Corridor (Zone D)**

### Resolution Strategy:
1. **Pincode / Postal Mapping**: Each urban locality is mapped to a master zone table. The system performs $O(1)$ dictionary lookup on origin and destination pincodes.
2. **Geographical Coordinate Fallback**: When exact postal codes are ambiguous, coordinates (latitude/longitude) are evaluated against polygon bounding boxes or Haversine distance centroids to tag the closest dispatch hub.
3. **Route Distance Matrix**: Inter-zone transit applies calibrated distance matrices to adjust estimated delivery transit times (ETAs).

---

## 4. Intelligent Auto-Assignment Logic

When an order transitions to `CONFIRMED` or auto-dispatch is triggered:
1. **Eligibility Filtering**:
   - Agent is `ONLINE` / `AVAILABLE`.
   - Agent is operating in or assigned to the order's pickup/hub zone.
   - Current active load < vehicle max capacity (e.g., 20 kg for EV Scooter, 150 kg for Van).
2. **Multi-Factor Scoring Function**:
   $$\text{Score} = w_1 \cdot \text{Proximity}(\text{Agent Location}, \text{Pickup}) + w_2 \cdot \text{Active Load Ratio} + w_3 \cdot \text{Historical SLA Rating}$$
3. **Assignment & Lock**: The highest-ranked agent is assigned via an atomic transaction. A notification is dispatched to the courier's mobile console, updating their active route sheet.
4. **Admin Override**: Operations dispatchers can manually override any assignment at any point prior to delivery.

---

## 5. Order Status Lifecycle & Immutable Tracking History

The order state machine strictly enforces sequential milestones:
$$\text{CREATED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \text{DELIVERED} \mid \text{FAILED}$$

### Immutable Audit Trail
Every transition appends a non-destructive event log record containing:
- `order_id`, `status`, `actor` (`customer`, `courier_id`, `admin`, `system`), `timestamp`, `location_coordinates`, and `notes`.

### Cryptographic Doorstep Verification
To prevent false delivery claims, `DELIVERED` status requires a secure 4-digit recipient OTP handshake entered into the courier console and verified server-side.

---

## 6. Failed Delivery Handling & Rescheduling

If a delivery cannot be completed (e.g., recipient unavailable, incorrect address, customer refused):
1. **Exception Logging**: The courier logs `FAILED` with a structured reason code and optional driver remarks.
2. **Instant Notification**: Automated webhook/email/SMS alerts the recipient with the failure reason and a secure 1-click reschedule link.
3. **Reschedule Ingestion**: Recipient selects a new target delivery date and convenient time window (Morning / Afternoon / Evening).
4. **Re-Routing & Re-Assignment**: The order status resets to `RESCHEDULED`, and the system re-evaluates courier availability for the chosen slot, assigning a fresh run sheet.
