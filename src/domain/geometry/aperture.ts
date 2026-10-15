/**
 * Czy się zmieści? (FitCheck) — Reguła RD-03: Weryfikacja przejścia przez światło otworu załadunkowego klapy
 */

export interface ApertureSpecs {
  readonly widthMm: number;
  readonly heightMm: number;
  readonly thresholdHeightMm: number;
}

export interface ApertureClearanceResult {
  readonly canPassThroughAperture: boolean;
  readonly optimalOrientation: 'LENGTHWISE' | 'WIDTHWISE' | 'HEIGHTWISE';
  readonly minRequiredWidthMm: number;
  readonly minRequiredHeightMm: number;
  readonly marginWidthMm: number;
  readonly marginHeightMm: number;
  readonly warnings: readonly string[];
}

export const APERTURE_SAFETY_BUFFER_MM = 15; // Luz manewrowy przy wkładaniu do bagażnika

export function evaluateAperturePassage(
  itemDimensionsMm: { readonly lengthMm: number; readonly widthMm: number; readonly heightMm: number },
  aperture: ApertureSpecs
): ApertureClearanceResult {
  const warnings: string[] = [];

  const dims = [
    itemDimensionsMm.lengthMm,
    itemDimensionsMm.widthMm,
    itemDimensionsMm.heightMm,
  ].sort((a, b) => a - b);

  // Trzy możliwe rzuty 2D przy wsuwaniu prostopadle do otworu:
  // 1. Wsuwanie wzdłuż najdłuższego boku: przekrój = [dims[0], dims[1]]
  // 2. Wsuwanie wzdłuż średniego boku: przekrój = [dims[0], dims[2]]
  // 3. Wsuwanie wzdłuż najkrótszego boku: przekrój = [dims[1], dims[2]]

  const passesProjection = (w: number, h: number) => {
    // Sprawdzamy orientację poziomą i pionową w otworze
    const fitsNormal = (w + APERTURE_SAFETY_BUFFER_MM <= aperture.widthMm) &&
                       (h + APERTURE_SAFETY_BUFFER_MM <= aperture.heightMm);
    const fitsFlipped = (h + APERTURE_SAFETY_BUFFER_MM <= aperture.widthMm) &&
                        (w + APERTURE_SAFETY_BUFFER_MM <= aperture.heightMm);
    return fitsNormal || fitsFlipped;
  };

  // Najmniejszy przekrój czołowy to dims[0] x dims[1] (wsuwanie wzdłuż najdłuższej krawędzi)
  const canPassLengthwise = passesProjection(dims[0], dims[1]);
  const canPassWidthwise = passesProjection(dims[0], dims[2]);
  const canPassHeightwise = passesProjection(dims[1], dims[2]);

  const canPassThroughAperture = canPassLengthwise || canPassWidthwise || canPassHeightwise;

  let optimalOrientation: 'LENGTHWISE' | 'WIDTHWISE' | 'HEIGHTWISE' = 'LENGTHWISE';
  let minW = dims[0];
  let minH = dims[1];

  if (!canPassThroughAperture) {
    warnings.push(
      `Przedmiot nie przejdzie przez otwór klapy (${aperture.widthMm} x ${aperture.heightMm} mm) — najmniejszy przekrój czołowy to ${dims[0]} x ${dims[1]} mm + ${APERTURE_SAFETY_BUFFER_MM} mm luzu`
    );
  }

  const marginWidth = aperture.widthMm - (minW + APERTURE_SAFETY_BUFFER_MM);
  const marginHeight = aperture.heightMm - (minH + APERTURE_SAFETY_BUFFER_MM);

  return {
    canPassThroughAperture,
    optimalOrientation,
    minRequiredWidthMm: minW + APERTURE_SAFETY_BUFFER_MM,
    minRequiredHeightMm: minH + APERTURE_SAFETY_BUFFER_MM,
    marginWidthMm: marginWidth,
    marginHeightMm: marginHeight,
    warnings,
  };
}
