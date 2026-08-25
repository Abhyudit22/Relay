# Relay - Last-Mile Delivery Tracker & Logistics Management Platform

A full-stack urban logistics operating system engineered for real-time consignment tracking, volumetric rate calculation, dynamic agent assignment, immutable order lifecycle auditing, and multi-persona fleet management.

---

## 📋 Project Scope & Objectives

Logistics operations require dynamic pricing rules, intelligent agent assignment, and reliable customer communication. **Relay** provides an end-to-end delivery management platform where:
- **Customers & Merchants** can book consignments with dynamic, auto-calculated rates based on actual vs. volumetric package dimensions, payment modes (Prepaid / COD), and B2B/B2C rate cards.
- **Admin HQ Operations** manages operational zones, rate cards, agent roster assignments, and status overrides, protected by mandatory **Company Admin Verification Passkeys**.
- **Delivery Agents / Couriers** receive thumb-optimized mobile dispatch run sheets, update delivery milestones, log doorstep OTP handshakes, and process failed delivery exceptions.
- **End Recipients** receive live tracking timelines, SMS/email alerts on every status change, and doorstep OTP verification.

---

## 🛠️ Technology Stack & Architecture

- **Runtime & Language**: Node.js & TypeScript (ES Modules)
- **Backend API**: Express.js server handling REST API endpoints, rate calculation engine, and database ORM layer
- **Frontend SPA**: React 18 with Vite, Tailwind CSS, Lucide Icons, and Motion animations
- **Database**: PostgreSQL (Neon Serverless PostgreSQL connection pool with automated schema initialization and transient fallback)
- **Port**: Binds to standard container port `3000` (`0.0.0.0`)

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL (Optional for persistence)**: Neon PostgreSQL database connection string

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/Abhyudit22/Relay.git
cd Relay
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure environment variables:
```bash
cp .env.example .env
```

### 3. Running Development Server
Start the Express backend and Vite frontend dev server on port `3000`:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Production Build & Execution
Compile TypeScript assets with Vite and bundle the server:
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables (`.env.example`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string for persistent database storage (e.g. Neon PostgreSQL) | `postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `VITE_APP_URL` | Application root URL for webhooks and public tracking links | `http://localhost:3000` |
| `GEMINI_API_KEY` | Optional API key for intelligent AI logistics assistant endpoints | `AIzaSy...` |

---

## 📐 Rate Calculation Engine Explanation

The rate engine computes consignment charges dynamically based on physical metrics, origin/destination zones, service segment, and payment type. **Charges are shown to the customer before order confirmation.**

### 1. Volumetric Weight Formula
Package dimensions in centimeters ($L \times B \times H$) are converted to volumetric weight using the standard logistics divisor:
$$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Breadth (cm)} \times \text{Height (cm)}}{5000}$$

### 2. Billable Weight Selection
The billable mass is determined by taking the higher of actual physical scale weight vs. volumetric weight:
$$\text{Billable Weight (kg)} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$

### 3. Zone Resolution & Rate Lookup
- **Intra-Zone**: Pickup and delivery addresses belong to the same zone (e.g., Zone A to Zone A).
- **Inter-Zone**: Pickup and delivery addresses span across different zones (e.g., Zone A to Zone B).
- **Rate Card Selection**:
  - **B2C Standard**: ₹50 base (first 0.5 kg) + ₹20/kg incremental + ₹30 inter-zone tariff.
  - **B2B Commercial**: ₹180 base (first 5.0 kg) + ₹15/kg incremental + ₹50 inter-zone tariff.

### 4. Cash on Delivery (COD) Surcharge
For COD orders, a surcharge is calculated as $\max(\text{Fixed Minimum Fee}, \text{Declared Value} \times \text{COD \%})$:
- **B2C COD**: $\max(₹25, 1.5\% \text{ of Declared Value})$
- **B2B COD**: $\max(₹50, 2.0\% \text{ of Declared Value})$

### 5. Final Invoice Calculation
$$\text{Total Charge} = \text{Base Rate} + \text{Incremental Weight Charge} + \text{Inter-Zone Surcharge} + \text{COD Surcharge} + \text{GST (18\%)}$$

---

## 🗺️ Zone Detection Approach

Urban delivery hubs are organized into four operational quadrants:
- **Zone A**: Central Business District & Core City
- **Zone B**: East IT & Tech Corridor
- **Zone C**: North Suburban Industrial Belt
- **Zone D**: South Commercial & Residential Corridor

### Resolution Logic:
1. **Pincode Dictionary Mapping**: $O(1)$ fast lookup table maps 6-digit postal pincodes to Zone IDs.
2. **Coordinate Centroid Fallback**: For unrecognized pincodes, Haversine distance calculations determine the nearest zone hub centroid based on latitude/longitude.

---

## 🤖 Intelligent Auto-Assignment Logic

When an order is confirmed or auto-dispatch is triggered:
1. **Filtering Candidates**:
   - Courier status must be `AVAILABLE` / `ONLINE`.
   - Courier operational zone must match order pickup zone.
   - Courier current payload + order billable weight must not exceed vehicle capacity (EV Scooter: 25 kg, Bike: 40 kg, Van: 250 kg).
2. **Scoring Formula**:
   $$\text{Score} = (0.4 \times \text{Proximity}) + (0.35 \times \text{Available Capacity Ratio}) + (0.25 \times \text{Courier SLA Rating})$$
3. **Assignment & Dispatch**: The courier with the highest score is automatically assigned, generating an instant notification and adding the item to their mobile run sheet.

---

## 🔄 Order Lifecycle & Failed Delivery Handling

### Status Lifecycle State Machine
$$\text{BOOKED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \text{DELIVERED} \mid \text{FAILED}$$

- **Doorstep OTP Handshake**: Couriers must input the recipient's 4-digit security code to mark an order as `DELIVERED`.
- **Immutable Audit History**: Every state change records `timestamp`, `actor` (`customer`, `courier`, `admin`, `system`), status, and driver remarks.

### Failed Delivery & Rescheduling Flow
1. If delivery fails (recipient unavailable, wrong address, customer refusal), courier marks status as `FAILED` with a structured exception code.
2. The customer receives an instant notification (SMS/Email) with a 1-click rescheduling link.
3. Customer selects a new delivery date and preferred time window (Morning / Afternoon / Evening).
4. Order status updates to `RESCHEDULED`, clearing the current courier and re-triggering auto-assignment for the rescheduled date.

---

## 🔒 Security & Admin Verification

Access to **Admin HQ Command Center** is strictly protected to ensure unauthorized users cannot access operational controls or override order statuses:
- **Company Verification Key Requirement**: Users attempting to log into or upgrade their account to Admin HQ must provide a valid **Company Verification Security Key** (`ADMIN-9900`).
- **Role Isolation**: Accounts registered under specific roles cannot access unauthorized operational portals without explicitly completing company verification.

---

## 📡 Backend API Endpoints Reference

### Consignments (`/api/orders`)
- `GET /api/orders` — List all active consignments stored in Neon PostgreSQL.
- `POST /api/orders` — Save or update consignment order details and tracking history.
- `GET /api/orders/:id` — Fetch order details and tracking timeline.

### Rate Engine (`/api/rates`)
- `POST /api/rates/calculate` — Calculate volumetric weight, billable mass, zone tariffs, and COD surcharges.

### Health Check (`/api/health`)
- `GET /api/health` — Returns system health status and active database connection state.

---

## 🗄️ Database Schema (`orders` & `status_history`)

```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  tracking_number VARCHAR(64) NOT NULL,
  order_type VARCHAR(32) NOT NULL DEFAULT 'DOMESTIC_STANDARD',
  payment_type VARCHAR(32) NOT NULL DEFAULT 'PREPAID',
  status VARCHAR(32) NOT NULL DEFAULT 'BOOKED',
  customer_name VARCHAR(128),
  customer_phone VARCHAR(32),
  customer_email VARCHAR(128),
  recipient_name VARCHAR(128),
  recipient_phone VARCHAR(32),
  recipient_address TEXT,
  pickup_pincode VARCHAR(16),
  delivery_pincode VARCHAR(16),
  declared_value NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(64) REFERENCES orders(id),
  status VARCHAR(32) NOT NULL,
  actor VARCHAR(64) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 System Design Summary (Max 800 Words)

A standalone system design document detailing architectural decisions, pricing algorithms, zone detection models, auto-assignment scoring, and delivery failure workflows is available in [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).
