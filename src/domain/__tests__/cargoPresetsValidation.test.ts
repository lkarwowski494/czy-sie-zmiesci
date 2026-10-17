import { CARGO_ITEMS_PRESETS, ExtendedCargoItemPreset } from '../../data/presets/cargoItems';

describe('Cargo Presets Physical Realism & Constraints Guard (RD-05, RD-06, B3)', () => {
  it('contains at least 15 verified cargo items spanning all core categories', () => {
    expect(CARGO_ITEMS_PRESETS.length).toBeGreaterThanOrEqual(15);

    const categories = new Set(CARGO_ITEMS_PRESETS.map((c) => c.category));
    expect(categories.has('karton')).toBe(true);
    expect(categories.has('walizka')).toBe(true);
    expect(categories.has('mebel_ikea')).toBe(true);
    expect(categories.has('agd')).toBe(true);
    expect(categories.has('sport')).toBe(true);
  });

  it('guarantees unique IDs across all cargo presets', () => {
    const ids = CARGO_ITEMS_PRESETS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  CARGO_ITEMS_PRESETS.forEach((item: ExtendedCargoItemPreset) => {
    describe(`Cargo item: ${item.name} (${item.id})`, () => {
      it('has valid metadata and description', () => {
        expect(item.id).toMatch(/^[a-z0-9-]+$/);
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(10);
      });

      it('has realistic positive integer millimeter dimensions', () => {
        const { lengthMm, widthMm, heightMm } = item.dimensionsMm;

        expect(lengthMm).toBeGreaterThanOrEqual(100);
        expect(widthMm).toBeGreaterThanOrEqual(100);
        expect(heightMm).toBeGreaterThanOrEqual(50);

        // Max passenger car / van cargo limit
        expect(lengthMm).toBeLessThanOrEqual(2500);
        expect(widthMm).toBeLessThanOrEqual(1500);
        expect(heightMm).toBeLessThanOrEqual(2000);

        // Must be integers
        expect(Number.isInteger(lengthMm)).toBe(true);
        expect(Number.isInteger(widthMm)).toBe(true);
        expect(Number.isInteger(heightMm)).toBe(true);
      });

      it('has positive weight and plausible physical density', () => {
        expect(item.weightKg).toBeGreaterThanOrEqual(0.5);
        expect(item.weightKg).toBeLessThanOrEqual(150);

        // Volume in m³
        const volumeM3 =
          (item.dimensionsMm.lengthMm * item.dimensionsMm.widthMm * item.dimensionsMm.heightMm) /
          1_000_000_000;
        const densityKgM3 = item.weightKg / volumeM3;

        // Density must be plausible: from light duvets (10 kg/m³) to dense appliances (1200 kg/m³)
        expect(densityKgM3).toBeGreaterThanOrEqual(10);
        expect(densityKgM3).toBeLessThanOrEqual(1500);
      });

      it('enforces safety constraints for fragile and electronic goods', () => {
        if (item.category === 'agd' && item.name.toLowerCase().includes('pralka')) {
          expect(item.rotationConstraint).toBe('Z_ONLY');
          expect(item.allowStacking).toBe(false);
          expect(item.weightKg).toBeGreaterThanOrEqual(40);
        }

        if (item.name.toLowerCase().includes('telewizor') || item.name.toLowerCase().includes('tv')) {
          expect(item.isFragile).toBe(true);
          expect(item.allowStacking).toBe(false);
          expect(item.rotationConstraint).toBe('Z_ONLY');
        }

        if (item.name.toLowerCase().includes('lodówka') || item.name.toLowerCase().includes('lodowka')) {
          expect(item.rotationConstraint).toBe('Z_ONLY');
          expect(item.allowStacking).toBe(false);
        }
      });
    });
  });
});
