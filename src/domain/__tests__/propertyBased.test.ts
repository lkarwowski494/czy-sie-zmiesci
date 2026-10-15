import fc from 'fast-check';
import { doesOverlap, packItemsInTrunk } from '../geometry/extremePoints';
import { CargoItem, TrunkGeometry } from '../geometry/types';
import { evaluateTowbarLoad, Bicycle } from '../garage/towbarPhysics';
import { calculateDoorwayClearance } from '../doors-stairs/doorwayClearance';

describe('Property-Based Invariant Tests (fast-check — Warstwa 3)', () => {
  const arbitraryTrunk: fc.Arbitrary<TrunkGeometry> = fc.record({
    lengthFloorMm: fc.integer({ min: 800, max: 1500 }),
    lengthRoofMm: fc.integer({ min: 500, max: 1200 }),
    widthMinMm: fc.integer({ min: 800, max: 1100 }),
    widthMaxMm: fc.integer({ min: 1000, max: 1400 }),
    heightRoofMm: fc.integer({ min: 600, max: 1000 }),
    heightShelfMm: fc.integer({ min: 350, max: 550 }),
    apertureWidthMm: fc.integer({ min: 800, max: 1200 }),
    apertureHeightMm: fc.integer({ min: 600, max: 900 }),
    thresholdHeightMm: fc.integer({ min: 0, max: 150 }),
  }).filter(t => t.lengthRoofMm <= t.lengthFloorMm && t.widthMinMm <= t.widthMaxMm);

  const arbitraryCargoItem: fc.Arbitrary<CargoItem> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    dimensionsMm: fc.record({
      lengthMm: fc.integer({ min: 150, max: 600 }),
      widthMm: fc.integer({ min: 150, max: 500 }),
      heightMm: fc.integer({ min: 100, max: 400 }),
    }),
    weightKg: fc.float({ min: 1, max: 30, noNaN: true }),
    rotationConstraint: fc.constantFrom('XYZ' as const, 'Z_ONLY' as const, 'NONE' as const),
    isFragile: fc.boolean(),
    isSoft: fc.boolean(),
    allowStacking: fc.boolean(),
  });

  it('INVARIANT 1: No two packed items ever overlap in 3D space', () => {
    fc.assert(
      fc.property(
        arbitraryTrunk,
        fc.array(arbitraryCargoItem, { minLength: 1, maxLength: 10 }),
        (trunk, items) => {
          const result = packItemsInTrunk(items, trunk);

          for (let i = 0; i < result.placements.length; i++) {
            for (let j = i + 1; j < result.placements.length; j++) {
              const pA = result.placements[i];
              const pB = result.placements[j];
              const overlap = doesOverlap(
                pA.positionMm,
                pA.orientedDimensionsMm,
                pB.positionMm,
                pB.orientedDimensionsMm
              );
              expect(overlap).toBe(false);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('INVARIANT 2: Sum of packed volumes never exceeds trunk usable volume', () => {
    fc.assert(
      fc.property(
        arbitraryTrunk,
        fc.array(arbitraryCargoItem, { minLength: 1, maxLength: 8 }),
        (trunk, items) => {
          const result = packItemsInTrunk(items, trunk);
          expect(result.usedVolumeMm3).toBeLessThanOrEqual(result.usableVolumeMm3 * 1.05); // with small bounding allowance
        }
      ),
      { numRuns: 50 }
    );
  });

  it('INVARIANT 3: Towbar vertical load is strictly monotonic with respect to added bike weight', () => {
    const arbitraryBike: fc.Arbitrary<Bicycle> = fc.record({
      id: fc.uuid(),
      name: fc.string(),
      weightKg: fc.float({ min: 5, max: 30, noNaN: true }),
      isElectric: fc.boolean(),
      batteryWeightKg: fc.float({ min: 2, max: 5, noNaN: true }),
    });

    fc.assert(
      fc.property(
        fc.array(arbitraryBike, { minLength: 1, maxLength: 3 }),
        arbitraryBike,
        fc.integer({ min: 50, max: 100 }),
        (existingBikes, newBike, sLimit) => {
          const rackSpecs = { towbarSLimitKg: sLimit, rackWeightKg: 18, maxBikesCapacity: 4 };

          const resBefore = evaluateTowbarLoad(existingBikes, rackSpecs);
          const resAfter = evaluateTowbarLoad([...existingBikes, newBike], rackSpecs);

          expect(resAfter.totalVerticalLoadKg).toBeGreaterThan(resBefore.totalVerticalLoadKg);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('INVARIANT 4: Widening a doorway never turns a valid pass into a failure', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 600, max: 1000 }),
        fc.integer({ min: 10, max: 300 }),
        fc.integer({ min: 300, max: 800 }),
        (width1, widthDelta, itemDim) => {
          const width2 = width1 + widthDelta;
          const door1 = {
            nominalWidthMm: width1,
            doorSwingAngleDeg: 180,
            isDoorLeafRemovable: true,
            isHandleRemovable: true,
          };
          const door2 = {
            ...door1,
            nominalWidthMm: width2,
          };

          const item = { lengthMm: itemDim, widthMm: itemDim, heightMm: itemDim };
          const res1 = calculateDoorwayClearance(item, door1, false);
          const res2 = calculateDoorwayClearance(item, door2, false);

          if (res1.canPass) {
            expect(res2.canPass).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
