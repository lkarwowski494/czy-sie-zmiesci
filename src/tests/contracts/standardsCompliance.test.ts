/**
 * Czy się zmieści? (FitCheck) — Warstwa 8: Testy Kontraktowe i Zgodności z Normami
 */

import { VDA_BLOCK_DIMENSIONS_MM, calculateVdaCapacity } from '../../domain/standards/vdaCalculator';
import { INPOST_LOCKER_LIMITS, validateInPostLocker } from '../../domain/standards/parcelLockers';
import { AIRLINE_RULES, validateAviationSizer } from '../../domain/standards/aviationSizers';
import { calculatePayloadDMC } from '../../domain/physics/payloadDMC';

describe('Standards & Legal Contracts Compliance (Warstwa 8)', () => {
  describe('Norma VDA 238-100 (Przemysł Motoryzacyjny)', () => {
    it('strictly satisfies 1-liter standard block dimensions: 200 x 100 x 50 mm', () => {
      expect(VDA_BLOCK_DIMENSIONS_MM.lengthMm).toBe(200);
      expect(VDA_BLOCK_DIMENSIONS_MM.widthMm).toBe(100);
      expect(VDA_BLOCK_DIMENSIONS_MM.heightMm).toBe(50);

      const blockVolumeMm3 =
        VDA_BLOCK_DIMENSIONS_MM.lengthMm *
        VDA_BLOCK_DIMENSIONS_MM.widthMm *
        VDA_BLOCK_DIMENSIONS_MM.heightMm;

      // 1 liter = 1 dm³ = 1,000,000 mm³
      expect(blockVolumeMm3).toBe(1_000_000);
    });

    it('calculates theoretical vs practical VDA packing volume', () => {
      const res = calculateVdaCapacity({
        lengthMm: 1000,
        widthMm: 1000,
        heightMm: 500,
      });

      expect(res.vdaVolumeLiters).toBeGreaterThan(0);
      expect(res.vdaBlocksCount).toBe(res.vdaVolumeLiters);
    });
  });

  describe('Standard InPost Paczkomat (A/B/C)', () => {
    it('strictly enforces official InPost locker limits and 25 kg weight ceiling', () => {
      const sizeA = INPOST_LOCKER_LIMITS.find(l => l.size === 'A')!;
      expect(sizeA.maxDimensionMm.heightMm).toBe(80);
      expect(sizeA.maxDimensionMm.widthMm).toBe(380);
      expect(sizeA.maxDimensionMm.lengthMm).toBe(640);
      expect(sizeA.maxWeightKg).toBe(25);

      const sizeB = INPOST_LOCKER_LIMITS.find(l => l.size === 'B')!;
      expect(sizeB.maxDimensionMm.heightMm).toBe(190);
      expect(sizeB.maxDimensionMm.widthMm).toBe(380);
      expect(sizeB.maxDimensionMm.lengthMm).toBe(640);
      expect(sizeB.maxWeightKg).toBe(25);

      const sizeC = INPOST_LOCKER_LIMITS.find(l => l.size === 'C')!;
      expect(sizeC.maxDimensionMm.heightMm).toBe(410);
      expect(sizeC.maxDimensionMm.widthMm).toBe(380);
      expect(sizeC.maxDimensionMm.lengthMm).toBe(640);
      expect(sizeC.maxWeightKg).toBe(25);
    });

    it('rejects parcel exceeding 25 kg limit even if dimensions fit Gabaryt A', () => {
      const res = validateInPostLocker(
        { heightMm: 70, widthMm: 300, lengthMm: 400 },
        26.0 // 26 kg > 25 kg
      );

      expect(res.fits).toBe(false);
      expect(res.warnings.some(w => w.includes('25 kg'))).toBe(true);
    });
  });

  describe('Regulacje Bagażowe Linii Lotniczych (IATA / Przewoźnicy)', () => {
    it('strictly enforces Ryanair free small bag rule (40 x 25 x 20 cm)', () => {
      const ryanair = AIRLINE_RULES['ryanair'];
      expect(ryanair.smallFreeBagMm).toEqual({ length: 400, width: 250, height: 200 });
      expect(ryanair.priorityCabinBagMm).toEqual({ length: 550, width: 400, height: 200 });
    });

    it('strictly enforces Wizz Air free small bag rule (40 x 30 x 20 cm)', () => {
      const wizzair = AIRLINE_RULES['wizzair'];
      expect(wizzair.smallFreeBagMm).toEqual({ length: 400, width: 300, height: 200 });
      expect(wizzair.priorityCabinBagMm).toEqual({ length: 550, width: 400, height: 230 });
    });

    it('strictly enforces PLL LOT free small bag rule (40 x 35 x 12 cm)', () => {
      const lot = AIRLINE_RULES['lot'];
      expect(lot.smallFreeBagMm).toEqual({ length: 400, width: 350, height: 120 });
      expect(lot.priorityCabinBagMm).toEqual({ length: 550, width: 400, height: 230 });
    });
  });

  describe('Ustawa Prawo o Ruchu Drogowym (Art. 61 ust. 1 i 2)', () => {
    it('strictly checks legal ban on exceeding Gross Vehicle Weight (DMC)', () => {
      const vehicle = {
        curbWeightKg: 1200,
        grossVehicleWeightKg: 1600, // Max payload = 400 kg
        maxRoofLoadKg: 75,
      };

      // 4 passengers = 300 kg deduction -> 100 kg net cargo remaining
      // 150 kg cargo -> overload by 50 kg!
      const res = calculatePayloadDMC(vehicle, 4, 150);

      expect(res.status).toBe('CRITICAL_OVERLOAD');
      expect(res.overloadKg).toBe(50);
      expect(res.legalReferences.some(r => r.includes('Art. 61 ust. 1 i 2'))).toBe(true);
    });
  });
});
