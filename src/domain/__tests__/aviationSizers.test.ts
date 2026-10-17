import {
  validateAviationSizer,
  AIRLINE_RULES,
  SOFT_BAG_COMPRESSION_FACTOR,
  AirlineCode,
} from '../standards/aviationSizers';

describe('AviationSizers Deep Coverage (RD-14, SPRZ-04, Luggage Engineering)', () => {
  it('exposes valid configuration and rules for all 5 major European airlines', () => {
    const supportedAirlines: AirlineCode[] = ['ryanair', 'wizzair', 'lot', 'easyjet', 'lufthansa'];
    expect(Object.keys(AIRLINE_RULES)).toEqual(supportedAirlines);

    supportedAirlines.forEach((code) => {
      const rule = AIRLINE_RULES[code];
      expect(rule.airline).toBe(code);
      expect(rule.airlineName.length).toBeGreaterThan(0);
      expect(rule.smallFreeBagMm.length).toBeGreaterThan(0);
      expect(rule.smallFreeBagMm.width).toBeGreaterThan(0);
      expect(rule.smallFreeBagMm.height).toBeGreaterThan(0);
      expect(rule.priorityCabinBagMm.length).toBeGreaterThanOrEqual(rule.smallFreeBagMm.length);
      expect(rule.sizerToleranceMm).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Dimension Orientation Invariance (Sorting)', () => {
    it('treats rotated bag dimensions identically regardless of input axis order', () => {
      const orientationA = { length: 400, width: 250, height: 200 };
      const orientationB = { length: 200, width: 400, height: 250 };
      const orientationC = { length: 250, width: 200, height: 400 };

      const resA = validateAviationSizer(orientationA, false, 'ryanair');
      const resB = validateAviationSizer(orientationB, false, 'ryanair');
      const resC = validateAviationSizer(orientationC, false, 'ryanair');

      expect(resA.fitsFreeSmallBag).toBe(true);
      expect(resB.fitsFreeSmallBag).toBe(true);
      expect(resC.fitsFreeSmallBag).toBe(true);
      expect(resA.effectiveBagDimensionsMm).toEqual(resB.effectiveBagDimensionsMm);
      expect(resB.effectiveBagDimensionsMm).toEqual(resC.effectiveBagDimensionsMm);
    });
  });

  describe('Metal Sizer Physical Tolerances', () => {
    it('accepts bag utilizing the 15 mm sizer margin in Ryanair (400+15, 250+15, 200+15 mm)', () => {
      // Ryanair small: 400 x 250 x 200 mm + 15 mm tolerance = 415 x 265 x 215 mm
      const exactFit = validateAviationSizer(
        { length: 415, width: 265, height: 215 },
        false,
        'ryanair'
      );
      expect(exactFit.fitsFreeSmallBag).toBe(true);

      // 1 mm over tolerance fails
      const overFit = validateAviationSizer(
        { length: 416, width: 265, height: 215 },
        false,
        'ryanair'
      );
      expect(overFit.fitsFreeSmallBag).toBe(false);
      expect(overFit.fitsPriorityCabinBag).toBe(true);
    });

    it('respects the stricter 10 mm sizer margin in LOT and Lufthansa', () => {
      // LOT small: 400 x 350 x 120 mm + 10 mm tolerance = 410 x 360 x 130 mm
      const fitLot = validateAviationSizer(
        { length: 410, width: 360, height: 130 },
        false,
        'lot'
      );
      expect(fitLot.fitsFreeSmallBag).toBe(true);

      const overLot = validateAviationSizer(
        { length: 411, width: 360, height: 130 },
        false,
        'lot'
      );
      expect(overLot.fitsFreeSmallBag).toBe(false);
    });
  });

  describe('Soft Bag Compression Mechanics (-10%)', () => {
    it('verifies compression constant is exactly 0.90', () => {
      expect(SOFT_BAG_COMPRESSION_FACTOR).toBe(0.9);
    });

    it('compresses soft duffel bag to fit within sizer where rigid case would fail', () => {
      // 450 x 280 x 230 mm rigid case:
      // sorted: 450, 280, 230. Ryanair limits with tolerance: 415, 265, 215 -> FAILS!
      const rigidRes = validateAviationSizer(
        { length: 450, width: 280, height: 230 },
        false,
        'ryanair'
      );
      expect(rigidRes.fitsFreeSmallBag).toBe(false);
      expect(rigidRes.warnings.some((w) => w.includes('sztywną skorupą'))).toBe(true);

      // Same bag soft:
      // 450 * 0.9 = 405 <= 415
      // 280 * 0.9 = 252 <= 265
      // 230 * 0.9 = 207 <= 215 -> PASSES!
      const softRes = validateAviationSizer(
        { length: 450, width: 280, height: 230 },
        true,
        'ryanair'
      );
      expect(softRes.fitsFreeSmallBag).toBe(true);
      expect(softRes.effectiveBagDimensionsMm).toEqual({
        length: 405,
        width: 252,
        height: 207,
      });
    });
  });

  describe('Cabin Baggage Tiers & Gate Fee Warnings', () => {
    it('generates Priority advisory for trolley that fits overhead compartment', () => {
      // 550 x 400 x 200 mm cabin trolley in Wizz Air
      const res = validateAviationSizer(
        { length: 550, width: 400, height: 200 },
        false,
        'wizzair'
      );

      expect(res.fitsFreeSmallBag).toBe(false);
      expect(res.fitsPriorityCabinBag).toBe(true);
      expect(res.warnings.some((w) => w.includes('Bagaż przekracza darmowy limit'))).toBe(true);
      expect(res.recommendations.some((r) => r.includes('Priority'))).toBe(true);
    });

    it('generates cargo hold warning with gate surcharge warning when bag exceeds cabin limits', () => {
      // 780 x 500 x 320 mm large suitcase
      const res = validateAviationSizer(
        { length: 780, width: 500, height: 320 },
        false,
        'easyjet'
      );

      expect(res.fitsFreeSmallBag).toBe(false);
      expect(res.fitsPriorityCabinBag).toBe(false);
      expect(res.warnings.some((w) => w.includes('przekracza również duży bagaż'))).toBe(true);
      expect(res.recommendations.some((r) => r.includes('luku') && r.includes('250 zł'))).toBe(true);
    });
  });
});
