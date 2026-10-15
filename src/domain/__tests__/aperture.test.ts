import { evaluateAperturePassage } from '../geometry/aperture';

describe('AperturePassage (RD-03)', () => {
  const aperture = {
    widthMm: 1000,
    heightMm: 750,
    thresholdHeightMm: 50,
  };

  it('allows passage when item cross section fits aperture with 15mm buffer', () => {
    // Item 1200 x 900 x 600 mm:
    // Smallest frontal cross section is 900 x 600 mm (+ 15 mm -> 915 x 615 mm)
    // 915 <= 1000 and 615 <= 750 -> can pass!
    const res = evaluateAperturePassage(
      { lengthMm: 1200, widthMm: 900, heightMm: 600 },
      aperture
    );

    expect(res.canPassThroughAperture).toBe(true);
    expect(res.minRequiredWidthMm).toBe(615);
    expect(res.minRequiredHeightMm).toBe(915);
  });

  it('rejects item when smallest cross section exceeds aperture dimensions', () => {
    // Item 1200 x 1050 x 800 mm:
    // Smallest cross section is 1050 x 800 mm (+15mm -> 1065 x 815 mm)
    // Exceeds 1000 x 750 aperture
    const res = evaluateAperturePassage(
      { lengthMm: 1200, widthMm: 1050, heightMm: 800 },
      aperture
    );

    expect(res.canPassThroughAperture).toBe(false);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});
