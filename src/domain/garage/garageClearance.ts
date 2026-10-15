/**
 * Czy się zmieści? (FitCheck) — Reguły RD-41, RD-42, RD-43: Wymiarowanie skrajni garażowej i wjazdów
 */

export interface VehicleDimensions {
  readonly bodyWidthMm: number; // Szerokość bez lusterek
  readonly widthWithMirrorsMm: number; // Szerokość z rozłożonymi lusterkami
  readonly widthWithFoldedMirrorsMm: number; // Szerokość ze złożonymi lusterkami
  readonly baseHeightMm: number;
  readonly tailgateMaxOpenHeightMm: number; // Maksymalna wysokość uniesionej klapy
}

export interface GarageSpecs {
  readonly gateWidthMm: number;
  readonly interiorWidthMm: number;
  readonly ceilingHeightMm: number;
  readonly gateRunnerHeightMm?: number; // Prowadnice bramy segmentowej
  readonly obstacleDistanceMm?: number; // Np. słup po stronie kierowcy
}

export interface GarageFitResult {
  readonly canEnterWithOpenMirrors: boolean;
  readonly canEnterWithFoldedMirrors: boolean;
  readonly entryMarginOpenMirrorsMm: number;
  readonly entryMarginFoldedMirrorsMm: number;
  readonly driverExitClearanceMm: number;
  readonly canDriverExitComfortably: boolean;
  readonly willTailgateHitCeiling: boolean;
  readonly tailgateCeilingMarginMm: number;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const DRIVER_EXIT_MIN_CLEARANCE_MM = 650; // Minimalna przestrzeń na 1. stopień zapadki drzwi
export const ENTRY_GATE_SAFETY_MARGIN_MM = 100; // Po 50 mm z każdej strony
export const DYNAMIC_BOUNCE_BUFFER_MM = 30; // Margines na kołysanie zawieszenia na progu

export function evaluateGarageFit(
  vehicle: VehicleDimensions,
  garage: GarageSpecs
): GarageFitResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const entryMarginOpen = garage.gateWidthMm - vehicle.widthWithMirrorsMm;
  const entryMarginFolded = garage.gateWidthMm - vehicle.widthWithFoldedMirrorsMm;

  const canEnterWithOpenMirrors = entryMarginOpen >= ENTRY_GATE_SAFETY_MARGIN_MM;
  const canEnterWithFoldedMirrors = entryMarginFolded >= ENTRY_GATE_SAFETY_MARGIN_MM;

  if (!canEnterWithOpenMirrors) {
    if (canEnterWithFoldedMirrors) {
      warnings.push(`Zbyt wąska brama na rozłożone lusterka (luz jedynie ${entryMarginOpen} mm)`);
      recommendations.push('Złóż lusterka boczne przed wjazdem do garażu');
    } else {
      warnings.push(`Brama garażowa jest zbyt wąska nawet po złożeniu lusterek (brak ${Math.abs(entryMarginFolded)} mm)`);
    }
  }

  // Weryfikacja strefy wysiadania kierowcy
  let driverExitClearanceMm = 0;
  if (garage.obstacleDistanceMm !== undefined && garage.obstacleDistanceMm > 0) {
    driverExitClearanceMm = garage.obstacleDistanceMm;
  } else {
    // Symetryczne parkowanie wewnątrz
    const sideClearance = (garage.interiorWidthMm - vehicle.bodyWidthMm) / 2;
    driverExitClearanceMm = Math.max(0, sideClearance);
  }

  const canDriverExitComfortably = driverExitClearanceMm >= DRIVER_EXIT_MIN_CLEARANCE_MM;

  if (!canDriverExitComfortably) {
    warnings.push(
      `Zbyt ciasno na swobodne wysiadanie kierowcy (${driverExitClearanceMm} mm < wymagane ${DRIVER_EXIT_MIN_CLEARANCE_MM} mm)`
    );
    recommendations.push('Zaparkuj asymetrycznie bliżej prawej ściany, aby zyskać przestrzeń na otwarcie drzwi kierowcy');
  }

  // Weryfikacja uniesienia klapy bagażnika
  const effectiveCeiling = garage.gateRunnerHeightMm
    ? Math.min(garage.ceilingHeightMm, garage.gateRunnerHeightMm)
    : garage.ceilingHeightMm;

  const tailgateMargin = effectiveCeiling - vehicle.tailgateMaxOpenHeightMm;
  const willTailgateHitCeiling = tailgateMargin < 0;

  if (willTailgateHitCeiling) {
    warnings.push(
      `Uniesiona klapa bagażnika (${vehicle.tailgateMaxOpenHeightMm} mm) uderzy w sufit/prowadnicę bramy (${effectiveCeiling} mm) o ${Math.abs(tailgateMargin)} mm!`
    );
    recommendations.push('Zaprogramuj ogranicznik wysokości otwarcia elektrycznej klapy w menu pojazdu');
  }

  return {
    canEnterWithOpenMirrors,
    canEnterWithFoldedMirrors,
    entryMarginOpenMirrorsMm: entryMarginOpen,
    entryMarginFoldedMirrorsMm: entryMarginFolded,
    driverExitClearanceMm,
    canDriverExitComfortably,
    willTailgateHitCeiling,
    tailgateCeilingMarginMm: tailgateMargin,
    warnings,
    recommendations,
  };
}

export interface RoofSetupSpecs {
  readonly vehicleHeightMm: number;
  readonly roofBarsHeightMm: number;
  readonly roofCargoHeightMm: number; // Wysokość boxa dachowego lub rowerów
}

export interface UndergroundParkingCheckResult {
  readonly totalHeightMm: number;
  readonly totalHeightWithBounceMm: number;
  readonly canEnterSign190m: boolean;
  readonly canEnterSign200m: boolean;
  readonly canEnterSign210m: boolean;
  readonly marginForSign200mMm: number;
}

export function evaluateRoofSetupHeight(setup: RoofSetupSpecs): UndergroundParkingCheckResult {
  const totalRaw = setup.vehicleHeightMm + setup.roofBarsHeightMm + setup.roofCargoHeightMm;
  const totalWithBounce = totalRaw + DYNAMIC_BOUNCE_BUFFER_MM;

  return {
    totalHeightMm: totalRaw,
    totalHeightWithBounceMm: totalWithBounce,
    canEnterSign190m: totalWithBounce <= 1900,
    canEnterSign200m: totalWithBounce <= 2000,
    canEnterSign210m: totalWithBounce <= 2100,
    marginForSign200mMm: 2000 - totalWithBounce,
  };
}
