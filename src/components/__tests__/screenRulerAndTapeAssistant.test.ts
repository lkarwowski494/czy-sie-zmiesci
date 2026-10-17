import React from 'react';
import { ScreenRuler } from '../ScreenRuler';
import {
  calculateToleranceBounds,
  validateMeasurementSanity,
  calculateScreenPointsForMm,
  convertLength,
  STANDARD_REFERENCE_OBJECTS,
  TOOL_UNCERTAINTY_MAP,
  MeasurementTool,
} from '../../domain/measuring/tapeMeasureAssistant';

describe('ScreenRuler & Tape Measure Precision Engineering (BR-POM-001..004)', () => {
  describe('ScreenRuler Component Instantiation', () => {
    it('creates a valid React element for ScreenRuler with custom and default props', () => {
      const defaultElement = React.createElement(ScreenRuler);
      expect(React.isValidElement(defaultElement)).toBe(true);
      expect(defaultElement.type).toBe(ScreenRuler);

      const calibratedElement = React.createElement(ScreenRuler, {
        maxCm: 20,
        screenPpi: 460,
        displayScale: 3.0,
      });
      expect(React.isValidElement(calibratedElement)).toBe(true);
      expect(calibratedElement.props.maxCm).toBe(20);
    });
  });

  describe('Display PPI to Screen Point Calibration (BR-POM-002)', () => {
    it('calculates physical screen points accurately for iPhone 14/15/16 Pro (460 PPI, 3.0x scale)', () => {
      // 1 inch = 25.4 mm => 460 pixels / 3.0 = 153.333 pt per inch => ~6.037 pt/mm
      const points10mm = calculateScreenPointsForMm(10, 460, 3.0);
      expect(points10mm).toBeCloseTo(60.4, 0);

      // ISO/IEC 7810 ID-1 Credit Card length (85.6 mm)
      const pointsCard = calculateScreenPointsForMm(85.6, 460, 3.0);
      expect(pointsCard).toBeGreaterThan(500);
      expect(pointsCard).toBeLessThan(530);
    });

    it('calculates points for high-density Android device (420 PPI, 2.625x scale)', () => {
      const points10mm = calculateScreenPointsForMm(10, 420, 2.625);
      expect(points10mm).toBeCloseTo(63.0, 0);
    });

    it('throws when screen parameters or length are invalid', () => {
      expect(() => calculateScreenPointsForMm(-1, 460, 3.0)).toThrow();
      expect(() => calculateScreenPointsForMm(10, 0, 3.0)).toThrow();
      expect(() => calculateScreenPointsForMm(10, 460, 0)).toThrow();
    });
  });

  describe('Measurement Tolerance & Uncertainty Bounds (BR-POM-001)', () => {
    it('enforces exact tool uncertainty rates defined in specification', () => {
      expect(TOOL_UNCERTAINTY_MAP.LASER_METER).toBe(0.005); // ±0.5%
      expect(TOOL_UNCERTAINTY_MAP.MANUAL_TAPE).toBe(0.01);  // ±1.0%
      expect(TOOL_UNCERTAINTY_MAP.AR_LIDAR).toBe(0.02);     // ±2.0%
      expect(TOOL_UNCERTAINTY_MAP.AR_CAMERA).toBe(0.05);    // ±5.0%
      expect(TOOL_UNCERTAINTY_MAP.VISUAL_ESTIMATE).toBe(0.1); // ±10.0%
    });

    it('calculates conservative upper bound maxMm for 1000 mm nominal measurement', () => {
      // Laser: 1000 mm ± 5 mm => [995, 1005] mm
      const laser = calculateToleranceBounds(1000, 'LASER_METER');
      expect(laser.minMm).toBe(995);
      expect(laser.maxMm).toBe(1005);
      expect(laser.uncertaintyPercentage).toBe(0.5);

      // Manual Tape: 1000 mm ± 10 mm => [990, 1010] mm
      const tape = calculateToleranceBounds(1000, 'MANUAL_TAPE');
      expect(tape.minMm).toBe(990);
      expect(tape.maxMm).toBe(1010);
      expect(tape.uncertaintyPercentage).toBe(1.0);

      // AR LiDAR: 1000 mm ± 20 mm => [980, 1020] mm
      const lidar = calculateToleranceBounds(1000, 'AR_LIDAR');
      expect(lidar.minMm).toBe(980);
      expect(lidar.maxMm).toBe(1020);

      // Visual Estimate: 1000 mm ± 100 mm => [900, 1100] mm
      const visual = calculateToleranceBounds(1000, 'VISUAL_ESTIMATE');
      expect(visual.minMm).toBe(900);
      expect(visual.maxMm).toBe(1100);
    });

    it('throws error when nominal dimension is non-positive', () => {
      expect(() => calculateToleranceBounds(0, 'LASER_METER')).toThrow();
      expect(() => calculateToleranceBounds(-50, 'MANUAL_TAPE')).toThrow();
    });
  });

  describe('Standard Physical Reference Objects Calibration', () => {
    it('contains ISO-standard reference objects with exact real-world dimensions', () => {
      expect(STANDARD_REFERENCE_OBJECTS.length).toBeGreaterThanOrEqual(4);

      const card = STANDARD_REFERENCE_OBJECTS.find((r) => r.id === 'credit_card')!;
      expect(card.lengthMm).toBe(85.6);
      expect(card.widthMm).toBe(53.98);

      const a4 = STANDARD_REFERENCE_OBJECTS.find((r) => r.id === 'a4_paper')!;
      expect(a4.lengthMm).toBe(297.0);
      expect(a4.widthMm).toBe(210.0);

      const coin5 = STANDARD_REFERENCE_OBJECTS.find((r) => r.id === 'coin_5_pln')!;
      expect(coin5.lengthMm).toBe(24.0);

      const coin2Eur = STANDARD_REFERENCE_OBJECTS.find((r) => r.id === 'coin_2_eur')!;
      expect(coin2Eur.lengthMm).toBe(25.75);
    });
  });

  describe('Dimensional Sanity Validation & Unit Conversions', () => {
    it('validates realistic parcel and furniture dimensions against legal road clearances', () => {
      expect(validateMeasurementSanity(1200, 800, 750).isValid).toBe(true);
      expect(validateMeasurementSanity(-10, 800, 750).isValid).toBe(false);
      expect(validateMeasurementSanity(1200, 0, 750).isValid).toBe(false);

      // Exceeds max road transport clearance (> 15m or > 4.5m)
      const oversized = validateMeasurementSanity(18000, 2000, 2000);
      expect(oversized.isValid).toBe(false);
      expect(oversized.reason).toContain('skrajnię');
    });

    it('performs exact unit conversions between metric and imperial systems', () => {
      // mm to cm / m
      expect(convertLength(2500, 'mm', 'cm')).toBe(250);
      expect(convertLength(2500, 'mm', 'm')).toBe(2.5);

      // inches to mm (1 in = 25.4 mm)
      expect(convertLength(10, 'in', 'mm')).toBe(254);

      // feet to meters (1 ft = 304.8 mm = 0.3048 m)
      expect(convertLength(6, 'ft', 'm')).toBe(1.83);

      // meters to feet
      expect(convertLength(3.048, 'm', 'ft')).toBe(10);
    });

    it('rejects negative length conversions', () => {
      expect(() => convertLength(-5, 'mm', 'cm')).toThrow();
    });
  });
});
