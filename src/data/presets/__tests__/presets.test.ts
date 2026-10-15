/**
 * Czy się zmieści? (FitCheck) — Testy Poprawności i Spójności Biblioteki Wzorców (Presets)
 * Weryfikuje fizyczne parametry geometryczne, wagowe i homologacyjne pojazdów, ładunków i floty (BRD Rozdział 11)
 */

import { POPULAR_VEHICLES_PRESETS, VehiclePreset } from '../vehicles';
import { CARGO_ITEMS_PRESETS, ExtendedCargoItemPreset } from '../cargoItems';
import { MOVING_FLEET_PRESETS, VanSpecPreset } from '../movingFleet';

describe('Presets Integrity & Physical Contracts (Biblioteka Modeli i Ładunków)', () => {
  describe('Vehicle Presets (Katalog Pojazdów)', () => {
    it('contains all required top European models (Skoda, VW, Toyota, Dacia, Tesla, Ford, BMW)', () => {
      const makes = new Set(POPULAR_VEHICLES_PRESETS.map((v: VehiclePreset) => v.make));
      expect(makes.has('Škoda')).toBe(true);
      expect(makes.has('Volkswagen')).toBe(true);
      expect(makes.has('Toyota')).toBe(true);
      expect(makes.has('Dacia')).toBe(true);
      expect(makes.has('Tesla')).toBe(true);
      expect(makes.has('Ford')).toBe(true);
      expect(makes.has('BMW')).toBe(true);
    });

    it('ensures each vehicle has realistic physical and legal dimensions', () => {
      for (const v of POPULAR_VEHICLES_PRESETS) {
        expect(v.specs.curbWeightKg).toBeGreaterThan(1000);
        expect(v.specs.curbWeightKg).toBeLessThan(3500);

        expect(v.specs.grossVehicleWeightKg).toBeGreaterThan(v.specs.curbWeightKg);

        expect(v.specs.maxRoofLoadKg).toBeGreaterThanOrEqual(50);
        expect(v.specs.maxRoofLoadKg).toBeLessThanOrEqual(150);

        expect(v.specs.maxTowbarLoadKg).toBeGreaterThanOrEqual(50);
        expect(v.specs.maxTowbarLoadKg).toBeLessThanOrEqual(150);
      }
    });

    it('validates trunk spaces and aperture contracts for all vehicles', () => {
      for (const v of POPULAR_VEHICLES_PRESETS) {
        const s = v.trunk;
        expect(s.lengthFloorMm).toBeGreaterThan(500);
        expect(s.lengthRoofMm).toBeLessThanOrEqual(s.lengthFloorMm);

        expect(s.widthMinMm).toBeGreaterThan(800);
        expect(s.widthMaxMm).toBeGreaterThanOrEqual(s.widthMinMm);

        expect(s.heightRoofMm).toBeGreaterThan(500);
        expect(s.heightShelfMm).toBeLessThan(s.heightRoofMm);

        expect(s.apertureWidthMm).toBeGreaterThan(700);
        expect(s.apertureHeightMm).toBeGreaterThan(500);
        expect(s.thresholdHeightMm).toBeGreaterThanOrEqual(0);

        expect(v.vdaVolumeLiters).toBeGreaterThan(200);
        expect(v.vdaVolumeLiters).toBeLessThan(2500);
      }
    });
  });

  describe('Cargo Item Presets (Katalog Ładunków)', () => {
    it('contains standard categories: karton, walizka, mebel_ikea, agd, sport', () => {
      const categories = new Set(CARGO_ITEMS_PRESETS.map((c: ExtendedCargoItemPreset) => c.category));
      expect(categories.has('karton')).toBe(true);
      expect(categories.has('walizka')).toBe(true);
      expect(categories.has('mebel_ikea')).toBe(true);
      expect(categories.has('agd')).toBe(true);
      expect(categories.has('sport')).toBe(true);
    });

    it('validates physical properties and legal/handling attributes', () => {
      for (const c of CARGO_ITEMS_PRESETS) {
        expect(c.id).toBeTruthy();
        expect(c.name).toBeTruthy();
        expect(c.dimensionsMm.lengthMm).toBeGreaterThan(0);
        expect(c.dimensionsMm.widthMm).toBeGreaterThan(0);
        expect(c.dimensionsMm.heightMm).toBeGreaterThan(0);
        expect(c.weightKg).toBeGreaterThan(0);
        expect(c.description).toBeTruthy();

        if (c.isFragile) {
          // Kruche przedmioty nie powinny być miękkie
          expect(c.isSoft).toBeFalsy();
        }

        if (c.rotationConstraint === 'Z_ONLY') {
          // Sprzęt z zakazem obrotu w innych osiach (AGD pionowe, wózek, klatka psa)
          expect(['agd', 'sport']).toContain(c.category);
        }
      }
    });

    it('verifies iconic Polish market items (Pralka, Lodówka, Walizka, Regał Billy, Wózek)', () => {
      const ids = CARGO_ITEMS_PRESETS.map((c: ExtendedCargoItemPreset) => c.id);
      expect(ids).toContain('appliance-washing-machine');
      expect(ids).toContain('appliance-fridge-freezer');
      expect(ids).toContain('luggage-cabin-standard');
      expect(ids).toContain('ikea-billy-bookcase');
      expect(ids).toContain('sport-pram-stroller');
    });
  });

  describe('Moving Fleet Presets (Flota Przeprowadzkowa)', () => {
    it('contains fleet categories from small van up to 20m3 box van', () => {
      const codes = MOVING_FLEET_PRESETS.map((f: VanSpecPreset) => f.code);
      expect(codes).toContain('L1H1');
      expect(codes).toContain('L2H2');
      expect(codes).toContain('L3H2');
      expect(codes).toContain('L4H3');
      expect(codes).toContain('BOX_20M3');
    });

    it('ensures realistic progressive volume and payload capacities across fleet', () => {
      for (let i = 1; i < MOVING_FLEET_PRESETS.length; i++) {
        const prev = MOVING_FLEET_PRESETS[i - 1];
        const curr = MOVING_FLEET_PRESETS[i];

        expect(curr.cargoVolumeM3).toBeGreaterThan(prev.cargoVolumeM3);
        expect(curr.cargoLengthMm).toBeGreaterThan(prev.cargoLengthMm);
      }
    });

    it('verifies tail lift flag on box van 20m3', () => {
      const boxVan = MOVING_FLEET_PRESETS.find((f: VanSpecPreset) => f.code === 'BOX_20M3');
      expect(boxVan).toBeDefined();
      expect(boxVan!.hasTailLift).toBe(true);

      const l1h1 = MOVING_FLEET_PRESETS.find((f: VanSpecPreset) => f.code === 'L1H1');
      expect(l1h1).toBeDefined();
      expect(l1h1!.hasTailLift).toBe(false);
    });

    it('verifies category B driving license compatibility for all standard vans', () => {
      for (const van of MOVING_FLEET_PRESETS) {
        expect(van.categoryB).toBe(true);
        expect(van.maxPayloadKg).toBeGreaterThanOrEqual(950);
        expect(van.typicalExamples.length).toBeGreaterThan(0);
      }
    });
  });
});
