/**
 * Czy się zmieści? (FitCheck) — Reguła RD-35: Przestrzenna przekątna kabiny windy
 */

export interface ElevatorCabinSpecs {
  readonly depthMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly doorWidthMm: number;
  readonly doorHeightMm: number;
}

export interface ElevatorFitResult {
  readonly spatialDiagonalMm: number;
  readonly maxRigidItemLengthMm: number;
  readonly fitsThroughDoor: boolean;
  readonly fitsInsideCabin: boolean;
  readonly marginMm: number;
  readonly warnings: readonly string[];
}

export const ELEVATOR_MANEUVER_MARGIN_MM = 50;

export function calculateElevatorFit(
  itemDimensionsMm: { readonly lengthMm: number; readonly widthMm: number; readonly heightMm: number },
  cabinSpecs: ElevatorCabinSpecs
): ElevatorFitResult {
  const warnings: string[] = [];

  // Obliczenie przekątnej przestrzennej 3D kabiny
  const diagonalRaw = Math.sqrt(
    Math.pow(cabinSpecs.depthMm, 2) +
    Math.pow(cabinSpecs.widthMm, 2) +
    Math.pow(cabinSpecs.heightMm, 2)
  );

  const maxRigidLength = Math.max(0, Math.floor(diagonalRaw - ELEVATOR_MANEUVER_MARGIN_MM));

  // Sortowanie wymiarów przedmiotu
  const sortedDims = [
    itemDimensionsMm.lengthMm,
    itemDimensionsMm.widthMm,
    itemDimensionsMm.heightMm,
  ].sort((a, b) => b - a);

  const longestDim = sortedDims[0];
  const middleDim = sortedDims[1];
  const smallestDim = sortedDims[2];

  // Sprawdzenie przejścia przez drzwi windy (przedmiot wnoszony po przekątnej drzwi)
  const doorDiagonal = Math.sqrt(
    Math.pow(cabinSpecs.doorWidthMm, 2) + Math.pow(cabinSpecs.doorHeightMm, 2)
  );
  const fitsThroughDoor = middleDim <= cabinSpecs.doorWidthMm || smallestDim <= cabinSpecs.doorWidthMm;

  if (!fitsThroughDoor) {
    warnings.push('Przedmiot jest zbyt szeroki, by przejść przez drzwi windy');
  }

  const fitsInsideCabin = longestDim <= maxRigidLength && fitsThroughDoor;
  const marginMm = maxRigidLength - longestDim;

  if (!fitsInsideCabin && longestDim > maxRigidLength) {
    warnings.push(
      `Długość ${longestDim} mm przekracza maksymalną przekątną manewrową windy (${maxRigidLength} mm)`
    );
  }

  return {
    spatialDiagonalMm: Math.round(diagonalRaw),
    maxRigidItemLengthMm: maxRigidLength,
    fitsThroughDoor,
    fitsInsideCabin,
    marginMm,
    warnings,
  };
}
