import { validateAviationSizer } from '../standards/aviationSizers';

describe('AviationSizers (RD-14, SPRZ-04)', () => {
  it('allows small free bag that fits underseat for Ryanair', () => {
    // Ryanair small bag: 400 x 250 x 200 mm (+ 15 mm tolerance)
    const res = validateAviationSizer(
      { length: 390, width: 240, height: 190 },
      false, // rigid
      'ryanair'
    );

    expect(res.fitsFreeSmallBag).toBe(true);
    expect(res.fitsPriorityCabinBag).toBe(true);
  });

  it('allows slightly larger soft bag due to 10% compression factor', () => {
    // 430 mm compressed by 0.9 = 387 mm (fits 400 + 15 mm)
    const res = validateAviationSizer(
      { length: 430, width: 260, height: 210 },
      true, // soft bag
      'ryanair'
    );

    expect(res.fitsFreeSmallBag).toBe(true);
  });

  it('identifies bag fitting Priority Cabin Bag but not small free underseat bag', () => {
    // 520 x 380 x 190 mm (standard cabin trolley)
    const res = validateAviationSizer(
      { length: 520, width: 380, height: 190 },
      false,
      'wizzair'
    );

    expect(res.fitsFreeSmallBag).toBe(false);
    expect(res.fitsPriorityCabinBag).toBe(true);
    expect(res.recommendations.some(r => r.includes('Priority'))).toBe(true);
  });

  it('rejects oversized luggage exceeding cabin limits for LOT', () => {
    // 700 mm length (check-in trunk)
    const res = validateAviationSizer(
      { length: 700, width: 500, height: 300 },
      false,
      'lot'
    );

    expect(res.fitsFreeSmallBag).toBe(false);
    expect(res.fitsPriorityCabinBag).toBe(false);
    expect(res.recommendations.some(r => r.includes('luku'))).toBe(true);
  });
});
