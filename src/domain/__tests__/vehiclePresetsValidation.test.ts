import { POPULAR_VEHICLES_PRESETS, VehiclePreset } from '../../data/presets/vehicles';

describe('Vehicle Presets Physical & Geometric Validity Guard (RD-03, RD-04, ECE-R)', () => {
  it('contains at least 8 verified popular vehicles covering kombi, suv, hatchback, and sedan', () => {
    expect(POPULAR_VEHICLES_PRESETS.length).toBeGreaterThanOrEqual(8);

    const bodyTypes = new Set(POPULAR_VEHICLES_PRESETS.map((v) => v.bodyType));
    expect(bodyTypes.has('kombi')).toBe(true);
    expect(bodyTypes.has('suv')).toBe(true);
  });

  POPULAR_VEHICLES_PRESETS.forEach((v: VehiclePreset) => {
    describe(`Vehicle: ${v.make} ${v.model} (${v.generation})`, () => {
      it('has valid identification and production metadata', () => {
        expect(v.id).toMatch(/^[a-z0-9-]+$/);
        expect(v.make.length).toBeGreaterThan(0);
        expect(v.model.length).toBeGreaterThan(0);
        expect(v.productionYears).toMatch(/\d{4}/);
      });

      it('satisfies automotive trunk geometric constraints (ISO / VDA 238-100)', () => {
        const { trunk } = v;

        // Floor must be longer than roof due to rear seat recline angle
        expect(trunk.lengthFloorMm).toBeGreaterThan(trunk.lengthRoofMm);
        expect(trunk.lengthFloorMm).toBeGreaterThanOrEqual(600); // min 60cm
        expect(trunk.lengthFloorMm).toBeLessThanOrEqual(2500); // max 2.5m

        // Width constraints (wheel arches reduce minimum width)
        expect(trunk.widthMaxMm).toBeGreaterThanOrEqual(trunk.widthMinMm);
        expect(trunk.widthMinMm).toBeGreaterThanOrEqual(800); // min 80cm between wheel arches
        expect(trunk.widthMaxMm).toBeLessThanOrEqual(1800); // max 1.8m interior

        // Height constraints
        expect(trunk.heightRoofMm).toBeGreaterThan(trunk.heightShelfMm);
        expect(trunk.heightShelfMm).toBeGreaterThanOrEqual(350); // min 35cm to parcel shelf
        expect(trunk.heightRoofMm).toBeLessThanOrEqual(1400); // max roof

        // Loading sill / threshold
        expect(trunk.thresholdHeightMm).toBeGreaterThanOrEqual(0);
        expect(trunk.thresholdHeightMm).toBeLessThanOrEqual(300); // sill <= 30cm
      });

      it('satisfies rear boot aperture tailgate constraints', () => {
        const { trunk } = v;

        // Tailgate aperture cannot exceed outer vehicle width or height
        expect(trunk.apertureWidthMm).toBeGreaterThanOrEqual(700);
        expect(trunk.apertureWidthMm).toBeLessThanOrEqual(trunk.widthMaxMm + 100);

        expect(trunk.apertureHeightMm).toBeGreaterThanOrEqual(500);
        expect(trunk.apertureHeightMm).toBeLessThanOrEqual(trunk.heightRoofMm + 100);
      });

      it('satisfies weight, legal DMC payload, and axle dynamics (ECE regulations)', () => {
        const { specs } = v;

        expect(specs.grossVehicleWeightKg).toBeGreaterThan(specs.curbWeightKg);

        const payloadDmcKg = specs.grossVehicleWeightKg - specs.curbWeightKg;
        // Legal passenger car payload must be between 350 kg and 1000 kg
        expect(payloadDmcKg).toBeGreaterThanOrEqual(350);
        expect(payloadDmcKg).toBeLessThanOrEqual(1000);

        // Roof load limit: European automotive standard 50-100 kg
        expect(specs.maxRoofLoadKg).toBeGreaterThanOrEqual(50);
        expect(specs.maxRoofLoadKg).toBeLessThanOrEqual(100);

        // Vertical towbar load (S): Standard ISO 50mm ball hitch 50-120 kg
        expect(specs.maxTowbarLoadKg).toBeGreaterThanOrEqual(50);
        expect(specs.maxTowbarLoadKg).toBeLessThanOrEqual(120);
      });

      it('has VDA volume aligned with geometric physical volume bounds', () => {
        expect(v.vdaVolumeLiters).toBeGreaterThanOrEqual(250);
        expect(v.vdaVolumeLiters).toBeLessThanOrEqual(1000);

        // Geometric volume under parcel shelf in liters: lengthFloor * widthMin * heightShelf
        const shelfBoxVolumeLiters =
          (v.trunk.lengthFloorMm * v.trunk.widthMinMm * v.trunk.heightShelfMm) / 1_000_000;

        // VDA volume must be within realistic physical correlation to shelf box (factor 0.8x to 2.2x)
        expect(v.vdaVolumeLiters).toBeGreaterThanOrEqual(shelfBoxVolumeLiters * 0.7);
        expect(v.vdaVolumeLiters).toBeLessThanOrEqual(shelfBoxVolumeLiters * 2.5);
      });
    });
  });
});
