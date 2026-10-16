/**
 * Czy się zmieści? (FitCheck) — Jednoczesna Weryfikacja Macierzowa (Multi-Checker Matrix)
 * Zgodność ze standardami automatów paczkowych i 10 linii lotniczych (BR-LOT-001, BR-LOT-002, BR-LOT-003, BR-LOT-004).
 */

export interface ParcelDimensions {
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly weightKg?: number;
  readonly isSoftBag?: boolean;
}

export type LockerNetwork = 'inpost' | 'orlen' | 'dpd' | 'pocztex';

export interface LockerCheckResult {
  readonly network: LockerNetwork;
  readonly networkName: string;
  readonly fits: boolean;
  readonly recommendedBox: string | null;
  readonly details: string;
  readonly maxWeightKg: number;
}

export type AirlineMatrixCode =
  | 'ryanair'
  | 'wizzair'
  | 'lot'
  | 'lufthansa'
  | 'easyjet'
  | 'klm'
  | 'airfrance'
  | 'british_airways'
  | 'norwegian'
  | 'sas';

export interface AirlineCheckResult {
  readonly code: AirlineMatrixCode;
  readonly name: string;
  readonly fitsSmallFree: boolean;
  readonly fitsPriorityCabin: boolean;
  readonly maxCabinWeightKg: number;
  readonly smallDimsLabel: string;
  readonly priorityDimsLabel: string;
  readonly advisory: string;
}

export interface MultiCheckerMatrixResult {
  readonly effectiveDimensionsMm: {
    readonly length: number;
    readonly width: number;
    readonly height: number;
  };
  readonly weightKg: number;
  readonly lockers: readonly LockerCheckResult[];
  readonly airlines: readonly AirlineCheckResult[];
  readonly totalLockersPassed: number;
  readonly totalAirlinesPassed: number;
}

const SOFT_COMPRESSION_RATIO = 0.9;

interface SingleLockerBoxLimit {
  readonly label: string;
  readonly heightMm: number;
  readonly widthMm: number;
  readonly lengthMm: number;
  readonly maxWeightKg: number;
}

const INPOST_BOXES: readonly SingleLockerBoxLimit[] = [
  { label: 'Gabaryt A', heightMm: 80, widthMm: 380, lengthMm: 640, maxWeightKg: 25 },
  { label: 'Gabaryt B', heightMm: 190, widthMm: 380, lengthMm: 640, maxWeightKg: 25 },
  { label: 'Gabaryt C', heightMm: 410, widthMm: 380, lengthMm: 640, maxWeightKg: 25 },
];

const ORLEN_BOXES: readonly SingleLockerBoxLimit[] = [
  { label: 'Gabaryt S', heightMm: 80, widthMm: 380, lengthMm: 600, maxWeightKg: 25 },
  { label: 'Gabaryt M', heightMm: 190, widthMm: 380, lengthMm: 600, maxWeightKg: 25 },
  { label: 'Gabaryt L', heightMm: 410, widthMm: 380, lengthMm: 600, maxWeightKg: 25 },
];

const POCZTEX_BOXES: readonly SingleLockerBoxLimit[] = [
  { label: 'Gabaryt S', heightMm: 90, widthMm: 380, lengthMm: 650, maxWeightKg: 20 },
  { label: 'Gabaryt M', heightMm: 190, widthMm: 380, lengthMm: 650, maxWeightKg: 20 },
  { label: 'Gabaryt L', heightMm: 420, widthMm: 380, lengthMm: 650, maxWeightKg: 20 },
];

const DPD_PICKUP_LIMIT: SingleLockerBoxLimit = {
  label: 'DPD Standard',
  heightMm: 300,
  widthMm: 400,
  lengthMm: 500,
  maxWeightKg: 31.5,
};

interface AirlineRuleConfig {
  readonly code: AirlineMatrixCode;
  readonly name: string;
  readonly smallFreeMm: { readonly l: number; readonly w: number; readonly h: number };
  readonly priorityMm: { readonly l: number; readonly w: number; readonly h: number };
  readonly maxCabinWeightKg: number;
}

export const POPULAR_10_AIRLINES: readonly AirlineRuleConfig[] = [
  {
    code: 'ryanair',
    name: 'Ryanair',
    smallFreeMm: { l: 400, w: 200, h: 250 },
    priorityMm: { l: 550, w: 400, h: 200 },
    maxCabinWeightKg: 10,
  },
  {
    code: 'wizzair',
    name: 'Wizz Air',
    smallFreeMm: { l: 400, w: 300, h: 200 },
    priorityMm: { l: 550, w: 400, h: 230 },
    maxCabinWeightKg: 10,
  },
  {
    code: 'lot',
    name: 'PLL LOT',
    smallFreeMm: { l: 400, w: 350, h: 120 },
    priorityMm: { l: 550, w: 400, h: 230 },
    maxCabinWeightKg: 8,
  },
  {
    code: 'lufthansa',
    name: 'Lufthansa',
    smallFreeMm: { l: 400, w: 300, h: 100 },
    priorityMm: { l: 550, w: 400, h: 230 },
    maxCabinWeightKg: 8,
  },
  {
    code: 'easyjet',
    name: 'EasyJet',
    smallFreeMm: { l: 450, w: 360, h: 200 },
    priorityMm: { l: 560, w: 450, h: 250 },
    maxCabinWeightKg: 15,
  },
  {
    code: 'klm',
    name: 'KLM',
    smallFreeMm: { l: 400, w: 300, h: 150 },
    priorityMm: { l: 550, w: 350, h: 250 },
    maxCabinWeightKg: 12,
  },
  {
    code: 'airfrance',
    name: 'Air France',
    smallFreeMm: { l: 400, w: 300, h: 150 },
    priorityMm: { l: 550, w: 350, h: 250 },
    maxCabinWeightKg: 12,
  },
  {
    code: 'british_airways',
    name: 'British Airways',
    smallFreeMm: { l: 400, w: 300, h: 150 },
    priorityMm: { l: 560, w: 450, h: 250 },
    maxCabinWeightKg: 23,
  },
  {
    code: 'norwegian',
    name: 'Norwegian',
    smallFreeMm: { l: 380, w: 300, h: 200 },
    priorityMm: { l: 550, w: 400, h: 230 },
    maxCabinWeightKg: 10,
  },
  {
    code: 'sas',
    name: 'SAS',
    smallFreeMm: { l: 400, w: 300, h: 150 },
    priorityMm: { l: 550, w: 400, h: 230 },
    maxCabinWeightKg: 8,
  },
];

/**
 * Sprawdza czy posortowane wymiary [min, med, max] mieszczą się w skrytce o posortowanych limitach.
 */
function fitsInLockerBox(
  sortedParcel: readonly [number, number, number],
  weightKg: number,
  box: SingleLockerBoxLimit
): boolean {
  const sortedBox = [box.heightMm, box.widthMm, box.lengthMm].sort((a, b) => a - b);
  return (
    sortedParcel[0] <= sortedBox[0] &&
    sortedParcel[1] <= sortedBox[1] &&
    sortedParcel[2] <= sortedBox[2] &&
    weightKg <= box.maxWeightKg
  );
}

/**
 * Sprawdza czy wymiary torby mieszczą się w sizerze w standardowej orientacji (dł x szer x wys).
 */
function fitsInAviationSizer(
  bagDims: { readonly l: number; readonly w: number; readonly h: number },
  limitMm: { readonly l: number; readonly w: number; readonly h: number }
): boolean {
  return (
    bagDims.l <= limitMm.l &&
    bagDims.w <= limitMm.w &&
    bagDims.h <= limitMm.h
  );
}

/**
 * Główna funkcja jednoczesnej ewaluacji macierzowej (BR-LOT-001).
 */
export function evaluateMultiCheckerMatrix(
  input: ParcelDimensions
): MultiCheckerMatrixResult {
  const weightKg = input.weightKg ?? 1.0;
  const isSoft = input.isSoftBag ?? false;

  // Uwzględnienie kompresji miękkiej torby
  const factor = isSoft ? SOFT_COMPRESSION_RATIO : 1.0;
  const effectiveBagDims = {
    l: Math.round(input.lengthMm * factor),
    w: Math.round(input.widthMm * factor),
    h: Math.round(input.heightMm * factor),
  };

  const rawDims = [effectiveBagDims.h, effectiveBagDims.w, effectiveBagDims.l];

  // Posortowane od najmniejszego do największego (dla skrytek paczkowych)
  const sorted = [...rawDims].sort((a, b) => a - b) as [number, number, number];

  // 1. Sprawdzenie automatów paczkowych
  const lockers: LockerCheckResult[] = [];

  // InPost
  let inpostBox: string | null = null;
  for (const b of INPOST_BOXES) {
    if (fitsInLockerBox(sorted, weightKg, b)) {
      inpostBox = b.label;
      break;
    }
  }
  lockers.push({
    network: 'inpost',
    networkName: 'InPost Paczkomat',
    fits: inpostBox !== null,
    recommendedBox: inpostBox,
    details: inpostBox ? `${inpostBox} (max 25 kg)` : 'Przekracza Gabaryt C (41×38×64 cm)',
    maxWeightKg: 25,
  });

  // Orlen Paczka
  let orlenBox: string | null = null;
  for (const b of ORLEN_BOXES) {
    if (fitsInLockerBox(sorted, weightKg, b)) {
      orlenBox = b.label;
      break;
    }
  }
  lockers.push({
    network: 'orlen',
    networkName: 'Orlen Paczka',
    fits: orlenBox !== null,
    recommendedBox: orlenBox,
    details: orlenBox ? `${orlenBox} (max 25 kg, dł. 60 cm)` : 'Przekracza Gabaryt L (41×38×60 cm)',
    maxWeightKg: 25,
  });

  // DPD Pickup
  const dpdFits = fitsInLockerBox(sorted, weightKg, DPD_PICKUP_LIMIT);
  lockers.push({
    network: 'dpd',
    networkName: 'DPD Pickup',
    fits: dpdFits,
    recommendedBox: dpdFits ? 'Skrytka DPD' : null,
    details: dpdFits ? 'Mieści się (max dł. 50 cm, 31,5 kg)' : 'Przekracza 50×40×30 cm lub 31,5 kg',
    maxWeightKg: 31.5,
  });

  // Pocztex
  let pocztexBox: string | null = null;
  for (const b of POCZTEX_BOXES) {
    if (fitsInLockerBox(sorted, weightKg, b)) {
      pocztexBox = b.label;
      break;
    }
  }
  lockers.push({
    network: 'pocztex',
    networkName: 'Pocztex Automat',
    fits: pocztexBox !== null,
    recommendedBox: pocztexBox,
    details: pocztexBox ? `${pocztexBox} (max 20 kg)` : 'Przekracza Gabaryt L (42×38×65 cm)',
    maxWeightKg: 20,
  });

  // 2. Sprawdzenie 10 linii lotniczych
  const airlines: AirlineCheckResult[] = [];
  for (const a of POPULAR_10_AIRLINES) {
    const fitsSmall = fitsInAviationSizer(effectiveBagDims, a.smallFreeMm);
    const dimsFitPriority = fitsInAviationSizer(effectiveBagDims, a.priorityMm);
    const weightFits = weightKg <= a.maxCabinWeightKg;
    const fitsPriority = dimsFitPriority && weightFits;

    let advisory = '';
    if (fitsSmall && weightFits) {
      advisory = 'Darmowy mały bagaż pod fotelem';
    } else if (fitsPriority) {
      advisory = `Wymaga taryfy Priority (max ${a.maxCabinWeightKg} kg)`;
    } else if (dimsFitPriority && !weightFits) {
      advisory = `Przekroczona waga podręczna (${weightKg} kg > ${a.maxCabinWeightKg} kg)`;
    } else {
      advisory = 'Wymaga nadania jako bagaż rejestrowany';
    }

    airlines.push({
      code: a.code,
      name: a.name,
      fitsSmallFree: fitsSmall && weightFits,
      fitsPriorityCabin: fitsPriority,
      maxCabinWeightKg: a.maxCabinWeightKg,
      smallDimsLabel: `${a.smallFreeMm.l / 10}×${a.smallFreeMm.w / 10}×${a.smallFreeMm.h / 10} cm`,
      priorityDimsLabel: `${a.priorityMm.l / 10}×${a.priorityMm.w / 10}×${a.priorityMm.h / 10} cm`,
      advisory,
    });
  }

  const totalLockersPassed = lockers.filter((l) => l.fits).length;
  const totalAirlinesPassed = airlines.filter((a) => a.fitsPriorityCabin).length;

  return {
    effectiveDimensionsMm: {
      length: rawDims[2],
      width: rawDims[1],
      height: rawDims[0],
    },
    weightKg,
    lockers,
    airlines,
    totalLockersPassed,
    totalAirlinesPassed,
  };
}
