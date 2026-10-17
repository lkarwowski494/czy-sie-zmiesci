import React from 'react';
import { MultiCheckerMatrixView } from '../MultiCheckerMatrixView';
import {
  evaluateMultiCheckerMatrix,
  POPULAR_10_AIRLINES,
} from '../../domain/standards/multiCheckerMatrix';

describe('MultiCheckerMatrixView & Unified Multi-Standard Matrix (BR-LOT-001..004)', () => {
  describe('Component instantiation', () => {
    it('creates a valid React element for MultiCheckerMatrixView', () => {
      const element = React.createElement(MultiCheckerMatrixView);
      expect(React.isValidElement(element)).toBe(true);
      expect(element.type).toBe(MultiCheckerMatrixView);
    });
  });

  describe('Automaty Paczkowe Matrix (InPost, Orlen, DPD, Pocztex)', () => {
    it('evaluates standard shoebox (320x200x120 mm, 1.5 kg) across all locker networks', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 320,
        widthMm: 200,
        heightMm: 120,
        weightKg: 1.5,
      });

      expect(result.lockers.length).toBe(4);
      expect(result.totalLockersPassed).toBe(4);

      const inpost = result.lockers.find((l) => l.network === 'inpost')!;
      expect(inpost.fits).toBe(true);
      expect(inpost.recommendedBox).toBe('Gabaryt B'); // 120mm exceeds Gabaryt A (80mm)

      const orlen = result.lockers.find((l) => l.network === 'orlen')!;
      expect(orlen.fits).toBe(true);

      const dpd = result.lockers.find((l) => l.network === 'dpd')!;
      expect(dpd.fits).toBe(true);

      const pocztex = result.lockers.find((l) => l.network === 'pocztex')!;
      expect(pocztex.fits).toBe(true);
    });

    it('identifies InPost Gabaryt A for slim documents and books (under 80 mm height)', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 300,
        widthMm: 210,
        heightMm: 50,
        weightKg: 1.0,
      });

      const inpost = result.lockers.find((l) => l.network === 'inpost')!;
      expect(inpost.fits).toBe(true);
      expect(inpost.recommendedBox).toBe('Gabaryt A');
    });

    it('identifies InPost Gabaryt C for tall/deep boxes (between 190 mm and 410 mm)', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 500,
        widthMm: 350,
        heightMm: 300,
        weightKg: 8.0,
      });

      const inpost = result.lockers.find((l) => l.network === 'inpost')!;
      expect(inpost.fits).toBe(true);
      expect(inpost.recommendedBox).toBe('Gabaryt C');
    });

    it('rejects parcel exceeding legal weight limits (25 kg for InPost/Orlen)', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 300,
        widthMm: 200,
        heightMm: 150,
        weightKg: 28, // > 25 kg InPost/Orlen limit
      });

      const inpost = result.lockers.find((l) => l.network === 'inpost')!;
      expect(inpost.fits).toBe(false);
      expect(inpost.recommendedBox).toBeNull();

      const orlen = result.lockers.find((l) => l.network === 'orlen')!;
      expect(orlen.fits).toBe(false);
      expect(orlen.recommendedBox).toBeNull();

      // DPD allows up to 31.5 kg
      const dpd = result.lockers.find((l) => l.network === 'dpd')!;
      expect(dpd.fits).toBe(true);
    });

    it('rejects parcel exceeding maximum locker box length (640 mm for InPost)', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 750, // exceeds 640mm
        widthMm: 200,
        heightMm: 150,
        weightKg: 5,
      });

      const inpost = result.lockers.find((l) => l.network === 'inpost')!;
      expect(inpost.fits).toBe(false);
      expect(inpost.recommendedBox).toBeNull();
    });
  });

  describe('European Airline Sizer Matrix (10 Airlines)', () => {
    it('verifies all 10 major European airlines are present in catalog', () => {
      expect(POPULAR_10_AIRLINES.length).toBe(10);
      const names = POPULAR_10_AIRLINES.map((a) => a.name);
      expect(names).toContain('Ryanair');
      expect(names).toContain('Wizz Air');
      expect(names).toContain('PLL LOT');
      expect(names).toContain('Lufthansa');
      expect(names).toContain('EasyJet');
    });

    it('evaluates compact backpack (400x200x200 mm) under Ryanair and Wizz Air personal item rules', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 400,
        widthMm: 200,
        heightMm: 200,
        weightKg: 5,
      });

      const ryanair = result.airlines.find((a) => a.code === 'ryanair')!;
      // Ryanair personal item is 400x200x250, Priority is 550x400x200
      expect(ryanair.fitsSmallFree).toBe(true);
      expect(ryanair.fitsPriorityCabin).toBe(true);
      expect(ryanair.advisory).toContain('Darmowy mały bagaż');

      const wizzair = result.airlines.find((a) => a.code === 'wizzair')!;
      // Wizz Air personal item is 400x300x200, Priority is 550x400x230
      expect(wizzair.fitsSmallFree).toBe(true);
      expect(wizzair.fitsPriorityCabin).toBe(true);
    });

    it('requires Priority fare when bag exceeds personal item but fits overhead cabin bin', () => {
      const result = evaluateMultiCheckerMatrix({
        lengthMm: 540,
        widthMm: 380,
        heightMm: 190,
        weightKg: 9,
      });

      const ryanair = result.airlines.find((a) => a.code === 'ryanair')!;
      expect(ryanair.fitsSmallFree).toBe(false);
      expect(ryanair.fitsPriorityCabin).toBe(true);
      expect(ryanair.advisory).toContain('Priority');

      const lot = result.airlines.find((a) => a.code === 'lot')!;
      // LOT cabin limit is 8 kg. Here weight is 9 kg -> exceeds weight limit
      expect(lot.fitsPriorityCabin).toBe(false);
      expect(lot.advisory.toLowerCase()).toContain('waga');
    });

    it('applies soft bag compressibility benefit (-10% allowance) for semi-flexible bags', () => {
      // Dimensions: 420 x 210 x 260 mm (slightly exceeds Ryanair limit 400 x 200 x 250)
      const rigidResult = evaluateMultiCheckerMatrix({
        lengthMm: 420,
        widthMm: 210,
        heightMm: 260,
        weightKg: 4,
        isSoftBag: false,
      });
      const ryanairRigid = rigidResult.airlines.find((a) => a.code === 'ryanair')!;
      expect(ryanairRigid.fitsSmallFree).toBe(false);

      // With soft bag compression: 420*0.9 = 378 mm, 210*0.9 = 189 mm, 260*0.9 = 234 mm (fits 400x200x250)
      const softResult = evaluateMultiCheckerMatrix({
        lengthMm: 420,
        widthMm: 210,
        heightMm: 260,
        weightKg: 4,
        isSoftBag: true,
      });
      const ryanairSoft = softResult.airlines.find((a) => a.code === 'ryanair')!;
      expect(ryanairSoft.fitsSmallFree).toBe(true);
    });
  });
});
