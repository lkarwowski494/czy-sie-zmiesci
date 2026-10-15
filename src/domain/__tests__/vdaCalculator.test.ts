import { calculateVdaCapacity } from '../standards/vdaCalculator';

describe('VdaCalculator (RD-01)', () => {
  it('correctly calculates the number of VDA 1-liter blocks in a rectangular trunk', () => {
    // 1000 x 1000 x 500 mm:
    // X blocks = 1000 / 200 = 5
    // Y blocks = 1000 / 100 = 10
    // Z blocks = 500 / 50 = 10
    // Total blocks = 5 * 10 * 10 = 500 blocks = 500 liters
    const res = calculateVdaCapacity({
      lengthMm: 1000,
      widthMm: 1000,
      heightMm: 500,
    });

    expect(res.vdaBlocksCount).toBe(500);
    expect(res.vdaVolumeLiters).toBe(500);
    expect(res.geometricRawVolumeLiters).toBe(500);
    expect(res.wastedVolumeLossPct).toBe(0);
  });

  it('calculates wasted volume when dimensions are not multiples of 200x100x50 mm', () => {
    // 950 x 850 x 420 mm
    // X: floor(950 / 200) = 4
    // Y: floor(850 / 100) = 8
    // Z: floor(420 / 50) = 8
    // Blocks = 4 * 8 * 8 = 256 liters
    // Geometric volume = 950 * 850 * 420 = 339,150,000 mm³ ≈ 339 liters
    const res = calculateVdaCapacity({
      lengthMm: 950,
      widthMm: 850,
      heightMm: 420,
    });

    expect(res.vdaBlocksCount).toBe(256);
    expect(res.vdaVolumeLiters).toBe(256);
    expect(res.geometricRawVolumeLiters).toBe(339);
    expect(res.wastedVolumeLossPct).toBeGreaterThan(0);
  });

  it('handles zero or small dimension trunk gracefully', () => {
    const res = calculateVdaCapacity({
      lengthMm: 100,
      widthMm: 50,
      heightMm: 20,
    });

    expect(res.vdaBlocksCount).toBe(0);
    expect(res.vdaVolumeLiters).toBe(0);
  });
});
