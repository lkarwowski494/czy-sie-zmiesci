/**
 * Test wyroczni prawdy geometrii 3D (BR-TEST-011, BR-TEST-012)
 * Weryfikuje zgodnosc implementacji TypeScriptu z niezaleznym korpusem Pythona
 */

import { calculateElevatorFit, ElevatorCabinSpecs } from '../doors-stairs/elevatorDiagonal';
import corpus from './fixtures/geometry3d-corpus.json';

describe('Geometry 3D Python Oracle Corpus (BR-TEST-011)', () => {
  it('matches Python truth oracle for all elevator cabin evaluations', () => {
    const cabinLookup: Record<string, ElevatorCabinSpecs> = {
      '4_person_prefab': { depthMm: 1000, widthMm: 900, heightMm: 2100, doorWidthMm: 700, doorHeightMm: 2000 },
      '8_person_modern': { depthMm: 1400, widthMm: 1100, heightMm: 2200, doorWidthMm: 800, doorHeightMm: 2000 },
      'freight_hospital': { depthMm: 2100, widthMm: 1500, heightMm: 2300, doorWidthMm: 1100, doorHeightMm: 2100 },
    };

    expect(corpus.elevator_evaluations.length).toBeGreaterThanOrEqual(30);

    for (const testCase of corpus.elevator_evaluations) {
      const cabin = cabinLookup[testCase.cabin];
      expect(cabin).toBeDefined();

      const tsResult = calculateElevatorFit(testCase.dimensions, cabin);

      expect(tsResult.spatialDiagonalMm).toBe(testCase.result.spatialDiagonalMm);
      expect(tsResult.maxRigidItemLengthMm).toBe(testCase.result.maxRigidItemLengthMm);
      expect(tsResult.fitsThroughDoor).toBe(testCase.result.fitsThroughDoor);
      expect(tsResult.fitsInsideCabin).toBe(testCase.result.fitsInsideCabin);
      expect(tsResult.marginMm).toBe(testCase.result.marginMm);
    }
  });

  it('validates VDA liter calculations from Python oracle', () => {
    expect(corpus.vda_evaluations.length).toBeGreaterThanOrEqual(7);

    for (const item of corpus.vda_evaluations) {
      const dims = item.dimensions;
      const length = dims.lengthMm;
      const width = dims.widthMm;
      const height = dims.heightMm;

      const orientations = [
        [200, 100, 50],
        [200, 50, 100],
        [100, 200, 50],
        [100, 50, 200],
        [50, 200, 100],
        [50, 100, 200],
      ];

      let maxBlocks = 0;
      for (const [bx, by, bz] of orientations) {
        const blocks = Math.floor(length / bx) * Math.floor(width / by) * Math.floor(height / bz);
        if (blocks > maxBlocks) maxBlocks = blocks;
      }

      expect(maxBlocks).toBe(item.result.vdaBlocksCount);
      expect(maxBlocks * 1.0).toBe(item.result.vdaLiters);
    }
  });
});
