/**
 * Czy się zmieści? (FitCheck) — Reguła RD-09 i SPRZ-03: Gabaryty Paczkomatów i automatów paczkowych
 */

export type LockerSize = 'A' | 'B' | 'C';

export interface LockerDimensionLimit {
  readonly size: LockerSize;
  readonly maxDimensionMm: {
    readonly heightMm: number;
    readonly widthMm: number;
    readonly lengthMm: number;
  };
  readonly maxWeightKg: number;
}

export interface ParcelValidationResult {
  readonly fits: boolean;
  readonly recommendedSize: LockerSize | null;
  readonly effectiveParcelDimensionsMm: {
    readonly heightMm: number;
    readonly widthMm: number;
    readonly lengthMm: number;
  };
  readonly marginForSizeAMm?: { readonly height: number; readonly width: number; readonly length: number };
  readonly marginForSizeBMm?: { readonly height: number; readonly width: number; readonly length: number };
  readonly marginForSizeCMm?: { readonly height: number; readonly width: number; readonly length: number };
  readonly warnings: readonly string[];
}

export const LOCKER_SAFETY_MARGIN_MM = 10; // Bufor na wybrzuszenie taśmy i zamek elektromagnetyczny (RD-09)

// Oficjalne wymiary InPost Paczkomat (wysokość x szerokość x długość)
export const INPOST_LOCKER_LIMITS: readonly LockerDimensionLimit[] = [
  {
    size: 'A',
    maxDimensionMm: { heightMm: 80, widthMm: 380, lengthMm: 640 },
    maxWeightKg: 25,
  },
  {
    size: 'B',
    maxDimensionMm: { heightMm: 190, widthMm: 380, lengthMm: 640 },
    maxWeightKg: 25,
  },
  {
    size: 'C',
    maxDimensionMm: { heightMm: 410, widthMm: 380, lengthMm: 640 },
    maxWeightKg: 25,
  },
];

export function validateInPostLocker(
  parcelDimensionsMm: { readonly heightMm: number; readonly widthMm: number; readonly lengthMm: number },
  weightKg: number
): ParcelValidationResult {
  const warnings: string[] = [];

  // Sortowanie wymiarów paczki od najmniejszego do największego:
  // w Paczkomacie krytyczna jest wysokość (najmniejszy wymiar skrytki)
  const sortedDims = [
    parcelDimensionsMm.heightMm,
    parcelDimensionsMm.widthMm,
    parcelDimensionsMm.lengthMm,
  ].sort((a, b) => a - b);

  // Zorientowanie paczki: [wysokość, szerokość, długość]
  const orientedParcel = {
    heightMm: sortedDims[0],
    widthMm: sortedDims[1],
    lengthMm: sortedDims[2],
  };

  // Dodanie marginesu technologicznego
  const effectiveParcel = {
    heightMm: orientedParcel.heightMm + LOCKER_SAFETY_MARGIN_MM,
    widthMm: orientedParcel.widthMm + LOCKER_SAFETY_MARGIN_MM,
    lengthMm: orientedParcel.lengthMm + LOCKER_SAFETY_MARGIN_MM,
  };

  if (weightKg > 25) {
    warnings.push(`Waga paczki (${weightKg} kg) przekracza maksymalny limit 25 kg`);
  }

  const checkSize = (limit: LockerDimensionLimit) => {
    return (
      effectiveParcel.heightMm <= limit.maxDimensionMm.heightMm &&
      effectiveParcel.widthMm <= limit.maxDimensionMm.widthMm &&
      effectiveParcel.lengthMm <= limit.maxDimensionMm.lengthMm &&
      weightKg <= limit.maxWeightKg
    );
  };

  const getMargin = (limit: LockerDimensionLimit) => ({
    height: limit.maxDimensionMm.heightMm - effectiveParcel.heightMm,
    width: limit.maxDimensionMm.widthMm - effectiveParcel.widthMm,
    length: limit.maxDimensionMm.lengthMm - effectiveParcel.lengthMm,
  });

  let recommendedSize: LockerSize | null = null;
  if (checkSize(INPOST_LOCKER_LIMITS[0])) {
    recommendedSize = 'A';
  } else if (checkSize(INPOST_LOCKER_LIMITS[1])) {
    recommendedSize = 'B';
  } else if (checkSize(INPOST_LOCKER_LIMITS[2])) {
    recommendedSize = 'C';
  }

  const fits = recommendedSize !== null;

  if (!fits) {
    warnings.push('Paczka przekracza wymiary maksymalnej skrytki Gabaryt C (41 x 38 x 64 cm) lub limit wagi 25 kg');
  }

  return {
    fits,
    recommendedSize,
    effectiveParcelDimensionsMm: effectiveParcel,
    marginForSizeAMm: getMargin(INPOST_LOCKER_LIMITS[0]),
    marginForSizeBMm: getMargin(INPOST_LOCKER_LIMITS[1]),
    marginForSizeCMm: getMargin(INPOST_LOCKER_LIMITS[2]),
    warnings,
  };
}
