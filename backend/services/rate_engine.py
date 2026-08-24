import math
from backend.models import (
    Dimensions,
    OrderType,
    PaymentType,
    ChargeBreakdown,
    RateCalculationRequest,
    RateCalculationResponse,
)

# Standard IATA Volumetric Divisor (5000 cm3/kg)
VOLUMETRIC_DIVISOR = 5000.0

def calculate_volumetric_weight(dimensions: Dimensions) -> float:
    volume_cm3 = dimensions.lengthCm * dimensions.widthCm * dimensions.heightCm
    return round(volume_cm3 / VOLUMETRIC_DIVISOR, 2)

def calculate_billable_weight(actual_kg: float, volumetric_kg: float, min_kg: float = 0.5) -> float:
    heavier = max(actual_kg, volumetric_kg)
    # Round up to nearest 0.5 kg slab
    slabs = math.ceil(max(heavier, min_kg) / 0.5)
    return round(slabs * 0.5, 2)

def calculate_order_charges(req: RateCalculationRequest) -> RateCalculationResponse:
    vol_weight = calculate_volumetric_weight(req.dimensions)
    billable_wt = calculate_billable_weight(req.actualWeightKg, vol_weight)

    # Base pricing model
    base_rate = 60.0
    if req.orderType == OrderType.HYPERLOCAL:
        base_rate = 45.0
    elif req.orderType == OrderType.SAME_DAY:
        base_rate = 90.0
    elif req.orderType == OrderType.EXPRESS:
        base_rate = 120.0

    # Additional weight surcharge: ₹30 per 0.5kg above 0.5kg
    weight_surcharge = 0.0
    if billable_wt > 0.5:
        excess_slabs = int((billable_wt - 0.5) / 0.5)
        weight_surcharge = excess_slabs * 30.0

    # COD fee
    cod_fee = 0.0
    if req.paymentType == PaymentType.COD and req.declaredValue:
        cod_fee = max(35.0, round(req.declaredValue * 0.02, 2))

    fuel_surcharge = round((base_rate + weight_surcharge) * 0.08, 2)
    handling_fee = 15.0

    subtotal = base_rate + weight_surcharge + cod_fee + fuel_surcharge + handling_fee
    tax_gst = round(subtotal * 0.18, 2)
    total = round(subtotal + tax_gst, 2)

    breakdown = ChargeBreakdown(
        baseCharge=base_rate,
        weightSurcharge=weight_surcharge,
        codFee=cod_fee,
        fuelSurcharge=fuel_surcharge,
        handlingFee=handling_fee,
        subtotal=subtotal,
        taxGst=tax_gst,
        total=total,
    )

    return RateCalculationResponse(
        actualWeightKg=req.actualWeightKg,
        volumetricWeightKg=vol_weight,
        billableWeightKg=billable_wt,
        chargeBreakdown=breakdown,
        zoneRelation="INTRA_CITY",
        pickupZoneId="zone_blr_central",
        deliveryZoneId="zone_blr_east",
    )
