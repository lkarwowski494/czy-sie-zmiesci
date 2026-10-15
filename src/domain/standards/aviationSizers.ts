/**
 * Czy się zmieści? (FitCheck) — Reguła RD-14 i SPRZ-04: Sizer lotniczy i bagaż podręczny
 */

export type AirlineCode = 'ryanair' | 'wizzair' | 'lot' | 'easyjet' | 'lufthansa';

export interface AirlineBaggageRule {
  readonly airline: AirlineCode;
  readonly airlineName: string;
  readonly smallFreeBagMm: { readonly length: number; readonly width: number; readonly height: number };
  readonly priorityCabinBagMm: { readonly length: number; readonly width: number; readonly height: number };
  readonly sizerToleranceMm: number; // Luz metalowego sizera na lotnisku (np. 15 mm)
}

export interface AviationSizerResult {
  readonly fitsFreeSmallBag: boolean;
  readonly fitsPriorityCabinBag: boolean;
  readonly airline: AirlineCode;
  readonly effectiveBagDimensionsMm: { readonly length: number; readonly width: number; readonly height: number };
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const SOFT_BAG_COMPRESSION_FACTOR = 0.90; // Miękka torba może skompresować się o 10% przy dopychaniu

export const AIRLINE_RULES: Record<AirlineCode, AirlineBaggageRule> = {
  ryanair: {
    airline: 'ryanair',
    airlineName: 'Ryanair',
    smallFreeBagMm: { length: 400, width: 250, height: 200 },
    priorityCabinBagMm: { length: 550, width: 400, height: 200 },
    sizerToleranceMm: 15,
  },
  wizzair: {
    airline: 'wizzair',
    airlineName: 'Wizz Air',
    smallFreeBagMm: { length: 400, width: 300, height: 200 },
    priorityCabinBagMm: { length: 550, width: 400, height: 230 },
    sizerToleranceMm: 10,
  },
  lot: {
    airline: 'lot',
    airlineName: 'PLL LOT',
    smallFreeBagMm: { length: 400, width: 350, height: 120 },
    priorityCabinBagMm: { length: 550, width: 400, height: 230 },
    sizerToleranceMm: 10,
  },
  easyjet: {
    airline: 'easyjet',
    airlineName: 'EasyJet',
    smallFreeBagMm: { length: 450, width: 360, height: 200 },
    priorityCabinBagMm: { length: 560, width: 450, height: 250 },
    sizerToleranceMm: 15,
  },
  lufthansa: {
    airline: 'lufthansa',
    airlineName: 'Lufthansa',
    smallFreeBagMm: { length: 400, width: 300, height: 100 },
    priorityCabinBagMm: { length: 550, width: 400, height: 230 },
    sizerToleranceMm: 10,
  },
};

export function validateAviationSizer(
  bagDimensionsMm: { readonly length: number; readonly width: number; readonly height: number },
  isSoftBag: boolean,
  airline: AirlineCode
): AviationSizerResult {
  const rule = AIRLINE_RULES[airline];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Posortowanie wymiarów torby od najdłuższego do najkrótszego
  const sorted = [bagDimensionsMm.length, bagDimensionsMm.width, bagDimensionsMm.height].sort((a, b) => b - a);

  let [L, W, H] = sorted;

  if (isSoftBag) {
    // Kompresja miękkiej torby
    L = Math.round(L * SOFT_BAG_COMPRESSION_FACTOR);
    W = Math.round(W * SOFT_BAG_COMPRESSION_FACTOR);
    H = Math.round(H * SOFT_BAG_COMPRESSION_FACTOR);
  } else {
    warnings.push('Walizka ze sztywną skorupą: kółka i rączki muszą bezwzględnie mieścić się w obrysie kosza');
  }

  const effectiveBag = { length: L, width: W, height: H };

  // Sprawdzenie darmowego małego bagażu
  const smallSorted = [rule.smallFreeBagMm.length, rule.smallFreeBagMm.width, rule.smallFreeBagMm.height].sort((a, b) => b - a);
  const fitsFreeSmallBag =
    L <= (smallSorted[0] + rule.sizerToleranceMm) &&
    W <= (smallSorted[1] + rule.sizerToleranceMm) &&
    H <= (smallSorted[2] + rule.sizerToleranceMm);

  // Sprawdzenie dużego bagażu podręcznego
  const prioSorted = [rule.priorityCabinBagMm.length, rule.priorityCabinBagMm.width, rule.priorityCabinBagMm.height].sort((a, b) => b - a);
  const fitsPriorityCabinBag =
    L <= (prioSorted[0] + rule.sizerToleranceMm) &&
    W <= (prioSorted[1] + rule.sizerToleranceMm) &&
    H <= (prioSorted[2] + rule.sizerToleranceMm);

  if (!fitsFreeSmallBag) {
    if (fitsPriorityCabinBag) {
      warnings.push(`Bagaż przekracza darmowy limit pod fotel (${rule.smallFreeBagMm.length/10}x${rule.smallFreeBagMm.width/10}x${rule.smallFreeBagMm.height/10} cm) w ${rule.airlineName}`);
      recommendations.push('Wykup opcję Priority / drugi bagaż kabinowy lub skompresuj zawartość');
    } else {
      warnings.push(`Bagaż przekracza również duży bagaż kabinowy (${rule.priorityCabinBagMm.length/10}x${rule.priorityCabinBagMm.width/10}x${rule.priorityCabinBagMm.height/10} cm)`);
      recommendations.push('Wymagane nadanie bagażu do luku (Check-in baggage) — opłata przy bramce do 250 zł');
    }
  }

  return {
    fitsFreeSmallBag,
    fitsPriorityCabinBag,
    airline,
    effectiveBagDimensionsMm: effectiveBag,
    warnings,
    recommendations,
  };
}
