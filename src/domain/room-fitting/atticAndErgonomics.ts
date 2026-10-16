/**
 * Czy się zmieści? (FitCheck) — Moduł Geometrii Poddasza, Ergonomii Mebli i BHP Wnoszenia
 * Zgodność z regułami RD-48, RD-50, RD-51, RD-53 oraz decyzjami DEC-45, DEC-50, DEC-57.
 */

export interface AtticSlopeSpecs {
  readonly kneeWallHeightMm: number; // Wysokość ścianki kolankowej (H_k)
  readonly roofPitchDeg: number;      // Kąt nachylenia połaci dachu (alpha) w stopniach (0 < alpha < 90)
}

export interface AtticSlopeAnalysisResult {
  readonly kneeWallHeightMm: number;
  readonly roofPitchDeg: number;
  readonly roofPitchTan: number;
  readonly distanceToStandingHeight190Mm: number; // Odległość x od ścianki kolankowej do wysokości 1900 mm
  readonly distanceToLowZone140Mm: number;        // Odległość x od ścianki kolankowej do strefy niskiej 1400 mm
  readonly standingHeightAchievedAtWall: boolean;
  readonly heightAtDistance: (distanceMm: number) => number;
}

export interface FurnitureUnderSlopeCheck {
  readonly furnitureWidthMm: number;
  readonly furnitureDepthMm: number;
  readonly furnitureHeightMm: number;
  readonly distanceFromKneeWallMm: number;
  readonly ceilingHeightAtBackMm: number;
  readonly ceilingHeightAtFrontMm: number;
  readonly fitsUnderSlope: boolean;
  readonly minRequiredDistanceFromWallMm: number;
  readonly collisionDepthMm: number;
  readonly warnings: readonly string[];
}

export interface SelfStorageSpecs {
  readonly lengthM: number;
  readonly widthM: number;
  readonly heightM: number;
  readonly hasInspectionCorridor: boolean;
  readonly corridorWidthM?: number; // Domyślnie 0.50 m (500 mm) wg RD-50
}

export interface SelfStorageResult {
  readonly totalFloorAreaM2: number;
  readonly usableStorageAreaM2: number;
  readonly corridorAreaM2: number;
  readonly totalVolumeM3: number;
  readonly usableVolumeM3: number;
  readonly corridorLossPct: number;
}

export type FurnitureClearanceType =
  | 'HINGED_WARDROBE'  // Drzwi uchylne szafy (DEC-45: 700 mm)
  | 'CHEST_OF_DRAWERS' // Szuflada + stojący człowiek (DEC-45: 900 mm)
  | 'DINING_CHAIR'     // Odsunięcie krzesła (DEC-45: 750 mm)
  | 'DINING_PASSAGE'   // Odsunięcie krzesła z przejściem za plecami (1000 mm)
  | 'DISHWASHER'       // Otwarta klapa + osoba klęcząca (RD-51: 1050 mm)
  | 'BED_SIDE';        // Przejście obok łóżka (600 mm)

export interface FunctionalClearanceResult {
  readonly type: FurnitureClearanceType;
  readonly requiredClearanceMm: number;
  readonly availableClearanceMm: number;
  readonly marginMm: number;
  readonly isErgonomic: boolean;
  readonly label: string;
  readonly recommendation: string;
}

export interface PorterManualHandlingResult {
  readonly cargoWeightKg: number;
  readonly portersCount: number;
  readonly isOccasionalHandling: boolean; // Dorywcze (50 kg/os.) vs stałe (30 kg/os.)
  readonly maxAllowedTotalWeightKg: number;
  readonly weightPerPorterKg: number;
  readonly isCompliant: boolean;
  readonly recommendedMinPorters: number;
  readonly requiresMechanicalEquipment: boolean;
  readonly legalAdvisory: string;
}

export const RECOMMENDED_CLEARANCES_MM: Record<FurnitureClearanceType, { readonly requiredMm: number; readonly label: string }> = {
  HINGED_WARDROBE: {
    requiredMm: 700,
    label: 'Drzwi szafy uchylnej (skrzydło + dostęp)',
  },
  CHEST_OF_DRAWERS: {
    requiredMm: 900,
    label: 'Szuflady komody (pełny wysuw + stojący człowiek)',
  },
  DINING_CHAIR: {
    requiredMm: 750,
    label: 'Odsunięcie krzesła od stołu jadalnego',
  },
  DINING_PASSAGE: {
    requiredMm: 1000,
    label: 'Stół z krzesłem i ciągiem komunikacyjnym za plecami',
  },
  DISHWASHER: {
    requiredMm: 1050,
    label: 'Otwarta klapa zmywarki (650 mm) + osoba klęcząca (400 mm)',
  },
  BED_SIDE: {
    requiredMm: 600,
    label: 'Swobodne dojście do boku łóżka sypialnianego',
  },
};

/**
 * Analizuje geometrię skosów poddasza wg RD-48 i DEC-57.
 */
export function analyzeAtticSlope(specs: AtticSlopeSpecs): AtticSlopeAnalysisResult {
  if (specs.roofPitchDeg <= 0 || specs.roofPitchDeg >= 90) {
    throw new Error('Kąt nachylenia dachu musi mieścić się w przedziale (0°, 90°)');
  }
  if (specs.kneeWallHeightMm < 0) {
    throw new Error('Wysokość ścianki kolankowej nie może być ujemna');
  }

  const pitchRad = (specs.roofPitchDeg * Math.PI) / 180;
  const tanAlpha = Math.tan(pitchRad);

  const standingAchievedAtWall = specs.kneeWallHeightMm >= 1900;
  const lowZoneAchievedAtWall = specs.kneeWallHeightMm >= 1400;

  const dist190 = standingAchievedAtWall
    ? 0
    : Math.round(((1900 - specs.kneeWallHeightMm) / tanAlpha) * 10) / 10;

  const dist140 = lowZoneAchievedAtWall
    ? 0
    : Math.round(((1400 - specs.kneeWallHeightMm) / tanAlpha) * 10) / 10;

  return {
    kneeWallHeightMm: specs.kneeWallHeightMm,
    roofPitchDeg: specs.roofPitchDeg,
    roofPitchTan: Math.round(tanAlpha * 10000) / 10000,
    distanceToStandingHeight190Mm: dist190,
    distanceToLowZone140Mm: dist140,
    standingHeightAchievedAtWall: standingAchievedAtWall,
    heightAtDistance: (distMm: number) => {
      const safeDist = Math.max(0, distMm);
      return Math.round(specs.kneeWallHeightMm + safeDist * tanAlpha);
    },
  };
}

/**
 * Sprawdza czy mebel o zadanych wymiarach zmieści się pod skosem dachu (RD-48).
 */
export function evaluateFurnitureUnderSlope(
  furniture: { readonly widthMm: number; readonly depthMm: number; readonly heightMm: number },
  slope: AtticSlopeSpecs,
  distanceFromKneeWallMm: number
): FurnitureUnderSlopeCheck {
  if (furniture.heightMm <= 0 || furniture.depthMm <= 0 || furniture.widthMm <= 0) {
    throw new Error('Wymiary mebla muszą być dodatnie');
  }
  const safeDistance = Math.max(0, distanceFromKneeWallMm);
  const slopeAnalysis = analyzeAtticSlope(slope);

  const ceilingAtBack = slopeAnalysis.heightAtDistance(safeDistance);
  const ceilingAtFront = slopeAnalysis.heightAtDistance(safeDistance + furniture.depthMm);

  const minRequiredDistance = furniture.heightMm <= slope.kneeWallHeightMm
    ? 0
    : Math.ceil((furniture.heightMm - slope.kneeWallHeightMm) / slopeAnalysis.roofPitchTan);

  const fitsAtBack = ceilingAtBack >= furniture.heightMm;
  const fitsAtFront = ceilingAtFront >= furniture.heightMm;
  const fits = fitsAtBack && fitsAtFront;

  const warnings: string[] = [];
  if (!fitsAtBack) {
    const deficit = furniture.heightMm - ceilingAtBack;
    warnings.push(`Kolizja ze skosem dachu z tyłu mebla: brakuje ${deficit} mm.`);
  }
  if (safeDistance < minRequiredDistance) {
    warnings.push(
      `Aby zmieścić mebel o wysokości ${furniture.heightMm} mm, odsuń go o min. ${minRequiredDistance} mm od ścianki kolankowej.`
    );
  }

  const collisionDepth = fitsAtBack ? 0 : Math.max(0, minRequiredDistance - safeDistance);

  return {
    furnitureWidthMm: furniture.widthMm,
    furnitureDepthMm: furniture.depthMm,
    furnitureHeightMm: furniture.heightMm,
    distanceFromKneeWallMm: safeDistance,
    ceilingHeightAtBackMm: ceilingAtBack,
    ceilingHeightAtFrontMm: ceilingAtFront,
    fitsUnderSlope: fits,
    minRequiredDistanceFromWallMm: minRequiredDistance,
    collisionDepthMm: collisionDepth,
    warnings,
  };
}

/**
 * Oblicza powierzchnię i objętość boksu self-storage z korytarzem inspekcyjnym (RD-50, DEC-50).
 */
export function calculateSelfStorageCapacity(specs: SelfStorageSpecs): SelfStorageResult {
  if (specs.lengthM <= 0 || specs.widthM <= 0 || specs.heightM <= 0) {
    throw new Error('Wymiary boksu self-storage muszą być dodatnie');
  }

  const totalArea = Math.round(specs.lengthM * specs.widthM * 100) / 100;
  const corridorWidth = specs.hasInspectionCorridor ? (specs.corridorWidthM ?? 0.50) : 0;

  if (corridorWidth >= specs.widthM) {
    throw new Error('Szerokość korytarza nie może przekraczać szerokości boksu');
  }

  const usableWidth = specs.widthM - corridorWidth;
  const usableArea = Math.round(specs.lengthM * usableWidth * 100) / 100;
  const corridorArea = Math.round((totalArea - usableArea) * 100) / 100;

  const totalVolume = Math.round(totalArea * specs.heightM * 100) / 100;
  const usableVolume = Math.round(usableArea * specs.heightM * 100) / 100;

  const corridorLossPct = Math.round((corridorArea / totalArea) * 100);

  return {
    totalFloorAreaM2: totalArea,
    usableStorageAreaM2: usableArea,
    corridorAreaM2: corridorArea,
    totalVolumeM3: totalVolume,
    usableVolumeM3: usableVolume,
    corridorLossPct,
  };
}

/**
 * Ocenia ergonomię stref otwarcia mebli i przejść (RD-51, DEC-45).
 */
export function evaluateFunctionalClearance(
  type: FurnitureClearanceType,
  availableDistanceMm: number
): FunctionalClearanceResult {
  const standard = RECOMMENDED_CLEARANCES_MM[type];
  const marginMm = availableDistanceMm - standard.requiredMm;
  const isErgonomic = marginMm >= 0;

  let recommendation = '';
  if (isErgonomic) {
    recommendation = `Optymalna przestrzeń użytkowa (+${marginMm} mm zapasu ponad normę).`;
  } else {
    recommendation = `Zbyt wąska strefa: brakuje ${Math.abs(marginMm)} mm do swobodnego otwarcia/dostępu (${standard.requiredMm} mm).`;
  }

  return {
    type,
    requiredClearanceMm: standard.requiredMm,
    availableClearanceMm: availableDistanceMm,
    marginMm,
    isErgonomic,
    label: standard.label,
    recommendation,
  };
}

/**
 * Weryfikuje dopuszczalne limity ręcznego dźwigania przez tragarzy wg BHP i RD-53.
 */
export function evaluatePorterManualHandling(
  cargoWeightKg: number,
  portersCount: number,
  isOccasionalHandling: boolean = true
): PorterManualHandlingResult {
  if (cargoWeightKg <= 0 || portersCount <= 0) {
    throw new Error('Masa ładunku i liczba tragarzy muszą być dodatnie');
  }

  const limitPerManKg = isOccasionalHandling ? 50 : 30;
  const maxAllowedWeight = portersCount * limitPerManKg;
  const weightPerPorter = Math.round((cargoWeightKg / portersCount) * 10) / 10;
  const isCompliant = cargoWeightKg <= maxAllowedWeight;

  const recommendedPorters = Math.ceil(cargoWeightKg / limitPerManKg);
  const requiresMechanical = cargoWeightKg > 150 || recommendedPorters > 4;

  let advisory = '';
  if (isCompliant) {
    advisory = `Zgodne z BHP: obciążenie ${weightPerPorter} kg/os. mieści się w limicie ${limitPerManKg} kg/os.`;
  } else {
    advisory = `ZAKAZ WNOSZENIA: ${weightPerPorter} kg/os. przekracza dopuszczalne ${limitPerManKg} kg/os. Wymaga min. ${recommendedPorters} tragarzy.`;
  }

  if (requiresMechanical) {
    advisory += ' Ze względu na masę > 150 kg zalecany transport z użyciem schodołazu lub pasów nośnych.';
  }

  return {
    cargoWeightKg,
    portersCount,
    isOccasionalHandling,
    maxAllowedTotalWeightKg: maxAllowedWeight,
    weightPerPorterKg: weightPerPorter,
    isCompliant,
    recommendedMinPorters: recommendedPorters,
    requiresMechanicalEquipment: requiresMechanical,
    legalAdvisory: advisory,
  };
}
