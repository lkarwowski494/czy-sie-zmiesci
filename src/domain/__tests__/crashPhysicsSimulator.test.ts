/**
 * Czy się zmieści? (FitCheck) — Testy Modułu Fizyki Zderzeń i Mocowania Ładunku (BR-EDU-001…003)
 */

import {
  calculateCrashPhysics,
  calculateLashingRequirements,
  evaluateApplianceTransportProtocol,
  FRICTION_COEFFICIENTS,
  CRASH_DECELERATION_G,
} from '../physics/crashPhysicsSimulator';

describe('CrashPhysicsSimulator & Lashing Norms (Warstwa 1: 100% Coverage)', () => {
  describe('calculateCrashPhysics', () => {
    it('calculates exact energy and equivalent impact mass for 9 kg pack at 50 km/h', () => {
      // 9 kg at 50 km/h: v = 13.8889 m/s, Ek = 0.5 * 9 * 13.8889^2 = 868 J
      // 9 kg * 25g = 225 kg equivalent mass
      const res = calculateCrashPhysics(9, 50);

      expect(res.cargoMassKg).toBe(9);
      expect(res.speedKmh).toBe(50);
      expect(res.kineticEnergyJoules).toBe(868);
      expect(res.decelerationG).toBe(CRASH_DECELERATION_G);
      expect(res.equivalentImpactMassKg).toBe(225);
      expect(res.impactForceNewtons).toBeGreaterThan(2000);
      expect(res.dangerSeverity).toBe('HIGH');
      expect(res.safetyAdvisory).toContain('przebija oparcie kanapy');
    });

    it('classifies severity tiers correctly (LOW, MEDIUM, HIGH, LETHAL)', () => {
      // 1.5 kg smartphone/tablet: 1.5 * 25 = 37.5 kg -> LOW
      const low = calculateCrashPhysics(1.5, 50);
      expect(low.dangerSeverity).toBe('LOW');

      // 6 kg laptop bag: 6 * 25 = 150 kg -> MEDIUM
      const med = calculateCrashPhysics(6, 50);
      expect(med.dangerSeverity).toBe('MEDIUM');

      // 15 kg suitcase: 15 * 25 = 375 kg -> HIGH
      const high = calculateCrashPhysics(15, 50);
      expect(high.dangerSeverity).toBe('HIGH');

      // 30 kg heavy cargo / cement bag: 30 * 25 = 750 kg -> LETHAL
      const lethal = calculateCrashPhysics(30, 90);
      expect(lethal.dangerSeverity).toBe('LETHAL');
      expect(lethal.safetyAdvisory).toContain('Śmiertelne niebezpieczeństwo');
    });

    it('throws error for non-positive mass or negative speed or non-positive deceleration', () => {
      expect(() => calculateCrashPhysics(0, 50)).toThrow('Masa i przeciążenie muszą być dodatnie');
      expect(() => calculateCrashPhysics(-5, 50)).toThrow('Masa i przeciążenie muszą być dodatnie');
      expect(() => calculateCrashPhysics(10, -10)).toThrow('Masa i przeciążenie muszą być dodatnie');
      expect(() => calculateCrashPhysics(10, 50, 0)).toThrow('Masa i przeciążenie muszą być dodatnie');
    });
  });

  describe('calculateLashingRequirements (PN-EN 12195-1)', () => {
    it('calculates lashing requirements on rubber mat (mu = 0.6)', () => {
      // 100 kg on rubber mat (cx = 0.8, mu = 0.6 -> net factor 0.2)
      // F_net = 100 * 9.80665 * 0.2 = 196.13 N -> 20 daN
      const res = calculateLashingRequirements(100, 'RUBBER_MAT');

      expect(res.surfaceFrictionMu).toBe(0.6);
      expect(res.requiredRestrainingForceNewtons).toBeCloseTo(196, 0);
      expect(res.minimumLashingCapacityDaN).toBe(20);
      expect(res.recommendedStrapsCount).toBe(1);
      expect(res.complianceStandard).toContain('PN-EN 12195-1');
    });

    it('calculates higher lashing requirements on slick plastic (mu = 0.2)', () => {
      // 100 kg on plastic (cx = 0.8, mu = 0.2 -> net factor 0.6)
      // F_net = 100 * 9.80665 * 0.6 = 588.4 N -> 59 daN
      const res = calculateLashingRequirements(100, 'PLASTIC_SLICK');

      expect(res.surfaceFrictionMu).toBe(0.2);
      expect(res.requiredRestrainingForceNewtons).toBeCloseTo(588, 0);
      expect(res.minimumLashingCapacityDaN).toBe(59);
    });

    it('recommends multiple straps for very heavy cargo', () => {
      // 600 kg cargo on plastic: net force ~ 3530 N -> 354 daN -> 2 straps (250 daN each)
      const res = calculateLashingRequirements(600, 'PLASTIC_SLICK');
      expect(res.recommendedStrapsCount).toBe(2);
    });

    it('throws error for non-positive cargo mass', () => {
      expect(() => calculateLashingRequirements(0, 'RUBBER_MAT')).toThrow('Masa ładunku musi być dodatnia');
      expect(() => calculateLashingRequirements(-10, 'CARPET_VELOUR')).toThrow('Masa ładunku musi być dodatnia');
    });
  });

  describe('evaluateApplianceTransportProtocol', () => {
    it('verifies refrigerator horizontal flat transport requires 24h settling', () => {
      const flat = evaluateApplianceTransportProtocol('REFRIGERATOR', 'HORIZONTAL_FLAT');
      expect(flat.minimumSettlingHours).toBe(24);
      expect(flat.criticalWarnings.some((w) => w.includes('24h w pionie'))).toBe(true);

      const tilted = evaluateApplianceTransportProtocol('REFRIGERATOR', 'TILTED_45_DEG');
      expect(tilted.minimumSettlingHours).toBe(6);

      const upright = evaluateApplianceTransportProtocol('REFRIGERATOR', 'UPRIGHT');
      expect(upright.minimumSettlingHours).toBe(2);
    });

    it('verifies washing machine requires transit bolts (blokady bębna)', () => {
      const wm = evaluateApplianceTransportProtocol('WASHING_MACHINE', 'UPRIGHT');
      expect(wm.requiresTransitBolts).toBe(true);
      expect(wm.criticalWarnings.some((w) => w.includes('BLOKADY TRANSPORTOWE'))).toBe(true);

      const wmTilted = evaluateApplianceTransportProtocol('WASHING_MACHINE', 'TILTED_45_DEG');
      expect(wmTilted.criticalWarnings.some((w) => w.includes('woda resztkowa'))).toBe(true);
    });

    it('verifies dishwasher warnings on tilt', () => {
      const dw = evaluateApplianceTransportProtocol('DISHWASHER', 'HORIZONTAL_FLAT');
      expect(dw.criticalWarnings.some((w) => w.includes('płaszcza wodnego'))).toBe(true);
    });

    it('verifies OLED TV warnings against horizontal placement', () => {
      const tv = evaluateApplianceTransportProtocol('TV_OLED', 'HORIZONTAL_FLAT');
      expect(tv.minimumSettlingHours).toBe(1);
      expect(tv.criticalWarnings.some((w) => w.includes('pęknięcia szkła'))).toBe(true);
    });
  });

  describe('FRICTION_COEFFICIENTS mapping', () => {
    it('contains all required surface friction constants', () => {
      expect(FRICTION_COEFFICIENTS.RUBBER_MAT).toBe(0.6);
      expect(FRICTION_COEFFICIENTS.CARPET_VELOUR).toBe(0.3);
      expect(FRICTION_COEFFICIENTS.PLASTIC_SLICK).toBe(0.2);
    });
  });
});
