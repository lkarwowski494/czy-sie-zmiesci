/**
 * Czy się zmieści? (FitCheck) — Reguła RD-49: Szacowanie kubatury mienia przeprowadzkowego
 */

export type ClutterLevel = 'minimalist' | 'standard' | 'dense';

export interface RelocationEstimateInput {
  readonly floorAreaM2: number;
  readonly clutterLevel: ClutterLevel;
  readonly residentsCount: number;
}

export type RecommendedFleetType =
  | 'passenger_car_multiple_trips'
  | 'van_l1h1'
  | 'van_l2h2'
  | 'van_l3h2'
  | 'van_l4h3'
  | 'box_truck_with_lift';

export interface RelocationEstimateResult {
  readonly estimatedVolumeM3: number;
  readonly recommendedBoxesCount: number;
  readonly estimatedWeightKg: number;
  readonly recommendedFleetType: RecommendedFleetType;
  readonly fleetDescription: string;
  readonly recommendedSelfStorageAreaM2: number;
}

export const CLUTTER_COEFFICIENT: Record<ClutterLevel, number> = {
  minimalist: 0.25, // m³/m²
  standard: 0.40,
  dense: 0.55,
};

export const AVERAGE_WEIGHT_PER_M3_KG = 65; // Średnia gęstość domowego mienia z kartonami
export const STANDARD_CEILING_HEIGHT_STORAGE_M = 2.70;

export function estimateRelocationVolume(input: RelocationEstimateInput): RelocationEstimateResult {
  const baseCoeff = CLUTTER_COEFFICIENT[input.clutterLevel];
  const residentMultiplier = 1 + 0.15 * Math.max(0, input.residentsCount - 1);

  const rawVolume = input.floorAreaM2 * baseCoeff * residentMultiplier;
  const estimatedVolumeM3 = Math.round(rawVolume * 10) / 10;

  // Średnio 1.8 kartonu na 1 m³ mienia (reszta to bryły mebli)
  const recommendedBoxesCount = Math.ceil(estimatedVolumeM3 * 1.8);
  const estimatedWeightKg = Math.round(estimatedVolumeM3 * AVERAGE_WEIGHT_PER_M3_KG);

  let recommendedFleetType: RecommendedFleetType = 'van_l2h2';
  let fleetDescription = 'Furgon średni (L2H2, kubatura ok. 10.5 m³)';

  if (estimatedVolumeM3 <= 3) {
    recommendedFleetType = 'passenger_car_multiple_trips';
    fleetDescription = 'Własne kombi (2-3 kursy)';
  } else if (estimatedVolumeM3 <= 7.5) {
    recommendedFleetType = 'van_l1h1';
    fleetDescription = 'Furgon krótki (L1H1, kubatura ok. 7.5 m³)';
  } else if (estimatedVolumeM3 <= 11) {
    recommendedFleetType = 'van_l2h2';
    fleetDescription = 'Furgon średni (L2H2, kubatura ok. 10.5-11.5 m³)';
  } else if (estimatedVolumeM3 <= 14) {
    recommendedFleetType = 'van_l3h2';
    fleetDescription = 'Furgon długi (L3H2, kubatura ok. 13-14 m³)';
  } else if (estimatedVolumeM3 <= 18) {
    recommendedFleetType = 'van_l4h3';
    fleetDescription = 'Furgon superdługi (L4H3, kubatura ok. 17 m³)';
  } else {
    recommendedFleetType = 'box_truck_with_lift';
    fleetDescription = 'Kontener meblowy z windą (pojemność 20-22 m³, 8 europalet)';
  }

  // Dobór boksu magazynowego z uwzględnieniem 80% współczynnika upakowania pod sufit 2.7m
  const usableStorageHeight = STANDARD_CEILING_HEIGHT_STORAGE_M * 0.85;
  const recommendedStorageArea = Math.ceil((estimatedVolumeM3 / usableStorageHeight) * 2) / 2; // Do 0.5 m²

  return {
    estimatedVolumeM3,
    recommendedBoxesCount,
    estimatedWeightKg,
    recommendedFleetType,
    fleetDescription,
    recommendedSelfStorageAreaM2: Math.max(1.0, recommendedStorageArea),
  };
}
