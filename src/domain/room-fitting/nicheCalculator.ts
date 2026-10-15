/**
 * Czy się zmieści? (FitCheck) — Reguła RD-36: Pasowanie szafy/mebla we wnękę ścienną
 */

export interface WallNicheSpecs {
  readonly widthTopMm: number;
  readonly widthMiddleMm: number;
  readonly widthBottomMm: number;
  readonly depthMm: number;
  readonly heightMm: number;
  readonly skirtingBoardThicknessMm: number; // Domyślnie 20 mm
  readonly hasSkirtingBoards: boolean;
  readonly radiatorProtrusionMm?: number; // Wystający kaloryfer
  readonly windowSillProtrusionMm?: number; // Wystający parapet
}

export interface NicheFitResult {
  readonly minimumWidthRawMm: number;
  readonly effectiveWidthAtFloorMm: number;
  readonly effectiveDepthMm: number;
  readonly fitsWidth: boolean;
  readonly fitsDepth: boolean;
  readonly fitsHeight: boolean;
  readonly fitsOverall: boolean;
  readonly marginWidthMm: number;
  readonly marginDepthMm: number;
  readonly marginHeightMm: number;
  readonly isSkirtingCollision: boolean;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const SKIRTING_DEFAULT_MM = 20;
export const PLUMBNESS_SAFETY_BUFFER_MM = 10;

export function evaluateNicheFit(
  furnitureDimensionsMm: { readonly widthMm: number; readonly depthMm: number; readonly heightMm: number },
  nicheSpecs: WallNicheSpecs
): NicheFitResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const minRawWidth = Math.min(
    nicheSpecs.widthTopMm,
    nicheSpecs.widthMiddleMm,
    nicheSpecs.widthBottomMm
  );

  const skirtingDeduction = nicheSpecs.hasSkirtingBoards
    ? 2 * nicheSpecs.skirtingBoardThicknessMm
    : 0;

  const effectiveWidthAtFloor = nicheSpecs.widthBottomMm - skirtingDeduction;

  // Efektywna głębokość z uwzględnieniem kaloryfera i parapetu
  let effectiveDepth = nicheSpecs.depthMm;
  if (nicheSpecs.radiatorProtrusionMm && nicheSpecs.radiatorProtrusionMm > 0) {
    effectiveDepth -= nicheSpecs.radiatorProtrusionMm;
    warnings.push(`Grzejnik wystaje na ${nicheSpecs.radiatorProtrusionMm} mm, ograniczając głębokość montażową`);
  }
  if (nicheSpecs.windowSillProtrusionMm && nicheSpecs.windowSillProtrusionMm > 0) {
    effectiveDepth -= nicheSpecs.windowSillProtrusionMm;
    warnings.push(`Parapet wystaje na ${nicheSpecs.windowSillProtrusionMm} mm w głąb wnęki`);
  }

  // Weryfikacja szerokości
  const isSkirtingCollision = nicheSpecs.hasSkirtingBoards && furnitureDimensionsMm.widthMm > effectiveWidthAtFloor;
  const effectiveUsableWidth = Math.min(minRawWidth - PLUMBNESS_SAFETY_BUFFER_MM, effectiveWidthAtFloor);

  const fitsWidth = furnitureDimensionsMm.widthMm <= effectiveUsableWidth;
  const fitsDepth = furnitureDimensionsMm.depthMm <= effectiveDepth;
  const fitsHeight = furnitureDimensionsMm.heightMm <= (nicheSpecs.heightMm - PLUMBNESS_SAFETY_BUFFER_MM);

  const fitsOverall = fitsWidth && fitsDepth && fitsHeight;

  const marginWidthMm = effectiveUsableWidth - furnitureDimensionsMm.widthMm;
  const marginDepthMm = effectiveDepth - furnitureDimensionsMm.depthMm;
  const marginHeightMm = (nicheSpecs.heightMm - PLUMBNESS_SAFETY_BUFFER_MM) - furnitureDimensionsMm.heightMm;

  if (isSkirtingCollision) {
    warnings.push(
      `Kolizja z listwami przypodłogowymi: mebel o szerokości ${furnitureDimensionsMm.widthMm} mm wymaga wycięcia listew (efektywna szerokość przy podłodze to ${effectiveWidthAtFloor} mm)`
    );
    recommendations.push('Podetnij listwy przypodłogowe pod kątem 90° na szerokość mebla lub wybierz model o 5-10 cm węższy');
  }

  if (!fitsDepth) {
    warnings.push(`Mebel wystaje poza wnękę o ${Math.abs(marginDepthMm)} mm`);
  }

  if (!fitsHeight) {
    warnings.push(`Mebel jest zbyt wysoki o ${Math.abs(marginHeightMm)} mm (wymagany min. 10 mm luzu pod sufitem na montaż)`);
  }

  return {
    minimumWidthRawMm: minRawWidth,
    effectiveWidthAtFloorMm: effectiveWidthAtFloor,
    effectiveDepthMm: effectiveDepth,
    fitsWidth,
    fitsDepth,
    fitsHeight,
    fitsOverall,
    marginWidthMm,
    marginDepthMm,
    marginHeightMm,
    isSkirtingCollision,
    warnings,
    recommendations,
  };
}
