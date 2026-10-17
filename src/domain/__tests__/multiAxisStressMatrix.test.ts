import {
  calculateCenterOfGravity,
  MAX_LATERAL_OFFSET_TOLERANCE_MM,
  REAR_OVERHANG_DANGER_THRESHOLD_PCT,
} from '../physics/centerOfGravity';
import { PackedPlacement } from '../geometry/types';

describe('Multi-Axis Dynamic Stress & Equilibrium Matrix (RD-20)', () => {
  const trunkGeometry = {
    lengthFloorMm: 1000,
    widthMaxMm: 1200,
    heightRoofMm: 800,
  };

  describe('Lateral (Y-axis) Balance & Asymmetry Detection', () => {
    it('detects perfect symmetry when two equal weights are mirrored across centerline', () => {
      // Centerline is widthMaxMm / 2 = 600 mm
      const placements: PackedPlacement[] = [
        {
          itemId: 'left-box',
          sequenceOrder: 1,
          positionMm: { xMm: 200, yMm: 100, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 400, widthMm: 400, heightMm: 300 },
        },
        {
          itemId: 'right-box',
          sequenceOrder: 2,
          positionMm: { xMm: 200, yMm: 700, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 400, widthMm: 400, heightMm: 300 },
        },
      ];

      // left center Y: 100 + 200 = 300 mm
      // right center Y: 700 + 200 = 900 mm
      // Mean Y: (300 + 900) / 2 = 600 mm (perfect center!)
      const weights = {
        'left-box': 25,
        'right-box': 25,
      };

      const result = calculateCenterOfGravity(placements, weights, trunkGeometry);

      expect(result.centerOfGravityMm.yMm).toBe(600);
      expect(result.lateralOffsetMm).toBe(0);
      expect(result.isLateralSymmetric).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('triggers asymmetry warning when heavy cargo is placed on one side', () => {
      const placements: PackedPlacement[] = [
        {
          itemId: 'heavy-safe',
          sequenceOrder: 1,
          positionMm: { xMm: 100, yMm: 50, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 400, widthMm: 400, heightMm: 500 },
        },
        {
          itemId: 'light-pillows',
          sequenceOrder: 2,
          positionMm: { xMm: 100, yMm: 700, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 400, widthMm: 400, heightMm: 500 },
        },
      ];

      const weights = {
        'heavy-safe': 90, // 90 kg on left (center 250 mm)
        'light-pillows': 5, // 5 kg on right (center 900 mm)
      };

      const result = calculateCenterOfGravity(placements, weights, trunkGeometry);

      expect(result.isLateralSymmetric).toBe(false);
      expect(result.lateralOffsetMm).toBeGreaterThan(MAX_LATERAL_OFFSET_TOLERANCE_MM);
      expect(result.warnings.some((w) => w.includes('lewej'))).toBe(true);
    });

    it('tolerates small lateral offset within allowed tolerance', () => {
      const placements: PackedPlacement[] = [
        {
          itemId: 'box-1',
          sequenceOrder: 1,
          positionMm: { xMm: 100, yMm: 400, zMm: 0 }, // center Y: 400 + 150 = 550 (50mm off-center)
          orientedDimensionsMm: { lengthMm: 300, widthMm: 300, heightMm: 300 },
        },
      ];

      const weights = { 'box-1': 20 };
      const result = calculateCenterOfGravity(placements, weights, trunkGeometry);

      expect(result.lateralOffsetMm).toBe(50);
      expect(result.lateralOffsetMm).toBeLessThanOrEqual(MAX_LATERAL_OFFSET_TOLERANCE_MM);
      expect(result.isLateralSymmetric).toBe(true);
    });
  });

  describe('Longitudinal (X-axis) Front/Rear Overhang Load', () => {
    it('approves safe weight placed near rear seats (front of trunk)', () => {
      const placements: PackedPlacement[] = [
        {
          itemId: 'engine-block',
          sequenceOrder: 1,
          positionMm: { xMm: 50, yMm: 400, zMm: 0 }, // center X: 50 + 200 = 250 mm
          orientedDimensionsMm: { lengthMm: 400, widthMm: 400, heightMm: 400 },
        },
      ];

      const weights = { 'engine-block': 70 };
      const result = calculateCenterOfGravity(placements, weights, trunkGeometry);

      expect(result.centerOfGravityMm.xMm).toBe(250);
      expect(result.isAxleLoadDangerous).toBe(false);
      expect(result.warnings.length).toBe(0);
    });

    it('flags dangerous rear axle leverage when heavy item is at tailgate threshold', () => {
      // Danger threshold: 1000 * 0.75 = 750 mm
      const placements: PackedPlacement[] = [
        {
          itemId: 'tailgate-anvil',
          sequenceOrder: 1,
          positionMm: { xMm: 700, yMm: 400, zMm: 0 }, // center X: 700 + 150 = 850 mm
          orientedDimensionsMm: { lengthMm: 300, widthMm: 400, heightMm: 300 },
        },
      ];

      const weights = { 'tailgate-anvil': 80 };
      const result = calculateCenterOfGravity(placements, weights, trunkGeometry);

      expect(result.centerOfGravityMm.xMm).toBe(850);
      expect(result.isAxleLoadDangerous).toBe(true);
      expect(result.warnings.some((w) => w.includes('tylnego zderzaka'))).toBe(true);
    });
  });

  describe('Vertical (Z-axis) Roll Center Dynamics', () => {
    it('correctly calculates vertical center of gravity for stacked layers', () => {
      // Bottom layer: heavy washer on floor (z: 0..400, center: 200)
      // Top layer: lightweight suitcases on top of washer (z: 400..700, center: 550)
      const placements: PackedPlacement[] = [
        {
          itemId: 'bottom-layer',
          sequenceOrder: 1,
          positionMm: { xMm: 200, yMm: 400, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 600, widthMm: 400, heightMm: 400 },
        },
        {
          itemId: 'top-layer',
          sequenceOrder: 2,
          positionMm: { xMm: 200, yMm: 400, zMm: 400 },
          orientedDimensionsMm: { lengthMm: 600, widthMm: 400, heightMm: 300 },
        },
      ];

      const weights = {
        'bottom-layer': 60, // 60kg @ z=200
        'top-layer': 15, // 15kg @ z=550
      };

      // Expected Z = (60 * 200 + 15 * 550) / 75 = (12000 + 8250) / 75 = 20250 / 75 = 270 mm
      const result = calculateCenterOfGravity(placements, weights, trunkGeometry);

      expect(result.centerOfGravityMm.zMm).toBe(270);
      expect(result.totalWeightKg).toBe(75);
    });
  });

  describe('Boundary & Edge Cases', () => {
    it('handles empty placements safely', () => {
      const result = calculateCenterOfGravity([], {}, trunkGeometry);
      expect(result.totalWeightKg).toBe(0);
      expect(result.centerOfGravityMm).toEqual({ xMm: 0, yMm: 0, zMm: 0 });
      expect(result.isLateralSymmetric).toBe(true);
      expect(result.isAxleLoadDangerous).toBe(false);
      expect(result.warnings).toEqual([]);
    });

    it('handles zero or negative weights gracefully', () => {
      const placements: PackedPlacement[] = [
        {
          itemId: 'ghost-item',
          sequenceOrder: 1,
          positionMm: { xMm: 100, yMm: 100, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 200, widthMm: 200, heightMm: 200 },
        },
      ];

      const result = calculateCenterOfGravity(placements, { 'ghost-item': 0 }, trunkGeometry);
      expect(result.totalWeightKg).toBe(0);
      expect(result.centerOfGravityMm).toEqual({ xMm: 0, yMm: 0, zMm: 0 });
    });

    it('falls back to 1.0 kg default when item weight is not in map', () => {
      const placements: PackedPlacement[] = [
        {
          itemId: 'unmapped-box',
          sequenceOrder: 1,
          positionMm: { xMm: 200, yMm: 400, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 400, widthMm: 400, heightMm: 200 },
        },
      ];

      const result = calculateCenterOfGravity(placements, {}, trunkGeometry);
      expect(result.totalWeightKg).toBe(1.0);
      expect(result.centerOfGravityMm.xMm).toBe(400); // 200 + 400/2
    });
  });
});
