/**
 * Czy się zmieści? (FitCheck) — Reguła RD-34: Obrót mebla na klatce schodowej i spoczniku (Moving Sofa Heuristic)
 */

export interface StaircaseLandingSpecs {
  readonly flightWidthMm: number; // Szerokość biegu schodów W1
  readonly landingDepthMm: number; // Głębokość spocznika W2
  readonly ceilingHeightMm: number; // Wysokość do sufitu lub skosu
  readonly turnAngleDeg: 90 | 180; // Kształt zakrętu (L = 90°, U = 180°)
  readonly hasHandrailObstruction: boolean; // Czy poręcz zwęża bieg
  readonly handrailWidthMm?: number; // O ile poręcz zwęża bieg (domyślnie 80 mm)
}

export interface StaircaseRotationResult {
  readonly canTurnHorizontally: boolean;
  readonly canTurnWithVerticalTilt: boolean;
  readonly requiredTiltAngleDeg?: number;
  readonly canPass: boolean;
  readonly bottleneckDescription: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const STAIRCASE_SAFETY_MARGIN_MM = 50;

export function evaluateStaircaseLandingTurn(
  itemDimensionsMm: { readonly lengthMm: number; readonly widthMm: number; readonly heightMm: number },
  landingSpecs: StaircaseLandingSpecs
): StaircaseRotationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const handrailDeduction = landingSpecs.hasHandrailObstruction
    ? (landingSpecs.handrailWidthMm ?? 80)
    : 0;

  const effectiveFlightWidth = landingSpecs.flightWidthMm - handrailDeduction;
  const effectiveLandingDepth = landingSpecs.landingDepthMm;

  const L = itemDimensionsMm.lengthMm;
  const W = itemDimensionsMm.widthMm;
  const H = itemDimensionsMm.heightMm;

  // Sprawdzenie, czy mebel w ogóle mieści się w biegu schodów
  const smallestCrossSection = Math.min(W, H);
  if (smallestCrossSection > effectiveFlightWidth - 2 * STAIRCASE_SAFETY_MARGIN_MM) {
    return {
      canTurnHorizontally: false,
      canTurnWithVerticalTilt: false,
      canPass: false,
      bottleneckDescription: 'Mebel jest zbyt szeroki na sam bieg schodowy',
      warnings: ['Szerokość mebla przekracza szerokość biegu schodów z uwzględnieniem poręczy i rąk'],
      recommendations: ['Wymagany demontaż poręczy lub transport zewnętrzny (balkon/okno)'],
    };
  }

  // Weryfikacja obrotu poziomego (2D)
  // W narożniku L (90°): uproszczony analityczny warunek dla prostopadłościanu
  // Suma rzutów przy kącie 45°: (L + W) * sqrt(2)/2 <= W1 + W2
  let canTurnHorizontally = false;
  if (landingSpecs.turnAngleDeg === 90) {
    // Przy obrocie 90° sprawdzamy czy mebel mieści się na spoczniku w pozycji pośredniej
    const maxDiagonalTurn = Math.hypot(L, W);
    const cornerClearance = Math.hypot(effectiveFlightWidth, effectiveLandingDepth);
    canTurnHorizontally = maxDiagonalTurn <= cornerClearance - STAIRCASE_SAFETY_MARGIN_MM &&
      W <= Math.min(effectiveFlightWidth, effectiveLandingDepth) - 2 * STAIRCASE_SAFETY_MARGIN_MM;
  } else {
    // Przy nawrocie U (180°): spocznik musi pomieścić całą długość mebla przy obrocie
    canTurnHorizontally = L <= effectiveLandingDepth - STAIRCASE_SAFETY_MARGIN_MM &&
      W <= effectiveFlightWidth - 2 * STAIRCASE_SAFETY_MARGIN_MM;
  }

  // Weryfikacja obrotu z przechyłem pionowym (pionizacja mebla pod kątem phi)
  let canTurnWithVerticalTilt = false;
  let requiredTiltAngleDeg: number | undefined;

  // Test kątów przechyłu od 30° do 85° z krokiem 5°
  for (let phi = 30; phi <= 85; phi += 5) {
    const rad = (phi * Math.PI) / 180;
    const projectedHeight = Math.sqrt(
      Math.pow(L * Math.sin(rad), 2) + Math.pow(H * Math.cos(rad), 2)
    );
    const projectedWidth = L * Math.cos(rad) + H * Math.sin(rad);

    if (
      projectedHeight <= landingSpecs.ceilingHeightMm - STAIRCASE_SAFETY_MARGIN_MM &&
      projectedWidth <= Math.max(effectiveFlightWidth, effectiveLandingDepth)
    ) {
      canTurnWithVerticalTilt = true;
      requiredTiltAngleDeg = phi;
      break;
    }
  }

  const canPass = canTurnHorizontally || canTurnWithVerticalTilt;

  let bottleneck = 'Brak kolizji — swobodne wniesienie';
  if (!canPass) {
    bottleneck = 'Zablokowanie na spoczniku — mebel zbyt długi przy zadanej wysokości sufitu';
    warnings.push('Mebel zaklinuje się między narożnikiem ściany a skosem sufitu');
    recommendations.push('Demontaż boczków, poduszek lub wnoszenie w pozycji całkowicie pionowej (jeśli sufit > długość mebla)');
  } else if (!canTurnHorizontally && canTurnWithVerticalTilt) {
    bottleneck = `Wymagana pionizacja mebla pod kątem ok. ${requiredTiltAngleDeg}° na spoczniku`;
    recommendations.push(`Na półpiętrze należy unieść przedni koniec mebla pod kątem ${requiredTiltAngleDeg}°`);
  }

  return {
    canTurnHorizontally,
    canTurnWithVerticalTilt,
    requiredTiltAngleDeg,
    canPass,
    bottleneckDescription: bottleneck,
    warnings,
    recommendations,
  };
}
