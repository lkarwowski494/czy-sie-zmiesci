/**
 * Czy się zmieści? (FitCheck) — Reguła RD-33 i RD-22: Przejście przez ościeżnicę drzwiową
 */

export interface DoorwaySpecs {
  readonly nominalWidthMm: number; // np. 800 mm dla drzwi "80"
  readonly doorSwingAngleDeg: number; // np. 90 lub 180
  readonly isDoorLeafRemovable: boolean; // Czy skrzydło można zdjąć z zawiasów
  readonly isHandleRemovable: boolean; // Czy klamkę można odkręcić
}

export interface DoorwayClearanceResult {
  readonly effectiveApertureWidthMm: number;
  readonly netClearanceWithHandsMm: number;
  readonly canPass: boolean;
  readonly smallestItemDimensionMm: number;
  readonly marginMm: number;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const OŚCIEŻNICA_WRĘB_MM = 20;
export const KLAMKA_WYSTAJE_MM = 60;
export const SKRZYDŁO_GRUBOŚĆ_MM = 45;
export const DŁOŃ_TRAGARZA_MM = 50; // Margines EN 1005-2 na dłonie (z każdej strony)

export function calculateDoorwayClearance(
  itemDimensionsMm: { readonly lengthMm: number; readonly widthMm: number; readonly heightMm: number },
  doorSpecs: DoorwaySpecs,
  requireHandClearance: boolean = true
): DoorwayClearanceResult {
  let effectiveWidth = doorSpecs.nominalWidthMm - OŚCIEŻNICA_WRĘB_MM;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Ograniczenie klamki
  if (!doorSpecs.isHandleRemovable && doorSpecs.doorSwingAngleDeg <= 90) {
    effectiveWidth -= KLAMKA_WYSTAJE_MM;
    warnings.push('Klamka wystaje na 60 mm w świetle przejścia');
    recommendations.push('Odkręcenie klamki na czas wnoszenia zwalnia 60 mm przestrzeni');
  }

  // Ograniczenie grubości skrzydła drzwiowego
  if (!doorSpecs.isDoorLeafRemovable && doorSpecs.doorSwingAngleDeg < 180) {
    effectiveWidth -= SKRZYDŁO_GRUBOŚĆ_MM;
    warnings.push('Skrzydło drzwi otwarte pod kątem < 180° zabiera 45 mm przejścia');
    recommendations.push('Zdjęcie skrzydła z zawiasów zwalnia 45 mm przestrzeni');
  }

  const handMarginTotal = requireHandClearance ? 2 * DŁOŃ_TRAGARZA_MM : 0;
  const netWidth = effectiveWidth - handMarginTotal;

  // Najmniejszy wymiar przekroju poprzecznego przedmiotu (przedmiot można wnieść w dowolnej orientacji)
  const sortedDims = [
    itemDimensionsMm.lengthMm,
    itemDimensionsMm.widthMm,
    itemDimensionsMm.heightMm,
  ].sort((a, b) => a - b);

  const smallestDim = sortedDims[0];
  const marginMm = netWidth - smallestDim;
  const canPass = marginMm >= 0;

  if (!canPass && effectiveWidth >= smallestDim && requireHandClearance) {
    warnings.push('Przedmiot zmieściłby się na styk, ale brakuje bezpiecznego luzu 50 mm na dłonie tragarzy');
    recommendations.push('Użyj pasów transportowych pod mebel, aby dłonie nie znajdowały się po bokach');
  }

  return {
    effectiveApertureWidthMm: effectiveWidth,
    netClearanceWithHandsMm: netWidth,
    canPass,
    smallestItemDimensionMm: smallestDim,
    marginMm,
    warnings,
    recommendations,
  };
}
