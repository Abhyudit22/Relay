from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from backend.routers import auth, orders, rates, agents

app = FastAPI(
    title="Relay Logistics OS - FastAPI Backend",
    description="High-Velocity Urban Delivery Engine API with Volumetric Calculation, OTP Verification, and Order Lifecycle State Management",
    version="1.0.0"
)

# Enable CORS for SvelteKit and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(rates.router, prefix="/api")
app.include_router(agents.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Relay Logistics FastAPI Service Online",
        "docs_url": "/docs",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Relay FastAPI Service",
        "engine": "FastAPI + Python 3",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
