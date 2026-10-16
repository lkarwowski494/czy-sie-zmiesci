/**
 * Czy się zmieści? (FitCheck) — Strażnik Wymiarowania AGD i Wentylacji (Warstwa 9)
 * Gwarantuje, że silnik obliczeniowy i interfejs bezwzględnie wymuszają luzy wentylacyjne i hydrauliczne.
 */

import {
  evaluateRefrigeratorFit,
  evaluateWashingMachineInstallation,
  evaluateCompressorRest,
  REFRIGERATOR_REAR_VENT_MM,
  REFRIGERATOR_SIDE_VENT_MM,
  WASHING_MACHINE_PLUMBING_BUFFER_MM,
  WASHING_MACHINE_DOOR_BULGE_MM,
  COMPRESSOR_REST_HOURS,
} from '../../domain/room-fitting/applianceClearance';

describe('Appliance Ventilation & Safety Guards (Warstwa 9: Strażnicy Standardów AGD)', () => {
  describe('GUARD: Mandatory Ventilation Buffers', () => {
    it('enforces refrigerator rear ventilation of at least 50 mm', () => {
      expect(REFRIGERATOR_REAR_VENT_MM).toBeGreaterThanOrEqual(50);
    });

    it('enforces refrigerator side ventilation of at least 20 mm per side', () => {
      expect(REFRIGERATOR_SIDE_VENT_MM).toBeGreaterThanOrEqual(20);
    });

    it('rejects installation when niche depth matches catalog depth without 50 mm clearance', () => {
      const result = evaluateRefrigeratorFit(
        {
          widthMm: 600,
          depthMm: 650,
          heightMm: 1850,
          distanceToSideWallMm: 150,
        },
        {
          widthMm: 700,
          depthMm: 650, // Zero clearance for rear condenser
          heightMm: 2000,
        }
      );

      expect(result.canVentilateSafely).toBe(false);
      expect(result.warnings.some(w => w.includes('skraplacza'))).toBe(true);
    });
  });

  describe('GUARD: Washing Machine Plumbing Buffers', () => {
    it('enforces plumbing connection allowance of at least 80 mm', () => {
      expect(WASHING_MACHINE_PLUMBING_BUFFER_MM).toBeGreaterThanOrEqual(80);
    });

    it('enforces front door bulge allowance of at least 35 mm', () => {
      expect(WASHING_MACHINE_DOOR_BULGE_MM).toBeGreaterThanOrEqual(35);
    });

    it('flags enclosure collision when closet depth equals machine catalog depth', () => {
      const result = evaluateWashingMachineInstallation(
        {
          catalogDepthMm: 550,
          widthMm: 600,
          heightMm: 850,
        },
        550 // No space for pipes or curved door
      );

      expect(result.canFitInEnclosure).toBe(false);
      expect(result.marginMm).toBeLessThan(0);
    });
  });

  describe('GUARD: Compressor Oil Settling (Z-189, DEC-14)', () => {
    it('mandates at least 24 hours of rest after horizontal transport', () => {
      expect(COMPRESSOR_REST_HOURS.HORIZONTAL).toBeGreaterThanOrEqual(24);
    });

    it('mandates at least 12 hours of rest after tilted transport', () => {
      expect(COMPRESSOR_REST_HOURS.TILTED).toBeGreaterThanOrEqual(12);
    });

    it('strictly forbids powering on compressor before rest time completes', () => {
      const premature = evaluateCompressorRest('HORIZONTAL', 23.9);
      expect(premature.canPowerOnSafely).toBe(false);
      expect(premature.isRestComplete).toBe(false);
      expect(premature.riskDescription).toContain('ZAKAZ WŁĄCZANIA DO PRĄDU');
    });
  });
});
