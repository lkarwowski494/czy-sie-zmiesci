import {
  evaluateGarageFit,
  evaluateRoofSetupHeight,
} from '../garage/garageClearance';

describe('GarageClearance (RD-41, RD-42, RD-43, SPRZ-07)', () => {
  describe('Garage Entry and Parking', () => {
    const suv = {
      bodyWidthMm: 1880,
      widthWithMirrorsMm: 2130,
      widthWithFoldedMirrorsMm: 1950,
      baseHeightMm: 1680,
      tailgateMaxOpenHeightMm: 2200,
    };

    const narrowGarage = {
      gateWidthMm: 2200, // 2130 with mirrors only leaves 70 mm (less than 100 mm margin)
      interiorWidthMm: 2600,
      ceilingHeightMm: 2250,
      gateRunnerHeightMm: 2120, // Low gate runners
    };

    it('warns about tight gate entry with open mirrors but approves with folded mirrors', () => {
      const res = evaluateGarageFit(suv, narrowGarage);

      expect(res.canEnterWithOpenMirrors).toBe(false);
      expect(res.canEnterWithFoldedMirrors).toBe(true);
      expect(res.entryMarginOpenMirrorsMm).toBe(70);
      expect(res.entryMarginFoldedMirrorsMm).toBe(250);
      expect(res.recommendations.some(r => r.includes('lusterka'))).toBe(true);
    });

    it('detects tailgate collision with overhead garage gate runners', () => {
      // Tailgate opens to 2200 mm. Runner is at 2120 mm -> collision by 80 mm!
      const res = evaluateGarageFit(suv, narrowGarage);

      expect(res.willTailgateHitCeiling).toBe(true);
      expect(res.tailgateCeilingMarginMm).toBe(-80);
      expect(res.warnings.some(w => w.includes('uderzy w sufit'))).toBe(true);
    });

    it('checks driver exit door clearance against obstacle pillar', () => {
      const garageWithPillar = {
        ...narrowGarage,
        obstacleDistanceMm: 450, // Pillar 45 cm from driver side
      };

      const res = evaluateGarageFit(suv, garageWithPillar);

      expect(res.canDriverExitComfortably).toBe(false);
      expect(res.driverExitClearanceMm).toBe(450);
      expect(res.warnings.some(w => w.includes('ciasno na swobodne wysiadanie'))).toBe(true);
    });

    it('rejects vehicle that is wider than gate even with folded mirrors', () => {
      const ultraNarrowGarage = {
        ...narrowGarage,
        gateWidthMm: 1950, // narrower than suv.widthWithFoldedMirrorsMm (2000 mm)
      };

      const res = evaluateGarageFit(suv, ultraNarrowGarage);

      expect(res.canEnterWithOpenMirrors).toBe(false);
      expect(res.canEnterWithFoldedMirrors).toBe(false);
      expect(res.warnings.some(w => w.includes('zbyt wąska nawet po złożeniu lusterek'))).toBe(true);
    });

    it('evaluates tailgate ceiling clearance when gate runner is absent', () => {
      const garageNoRunners = {
        gateWidthMm: 2500,
        interiorWidthMm: 3000,
        ceilingHeightMm: 2400,
        // gateRunnerHeightMm is omitted
      };

      const res = evaluateGarageFit(suv, garageNoRunners);

      expect(res.willTailgateHitCeiling).toBe(false);
      expect(res.tailgateCeilingMarginMm).toBe(200); // 2400 - 2200
    });
  });

  describe('Roof Setup Height and Underground Parking', () => {
    it('evaluates underground garage entry signs with roof box', () => {
      // 1500 mm car + 100 mm roof bars + 420 mm roof box = 2020 mm raw
      // With 30 mm dynamic bounce: 2050 mm
      const res = evaluateRoofSetupHeight({
        vehicleHeightMm: 1500,
        roofBarsHeightMm: 100,
        roofCargoHeightMm: 420,
      });

      expect(res.totalHeightMm).toBe(2020);
      expect(res.totalHeightWithBounceMm).toBe(2050);
      expect(res.canEnterSign190m).toBe(false);
      expect(res.canEnterSign200m).toBe(false);
      expect(res.canEnterSign210m).toBe(true);
      expect(res.marginForSign200mMm).toBe(-50);
    });
  });
});
