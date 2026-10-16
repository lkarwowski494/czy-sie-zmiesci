import {
  evaluateRefrigeratorFit,
  evaluateWashingMachineInstallation,
  evaluateCompressorRest,
} from '../room-fitting/applianceClearance';

describe('ApplianceClearance (RD-37, RD-38, RD-39, SPRZ-09, SPRZ-11)', () => {
  describe('Refrigerator', () => {
    const fridge = {
      widthMm: 600,
      depthMm: 650,
      heightMm: 1850,
      distanceToSideWallMm: 20, // close to corner wall
      doorSwingAngleDeg: 90,
    };

    it('detects lack of rear ventilation when niche is too shallow', () => {
      // Depth = 650 mm + 50 mm vent = 700 mm required. Niche is only 670 mm.
      const res = evaluateRefrigeratorFit(fridge, {
        widthMm: 700,
        depthMm: 670,
        heightMm: 1900,
      });

      expect(res.canVentilateSafely).toBe(false);
      expect(res.warnings.some(w => w.includes('skraplacza'))).toBe(true);
    });

    it('detects inability to open freezer drawers when door angle is limited to 90 degrees', () => {
      const res = evaluateRefrigeratorFit(fridge, {
        widthMm: 700,
        depthMm: 720,
        heightMm: 1900,
      });

      expect(res.canVentilateSafely).toBe(true);
      expect(res.canOpenFreezerDrawers).toBe(false);
      expect(res.warnings.some(w => w.includes('szuflad'))).toBe(true);
    });

    it('approves installation when both ventilation and door clearance are satisfied', () => {
      const openKitchenFridge = {
        ...fridge,
        distanceToSideWallMm: 150,
        doorSwingAngleDeg: 125,
      };

      const res = evaluateRefrigeratorFit(openKitchenFridge, {
        widthMm: 700,
        depthMm: 720,
        heightMm: 1900,
      });

      expect(res.canVentilateSafely).toBe(true);
      expect(res.canOpenFreezerDrawers).toBe(true);
    });

    it('detects lack of side ventilation and derives door angle from distance when angle is undefined', () => {
      const fridgeNoAngle = {
        widthMm: 600,
        depthMm: 650,
        heightMm: 1850,
        distanceToSideWallMm: 120, // >= 100 mm -> doorSwingAngle defaults to 120 deg
      };

      // Niche width 620 mm < required 600 + 40 = 640 mm
      const res = evaluateRefrigeratorFit(fridgeNoAngle, {
        widthMm: 620,
        depthMm: 720,
        heightMm: 1900,
      });

      expect(res.canVentilateSafely).toBe(false);
      expect(res.warnings.some(w => w.includes('luz boczny'))).toBe(true);
      expect(res.canOpenFreezerDrawers).toBe(true);
    });

    it('defaults door swing angle to 90 deg when close to wall and angle is undefined', () => {
      const fridgeTightWall = {
        widthMm: 600,
        depthMm: 650,
        heightMm: 1850,
        distanceToSideWallMm: 50, // < 100 mm -> doorSwingAngle defaults to 90 deg
      };

      const res = evaluateRefrigeratorFit(fridgeTightWall, {
        widthMm: 700,
        depthMm: 720,
        heightMm: 1900,
      });

      expect(res.canOpenFreezerDrawers).toBe(false);
    });
  });

  describe('Washing Machine', () => {
    it('detects enclosure collision due to plumbing and door bulge', () => {
      // 550 mm catalog + 80 mm plumbing + 35 mm bulge = 665 mm
      // Cabinet is 620 mm -> cannot close doors!
      const res = evaluateWashingMachineInstallation(
        { catalogDepthMm: 550, widthMm: 600, heightMm: 850 },
        620
      );

      expect(res.effectiveInstallationDepthMm).toBe(665);
      expect(res.canFitInEnclosure).toBe(false);
      expect(res.marginMm).toBe(-45);
      expect(res.warnings.some(w => w.includes('przyłączy'))).toBe(true);
    });

    it('confirms proper fit when cabinet depth accommodates plumbing', () => {
      const res = evaluateWashingMachineInstallation(
        { catalogDepthMm: 550, widthMm: 600, heightMm: 850 },
        700
      );

      expect(res.canFitInEnclosure).toBe(true);
      expect(res.marginMm).toBe(35);
    });
  });

  describe('Compressor Oil Rest Timer (Z-189, DEC-14)', () => {
    it('requires 24h rest after horizontal transport and warns when power-on is premature', () => {
      const res = evaluateCompressorRest('HORIZONTAL', 5.5);

      expect(res.requiredRestHours).toBe(24);
      expect(res.elapsedHours).toBe(5.5);
      expect(res.remainingHours).toBe(18.5);
      expect(res.isRestComplete).toBe(false);
      expect(res.canPowerOnSafely).toBe(false);
      expect(res.riskDescription).toContain('ZAKAZ WŁĄCZANIA DO PRĄDU');
      expect(res.riskDescription).toContain('18.5h');
      expect(res.safetyGuidelines.some(g => g.includes('rurką tłoczną'))).toBe(true);
    });

    it('approves power-on after required 24h rest is satisfied for horizontal transport', () => {
      const res = evaluateCompressorRest('HORIZONTAL', 24);

      expect(res.requiredRestHours).toBe(24);
      expect(res.remainingHours).toBe(0);
      expect(res.isRestComplete).toBe(true);
      expect(res.canPowerOnSafely).toBe(true);
      expect(res.riskDescription).toContain('Bezpieczny rozruch');
    });

    it('requires 12h rest for tilted transport and approves when elapsed >= 12h', () => {
      const pending = evaluateCompressorRest('TILTED', 8);
      expect(pending.requiredRestHours).toBe(12);
      expect(pending.remainingHours).toBe(4);
      expect(pending.canPowerOnSafely).toBe(false);

      const ready = evaluateCompressorRest('TILTED', 12.5);
      expect(ready.remainingHours).toBe(0);
      expect(ready.canPowerOnSafely).toBe(true);
    });

    it('requires 2h rest for upright transport and verifies non-horizontal guidelines', () => {
      const res = evaluateCompressorRest('UPRIGHT', 1.0);
      expect(res.requiredRestHours).toBe(2);
      expect(res.remainingHours).toBe(1.0);
      expect(res.canPowerOnSafely).toBe(false);
      expect(res.safetyGuidelines.some(g => g.includes('stabilnej pozycji pionowej'))).toBe(true);

      const done = evaluateCompressorRest('UPRIGHT', 2.0);
      expect(done.canPowerOnSafely).toBe(true);
    });

    it('throws error when elapsed hours is negative', () => {
      expect(() => evaluateCompressorRest('HORIZONTAL', -1)).toThrow(/nie może być ujemny/);
    });
  });
});

