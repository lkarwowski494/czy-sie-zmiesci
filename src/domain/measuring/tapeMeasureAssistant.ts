/**
 * Czy się zmieści? (FitCheck) — Moduł Miarki i Kalibracji Pomiarów (BR-POM-001…BR-POM-004)
 * Zapewnia kalibrację ekranową PPI, obliczanie marginesów niepewności pomiarowej i konwersje jednostek.
 */

export type MeasurementTool =
  | 'LASER_METER'      // Dalmierz laserowy: niepewność ±0.5%
  | 'MANUAL_TAPE'     // Miarka taśmowa: niepewność ±1.0%
  | 'AR_LIDAR'        // LiDAR (iPhone Pro): niepewność ±2.0%
  | 'AR_CAMERA'       // Aparat bez LiDAR: niepewność ±5.0%
  | 'VISUAL_ESTIMATE'; // Szacunek wzrokowy: niepewność ±10.0%

export interface ToleranceBoundsMm {
  readonly minMm: number;
  readonly nominalMm: number;
  readonly maxMm: number; // Kluczowy dla "Czy się zmieści?" (wymiar konserwatywny)
  readonly uncertaintyPercentage: number;
}

export interface ReferenceObject {
  readonly id: string;
  readonly name: string;
  readonly lengthMm: number;
  readonly widthMm?: number;
  readonly description: string;
}

export const STANDARD_REFERENCE_OBJECTS: readonly ReferenceObject[] = [
  {
    id: 'credit_card',
    name: 'Karta Płatnicza (ISO/IEC 7810 ID-1)',
    lengthMm: 85.6,
    widthMm: 53.98,
    description: 'Standardowa karta bankomatowa lub dowód osobisty',
  },
  {
    id: 'a4_paper',
    name: 'Arkusz papieru A4 (ISO 216)',
    lengthMm: 297.0,
    widthMm: 210.0,
    description: 'Standardowa kartka ksero/biurowa',
  },
  {
    id: 'coin_5_pln',
    name: 'Moneta 5 PLN',
    lengthMm: 24.0,
    description: 'Średnica polskiej monety 5-złotowej',
  },
  {
    id: 'coin_2_eur',
    name: 'Moneta 2 EUR',
    lengthMm: 25.75,
    description: 'Średnica europejskiej monety 2 Euro',
  },
];

export const TOOL_UNCERTAINTY_MAP: Record<MeasurementTool, number> = {
  LASER_METER: 0.005,
  MANUAL_TAPE: 0.01,
  AR_LIDAR: 0.02,
  AR_CAMERA: 0.05,
  VISUAL_ESTIMATE: 0.1,
};

/**
 * Oblicza przedział niepewności pomiarowej wg wytycznych BR-POM-001.
 * Wartość maxMm jest kluczowa: reprezentuje najgorszy możliwy przypadek gabarytowy.
 */
export function calculateToleranceBounds(
  nominalMm: number,
  tool: MeasurementTool
): ToleranceBoundsMm {
  if (nominalMm <= 0) {
    throw new Error('Wymiar nominalny musi być liczbą dodatnią');
  }

  const rate = TOOL_UNCERTAINTY_MAP[tool];
  const delta = nominalMm * rate;

  return {
    minMm: Math.round((nominalMm - delta) * 10) / 10,
    nominalMm: Math.round(nominalMm * 10) / 10,
    maxMm: Math.round((nominalMm + delta) * 10) / 10,
    uncertaintyPercentage: rate * 100,
  };
}

/**
 * Walidator prawdopodobieństwa wymiarów fizycznych ładunków domowych i bagażu.
 */
export function validateMeasurementSanity(
  lengthMm: number,
  widthMm: number,
  heightMm: number
): { isValid: boolean; reason?: string } {
  if (lengthMm <= 0 || widthMm <= 0 || heightMm <= 0) {
    return { isValid: false, reason: 'Wszystkie wymiary muszą być ściśle dodatnie' };
  }

  // Wymiary powyżej 15 metrów (dopuszczalna dł. naczepy to 13.6 m)
  if (lengthMm > 15000 || widthMm > 4000 || heightMm > 4500) {
    return {
      isValid: false,
      reason: 'Wymiary przekraczają skrajnię transportową prawa drogowego (max 15 m x 4 m x 4.5 m)',
    };
  }

  return { isValid: true };
}

/**
 * Przelicza fizyczne milimetry na punkty ekranowe (Screen Points) dla zadanego zagęszczenia PPI.
 * Standard dla współczesnych iPhone'ów OLED: 460 PPI, scale factor 3.0 (153.33 pt/cal).
 */
export function calculateScreenPointsForMm(
  lengthMm: number,
  screenPpi: number = 460,
  displayScaleFactor: number = 3.0
): number {
  if (lengthMm < 0 || screenPpi <= 0 || displayScaleFactor <= 0) {
    throw new Error('Nieprawidłowe parametry ekranu lub wymiaru');
  }

  const inches = lengthMm / 25.4;
  const pixels = inches * screenPpi;
  const points = pixels / displayScaleFactor;
  return Math.round(points * 10) / 10;
}

/**
 * Konwersje jednostek metrycznych i imperialnych.
 */
export function convertLength(
  value: number,
  from: 'mm' | 'cm' | 'm' | 'in' | 'ft',
  to: 'mm' | 'cm' | 'm' | 'in' | 'ft'
): number {
  if (value < 0) {
    throw new Error('Długość nie może być ujemna');
  }

  // Najpierw do mm (baza)
  let inMm = 0;
  switch (from) {
    case 'mm':
      inMm = value;
      break;
    case 'cm':
      inMm = value * 10;
      break;
    case 'm':
      inMm = value * 1000;
      break;
    case 'in':
      inMm = value * 25.4;
      break;
    case 'ft':
      inMm = value * 304.8;
      break;
  }

  // Z mm do docelowej
  let target = 0;
  switch (to) {
    case 'mm':
      target = inMm;
      break;
    case 'cm':
      target = inMm / 10;
      break;
    case 'm':
      target = inMm / 1000;
      break;
    case 'in':
      target = inMm / 25.4;
      break;
    case 'ft':
      target = inMm / 304.8;
      break;
  }

  return Math.round(target * 100) / 100;
}
