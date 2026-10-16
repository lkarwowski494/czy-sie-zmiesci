/**
 * Czy się zmieści? (FitCheck) — Moduł Bagażnika Dachowego, Zwisów Ładunku i Nośności Podłogi
 * Zgodność z normami RD-45, RD-47, RD-52, art. 61 ust. 6 PoRD oraz decyzjami DEC-52, DEC-54, DEC-55.
 */

export interface RoofRackSpecs {
  readonly roofRailLimitKg: number;    // Dopuszczalna nośność relingów wg homologacji (np. 50, 75, 100 kg)
  readonly crossbarsWeightKg: number;  // Masa własna belek poprzecznych (np. 5 kg)
  readonly crossbarsLimitKg?: number;  // Maksymalne obciążenie samych belek (opcjonalnie)
  readonly roofBoxWeightKg: number;    // Masa pustego boxa dachowego lub uchwytu rowerowego (np. 18 kg)
  readonly cargoItemsWeightKg: number; // Suma wag bagaży/sprzętu włożonego do boxa
}

export interface RoofRackLoadResult {
  readonly effectiveLimitKg: number;
  readonly totalMountedWeightKg: number;
  readonly maxUsableCargoPayloadKg: number;
  readonly remainingCapacityKg: number;
  readonly overloadKg: number;
  readonly isOverloaded: boolean;
  readonly capacityUtilizationPct: number;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export interface CargoOverhangSpecs {
  readonly vehicleLengthMm: number;
  readonly vehicleWidthMm: number;
  readonly frontOverhangMm: number;           // Zwis z przodu poza przedni obrys zderzaka (mm)
  readonly rearOverhangMm: number;            // Zwis z tyłu poza tylny obrys zderzaka (mm)
  readonly sideProtrusionLeftMm: number;      // Wystawanie poza obrys lewego boku auta (mm)
  readonly sideProtrusionRightMm: number;     // Wystawanie poza obrys prawego boku auta (mm)
  readonly distanceFromDriverSeatToFrontMm?: number; // Odległość od oparcia fotela do przodu auta (domyślnie 1500 mm)
}

export interface CargoOverhangResult {
  readonly isLegal: boolean;
  readonly totalVehicleWithCargoLengthMm: number;
  readonly totalVehicleWithCargoWidthMm: number;
  readonly frontOverhangMm: number;
  readonly rearOverhangMm: number;
  readonly maxFrontOverhangAllowedMm: number;
  readonly maxRearOverhangAllowedMm: number;
  readonly maxOverallWidthAllowedMm: number;
  readonly isFrontOverhangLegal: boolean;
  readonly isRearOverhangLegal: boolean;
  readonly isSideProtrusionLegal: boolean;
  readonly isTotalWidthLegal: boolean;
  readonly violations: readonly string[];
  readonly requiredMarkings: readonly string[];
  readonly legalReference: string;
}

export interface FalseFloorLoadSpecs {
  readonly hasModularFalseFloor: boolean;
  readonly maxFloorRatingKg?: number; // Domyślnie 120 kg wg RD-47
  readonly cargoWeightKg: number;
  readonly isPointLoadConcentrated?: boolean; // Np. cement, glazura, hantle
}

export interface FalseFloorLoadResult {
  readonly isSafe: boolean;
  readonly maxAllowedKg: number;
  readonly excessWeightKg: number;
  readonly warningRisk: 'NONE' | 'MODERATE' | 'CRITICAL_COLLAPSE';
  readonly advice: string;
}

export const LEGAL_MAX_REAR_OVERHANG_MM = 2000;  // 2.0 m wg art. 61 ust. 6 pkt 2 PoRD
export const LEGAL_MAX_FRONT_OVERHANG_MM = 500;   // 0.5 m wg art. 61 ust. 6 pkt 1 PoRD
export const LEGAL_MAX_DRIVER_DIST_MM = 1500;     // 1.5 m od siedzenia kierowcy
export const LEGAL_MAX_SIDE_PROTRUSION_MM = 230;  // 23 cm z każdej strony
export const LEGAL_MAX_TOTAL_WIDTH_MM = 2550;     // 2.55 m dopuszczalna szerokość zespołu
export const DEFAULT_MODULAR_FLOOR_LIMIT_KG = 120; // 120 kg wg RD-47

/**
 * Oblicza nośność i bilans masy zestawu dachowego wg RD-52 i DEC-55.
 */
export function calculateRoofRackLoad(specs: RoofRackSpecs): RoofRackLoadResult {
  if (specs.roofRailLimitKg <= 0 || specs.crossbarsWeightKg < 0 || specs.roofBoxWeightKg < 0 || specs.cargoItemsWeightKg < 0) {
    throw new Error('Wartości masy i limitów muszą być nieujemne (limit dachu dodatni)');
  }

  const effectiveLimit = Math.min(
    specs.roofRailLimitKg,
    specs.crossbarsLimitKg !== undefined && specs.crossbarsLimitKg > 0
      ? specs.crossbarsLimitKg
      : specs.roofRailLimitKg
  );

  const totalMounted = specs.crossbarsWeightKg + specs.roofBoxWeightKg + specs.cargoItemsWeightKg;
  const maxUsableCargo = Math.max(0, effectiveLimit - specs.crossbarsWeightKg - specs.roofBoxWeightKg);
  const remaining = Math.max(0, effectiveLimit - totalMounted);
  const overload = Math.max(0, totalMounted - effectiveLimit);
  const isOverloaded = overload > 0;

  const utilizationPct = Math.round((totalMounted / effectiveLimit) * 100);

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (isOverloaded) {
    warnings.push(
      `PRZECIĄŻENIE DACHU O ${Math.round(overload * 10) / 10} KG! (Całkowita masa ${totalMounted} kg > limit ${effectiveLimit} kg)`
    );
    recommendations.push(
      `Przełóż najcięższe przedmioty (${Math.round(overload * 10) / 10} kg) z boxa dachowego na dno bagażnika samochodowego.`
    );
  } else if (utilizationPct > 85) {
    warnings.push(`Uwaga: wykorzystano ${utilizationPct}% nośności dachu. Zwiększona podatność na boczny wiatr.`);
  }

  if (specs.cargoItemsWeightKg > maxUsableCargo * 0.85 && !isOverloaded) {
    recommendations.push('Zbliżasz się do dopuszczalnej ładowności netto boxa.');
  }

  return {
    effectiveLimitKg: effectiveLimit,
    totalMountedWeightKg: totalMounted,
    maxUsableCargoPayloadKg: maxUsableCargo,
    remainingCapacityKg: Math.round(remaining * 10) / 10,
    overloadKg: Math.round(overload * 10) / 10,
    isOverloaded,
    capacityUtilizationPct: utilizationPct,
    warnings,
    recommendations,
  };
}

/**
 * Weryfikuje zgodność zwisów ładunku z przepisami art. 61 ust. 6 PoRD (RD-45, DEC-54).
 */
export function validateCargoOverhang(specs: CargoOverhangSpecs): CargoOverhangResult {
  if (specs.vehicleLengthMm <= 0 || specs.vehicleWidthMm <= 0) {
    throw new Error('Wymiary pojazdu muszą być dodatnie');
  }

  const safeFront = Math.max(0, specs.frontOverhangMm);
  const safeRear = Math.max(0, specs.rearOverhangMm);
  const safeLeft = Math.max(0, specs.sideProtrusionLeftMm);
  const safeRight = Math.max(0, specs.sideProtrusionRightMm);

  const totalLength = specs.vehicleLengthMm + safeFront + safeRear;
  const totalWidth = specs.vehicleWidthMm + safeLeft + safeRight;

  const driverSeatDist = specs.distanceFromDriverSeatToFrontMm ?? LEGAL_MAX_DRIVER_DIST_MM;
  const isFrontSeatDistOk = safeFront <= driverSeatDist;
  const isFrontOk = safeFront <= LEGAL_MAX_FRONT_OVERHANG_MM && isFrontSeatDistOk;
  const isRearOk = safeRear <= LEGAL_MAX_REAR_OVERHANG_MM;
  const isSideOk = safeLeft <= LEGAL_MAX_SIDE_PROTRUSION_MM && safeRight <= LEGAL_MAX_SIDE_PROTRUSION_MM;
  const isWidthOk = totalWidth <= LEGAL_MAX_TOTAL_WIDTH_MM;

  const violations: string[] = [];
  const requiredMarkings: string[] = [];

  if (!isFrontOk) {
    if (safeFront > LEGAL_MAX_FRONT_OVERHANG_MM) {
      violations.push(
        `Zwis przedni (${safeFront} mm) przekracza dopuszczalne ${LEGAL_MAX_FRONT_OVERHANG_MM} mm (0.5 m) od zderzaka.`
      );
    }
    if (!isFrontSeatDistOk) {
      violations.push(
        `Ładunek wystaje z przodu dalej niż dopuszczalne ${driverSeatDist} mm od płaszczyzny fotela kierowcy.`
      );
    }
  }

  if (!isRearOk) {
    violations.push(
      `Zwis tylny (${safeRear} mm) przekracza dopuszczalne ${LEGAL_MAX_REAR_OVERHANG_MM} mm (2.0 m) za tylny obrys auta — ZAKAZ JAZDY!`
    );
  }

  if (!isSideOk) {
    violations.push(
      `Wystawanie boczne (${Math.max(safeLeft, safeRight)} mm) przekracza limit ${LEGAL_MAX_SIDE_PROTRUSION_MM} mm (23 cm) poza obrys boczny.`
    );
  }

  if (!isWidthOk) {
    violations.push(
      `Całkowita szerokość z ładunkiem (${totalWidth} mm) przekracza dopuszczalne ${LEGAL_MAX_TOTAL_WIDTH_MM} mm (2.55 m).`
    );
  }

  // Oznakowanie wg art. 61 ust. 8 i 9 PoRD
  if (safeRear > 500) {
    requiredMarkings.push(
      'Czerwona chorągiewka (min. 50×50 cm) na końcu ładunku lub biało-czerwone pasy (art. 61 ust. 8 PoRD).'
    );
    requiredMarkings.push(
      'W warunkach niedostatecznej widoczności: czerwone światło pozycyjne i czerwone światło odblaskowe na końcu ładunku.'
    );
  } else if (safeRear > 0) {
    requiredMarkings.push('Zalecane oznaczenie końca wystającego ładunku chorągiewką ostrzegawczą.');
  }

  if (safeFront > 0) {
    requiredMarkings.push(
      'Zwis przedni: chorągiewka pomarańczowa i białe światło odblaskowe przy ograniczonej widoczności.'
    );
  }

  const isLegal = isFrontOk && isRearOk && isSideOk && isWidthOk;

  return {
    isLegal,
    totalVehicleWithCargoLengthMm: totalLength,
    totalVehicleWithCargoWidthMm: totalWidth,
    frontOverhangMm: safeFront,
    rearOverhangMm: safeRear,
    maxFrontOverhangAllowedMm: LEGAL_MAX_FRONT_OVERHANG_MM,
    maxRearOverhangAllowedMm: LEGAL_MAX_REAR_OVERHANG_MM,
    maxOverallWidthAllowedMm: LEGAL_MAX_TOTAL_WIDTH_MM,
    isFrontOverhangLegal: isFrontOk,
    isRearOverhangLegal: isRearOk,
    isSideProtrusionLegal: isSideOk,
    isTotalWidthLegal: isWidthOk,
    violations,
    requiredMarkings,
    legalReference: 'Art. 61 ust. 6, 8 i 9 Ustawy z dnia 20 czerwca 1997 r. — Prawo o ruchu drogowym (Dz.U. z 2023 r. poz. 1047)',
  };
}

/**
 * Weryfikuje dopuszczalny nacisk punktowy na podwójną podłogę bagażnika (RD-47, DEC-52).
 */
export function evaluateFalseFloorLoad(specs: FalseFloorLoadSpecs): FalseFloorLoadResult {
  if (specs.cargoWeightKg < 0) {
    throw new Error('Masa ładunku nie może być ujemna');
  }

  if (!specs.hasModularFalseFloor) {
    return {
      isSafe: true,
      maxAllowedKg: 450,
      excessWeightKg: 0,
      warningRisk: 'NONE',
      advice: 'Ładunek oparty na fabrycznej stalowej podłodze nadwozia — pełna nośność bagażnika.',
    };
  }

  const limitKg = specs.maxFloorRatingKg ?? DEFAULT_MODULAR_FLOOR_LIMIT_KG;
  const isOverload = specs.cargoWeightKg > limitKg;
  const excess = Math.max(0, specs.cargoWeightKg - limitKg);

  if (isOverload) {
    return {
      isSafe: false,
      maxAllowedKg: limitKg,
      excessWeightKg: excess,
      warningRisk: 'CRITICAL_COLLAPSE',
      advice: `RYZYKO ZAŁAMANIA PÓŁKI! Masa ${specs.cargoWeightKg} kg przekracza dopuszczalne ${limitKg} kg modułowej podwójnej podłogi. Wyjmij ruchomą płytę podłogi i ułóż ciężar bezpośrednio na stalowym dnie.`,
    };
  }

  if (specs.isPointLoadConcentrated && specs.cargoWeightKg > limitKg * 0.7) {
    return {
      isSafe: true,
      maxAllowedKg: limitKg,
      excessWeightKg: 0,
      warningRisk: 'MODERATE',
      advice: 'Ciężki ładunek punktowy na podwójnej podłodze. Rozłóż ciężar za pomocą szerokiej deski lub maty, aby uniknąć pęknięcia szyn.',
    };
  }

  return {
    isSafe: true,
    maxAllowedKg: limitKg,
    excessWeightKg: 0,
    warningRisk: 'NONE',
    advice: `Bezpieczne obciążenie podłogi (${specs.cargoWeightKg} kg / ${limitKg} kg).`,
  };
}
