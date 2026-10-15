/**
 * Czy się zmieści? (FitCheck) — Deterministyczny solver 3D Bin Packing oparty na punktach ekstremalnych (Extreme Points)
 */

import {
  CargoItem,
  Dimensions3D,
  PackedPlacement,
  PackingResult,
  Position3D,
  TrunkGeometry,
} from './types';

export const PACKING_GAP_MM = 10; // Luz technologiczny między paczkami (RD-04)

export function doesOverlap(
  posA: Position3D,
  dimA: Dimensions3D,
  posB: Position3D,
  dimB: Dimensions3D
): boolean {
  return (
    posA.xMm < posB.xMm + dimB.lengthMm &&
    posA.xMm + dimA.lengthMm > posB.xMm &&
    posA.yMm < posB.yMm + dimB.widthMm &&
    posA.yMm + dimA.widthMm > posB.yMm &&
    posA.zMm < posB.zMm + dimB.heightMm &&
    posA.zMm + dimA.heightMm > posB.zMm
  );
}

export function isInsideTrunkBoundary(
  pos: Position3D,
  dim: Dimensions3D,
  trunk: TrunkGeometry
): boolean {
  // Sprawdzenie wysokości
  if (pos.zMm + dim.heightMm > trunk.heightRoofMm) {
    return false;
  }

  // Sprawdzenie szerokości:
  // Jeśli paczka wystaje poza szerokość minimalną między nadkolami (widthMinMm),
  // może się zmieścić tylko przy założeniu, że nie koliduje z nadkolami
  const maxWidthAllowed = trunk.widthMaxMm;
  if (pos.yMm + dim.widthMm > maxWidthAllowed) {
    return false;
  }

  // Sprawdzenie długości z uwzględnieniem skosu szyby
  // Długość dostępna na danej wysokości zmaleje w stronę dachu:
  const heightRatio = (pos.zMm + dim.heightMm) / trunk.heightRoofMm;
  const currentMaxAllowedLength =
    trunk.lengthFloorMm - heightRatio * (trunk.lengthFloorMm - trunk.lengthRoofMm);

  if (pos.xMm + dim.lengthMm > currentMaxAllowedLength) {
    return false;
  }

  return true;
}

export function getOrientations(item: CargoItem): Dimensions3D[] {
  const d = item.dimensionsMm;
  if (item.rotationConstraint === 'NONE') {
    return [d];
  }

  if (item.rotationConstraint === 'Z_ONLY') {
    return [
      { lengthMm: d.lengthMm, widthMm: d.widthMm, heightMm: d.heightMm },
      { lengthMm: d.widthMm, widthMm: d.lengthMm, heightMm: d.heightMm },
    ];
  }

  // XYZ — 6 możliwych permutacji
  const uniqueKeys = new Set<string>();
  const perms: Dimensions3D[] = [];
  const raw = [
    [d.lengthMm, d.widthMm, d.heightMm],
    [d.lengthMm, d.heightMm, d.widthMm],
    [d.widthMm, d.lengthMm, d.heightMm],
    [d.widthMm, d.heightMm, d.lengthMm],
    [d.heightMm, d.lengthMm, d.widthMm],
    [d.heightMm, d.widthMm, d.lengthMm],
  ];

  for (const [l, w, h] of raw) {
    const key = `${l}x${w}x${h}`;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      perms.push({ lengthMm: l, widthMm: w, heightMm: h });
    }
  }

  return perms;
}

export function packItemsInTrunk(
  items: readonly CargoItem[],
  trunk: TrunkGeometry
): PackingResult {
  // Sortowanie Best-Fit Decreasing: najpierw ciężkie i o największej objętości
  const sortedItems = [...items].sort((a, b) => {
    // Crucial rule: fragile items go last (on top)
    if (a.isFragile && !b.isFragile) return 1;
    if (!a.isFragile && b.isFragile) return -1;

    const volA = a.dimensionsMm.lengthMm * a.dimensionsMm.widthMm * a.dimensionsMm.heightMm;
    const volB = b.dimensionsMm.lengthMm * b.dimensionsMm.widthMm * b.dimensionsMm.heightMm;
    return volB - volA;
  });

  const placements: PackedPlacement[] = [];
  const unplacedItems: CargoItem[] = [];

  // Lista punktów ekstremalnych
  let extremePoints: Position3D[] = [{ xMm: 0, yMm: 0, zMm: 0 }];

  let sequence = 1;
  let totalWeight = 0;
  let usedVolume = 0;

  for (const item of sortedItems) {
    let placed = false;

    // Przeszukiwanie punktów ekstremalnych posortowanych w pierwszej kolejności:
    // najniższe Z (podłoga), potem najniższe X (grobla kanapy), potem najniższe Y
    extremePoints.sort((a, b) => {
      if (a.zMm !== b.zMm) return a.zMm - b.zMm;
      if (a.xMm !== b.xMm) return a.xMm - b.xMm;
      return a.yMm - b.yMm;
    });

    const orientations = getOrientations(item);

    pointLoop: for (const point of extremePoints) {
      for (const orient of orientations) {
        // Sprawdzenie granic bagażnika
        if (!isInsideTrunkBoundary(point, orient, trunk)) {
          continue;
        }

        // Sprawdzenie kolizji z już ułożonymi paczkami
        let hasCollision = false;
        for (const existing of placements) {
          if (doesOverlap(point, orient, existing.positionMm, existing.orientedDimensionsMm)) {
            hasCollision = true;
            break;
          }
        }

        if (!hasCollision) {
          // Ułożono paczkę!
          const newPlacement: PackedPlacement = {
            itemId: item.id,
            positionMm: point,
            orientedDimensionsMm: orient,
            sequenceOrder: sequence++,
          };

          placements.push(newPlacement);
          totalWeight += item.weightKg;
          usedVolume += orient.lengthMm * orient.widthMm * orient.heightMm;

          // Generowanie nowych punktów ekstremalnych
          const p1: Position3D = {
            xMm: point.xMm + orient.lengthMm + PACKING_GAP_MM,
            yMm: point.yMm,
            zMm: point.zMm,
          };
          const p2: Position3D = {
            xMm: point.xMm,
            yMm: point.yMm + orient.widthMm + PACKING_GAP_MM,
            zMm: point.zMm,
          };
          const p3: Position3D = {
            xMm: point.xMm,
            yMm: point.yMm,
            zMm: point.zMm + orient.heightMm + PACKING_GAP_MM,
          };

          // Usunięcie wykorzystanego punktu i dodanie nowych
          extremePoints = extremePoints.filter(p => p !== point);
          extremePoints.push(p1, p2);
          if (item.allowStacking && !item.isFragile) {
            extremePoints.push(p3);
          }

          placed = true;
          break pointLoop;
        }
      }
    }

    if (!placed) {
      unplacedItems.push(item);
    }
  }

  const usableVolumeMm3 =
    ((trunk.lengthFloorMm + trunk.lengthRoofMm) / 2) *
    trunk.widthMaxMm *
    trunk.heightRoofMm;

  const packingEfficiencyPct = usableVolumeMm3 > 0
    ? Math.min(100, Math.round((usedVolume / usableVolumeMm3) * 100))
    : 0;

  return {
    isFullyPacked: unplacedItems.length === 0,
    placements,
    unplacedItems,
    totalWeightKg: Math.round(totalWeight * 10) / 10,
    usedVolumeMm3: usedVolume,
    usableVolumeMm3: Math.round(usableVolumeMm3),
    packingEfficiencyPct,
  };
}
