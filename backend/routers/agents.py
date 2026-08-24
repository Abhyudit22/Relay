from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/agents", tags=["Agents"])

class AgentModel(BaseModel):
    id: str
    name: str
    phone: str
    zoneId: str
    vehicleType: str
    isAvailable: bool
    currentActiveDeliveries: int
    maxCapacity: int
    rating: float

DEMO_AGENTS = [
    AgentModel(
        id="ag_01",
        name="Rahul Sharma",
        phone="+91 98451 23456",
        zoneId="zone_blr_south",
        vehicleType="EV Scooter",
        isAvailable=True,
        currentActiveDeliveries=2,
        maxCapacity=5,
        rating=4.9
    ),
    AgentModel(
        id="ag_02",
        name="Vikas Gowda",
        phone="+91 98452 34567",
        zoneId="zone_blr_east",
        vehicleType="Delivery Van",
        isAvailable=True,
        currentActiveDeliveries=4,
        maxCapacity=10,
        rating=4.8
    )
]

@router.get("", response_model=List[AgentModel])
async def list_agents():
    return DEMO_AGENTS

@router.post("/{agent_id}/toggle-availability")
async def toggle_availability(agent_id: str):
    agent = next((a for a in DEMO_AGENTS if a.id == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.isAvailable = not agent.isAvailable
    return {"id": agent.id, "isAvailable": agent.isAvailable}
