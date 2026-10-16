import {
  setUnitSystem,
  getUnitSystem,
  mmToInches,
  inchesToMm,
  cmToInches,
  inchesToCm,
  cmToFeet,
  feetToCm,
  formatDimension,
  formatDimensions3D,
  litersToCubicFeet,
  cubicFeetToLiters,
  m3ToCubicFeet,
  cubicFeetToM3,
  formatVolume,
  formatM3,
  kgToPounds,
  poundsToKg,
  formatWeight,
} from '../unit-converter';

describe('unit-converter', () => {
  beforeEach(() => {
    setUnitSystem('metric');
  });

  describe('system state', () => {
    it('defaults to metric and can be switched to imperial', () => {
      expect(getUnitSystem()).toBe('metric');
      setUnitSystem('imperial');
      expect(getUnitSystem()).toBe('imperial');
      setUnitSystem('metric');
      expect(getUnitSystem()).toBe('metric');
    });
  });

  describe('linear dimensions', () => {
    it('converts mm to inches and back', () => {
      expect(mmToInches(25.4)).toBe(1);
      expect(mmToInches(508)).toBe(20);
      expect(inchesToMm(1)).toBe(25);
      expect(inchesToMm(10)).toBe(254);
    });

    it('converts cm to inches and back', () => {
      expect(cmToInches(2.54)).toBe(1);
      expect(cmToInches(100)).toBe(39.4);
      expect(inchesToCm(1)).toBe(2.5);
      expect(inchesToCm(10)).toBe(25.4);
    });

    it('converts cm to feet and back', () => {
      expect(cmToFeet(30.48)).toBe(1);
      expect(feetToCm(1)).toBe(30.5);
    });

    it('formats single dimension in metric and imperial', () => {
      expect(formatDimension(100, 'metric')).toBe('100 cm');
      expect(formatDimension(100, 'imperial')).toBe('39.4 in');
    });

    it('formats 3D dimensions in metric and imperial', () => {
      expect(formatDimensions3D(100, 50, 40, 'metric')).toBe('100 × 50 × 40 cm');
      expect(formatDimensions3D(100, 50, 40, 'imperial')).toBe('39.4 × 19.7 × 15.7 in');
    });
  });

  describe('volume conversions', () => {
    it('converts liters to cubic feet and back', () => {
      expect(litersToCubicFeet(500)).toBe(17.7);
      expect(cubicFeetToLiters(17.6573)).toBe(500);
    });

    it('converts m3 to cubic feet and back', () => {
      expect(m3ToCubicFeet(1)).toBe(35.3);
      expect(cubicFeetToM3(35.3146667)).toBe(1);
    });

    it('formats volume in metric and imperial', () => {
      expect(formatVolume(450, 'metric')).toBe('450 L');
      expect(formatVolume(450, 'imperial')).toBe('15.9 cu ft');
    });

    it('formats m3 in metric and imperial', () => {
      expect(formatM3(2.5, 'metric')).toBe('2.5 m³');
      expect(formatM3(2.5, 'imperial')).toBe('88.3 cu ft');
    });
  });

  describe('weight conversions', () => {
    it('converts kg to pounds and back', () => {
      expect(kgToPounds(100)).toBe(220.5);
      expect(poundsToKg(220.462)).toBe(100);
    });

    it('formats weight in metric and imperial', () => {
      expect(formatWeight(75, 'metric')).toBe('75 kg');
      expect(formatWeight(75, 'imperial')).toBe('165.3 lbs');
    });

    it('persists selected unit system to SQLite app_settings', () => {
      const { getAppSetting } = require('../../data/db');
      setUnitSystem('imperial');
      expect(getAppSetting('unit_system')).toBe('imperial');
      setUnitSystem('metric');
      expect(getAppSetting('unit_system')).toBe('metric');
    });
  });
});
