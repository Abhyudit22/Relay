from fastapi import APIRouter, HTTPException, status
import uuid
from backend.models import LoginRequest, SignUpRequest, UserResponse, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserResponse)
async def login(payload: LoginRequest):
    # Simulated auth handler
    role = payload.role or UserRole.CUSTOMER
    name = "Demo User"
    if role == UserRole.ADMIN:
        name = "Dispatch Controller"
    elif role == UserRole.AGENT:
        name = "Rahul Sharma (Rider)"
    elif role == UserRole.RECIPIENT:
        name = "Ananya Desai (Customer)"

    return UserResponse(
        id=f"usr_{uuid.uuid4().hex[:8]}",
        name=name,
        email=payload.emailOrPhone,
        phone="+91 98765 43210",
        role=role,
        token=f"jwt_relay_{uuid.uuid4().hex}"
    )

@router.post("/signup", response_model=UserResponse)
async def signup(payload: SignUpRequest):
    return UserResponse(
        id=f"usr_{uuid.uuid4().hex[:8]}",
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        token=f"jwt_relay_{uuid.uuid4().hex}"
    )
