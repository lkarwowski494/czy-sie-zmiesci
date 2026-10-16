/**
 * Czy się zmieści? (FitCheck) — Testy Modułu Miarki i Kalibracji Pomiarów (BR-POM-001…004)
 */

import {
  calculateToleranceBounds,
  validateMeasurementSanity,
  calculateScreenPointsForMm,
  convertLength,
  STANDARD_REFERENCE_OBJECTS,
  TOOL_UNCERTAINTY_MAP,
} from '../measuring/tapeMeasureAssistant';

describe('TapeMeasureAssistant & Calibration (Warstwa 1: 100% Coverage)', () => {
  describe('calculateToleranceBounds', () => {
    it('calculates bounds for laser meter (0.5% uncertainty)', () => {
      const bounds = calculateToleranceBounds(1000, 'LASER_METER');
      expect(bounds.nominalMm).toBe(1000);
      expect(bounds.minMm).toBe(995);
      expect(bounds.maxMm).toBe(1005);
      expect(bounds.uncertaintyPercentage).toBe(0.5);
    });

    it('calculates bounds for manual tape (1.0% uncertainty)', () => {
      const bounds = calculateToleranceBounds(500, 'MANUAL_TAPE');
      expect(bounds.minMm).toBe(495);
      expect(bounds.maxMm).toBe(505);
    });

    it('calculates bounds for AR LiDAR (2.0% uncertainty)', () => {
      const bounds = calculateToleranceBounds(2000, 'AR_LIDAR');
      expect(bounds.minMm).toBe(1960);
      expect(bounds.maxMm).toBe(2040);
    });

    it('calculates bounds for AR Camera (5.0% uncertainty)', () => {
      const bounds = calculateToleranceBounds(1000, 'AR_CAMERA');
      expect(bounds.minMm).toBe(950);
      expect(bounds.maxMm).toBe(1050);
    });

    it('calculates bounds for visual estimate (10.0% uncertainty)', () => {
      const bounds = calculateToleranceBounds(1000, 'VISUAL_ESTIMATE');
      expect(bounds.minMm).toBe(900);
      expect(bounds.maxMm).toBe(1100);
    });

    it('throws error for non-positive nominal dimensions', () => {
      expect(() => calculateToleranceBounds(0, 'LASER_METER')).toThrow('Wymiar nominalny musi być liczbą dodatnią');
      expect(() => calculateToleranceBounds(-10, 'MANUAL_TAPE')).toThrow('Wymiar nominalny musi być liczbą dodatnią');
    });
  });

  describe('validateMeasurementSanity', () => {
    it('approves standard household and cargo measurements', () => {
      const res = validateMeasurementSanity(1200, 800, 600);
      expect(res.isValid).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('rejects zero or negative dimensions', () => {
      expect(validateMeasurementSanity(0, 500, 500).isValid).toBe(false);
      expect(validateMeasurementSanity(500, -1, 500).isValid).toBe(false);
      expect(validateMeasurementSanity(500, 500, 0).isValid).toBe(false);
    });

    it('rejects improbable oversized dimensions exceeding road transport clearances', () => {
      const resOverLength = validateMeasurementSanity(16000, 1000, 1000);
      expect(resOverLength.isValid).toBe(false);
      expect(resOverLength.reason).toContain('przekraczają skrajnię transportową');

      const resOverWidth = validateMeasurementSanity(1000, 4500, 1000);
      expect(resOverWidth.isValid).toBe(false);

      const resOverHeight = validateMeasurementSanity(1000, 1000, 5000);
      expect(resOverHeight.isValid).toBe(false);
    });
  });

  describe('calculateScreenPointsForMm', () => {
    it('calculates screen points for credit card on iPhone 15 OLED (460 PPI, 3.0 scale)', () => {
      // 85.6 mm / 25.4 in = 3.37007 in
      // 3.37007 in * 460 ppi = 1550.23 px
      // 1550.23 px / 3.0 scale = 516.7 pt
      const pt = calculateScreenPointsForMm(85.6, 460, 3.0);
      expect(pt).toBeCloseTo(516.7, 0);

      // Default arguments branch coverage
      const ptDefault = calculateScreenPointsForMm(85.6);
      expect(ptDefault).toBe(pt);
    });

    it('throws error on invalid screen PPI or scale', () => {
      expect(() => calculateScreenPointsForMm(50, 0, 3.0)).toThrow('Nieprawidłowe parametry');
      expect(() => calculateScreenPointsForMm(50, 460, 0)).toThrow('Nieprawidłowe parametry');
      expect(() => calculateScreenPointsForMm(-5, 460, 3.0)).toThrow('Nieprawidłowe parametry');
    });
  });

  describe('convertLength', () => {
    it('converts between metric units correctly', () => {
      expect(convertLength(1000, 'mm', 'mm')).toBe(1000);
      expect(convertLength(1000, 'mm', 'cm')).toBe(100);
      expect(convertLength(1000, 'mm', 'm')).toBe(1);
      expect(convertLength(2.5, 'm', 'cm')).toBe(250);
      expect(convertLength(45, 'cm', 'mm')).toBe(450);
    });

    it('converts between metric and imperial units correctly', () => {
      // 1 inch = 25.4 mm
      expect(convertLength(1, 'in', 'mm')).toBe(25.4);
      expect(convertLength(25.4, 'mm', 'in')).toBe(1);
      // 1 foot = 304.8 mm
      expect(convertLength(1, 'ft', 'mm')).toBe(304.8);
      expect(convertLength(304.8, 'mm', 'ft')).toBe(1);
      expect(convertLength(12, 'in', 'ft')).toBe(1);
      expect(convertLength(1, 'ft', 'in')).toBe(12);
      expect(convertLength(10, 'in', 'cm')).toBe(25.4);
      expect(convertLength(2, 'm', 'ft')).toBeCloseTo(6.56, 1);
      expect(convertLength(5, 'ft', 'm')).toBeCloseTo(1.52, 1);
    });

    it('throws error for negative values', () => {
      expect(() => convertLength(-5, 'cm', 'in')).toThrow('Długość nie może być ujemna');
    });
  });

  describe('STANDARD_REFERENCE_OBJECTS & TOOL_UNCERTAINTY_MAP', () => {
    it('contains standard reference objects for quick tape calibration', () => {
      expect(STANDARD_REFERENCE_OBJECTS.length).toBeGreaterThanOrEqual(4);
      const cc = STANDARD_REFERENCE_OBJECTS.find((o) => o.id === 'credit_card');
      expect(cc).toBeDefined();
      expect(cc!.lengthMm).toBe(85.6);
      expect(cc!.widthMm).toBe(53.98);

      const a4 = STANDARD_REFERENCE_OBJECTS.find((o) => o.id === 'a4_paper');
      expect(a4).toBeDefined();
      expect(a4!.lengthMm).toBe(297.0);
      expect(a4!.widthMm).toBe(210.0);
    });

    it('maps all tools with proper progressive uncertainties', () => {
      expect(TOOL_UNCERTAINTY_MAP.LASER_METER).toBe(0.005);
      expect(TOOL_UNCERTAINTY_MAP.MANUAL_TAPE).toBe(0.01);
      expect(TOOL_UNCERTAINTY_MAP.AR_LIDAR).toBe(0.02);
      expect(TOOL_UNCERTAINTY_MAP.AR_CAMERA).toBe(0.05);
      expect(TOOL_UNCERTAINTY_MAP.VISUAL_ESTIMATE).toBe(0.1);
    });
  });
});
