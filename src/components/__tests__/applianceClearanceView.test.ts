import React from 'react';
import { ApplianceClearanceView } from '../ApplianceClearanceView';
import {
  evaluateRefrigeratorFit,
  evaluateWashingMachineInstallation,
  evaluateCompressorRest,
  REFRIGERATOR_REAR_VENT_MM,
  REFRIGERATOR_SIDE_VENT_MM,
  WASHING_MACHINE_PLUMBING_BUFFER_MM,
  WASHING_MACHINE_DOOR_BULGE_MM,
  FREEZER_DRAWER_MIN_ANGLE_DEG,
  FREEZER_DRAWER_MIN_WALL_DIST_MM,
  TransportOrientation,
} from '../../domain/room-fitting/applianceClearance';

describe('ApplianceClearanceView & Household Appliance Safety (RD-37, RD-38, RD-39, RD-51)', () => {
  describe('Component instantiation', () => {
    it('creates a valid React element for ApplianceClearanceView', () => {
      const element = React.createElement(ApplianceClearanceView);
      expect(React.isValidElement(element)).toBe(true);
      expect(element.type).toBe(ApplianceClearanceView);
    });
  });

  describe('Refrigerator Condenser Ventilation (RD-37 & SPRZ-09)', () => {
    it('validates mandatory ventilation constants (50mm rear, 20mm lateral)', () => {
      expect(REFRIGERATOR_REAR_VENT_MM).toBe(50);
      expect(REFRIGERATOR_SIDE_VENT_MM).toBe(20);
      expect(FREEZER_DRAWER_MIN_ANGLE_DEG).toBe(115);
      expect(FREEZER_DRAWER_MIN_WALL_DIST_MM).toBe(80);
    });

    it('approves installation when niche provides adequate rear and lateral ventilation', () => {
      const result = evaluateRefrigeratorFit(
        {
          widthMm: 600,
          depthMm: 650,
          heightMm: 1850,
          distanceToSideWallMm: 100,
          doorSwingAngleDeg: 120,
        },
        {
          widthMm: 650, // +50mm (> 40mm required for two sides of 20mm)
          depthMm: 710, // +60mm (> 50mm required for rear)
          heightMm: 2000,
        }
      );

      expect(result.canVentilateSafely).toBe(true);
      expect(result.canOpenFreezerDrawers).toBe(true);
      expect(result.effectiveDepthRequiredMm).toBe(700);
      expect(result.effectiveWidthRequiredMm).toBe(640);
      expect(result.warnings.length).toBe(0);
    });

    it('flags fire/overheating hazard when rear ventilation gap is below 50mm', () => {
      const result = evaluateRefrigeratorFit(
        {
          widthMm: 600,
          depthMm: 650,
          heightMm: 1850,
          distanceToSideWallMm: 100,
        },
        {
          widthMm: 650,
          depthMm: 670, // only 20mm rear clearance (< 50mm required)
          heightMm: 2000,
        }
      );

      expect(result.canVentilateSafely).toBe(false);
      expect(result.effectiveDepthRequiredMm).toBe(700);
      expect(result.warnings.some((w) => w.includes('skraplacza') || w.includes('wentylacj'))).toBe(true);
    });

    it('flags lateral ventilation restriction when niche width is too tight', () => {
      const result = evaluateRefrigeratorFit(
        {
          widthMm: 600,
          depthMm: 650,
          heightMm: 1850,
          distanceToSideWallMm: 100,
        },
        {
          widthMm: 620, // only 20mm total (< 40mm required for 20mm per side)
          depthMm: 720,
          heightMm: 2000,
        }
      );

      expect(result.canVentilateSafely).toBe(false);
      expect(result.effectiveWidthRequiredMm).toBe(640);
      expect(result.warnings.some((w) => w.includes('boczny') || w.includes('cyrkulację'))).toBe(true);
    });

    it('warns when 90-degree door swing next to a side wall blocks freezer drawers', () => {
      const result = evaluateRefrigeratorFit(
        {
          widthMm: 600,
          depthMm: 650,
          heightMm: 1850,
          distanceToSideWallMm: 20, // right against wall (< 80mm)
          doorSwingAngleDeg: 90, // < 115 deg
        },
        {
          widthMm: 680,
          depthMm: 720,
          heightMm: 2000,
        }
      );

      expect(result.canVentilateSafely).toBe(true);
      expect(result.canOpenFreezerDrawers).toBe(false);
      expect(result.warnings.some((w) => w.includes('szuflad'))).toBe(true);
    });
  });

  describe('Washing Machine Plumbing & Door Bulge Allowances (RD-38 & SPRZ-11)', () => {
    it('verifies standard installation buffer constants (80mm plumbing, 35mm door bulge)', () => {
      expect(WASHING_MACHINE_PLUMBING_BUFFER_MM).toBe(80);
      expect(WASHING_MACHINE_DOOR_BULGE_MM).toBe(35);
    });

    it('calculates total installation depth including plumbing and front door curve', () => {
      const result = evaluateWashingMachineInstallation(
        {
          catalogDepthMm: 550,
          widthMm: 600,
          heightMm: 850,
        },
        680 // 68cm cabinet depth
      );

      // Total depth = 550 + 80 (plumbing) + 35 (door) = 665 mm
      expect(result.effectiveInstallationDepthMm).toBe(665);
      expect(result.canFitInEnclosure).toBe(true);
      expect(result.marginMm).toBe(15);
      expect(result.warnings.length).toBe(0);
    });

    it('warns about cabinet door collision when niche depth neglects plumbing and door curve', () => {
      const result = evaluateWashingMachineInstallation(
        {
          catalogDepthMm: 550,
          widthMm: 600,
          heightMm: 850,
        },
        600 // only 60cm closet depth - catalog 55cm fits superficially, but 665mm required
      );

      expect(result.canFitInEnclosure).toBe(false);
      expect(result.marginMm).toBe(-65);
      expect(result.warnings.some((w) => w.includes('nie domkną') || w.includes('szaf') || w.includes('hydraulicznych'))).toBe(true);
    });
  });

  describe('Compressor Oil Settling Physics & Startup Timer (RD-39 & Z-189)', () => {
    it('enforces 24-hour settling time for horizontally transported refrigerators', () => {
      const orientation: TransportOrientation = 'HORIZONTAL';
      const result0h = evaluateCompressorRest(orientation, 0);
      expect(result0h.requiredRestHours).toBe(24);
      expect(result0h.canPowerOnSafely).toBe(false);
      expect(result0h.isRestComplete).toBe(false);
      expect(result0h.remainingHours).toBe(24);
      expect(result0h.riskDescription).toContain('ZAKAZ WŁĄCZANIA DO PRĄDU');

      const result12h = evaluateCompressorRest(orientation, 12);
      expect(result12h.canPowerOnSafely).toBe(false);
      expect(result12h.remainingHours).toBe(12);

      const result24h = evaluateCompressorRest(orientation, 24);
      expect(result24h.canPowerOnSafely).toBe(true);
      expect(result24h.isRestComplete).toBe(true);
      expect(result24h.remainingHours).toBe(0);
      expect(result24h.riskDescription).toContain('Bezpieczny rozruch');
    });

    it('enforces 12-hour settling time for tilted transport', () => {
      const orientation: TransportOrientation = 'TILTED';
      const result = evaluateCompressorRest(orientation, 6);
      expect(result.requiredRestHours).toBe(12);
      expect(result.canPowerOnSafely).toBe(false);
      expect(result.remainingHours).toBe(6);

      const resultReady = evaluateCompressorRest(orientation, 12);
      expect(resultReady.canPowerOnSafely).toBe(true);
    });

    it('allows quick startup after 2 hours for strictly upright transport', () => {
      const orientation: TransportOrientation = 'UPRIGHT';
      const result0h = evaluateCompressorRest(orientation, 0);
      expect(result0h.requiredRestHours).toBe(2);
      expect(result0h.canPowerOnSafely).toBe(false);
      expect(result0h.remainingHours).toBe(2);

      const result2h = evaluateCompressorRest(orientation, 2);
      expect(result2h.canPowerOnSafely).toBe(true);
      expect(result2h.remainingHours).toBe(0);
      expect(result2h.isRestComplete).toBe(true);
    });

    it('throws error when elapsed hours is negative', () => {
      expect(() => evaluateCompressorRest('UPRIGHT', -1)).toThrow(
        'Czas od zakończenia transportu nie może być ujemny'
      );
    });
  });
});
