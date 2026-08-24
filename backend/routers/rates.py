from fastapi import APIRouter, HTTPException
from backend.models import RateCalculationRequest, RateCalculationResponse
from backend.services.rate_engine import calculate_order_charges

router = APIRouter(prefix="/rates", tags=["Rate Engine"])

@router.post("/calculate", response_model=RateCalculationResponse)
async def calculate_rates(req: RateCalculationRequest):
    try:
        result = calculate_order_charges(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
