/**
 * Czy się zmieści? (FitCheck) — Reguły RD-37, RD-38, RD-39, RD-51: Wymiarowanie montażowe i wentylacja AGD
 */

export interface RefrigeratorSpecs {
  readonly widthMm: number;
  readonly depthMm: number;
  readonly heightMm: number;
  readonly distanceToSideWallMm: number;
  readonly doorSwingAngleDeg?: number;
}

export interface RefrigeratorClearanceResult {
  readonly effectiveDepthRequiredMm: number;
  readonly effectiveWidthRequiredMm: number;
  readonly canVentilateSafely: boolean;
  readonly canOpenFreezerDrawers: boolean;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const REFRIGERATOR_REAR_VENT_MM = 50;
export const REFRIGERATOR_SIDE_VENT_MM = 20;
export const FREEZER_DRAWER_MIN_ANGLE_DEG = 115;
export const FREEZER_DRAWER_MIN_WALL_DIST_MM = 80;

export function evaluateRefrigeratorFit(
  fridge: RefrigeratorSpecs,
  niche: { readonly widthMm: number; readonly depthMm: number; readonly heightMm: number }
): RefrigeratorClearanceResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const requiredDepth = fridge.depthMm + REFRIGERATOR_REAR_VENT_MM;
  const requiredWidth = fridge.widthMm + 2 * REFRIGERATOR_SIDE_VENT_MM;

  const canVentilateRear = niche.depthMm >= requiredDepth;
  const canVentilateSides = niche.widthMm >= requiredWidth;
  const canVentilateSafely = canVentilateRear && canVentilateSides;

  if (!canVentilateRear) {
    warnings.push(
      `Brak wymaganej dylatacji wentylacyjnej skraplacza z tyłu (wymagane min. ${REFRIGERATOR_REAR_VENT_MM} mm, jest ${Math.max(0, niche.depthMm - fridge.depthMm)} mm)`
    );
    recommendations.push('Odsunięcie lodówki od ściany chroni sprężarkę przed przegrzaniem i utratą gwarancji');
  }

  if (!canVentilateSides) {
    warnings.push(
      `Zbyt mały luz boczny (wymagane min. ${REFRIGERATOR_SIDE_VENT_MM} mm z każdej strony na cyrkulację powietrza)`
    );
  }

  // Sprawdzenie wysuwania szuflad zamrażarki
  const angle = fridge.doorSwingAngleDeg ?? (fridge.distanceToSideWallMm >= FREEZER_DRAWER_MIN_WALL_DIST_MM ? 120 : 90);
  const canOpenFreezerDrawers =
    angle >= FREEZER_DRAWER_MIN_ANGLE_DEG ||
    fridge.distanceToSideWallMm >= FREEZER_DRAWER_MIN_WALL_DIST_MM;

  if (!canOpenFreezerDrawers) {
    warnings.push(
      `Kąt otwarcia drzwi (${angle}°) przy odległości od ściany ${fridge.distanceToSideWallMm} mm blokuje pełne wysunięcie dolnych szuflad zamrażalnika`
    );
    recommendations.push(
      `Zwiększ odstęp zawiasu od prostopadłej ściany do min. ${FREEZER_DRAWER_MIN_WALL_DIST_MM} mm lub przełóż zawiasy drzwi na drugą stronę`
    );
  }

  return {
    effectiveDepthRequiredMm: requiredDepth,
    effectiveWidthRequiredMm: requiredWidth,
    canVentilateSafely,
    canOpenFreezerDrawers,
    warnings,
    recommendations,
  };
}

export interface WashingMachineSpecs {
  readonly catalogDepthMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface WashingMachineInstallationResult {
  readonly effectiveInstallationDepthMm: number;
  readonly canFitInEnclosure: boolean;
  readonly marginMm: number;
  readonly warnings: readonly string[];
}

export const WASHING_MACHINE_PLUMBING_BUFFER_MM = 80;
export const WASHING_MACHINE_DOOR_BULGE_MM = 35;

export function evaluateWashingMachineInstallation(
  machine: WashingMachineSpecs,
  enclosureDepthMm: number
): WashingMachineInstallationResult {
  const warnings: string[] = [];

  const effectiveDepth =
    machine.catalogDepthMm +
    WASHING_MACHINE_PLUMBING_BUFFER_MM +
    WASHING_MACHINE_DOOR_BULGE_MM;

  const marginMm = enclosureDepthMm - effectiveDepth;
  const canFitInEnclosure = marginMm >= 0;

  if (!canFitInEnclosure) {
    warnings.push(
      `Głębokość katalogowa ${machine.catalogDepthMm} mm po dodaniu przyłączy hydraulicznych (80 mm) i wypukłości drzwiczek (35 mm) wynosi ${effectiveDepth} mm i przekracza głębokość szafy (${enclosureDepthMm} mm)`
    );
  }

  return {
    effectiveInstallationDepthMm: effectiveDepth,
    canFitInEnclosure,
    marginMm,
    warnings,
  };
}
