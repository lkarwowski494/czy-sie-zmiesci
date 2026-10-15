/**
 * Czy się zmieści? (FitCheck) — Domenowe typy geometryczne
 * Wszystkie wymiary wewnętrzne jądra obliczeniowego przechowywane są w milimetrach (Integer arithmetic)
 * w celu uniknięcia błędów zaokrągleń zmiennoprzecinkowych (RYZ-15).
 */

export interface Dimensions3D {
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface Position3D {
  readonly xMm: number;
  readonly yMm: number;
  readonly zMm: number;
}

export type RotationConstraint = 'XYZ' | 'Z_ONLY' | 'NONE';

export interface CargoItem {
  readonly id: string;
  readonly name: string;
  readonly dimensionsMm: Dimensions3D;
  readonly weightKg: number;
  readonly rotationConstraint: RotationConstraint;
  readonly isFragile: boolean;
  readonly isSoft: boolean;
  readonly allowStacking: boolean;
}

export interface PackedPlacement {
  readonly itemId: string;
  readonly positionMm: Position3D;
  readonly orientedDimensionsMm: Dimensions3D;
  readonly sequenceOrder: number;
}

export interface TrunkGeometry {
  readonly lengthFloorMm: number;
  readonly lengthRoofMm: number;
  readonly widthMinMm: number; // Między nadkolami
  readonly widthMaxMm: number; // Za nadkolami
  readonly heightRoofMm: number;
  readonly heightShelfMm: number;
  readonly apertureWidthMm: number;
  readonly apertureHeightMm: number;
  readonly thresholdHeightMm: number;
}

export interface PackingResult {
  readonly isFullyPacked: boolean;
  readonly placements: readonly PackedPlacement[];
  readonly unplacedItems: readonly CargoItem[];
  readonly totalWeightKg: number;
  readonly usedVolumeMm3: number;
  readonly usableVolumeMm3: number;
  readonly packingEfficiencyPct: number;
}
