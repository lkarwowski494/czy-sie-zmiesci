/**
 * Czy się zmieści? (FitCheck) — Moduł Dopasowania Klatek Kennelowych dla Psa do Bagażnika
 * Zgodność z regułą RD-46 i wymaganiem Z-184.
 * Weryfikuje styk skośnych ścian aluminiowej klatki kennelowej z profilem tylnej szyby i klapy.
 */

export interface DogKennelSpecs {
  readonly widthMm: number;        // Szerokość klatki
  readonly depthBottomMm: number; // Głębokość dna klatki (D_base)
  readonly depthTopMm: number;    // Głębokość górnego sufitu klatki (D_top)
  readonly heightMm: number;      // Wysokość klatki (H_cage)
  readonly rearBevelAngleDeg?: number; // Kąt ścięcia tylnej ściany (opcjonalny, wyliczany z (depthBottom - depthTop) / height)
}

export interface TrunkWindowProfile {
  readonly lengthFloorMm: number;      // Długość podłogi bagażnika
  readonly widthMinMm: number;         // Szerokość minimalna (między nadkolami)
  readonly heightApertureMm: number;   // Wysokość otworu załadunkowego klapy
  readonly heightAtSeatBackMm: number; // Wysokość pod dachem przy tylnej kanapie (Z_0)
  readonly windowSlopeAngleDeg: number;// Kąt nachylenia tylnej szyby (alpha_szyba, np. 30° - 45°)
  readonly safetyClearanceMm?: number; // Wymagany luz bezpieczeństwa (domyślnie 30 mm wg RD-46)
}

export interface DogKennelFitResult {
  readonly fitsInTrunk: boolean;
  readonly fitsWidth: boolean;
  readonly fitsFloorLength: boolean;
  readonly fitsHeightAtSeat: boolean;
  readonly fitsWindowSlope: boolean;
  readonly rearBevelAngleDeg: number;
  readonly maxCageHeightAllowedAtRearMm: number;
  readonly windowClearanceAtTopRearMm: number;
  readonly collisionPointMm?: { readonly yMm: number; readonly zMm: number };
  readonly marginWidthMm: number;
  readonly marginFloorMm: number;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const DEFAULT_KENNEL_SAFETY_CLEARANCE_MM = 30; // 30 mm luzu technologicznego przed szybą wg RD-46

/**
 * Oblicza kąt ścięcia ściany klatki kennelowej na podstawie głębokości dołu i góry.
 */
export function calculateKennelBevelAngle(depthBottomMm: number, depthTopMm: number, heightMm: number): number {
  if (heightMm <= 0) return 0;
  const deltaDepth = Math.max(0, depthBottomMm - depthTopMm);
  const tanBevel = deltaDepth / heightMm;
  const rad = Math.atan(tanBevel);
  return Math.round(((rad * 180) / Math.PI) * 10) / 10;
}

/**
 * Ocenia dopasowanie klatki kennelowej do profilu bagażnika i skosu szyby (RD-46).
 */
export function evaluateDogKennelFit(
  kennel: DogKennelSpecs,
  trunk: TrunkWindowProfile
): DogKennelFitResult {
  if (
    kennel.widthMm <= 0 ||
    kennel.depthBottomMm <= 0 ||
    kennel.depthTopMm <= 0 ||
    kennel.heightMm <= 0
  ) {
    throw new Error('Wymiary klatki kennelowej muszą być dodatnie');
  }

  if (kennel.depthTopMm > kennel.depthBottomMm) {
    throw new Error('Głębokość górna klatki nie może być większa niż dolna');
  }

  if (
    trunk.lengthFloorMm <= 0 ||
    trunk.widthMinMm <= 0 ||
    trunk.heightAtSeatBackMm <= 0 ||
    trunk.windowSlopeAngleDeg <= 0 ||
    trunk.windowSlopeAngleDeg >= 90
  ) {
    throw new Error('Parametry geometryczne bagażnika muszą być prawidłowe (kąt szyby w zakresie 0°-90°)');
  }

  const clearance = trunk.safetyClearanceMm ?? DEFAULT_KENNEL_SAFETY_CLEARANCE_MM;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const bevelAngle =
    kennel.rearBevelAngleDeg !== undefined
      ? kennel.rearBevelAngleDeg
      : calculateKennelBevelAngle(kennel.depthBottomMm, kennel.depthTopMm, kennel.heightMm);

  // 1. Sprawdzenie szerokości i długości podłogi
  const fitsWidth = kennel.widthMm <= trunk.widthMinMm;
  const fitsFloor = kennel.depthBottomMm <= trunk.lengthFloorMm;
  const fitsSeatHeight = kennel.heightMm <= trunk.heightAtSeatBackMm;

  const marginWidth = trunk.widthMinMm - kennel.widthMm;
  const marginFloor = trunk.lengthFloorMm - kennel.depthBottomMm;

  if (!fitsWidth) {
    warnings.push(`Klatka jest za szeroka: ${kennel.widthMm} mm > ${trunk.widthMinMm} mm między nadkolami.`);
  }

  if (!fitsFloor) {
    warnings.push(`Klatka jest za głęboka na podłodze: ${kennel.depthBottomMm} mm > ${trunk.lengthFloorMm} mm.`);
  }

  if (!fitsSeatHeight) {
    warnings.push(`Klatka jest wyższa niż sufit przy kanapie: ${kennel.heightMm} mm > ${trunk.heightAtSeatBackMm} mm.`);
  }

  // 2. Profil szyby tylnej (RD-46)
  // Szyba zaczyna się przy wysokości Z_0 przy kanapie lub opada w stronę klapy
  // Model wysokości szyby w punkcie y od kanapy: Z_window(y) = Z_0 - y * tan(alpha_szyba)
  const windowSlopeRad = (trunk.windowSlopeAngleDeg * Math.PI) / 180;
  const tanSlope = Math.tan(windowSlopeRad);

  // Sprawdzamy newralgiczny punkt: górny tylny rant klatki
  // Położenie y górnego tylnego rantu: y = depthTopMm (jeśli klatka przysunięta do kanapy)
  const yTopRear = kennel.depthTopMm;
  const windowHeightAtTopRear = trunk.heightAtSeatBackMm - yTopRear * tanSlope;

  // Dopuszczalna wysokość klatki w tym punkcie z uwzględnieniem buforu bezpieczeństwa
  const maxAllowedHeightAtTopRear = Math.max(0, windowHeightAtTopRear - clearance);
  const windowClearanceAtTopRear = Math.round(maxAllowedHeightAtTopRear - kennel.heightMm);

  let fitsWindow = windowClearanceAtTopRear >= 0;
  let collisionPoint: { yMm: number; zMm: number } | undefined;

  if (!fitsWindow) {
    // Obliczamy punkt kolizji
    collisionPoint = {
      yMm: yTopRear,
      zMm: Math.round(windowHeightAtTopRear),
    };
    warnings.push(
      `Kolizja górnego tylnego rantu klatki z szybą klapy bagażnika na wysokości ${Math.round(windowHeightAtTopRear / 10)} cm (brakuje ${Math.abs(windowClearanceAtTopRear)} mm luzu).`
    );

    if (bevelAngle < trunk.windowSlopeAngleDeg) {
      recommendations.push(
        `Wybierz klatkę ze skośną ścianą tylną o kącie ścięcia min. ${trunk.windowSlopeAngleDeg}° (obecna ma ${bevelAngle}°), aby ominąć skos szyby.`
      );
    } else {
      recommendations.push(
        `Zmniejsz wysokość klatki do max ${Math.round(maxAllowedHeightAtTopRear / 10)} cm lub wybierz model o płytszym dachu (${Math.round(kennel.depthTopMm / 10)} cm).`
      );
    }
  }

  const fitsInTrunk = fitsWidth && fitsFloor && fitsSeatHeight && fitsWindow;

  if (fitsInTrunk) {
    recommendations.push('Klatka pasuje idealnie z zachowaniem bezpiecznego odstępu od szyby.');
  }

  return {
    fitsInTrunk,
    fitsWidth,
    fitsFloorLength: fitsFloor,
    fitsHeightAtSeat: fitsSeatHeight,
    fitsWindowSlope: fitsWindow,
    rearBevelAngleDeg: bevelAngle,
    maxCageHeightAllowedAtRearMm: Math.round(maxAllowedHeightAtTopRear),
    windowClearanceAtTopRearMm: windowClearanceAtTopRear,
    collisionPointMm: collisionPoint,
    marginWidthMm: marginWidth,
    marginFloorMm: marginFloor,
    warnings,
    recommendations,
  };
}
