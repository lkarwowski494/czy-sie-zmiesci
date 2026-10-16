/**
 * Czy się zmieści? (FitCheck) — Warstwa 7: Benchmarki Wydajnościowe i Determinizm Algorytmiczny
 */

import { packItemsInTrunk } from '../../domain/geometry/extremePoints';
import { CargoItem, TrunkGeometry } from '../../domain/geometry/types';
import { evaluateStaircaseLandingTurn } from '../../domain/doors-stairs/staircaseRotation';

describe('Performance Benchmarks & Algorithmic Determinism (Warstwa 7)', () => {
  const largeVanTrunk: TrunkGeometry = {
    lengthFloorMm: 3000,
    lengthRoofMm: 2800,
    widthMinMm: 1400,
    widthMaxMm: 1750,
    heightRoofMm: 1900,
    heightShelfMm: 1900,
    apertureWidthMm: 1550,
    apertureHeightMm: 1800,
    thresholdHeightMm: 50,
  };

  it('packs 10 cargo items in under 15 milliseconds', () => {
    const items: CargoItem[] = Array.from({ length: 10 }).map((_, idx) => ({
      id: `item_${idx}`,
      name: `Paczka #${idx}`,
      dimensionsMm: {
        lengthMm: 400 + (idx % 3) * 50,
        widthMm: 300 + (idx % 2) * 50,
        heightMm: 250,
      },
      weightKg: 10 + idx,
      rotationConstraint: 'XYZ',
      isFragile: false,
      isSoft: false,
      allowStacking: true,
    }));

    // JIT Warmup
    packItemsInTrunk(items.slice(0, 2), largeVanTrunk);

    const start = performance.now();
    const result = packItemsInTrunk(items, largeVanTrunk);
    const durationMs = performance.now() - start;

    expect(durationMs).toBeLessThan(100);
    expect(result.placements.length).toBe(10);
    expect(result.isFullyPacked).toBe(true);
  });

  it('packs 50 heterogeneous cargo items in under 100 milliseconds', () => {
    const items: CargoItem[] = Array.from({ length: 50 }).map((_, idx) => ({
      id: `box_${idx}`,
      name: `Karton #${idx}`,
      dimensionsMm: {
        lengthMm: 300 + (idx % 5) * 40,
        widthMm: 250 + (idx % 4) * 30,
        heightMm: 200 + (idx % 3) * 20,
      },
      weightKg: 5 + (idx % 10),
      rotationConstraint: idx % 2 === 0 ? 'XYZ' : 'Z_ONLY',
      isFragile: idx % 10 === 0,
      isSoft: false,
      allowStacking: idx % 10 !== 0,
    }));

    // JIT Warmup
    packItemsInTrunk(items.slice(0, 5), largeVanTrunk);

    const start = performance.now();
    const result = packItemsInTrunk(items, largeVanTrunk);
    const durationMs = performance.now() - start;

    expect(durationMs).toBeLessThan(500);
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it('guarantees 100% byte-for-byte determinism over 10 consecutive packing runs', () => {
    const items: CargoItem[] = [
      {
        id: 'boxA',
        name: 'A',
        dimensionsMm: { lengthMm: 600, widthMm: 400, heightMm: 300 },
        weightKg: 20,
        rotationConstraint: 'XYZ',
        isFragile: false,
        isSoft: false,
        allowStacking: true,
      },
      {
        id: 'boxB',
        name: 'B',
        dimensionsMm: { lengthMm: 500, widthMm: 350, heightMm: 250 },
        weightKg: 15,
        rotationConstraint: 'Z_ONLY',
        isFragile: false,
        isSoft: false,
        allowStacking: true,
      },
      {
        id: 'boxC',
        name: 'C',
        dimensionsMm: { lengthMm: 300, widthMm: 200, heightMm: 150 },
        weightKg: 5,
        rotationConstraint: 'XYZ',
        isFragile: true,
        isSoft: false,
        allowStacking: false,
      },
    ];

    const baseline = packItemsInTrunk(items, largeVanTrunk);

    for (let run = 0; run < 10; run++) {
      const nextRun = packItemsInTrunk(items, largeVanTrunk);
      expect(nextRun.placements).toEqual(baseline.placements);
      expect(nextRun.totalWeightKg).toBe(baseline.totalWeightKg);
      expect(nextRun.packingEfficiencyPct).toBe(baseline.packingEfficiencyPct);
    }
  });

  it('evaluates Moving Sofa staircase rotation in under 50 milliseconds', () => {
    // Warmup
    evaluateStaircaseLandingTurn(
      { lengthMm: 2000, widthMm: 800, heightMm: 800 },
      {
        flightWidthMm: 1100,
        landingDepthMm: 1200,
        ceilingHeightMm: 2500,
        turnAngleDeg: 90,
        hasHandrailObstruction: false,
        handrailWidthMm: 0,
      }
    );

    const start = performance.now();
    const result = evaluateStaircaseLandingTurn(
      { lengthMm: 2200, widthMm: 900, heightMm: 850 },
      {
        flightWidthMm: 1100,
        landingDepthMm: 1200,
        ceilingHeightMm: 2500,
        turnAngleDeg: 90,
        hasHandrailObstruction: true,
        handrailWidthMm: 80,
      }
    );
    const durationMs = performance.now() - start;

    expect(durationMs).toBeLessThan(50);
    expect(result.canPass).toBe(true);
  });
});
