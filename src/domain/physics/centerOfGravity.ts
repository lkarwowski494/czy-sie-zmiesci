/**
 * Czy się zmieści? (FitCheck) — Reguła RD-20: Wyznaczanie środka ciężkości (Center of Gravity — CoG)
 */

import { PackedPlacement, Position3D } from '../geometry/types';

export interface ItemWeightMap {
  readonly [itemId: string]: number; // Waga w kg
}

export interface CenterOfGravityResult {
  readonly centerOfGravityMm: Position3D;
  readonly totalWeightKg: number;
  readonly isLateralSymmetric: boolean; // Czy rozkład lewo/prawo jest zrównoważony
  readonly lateralOffsetMm: number; // Przesunięcie od osi środkowej w mm
  readonly isAxleLoadDangerous: boolean; // Czy środek masy jest zbyt blisko progu klapy
  readonly warnings: readonly string[];
}

export const MAX_LATERAL_OFFSET_TOLERANCE_MM = 150; // Dopuszczalna asymetria 15 cm od osi podłużnej
export const REAR_OVERHANG_DANGER_THRESHOLD_PCT = 0.75; // 75% długości bagażnika w stronę klapy

export function calculateCenterOfGravity(
  placements: readonly PackedPlacement[],
  itemWeights: ItemWeightMap,
  trunkGeometry: { readonly lengthFloorMm: number; readonly widthMaxMm: number; readonly heightRoofMm: number }
): CenterOfGravityResult {
  const warnings: string[] = [];

  if (placements.length === 0) {
    return {
      centerOfGravityMm: { xMm: 0, yMm: 0, zMm: 0 },
      totalWeightKg: 0,
      isLateralSymmetric: true,
      lateralOffsetMm: 0,
      isAxleLoadDangerous: false,
      warnings: [],
    };
  }

  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;

  for (const p of placements) {
    const weight = itemWeights[p.itemId] ?? 1.0;
    totalWeight += weight;

    // Środek geometryczny danej paczki
    const centerX = p.positionMm.xMm + p.orientedDimensionsMm.lengthMm / 2;
    const centerY = p.positionMm.yMm + p.orientedDimensionsMm.widthMm / 2;
    const centerZ = p.positionMm.zMm + p.orientedDimensionsMm.heightMm / 2;

    weightedX += weight * centerX;
    weightedY += weight * centerY;
    weightedZ += weight * centerZ;
  }

  if (totalWeight <= 0) {
    return {
      centerOfGravityMm: { xMm: 0, yMm: 0, zMm: 0 },
      totalWeightKg: 0,
      isLateralSymmetric: true,
      lateralOffsetMm: 0,
      isAxleLoadDangerous: false,
      warnings: [],
    };
  }

  const cogX = Math.round(weightedX / totalWeight);
  const cogY = Math.round(weightedY / totalWeight);
  const cogZ = Math.round(weightedZ / totalWeight);

  // Sprawdzenie symetrii bocznej (oś środkowa to widthMaxMm / 2)
  const trunkCenterY = trunkGeometry.widthMaxMm / 2;
  const lateralOffset = Math.abs(cogY - trunkCenterY);
  const isLateralSymmetric = lateralOffset <= MAX_LATERAL_OFFSET_TOLERANCE_MM;

  if (!isLateralSymmetric) {
    const side = cogY > trunkCenterY ? 'prawej' : 'lewej';
    warnings.push(
      `Asymetria rozkładu masy: ładunek mocniej dociąża samochód po ${side} stronie (przesunięcie o ${lateralOffset} mm)`
    );
  }

  // Sprawdzenie przeciążenia tylnej osi (CoG zbyt daleko w stronę progu bagażnika)
  const dangerThresholdX = trunkGeometry.lengthFloorMm * REAR_OVERHANG_DANGER_THRESHOLD_PCT;
  const isAxleLoadDangerous = cogX > dangerThresholdX;

  if (isAxleLoadDangerous) {
    warnings.push(
      `Środek ciężkości ładunku (${cogX} mm) znajduje się zbyt blisko tylnego zderzaka! Może to odciążyć przednią oś kierowaną i pogorszyć trakcję pojazdu`
    );
  }

  return {
    centerOfGravityMm: { xMm: cogX, yMm: cogY, zMm: cogZ },
    totalWeightKg: Math.round(totalWeight * 10) / 10,
    isLateralSymmetric,
    lateralOffsetMm: Math.round(lateralOffset),
    isAxleLoadDangerous,
    warnings,
  };
}
