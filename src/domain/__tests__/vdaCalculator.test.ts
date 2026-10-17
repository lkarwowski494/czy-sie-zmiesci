import {
  calculateVdaCapacity,
  VDA_BLOCK_DIMENSIONS_MM,
  VDA_BLOCK_VOLUME_MM3,
} from '../standards/vdaCalculator';

describe('VdaCalculator & ISO 3832 / VDA Metrology Specification (RD-01)', () => {
  it('enforces ISO 3832 standard block dimensions (200x100x50 mm) and 1-liter volume', () => {
    expect(VDA_BLOCK_DIMENSIONS_MM.lengthMm).toBe(200);
    expect(VDA_BLOCK_DIMENSIONS_MM.widthMm).toBe(100);
    expect(VDA_BLOCK_DIMENSIONS_MM.heightMm).toBe(50);
    expect(VDA_BLOCK_VOLUME_MM3).toBe(1_000_000);
  });

  describe('Perfect Multiples Packing (0% Packaging Loss)', () => {
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

    it('calculates single block capacity correctly', () => {
      const res = calculateVdaCapacity({
        lengthMm: 200,
        widthMm: 100,
        heightMm: 50,
      });

      expect(res.vdaBlocksCount).toBe(1);
      expect(res.vdaVolumeLiters).toBe(1);
      expect(res.geometricRawVolumeLiters).toBe(1);
      expect(res.wastedVolumeLossPct).toBe(0);
    });
  });

  describe('Real-World Trunk Geometry and Non-Multiple Discretization Losses', () => {
    it('calculates realistic Škoda Octavia trunk volume and gap losses', () => {
      // Škoda Octavia approx trunk: 1050 mm floor, 1010 mm width, 570 mm height to shelf
      // X: floor(1050 / 200) = 5
      // Y: floor(1010 / 100) = 10
      // Z: floor(570 / 50) = 11
      // Blocks: 5 * 10 * 11 = 550 liters
      // Raw volume: 1050 * 1010 * 570 = 604,485,000 mm³ ≈ 604 liters
      const res = calculateVdaCapacity({
        lengthMm: 1050,
        widthMm: 1010,
        heightMm: 570,
      });

      expect(res.vdaBlocksCount).toBe(550);
      expect(res.vdaVolumeLiters).toBe(550);
      expect(res.geometricRawVolumeLiters).toBe(604);
      expect(res.wastedVolumeLossPct).toBe(9); // ~9% lost due to block quantization
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
      expect(res.wastedVolumeLossPct).toBe(24);
    });
  });

  describe('Boundary Edge Cases & Quantization Cutoffs', () => {
    it('yields 0 VDA blocks when any single dimension is smaller than VDA block minimum', () => {
      // Height 49 mm is just 1 mm shy of 50 mm block
      const res = calculateVdaCapacity({
        lengthMm: 1000,
        widthMm: 1000,
        heightMm: 49,
      });

      expect(res.vdaBlocksCount).toBe(0);
      expect(res.vdaVolumeLiters).toBe(0);
      expect(res.geometricRawVolumeLiters).toBe(49);
      expect(res.wastedVolumeLossPct).toBe(100);
    });

    it('handles zero or tiny dimension spaces gracefully without NaN or negative values', () => {
      const res = calculateVdaCapacity({
        lengthMm: 0,
        widthMm: 0,
        heightMm: 0,
      });

      expect(res.vdaBlocksCount).toBe(0);
      expect(res.vdaVolumeLiters).toBe(0);
      expect(res.geometricRawVolumeLiters).toBe(0);
      expect(res.wastedVolumeLossPct).toBe(0);
    });
  });
});
