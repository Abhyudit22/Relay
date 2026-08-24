import {
  Zone,
  ZoneArea,
  RateCard,
  CodSurchargeConfig,
  OrderType,
  PaymentType,
  ChargeBreakdown,
  OrderDimensions,
  ZoneRelation,
} from '../../types';

export interface RateCalculationInput {
  pickupPincode: string;
  dropPincode: string;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  orderType: OrderType;
  paymentType: PaymentType;
  codDeclaredValue?: number;
  zones: Zone[];
  zoneAreas: ZoneArea[];
  rateCards: RateCard[];
  codConfigs: CodSurchargeConfig[];
}

export interface RateCalculationResult {
  dimensions: OrderDimensions;
  charges: ChargeBreakdown;
  pickupZone: Zone;
  dropZone: Zone;
  rateCard: RateCard;
  estimatedDeliveryHours: number;
}

/**
 * Auto-detects zone for a given pincode
 */
export function detectZone(
  pincode: string,
  zoneAreas: ZoneArea[],
  zones: Zone[]
): Zone | null {
  const cleanPincode = pincode.trim();
  const matchedArea = zoneAreas.find((area) => area.pincode === cleanPincode);
  
  if (matchedArea) {
    const foundZone = zones.find((z) => z.id === matchedArea.zoneId);
    if (foundZone) return foundZone;
  }

  // Fallback heuristic if not explicitly registered: derive from leading digits
  if (cleanPincode.startsWith('56000') || cleanPincode.startsWith('56002') || cleanPincode.startsWith('56003')) {
    return zones.find((z) => z.id === 'zone-a') || zones[0];
  }
  if (cleanPincode.startsWith('56010') || cleanPincode.startsWith('56006')) {
    return zones.find((z) => z.id === 'zone-b') || zones[1] || zones[0];
  }
  if (cleanPincode.startsWith('56005') || cleanPincode.startsWith('56009')) {
    return zones.find((z) => z.id === 'zone-c') || zones[2] || zones[0];
  }
  
  return zones[0]; // Default to primary zone
}

/**
 * Standard IATA Volumetric weight calculation: (L x B x H) / 5000
 */
export function calculateVolumetricWeight(
  lengthCm: number,
  breadthCm: number,
  heightCm: number
): number {
  const l = Math.max(0.1, lengthCm);
  const b = Math.max(0.1, breadthCm);
  const h = Math.max(0.1, heightCm);
  const volumetric = (l * b * h) / 5000;
  return Number(volumetric.toFixed(2));
}

/**
 * Pure Rate Calculation Engine
 */
export function calculateOrderCharges(input: RateCalculationInput): RateCalculationResult {
  const {
    pickupPincode,
    dropPincode,
    lengthCm,
    breadthCm,
    heightCm,
    actualWeightKg,
    orderType,
    paymentType,
    codDeclaredValue = 0,
    zones,
    zoneAreas,
    rateCards,
    codConfigs,
  } = input;

  // 1. Detect Zones
  const pickupZone = detectZone(pickupPincode, zoneAreas, zones) || zones[0];
  const dropZone = detectZone(dropPincode, zoneAreas, zones) || zones[0];

  // 2. Determine Zone Relation
  const zoneRelation: ZoneRelation = pickupZone.id === dropZone.id ? 'INTRA' : 'INTER';

  // 3. Volumetric vs Actual Weight
  const volumetricWeightKg = calculateVolumetricWeight(lengthCm, breadthCm, heightCm);
  const actualWeight = Number(Math.max(0.1, actualWeightKg).toFixed(2));
  const billableWeightKg = Number(Math.max(actualWeight, volumetricWeightKg).toFixed(2));
  const weightBasis: 'ACTUAL' | 'VOLUMETRIC' =
    actualWeight >= volumetricWeightKg ? 'ACTUAL' : 'VOLUMETRIC';

  // 4. Rate Card Lookup
  const matchingRateCard = rateCards.find(
    (rc) => rc.orderType === orderType && rc.zoneRelation === zoneRelation
  ) || {
    id: 'fallback',
    orderType,
    zoneRelation,
    baseWeightKg: orderType === 'B2B' ? 5.0 : 1.0,
    baseRate: orderType === 'B2B' ? 200.0 : 50.0,
    additionalPerKgRate: orderType === 'B2B' ? 20.0 : 25.0,
    estimatedDeliveryHours: zoneRelation === 'INTRA' ? 4 : 12,
  };

  // 5. Compute Base & Extra Weight Charge
  const baseFreightCharge = matchingRateCard.baseRate;
  const extraWeight = Math.max(0, billableWeightKg - matchingRateCard.baseWeightKg);
  const extraWeightCharge = Number((extraWeight * matchingRateCard.additionalPerKgRate).toFixed(2));

  // 6. COD Surcharge Computation
  let codSurcharge = 0;
  if (paymentType === 'COD') {
    const codConfig = codConfigs.find((c) => c.orderType === orderType) || {
      orderType,
      surchargeType: 'FLAT',
      surchargeValue: 30.0,
      minSurcharge: 30.0,
    };

    if (codConfig.surchargeType === 'FLAT') {
      codSurcharge = codConfig.surchargeValue;
    } else {
      const calcPerc = (codDeclaredValue * codConfig.surchargeValue) / 100;
      codSurcharge = Math.max(calcPerc, codConfig.minSurcharge);
    }
  }
  codSurcharge = Number(codSurcharge.toFixed(2));

  // 7. Nominal Handling / Security fee
  const handlingFee = orderType === 'B2B' ? 30.0 : 10.0;

  // 8. Total
  const totalCharge = Number(
    (baseFreightCharge + extraWeightCharge + codSurcharge + handlingFee).toFixed(2)
  );

  const dimensions: OrderDimensions = {
    lengthCm,
    breadthCm,
    heightCm,
    actualWeightKg: actualWeight,
    volumetricWeightKg,
    billableWeightKg,
  };

  const charges: ChargeBreakdown = {
    billableWeightKg,
    volumetricWeightKg,
    actualWeightKg: actualWeight,
    weightBasis,
    zoneRelation,
    pickupZoneName: pickupZone.name,
    dropZoneName: dropZone.name,
    baseFreightCharge,
    extraWeightCharge,
    codSurcharge,
    handlingFee,
    totalCharge,
  };

  return {
    dimensions,
    charges,
    pickupZone,
    dropZone,
    rateCard: matchingRateCard,
    estimatedDeliveryHours: matchingRateCard.estimatedDeliveryHours,
  };
}
