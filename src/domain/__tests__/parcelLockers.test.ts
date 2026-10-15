import { validateInPostLocker } from '../standards/parcelLockers';

describe('ParcelLockers (RD-09, SPRZ-03)', () => {
  it('identifies Gabaryt A for small flat packages with margin', () => {
    // Gabaryt A limit is 80 x 380 x 640 mm. With 10 mm margin, max parcel is 70 x 370 x 630 mm.
    const res = validateInPostLocker(
      { heightMm: 60, widthMm: 200, lengthMm: 300 },
      2.5
    );

    expect(res.fits).toBe(true);
    expect(res.recommendedSize).toBe('A');
    expect(res.warnings).toHaveLength(0);
  });

  it('qualifies for Gabaryt B when height exceeds Gabaryt A but fits under 190 mm', () => {
    // 120 mm height exceeds Gabaryt A (80 mm) but fits Gabaryt B (190 mm)
    const res = validateInPostLocker(
      { heightMm: 120, widthMm: 250, lengthMm: 400 },
      8.0
    );

    expect(res.fits).toBe(true);
    expect(res.recommendedSize).toBe('B');
  });

  it('qualifies for Gabaryt C when height exceeds Gabaryt B', () => {
    // 250 mm height exceeds Gabaryt B (190 mm) but fits Gabaryt C (410 mm)
    const res = validateInPostLocker(
      { heightMm: 250, widthMm: 350, lengthMm: 550 },
      15.0
    );

    expect(res.fits).toBe(true);
    expect(res.recommendedSize).toBe('C');
  });

  it('rejects parcel exceeding Gabaryt C dimensions', () => {
    // 450 mm height exceeds 410 mm
    const res = validateInPostLocker(
      { heightMm: 450, widthMm: 300, lengthMm: 500 },
      10.0
    );

    expect(res.fits).toBe(false);
    expect(res.recommendedSize).toBeNull();
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it('rejects parcel exceeding 25 kg weight limit', () => {
    const res = validateInPostLocker(
      { heightMm: 50, widthMm: 100, lengthMm: 150 },
      28.5
    );

    expect(res.fits).toBe(false);
    expect(res.warnings.some(w => w.includes('25 kg'))).toBe(true);
  });
});
