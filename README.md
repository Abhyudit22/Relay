# Relay - Urban Logistics & Last-Mile Delivery Platform

A high-performance last-mile logistics operating system engineered for urban parcel delivery, real-time consignment tracking, volumetric rate calculation, and multi-persona fleet management.

---

## 🛠️ Technology Stack

### Backend
- **Python 3.10+ with FastAPI**: High-performance asynchronous API framework with automatic OpenAPI/Swagger documentation.
- **Pydantic v2**: Type enforcement, payload parsing, and runtime data validation.
- **Uvicorn**: High-concurrency ASGI server implementation.

### Frontend
- **SvelteKit & React (Vite)**: Component-driven, reactive UI frameworks.
- **Tailwind CSS**: Utility-first styling framework with full dark/light theme support.
- **Lucide Icons**: Comprehensive iconography for logistics workflows.

---

## 🚀 Key Features & Functional Modules

### 1. Dynamic Rate & Billing Engine
- **Volumetric Weight Calculation**: Computes volumetric mass using standard logistics divisor formulas:
  $$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Breadth (cm)} \times \text{Height (cm)}}{5000}$$
- **Billable Weight Selection**: Automatically selects $\max(\text{Actual Weight}, \text{Volumetric Weight})$.
- **Zone-Based Distance Matrices**: City-wide coverage across Central (Zone A), East IT Corridor (Zone B), North Suburban (Zone C), and South Tech Corridor (Zone D).
- **Flexible Pricing Slabs**: Base rates + progressive per-kg tier multipliers.
- **Cash on Delivery (COD) Surcharges**: Configurable percentage fees with minimum collection charge thresholds.

### 2. Interactive Real-Time Consignment Tracking Map
- **Live Vector Map Canvas**: Urban transit network rendering with arterial corridors, ring roads, lakes, and zone overlays.
- **Dynamic Telemetry & Courier Marker**: Dynamic position interpolation along the route based on shipment milestone (`PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`).
- **Pulsing Radar Radar Beam**: Visual proximity beacon around active delivery riders.
- **Traffic Density Layer**: Real-time arterial flow visualization (Green, Amber, Red congestion points).
- **Map Controls**: Zoom, recenter, satellite/street/night theme toggles, and fullscreen mode.

### 3. Secure Doorstep OTP Verification
- **Cryptographic Delivery Handshake**: Dynamic 4-digit verification code generated for each consignment.
- **Rider Validation Enforcement**: Couriers cannot mark an order as `DELIVERED` without entering the recipient's matching doorstep OTP.
- **Cash Collection Safeguard**: For COD shipments, system requires explicit confirmation of cash collection prior to closing the consignment.

### 4. Multi-Role Operating Portals
- **Guest / Public**: Clean, streamlined landing page with direct Sign In and Sign Up authentication options.
- **Customer / Merchant Portal**: Book single or bulk shipments, print 4x6 AWB thermal labels, view billing breakdowns, and monitor active orders.
- **Delivery Courier Console**: Thumb-optimized mobile dispatch run sheet, availability toggle (`AVAILABLE`, `ON ROUTE`, `OFFLINE`), one-touch customer calling, OTP submission, and failure exception logging.
- **Admin HQ Operations Center**: Real-time dispatch grid, fleet workload balancing, zone rate configuration, COD policy management, and override controls.
- **Recipient Portal**: Live delivery ETA countdown, door-buzzer instructions, delivery rescheduling to preferred time slots, and courier rating.

### 5. Standard 4x6 AWB Thermal Shipping Labels
- High-contrast printable thermal shipping labels with scannable Code128 barcodes, recipient address blocks, weight metrics, routing barcodes, and merchant details.

---

## 📁 Repository Structure

```
.
├── backend/                        # Python FastAPI Backend
│   ├── main.py                     # FastAPI application entry point & CORS configuration
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic)
│   ├── Dockerfile                  # Containerization specification
│   ├── models/
│   │   └── schemas.py              # Pydantic schemas (Order, Rate, Agent, User)
│   └── routers/
│       ├── auth.py                 # Authentication and role access routes
│       ├── orders.py               # Consignment creation, tracking, OTP verification, rescheduling
│       ├── rates.py                # Volumetric charge and COD calculations
│       └── agents.py               # Fleet management and courier status
│
├── frontend-sveltekit/             # SvelteKit Application
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.js
│   └── src/
│       ├── lib/
│       │   └── api.ts              # FastAPI client service
│       └── routes/
│           └── +page.svelte        # Clean landing page with login & signup modals
│
├── src/                            # Full-Stack Web Application
│   ├── backend/                    # TypeScript backend services & rate calculation engine
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── admin/              # Admin HQ Command Center
│   │   │   ├── agent/              # Courier Mobile Run Sheet Console
│   │   │   ├── auth/               # Login & Registration views
│   │   │   ├── common/             # Live Tracking Map, Header, Status Badge, AWB Label
│   │   │   ├── customer/           # Merchant Portal, New Consignment Booking, Recipient Portal
│   │   │   └── landing/            # Clean Landing Page
│   │   ├── context/                # Theme and state providers
│   │   └── data/                   # Default configuration structures
│   └── types.ts                    # Global TypeScript interfaces
└── README.md
```

---

## ⚡ Quickstart & Setup Guide

### 1. Running the FastAPI Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`
- **Alternative Docs (ReDoc)**: `http://localhost:8000/redoc`

---

### 2. Running the SvelteKit Frontend

```bash
# Navigate to SvelteKit directory
cd frontend-sveltekit

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

### 3. Running the Full-Stack Web Server

```bash
# Install root dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be accessible at `http://localhost:3000`.

---

## 📡 API Endpoint Reference

### Consignments (`/api/orders`)
- `GET /api/orders`: List all active consignments with optional status and zone filters.
- `POST /api/orders`: Create a new consignment with automatic rate computation.
- `GET /api/orders/{order_id}`: Retrieve detailed order state, history timeline, and tracking coordinates.
- `POST /api/orders/{order_id}/verify-delivery`: Complete delivery handshake via 4-digit OTP.
- `POST /api/orders/{order_id}/reschedule`: Update scheduled delivery date and preferred delivery window.
- `POST /api/orders/{order_id}/fail`: Mark delivery attempt as failed with structured reason and driver remarks.

### Rate Calculation (`/api/rates`)
- `POST /api/rates/calculate`: Calculate volumetric weight, billable mass, zone tariffs, and COD surcharges.
- `GET /api/rates/cards`: Retrieve current active rate cards by service category.

### Fleet & Couriers (`/api/agents`)
- `GET /api/agents`: Retrieve courier roster with active capacity load and ratings.
- `PATCH /api/agents/{agent_id}/status`: Toggle availability state (`AVAILABLE`, `BUSY`, `OFFLINE`).

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate user credentials and return role-scoped session token.
- `POST /api/auth/register`: Create a new merchant, customer, or recipient profile.

---

## 🔒 Security & Verification

- **OTP Handshake**: Prevents false delivery marking and ensures package receipt by verified recipients.
- **Server-Authoritative Pricing**: All rate calculations and surcharges are validated on the backend to prevent client-side price tampering.
- **Granular Role-Based Access**: Strict separation of concerns between Customers, Couriers, Operations Managers, and End Recipients.
