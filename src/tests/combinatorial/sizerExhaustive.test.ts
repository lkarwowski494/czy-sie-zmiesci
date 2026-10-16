/**
 * Czy się zmieści? (FitCheck) — Wyczerpująca macierz kombinatoryczna: Sizer Lotniczy i Paczkomaty
 * Testuje reguły RD-09, RD-14 oraz SPRZ-03, SPRZ-04 dla linii lotniczych i automatów paczkowych.
 */

import {
  validateAviationSizer,
  AIRLINE_RULES,
  AirlineCode,
  SOFT_BAG_COMPRESSION_FACTOR,
} from '../../domain/standards/aviationSizers';
import {
  validateInPostLocker,
  INPOST_LOCKER_LIMITS,
  LOCKER_SAFETY_MARGIN_MM,
} from '../../domain/standards/parcelLockers';

describe('Exhaustive Combinatorial: Aviation Sizers & Parcel Locker Matrix', () => {
  describe('Aviation Sizers: Linie lotnicze vs Wymiary bagażu (Twarda skorupa)', () => {
    const airlines: AirlineCode[] = ['ryanair', 'wizzair', 'lot', 'easyjet', 'lufthansa'];
    const lengths = [350, 380, 400, 410, 420, 440, 450, 460, 500, 550, 560, 580];
    const widths = [200, 240, 250, 260, 300, 350, 360, 400];
    const heights = [90, 100, 120, 150, 180, 200, 230];

    const bagDimensions: Array<{ length: number; width: number; height: number }> = [];
    for (const length of lengths) {
      for (const width of widths) {
        for (const height of heights) {
          bagDimensions.push({ length, width, height });
        }
      }
    }

    describe.each(airlines)('Linia lotnicza: %s', airline => {
      const rule = AIRLINE_RULES[airline];
      const smallSorted = [
        rule.smallFreeBagMm.length,
        rule.smallFreeBagMm.width,
        rule.smallFreeBagMm.height,
      ].sort((a, b) => b - a);

      const prioSorted = [
        rule.priorityCabinBagMm.length,
        rule.priorityCabinBagMm.width,
        rule.priorityCabinBagMm.height,
      ].sort((a, b) => b - a);

      test.each(bagDimensions.map(d => [`${d.length}x${d.width}x${d.height}mm`, d]))(
        'Twarda walizka %s w sizerze',
        (_label, dim) => {
          const res = validateAviationSizer(dim, false, airline);

          const sorted = [dim.length, dim.width, dim.height].sort((a, b) => b - a);
          const expectedFitsSmall =
            sorted[0] <= smallSorted[0] + rule.sizerToleranceMm &&
            sorted[1] <= smallSorted[1] + rule.sizerToleranceMm &&
            sorted[2] <= smallSorted[2] + rule.sizerToleranceMm;

          const expectedFitsPrio =
            sorted[0] <= prioSorted[0] + rule.sizerToleranceMm &&
            sorted[1] <= prioSorted[1] + rule.sizerToleranceMm &&
            sorted[2] <= prioSorted[2] + rule.sizerToleranceMm;

          expect(res.fitsFreeSmallBag).toBe(expectedFitsSmall);
          expect(res.fitsPriorityCabinBag).toBe(expectedFitsPrio);
          expect(res.airline).toBe(airline);
          expect(res.effectiveBagDimensionsMm.length).toBe(sorted[0]);
          expect(res.effectiveBagDimensionsMm.width).toBe(sorted[1]);
          expect(res.effectiveBagDimensionsMm.height).toBe(sorted[2]);

          if (!expectedFitsSmall && expectedFitsPrio) {
            expect(res.recommendations.some(r => r.includes('Priority'))).toBe(true);
          } else if (!expectedFitsPrio) {
            expect(res.recommendations.some(r => r.includes('Check-in'))).toBe(true);
          }
        }
      );
    });
  });

  describe('Aviation Sizers: Miękka torba ze współczynnikiem kompresji 10%', () => {
    const airlines: AirlineCode[] = ['ryanair', 'wizzair'];
    const lengths = [400, 420, 440, 500, 550, 580];
    const widths = [220, 250, 300, 350, 400];
    const heights = [100, 150, 200, 220, 250];

    const softBags: Array<{ length: number; width: number; height: number }> = [];
    for (const length of lengths) {
      for (const width of widths) {
        for (const height of heights) {
          softBags.push({ length, width, height });
        }
      }
    }

    describe.each(airlines)('Linia lotnicza: %s (miękka torba)', airline => {
      const rule = AIRLINE_RULES[airline];
      const smallSorted = [
        rule.smallFreeBagMm.length,
        rule.smallFreeBagMm.width,
        rule.smallFreeBagMm.height,
      ].sort((a, b) => b - a);

      test.each(softBags.map(d => [`${d.length}x${d.width}x${d.height}mm`, d]))(
        'Miękka torba %s z kompresją',
        (_label, dim) => {
          const res = validateAviationSizer(dim, true, airline);

          const sorted = [dim.length, dim.width, dim.height].sort((a, b) => b - a);
          const compressed = [
            Math.round(sorted[0] * SOFT_BAG_COMPRESSION_FACTOR),
            Math.round(sorted[1] * SOFT_BAG_COMPRESSION_FACTOR),
            Math.round(sorted[2] * SOFT_BAG_COMPRESSION_FACTOR),
          ];

          const expectedFitsSmall =
            compressed[0] <= smallSorted[0] + rule.sizerToleranceMm &&
            compressed[1] <= smallSorted[1] + rule.sizerToleranceMm &&
            compressed[2] <= smallSorted[2] + rule.sizerToleranceMm;

          expect(res.fitsFreeSmallBag).toBe(expectedFitsSmall);
          expect(res.effectiveBagDimensionsMm.length).toBe(compressed[0]);
          expect(res.effectiveBagDimensionsMm.width).toBe(compressed[1]);
          expect(res.effectiveBagDimensionsMm.height).toBe(compressed[2]);
        }
      );
    });
  });

  describe('Paczkomaty InPost: Matryca Gabarytów A/B/C i limitu wagi 25 kg', () => {
    const heights = [30, 50, 70, 75, 80, 90, 120, 150, 180, 190, 220, 300, 380, 400, 410, 430];
    const widths = [150, 250, 350, 370, 380, 390];
    const lengths = [200, 400, 600, 630, 640, 650];
    const weights = [10, 25, 26];

    const parcelCases: Array<{
      h: number;
      w: number;
      l: number;
      weight: number;
    }> = [];

    for (const h of heights) {
      for (const w of widths) {
        for (const l of lengths) {
          for (const weight of weights) {
            parcelCases.push({ h, w, l, weight });
          }
        }
      }
    }

    test.each(parcelCases.map(c => [`${c.h}x${c.w}x${c.l}mm_${c.weight}kg`, c]))(
      'Paczka: %s',
      (_label, c) => {
        const res = validateInPostLocker({ heightMm: c.h, widthMm: c.w, lengthMm: c.l }, c.weight);

        // Sortowanie i bufor bezpieczeństwa 10 mm
        const sorted = [c.h, c.w, c.l].sort((a, b) => a - b);
        const effH = sorted[0] + LOCKER_SAFETY_MARGIN_MM;
        const effW = sorted[1] + LOCKER_SAFETY_MARGIN_MM;
        const effL = sorted[2] + LOCKER_SAFETY_MARGIN_MM;

        expect(res.effectiveParcelDimensionsMm.heightMm).toBe(effH);
        expect(res.effectiveParcelDimensionsMm.widthMm).toBe(effW);
        expect(res.effectiveParcelDimensionsMm.lengthMm).toBe(effL);

        // Limit wagi 25 kg
        if (c.weight > 25) {
          expect(res.fits).toBe(false);
          expect(res.recommendedSize).toBeNull();
          expect(res.warnings.some(w => w.includes('25 kg'))).toBe(true);
        } else {
          // Weryfikacja dopasowania do skrytek A, B, C
          const fitsA =
            effH <= INPOST_LOCKER_LIMITS[0].maxDimensionMm.heightMm &&
            effW <= INPOST_LOCKER_LIMITS[0].maxDimensionMm.widthMm &&
            effL <= INPOST_LOCKER_LIMITS[0].maxDimensionMm.lengthMm;

          const fitsB =
            effH <= INPOST_LOCKER_LIMITS[1].maxDimensionMm.heightMm &&
            effW <= INPOST_LOCKER_LIMITS[1].maxDimensionMm.widthMm &&
            effL <= INPOST_LOCKER_LIMITS[1].maxDimensionMm.lengthMm;

          const fitsC =
            effH <= INPOST_LOCKER_LIMITS[2].maxDimensionMm.heightMm &&
            effW <= INPOST_LOCKER_LIMITS[2].maxDimensionMm.widthMm &&
            effL <= INPOST_LOCKER_LIMITS[2].maxDimensionMm.lengthMm;

          if (fitsA) {
            expect(res.fits).toBe(true);
            expect(res.recommendedSize).toBe('A');
          } else if (fitsB) {
            expect(res.fits).toBe(true);
            expect(res.recommendedSize).toBe('B');
          } else if (fitsC) {
            expect(res.fits).toBe(true);
            expect(res.recommendedSize).toBe('C');
          } else {
            expect(res.fits).toBe(false);
            expect(res.recommendedSize).toBeNull();
            expect(res.warnings.some(w => w.includes('Gabaryt C'))).toBe(true);
          }
        }
      }
    );
  });
});
