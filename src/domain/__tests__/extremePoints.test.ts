import {
  doesOverlap,
  getOrientations,
  isInsideTrunkBoundary,
  packItemsInTrunk,
} from '../geometry/extremePoints';
import { CargoItem, TrunkGeometry } from '../geometry/types';

describe('ExtremePoints 3D Bin Packing Solver', () => {
  const standardTrunk: TrunkGeometry = {
    lengthFloorMm: 1000,
    lengthRoofMm: 700, // slanted rear window
    widthMinMm: 950,
    widthMaxMm: 1100,
    heightRoofMm: 800,
    heightShelfMm: 450,
    apertureWidthMm: 950,
    apertureHeightMm: 750,
    thresholdHeightMm: 80,
  };

  it('correctly detects 3D AABB overlap', () => {
    const posA = { xMm: 0, yMm: 0, zMm: 0 };
    const dimA = { lengthMm: 100, widthMm: 100, heightMm: 100 };

    // Overlapping box
    const posB = { xMm: 50, yMm: 50, zMm: 50 };
    const dimB = { lengthMm: 100, widthMm: 100, heightMm: 100 };
    expect(doesOverlap(posA, dimA, posB, dimB)).toBe(true);

    // Non-overlapping box
    const posC = { xMm: 200, yMm: 0, zMm: 0 };
    const dimC = { lengthMm: 100, widthMm: 100, heightMm: 100 };
    expect(doesOverlap(posA, dimA, posC, dimC)).toBe(false);
  });

  it('respects trunk slant boundary at high Z coordinates', () => {
    // At floor level (Z=0), max length is 1000 mm
    expect(
      isInsideTrunkBoundary(
        { xMm: 0, yMm: 0, zMm: 0 },
        { lengthMm: 900, widthMm: 800, heightMm: 100 },
        standardTrunk
      )
    ).toBe(true);

    // Near roof (Z=700), available length is reduced towards 700 mm
    // A 850 mm box near roof will protrude out of slanted window!
    expect(
      isInsideTrunkBoundary(
        { xMm: 0, yMm: 0, zMm: 600 },
        { lengthMm: 850, widthMm: 800, heightMm: 150 },
        standardTrunk
      )
    ).toBe(false);
  });

  it('generates proper orientations based on constraints', () => {
    const freeItem: CargoItem = {
      id: 'free',
      name: 'Free Item',
      dimensionsMm: { lengthMm: 300, widthMm: 200, heightMm: 100 },
      weightKg: 5,
      rotationConstraint: 'XYZ',
      isFragile: false,
      isSoft: false,
      allowStacking: true,
    };
    expect(getOrientations(freeItem)).toHaveLength(6);

    const zOnlyItem: CargoItem = {
      ...freeItem,
      rotationConstraint: 'Z_ONLY',
    };
    expect(getOrientations(zOnlyItem)).toHaveLength(2);

    const lockedItem: CargoItem = {
      ...freeItem,
      rotationConstraint: 'NONE',
    };
    expect(getOrientations(lockedItem)).toHaveLength(1);
  });

  it('packs multiple items deterministically in trunk and ensures no overlapping', () => {
    const items: CargoItem[] = [
      {
        id: 'box1',
        name: 'Duża walizka',
        dimensionsMm: { lengthMm: 600, widthMm: 400, heightMm: 250 },
        weightKg: 20,
        rotationConstraint: 'XYZ',
        isFragile: false,
        isSoft: false,
        allowStacking: true,
      },
      {
        id: 'box2',
        name: 'Średnia walizka',
        dimensionsMm: { lengthMm: 500, widthMm: 350, heightMm: 220 },
        weightKg: 15,
        rotationConstraint: 'XYZ',
        isFragile: false,
        isSoft: false,
        allowStacking: true,
      },
      {
        id: 'fragile_box',
        name: 'Zastawa szklana (Kruche)',
        dimensionsMm: { lengthMm: 300, widthMm: 250, heightMm: 200 },
        weightKg: 5,
        rotationConstraint: 'Z_ONLY',
        isFragile: true,
        isSoft: false,
        allowStacking: false,
      },
    ];

    const res = packItemsInTrunk(items, standardTrunk);

    expect(res.isFullyPacked).toBe(true);
    expect(res.placements).toHaveLength(3);
    expect(res.unplacedItems).toHaveLength(0);
    expect(res.totalWeightKg).toBe(40);

    // Verify non-overlapping invariant:
    for (let i = 0; i < res.placements.length; i++) {
      for (let j = i + 1; j < res.placements.length; j++) {
        const pA = res.placements[i];
        const pB = res.placements[j];
        const overlap = doesOverlap(
          pA.positionMm,
          pA.orientedDimensionsMm,
          pB.positionMm,
          pB.orientedDimensionsMm
        );
        expect(overlap).toBe(false);
      }
    }
  });

  it('identifies unplaced items when items exceed trunk dimensions', () => {
    const hugeItems: CargoItem[] = [
      {
        id: 'huge1',
        name: 'Duża szafa',
        dimensionsMm: { lengthMm: 600, widthMm: 800, heightMm: 300 },
        weightKg: 60,
        rotationConstraint: 'NONE',
        isFragile: false,
        isSoft: false,
        allowStacking: false,
      },
      {
        id: 'huge2',
        name: 'Druga duża szafa',
        dimensionsMm: { lengthMm: 600, widthMm: 800, heightMm: 300 },
        weightKg: 60,
        rotationConstraint: 'NONE',
        isFragile: false,
        isSoft: false,
        allowStacking: false,
      },
    ];

    const res = packItemsInTrunk(hugeItems, standardTrunk);

    expect(res.isFullyPacked).toBe(false);
    expect(res.placements).toHaveLength(1);
    expect(res.unplacedItems).toHaveLength(1);
    expect(res.unplacedItems[0].id).toBe('huge2');
  });

  it('exercises Y tie-breaking when extreme points share same X and Z coordinates', () => {
    const items: CargoItem[] = [
      {
        id: 'box1',
        name: 'Box 1',
        dimensionsMm: { lengthMm: 200, widthMm: 200, heightMm: 200 },
        weightKg: 5,
        rotationConstraint: 'NONE',
        isFragile: false,
        isSoft: false,
        allowStacking: false,
      },
      {
        id: 'box2',
        name: 'Box 2',
        dimensionsMm: { lengthMm: 200, widthMm: 200, heightMm: 200 },
        weightKg: 4,
        rotationConstraint: 'NONE',
        isFragile: false,
        isSoft: false,
        allowStacking: false,
      },
      {
        id: 'box3',
        name: 'Box 3',
        dimensionsMm: { lengthMm: 200, widthMm: 200, heightMm: 200 },
        weightKg: 3,
        rotationConstraint: 'NONE',
        isFragile: false,
        isSoft: false,
        allowStacking: false,
      },
    ];

    const res = packItemsInTrunk(items, standardTrunk);
    expect(res.isFullyPacked).toBe(true);
    expect(res.placements).toHaveLength(3);
  });

  it('handles zero usable volume trunk returning 0 packing efficiency', () => {
    const zeroTrunk: TrunkGeometry = {
      lengthFloorMm: 0,
      lengthRoofMm: 0,
      widthMinMm: 0,
      widthMaxMm: 0,
      heightRoofMm: 0,
      heightShelfMm: 0,
      apertureWidthMm: 0,
      apertureHeightMm: 0,
      thresholdHeightMm: 0,
    };

    const res = packItemsInTrunk([], zeroTrunk);
    expect(res.packingEfficiencyPct).toBe(0);
    expect(res.usableVolumeMm3).toBe(0);
  });
});
