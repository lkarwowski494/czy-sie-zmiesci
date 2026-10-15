/**
 * Czy się zmieści? (FitCheck) — Warstwa 9: Testy Odpornościowe (Fault Tolerance & Edge Cases)
 */

import { packItemsInTrunk } from '../../domain/geometry/extremePoints';
import { calculatePayloadDMC } from '../../domain/physics/payloadDMC';
import { evaluateNicheFit } from '../../domain/room-fitting/nicheCalculator';
import { calculateDoorwayClearance } from '../../domain/doors-stairs/doorwayClearance';
import { evaluateStaircaseLandingTurn } from '../../domain/doors-stairs/staircaseRotation';
import { evaluateRefrigeratorFit } from '../../domain/room-fitting/applianceClearance';

describe('Fault Tolerance, Fuzzing & Degenerate Geometries (Warstwa 9)', () => {
  const standardTrunk = {
    lengthFloorMm: 1000,
    lengthRoofMm: 700,
    widthMinMm: 950,
    widthMaxMm: 1100,
    heightRoofMm: 800,
    heightShelfMm: 450,
    apertureWidthMm: 950,
    apertureHeightMm: 750,
    thresholdHeightMm: 80,
  };

  it('safely handles empty item arrays in packing solver without crashing', () => {
    const res = packItemsInTrunk([], standardTrunk);
    expect(res.isFullyPacked).toBe(true);
    expect(res.placements).toHaveLength(0);
    expect(res.totalWeightKg).toBe(0);
  });

  it('safely handles items with zero dimensions', () => {
    const zeroItem = {
      id: 'zero',
      name: 'Zero Box',
      dimensionsMm: { lengthMm: 0, widthMm: 0, heightMm: 0 },
      weightKg: 0,
      rotationConstraint: 'XYZ' as const,
      isFragile: false,
      isSoft: false,
      allowStacking: true,
    };

    const res = packItemsInTrunk([zeroItem], standardTrunk);
    expect(res.isFullyPacked).toBe(true);
  });

  it('safely rejects giant 100-meter monolith box without memory exhaustion or infinite loops', () => {
    const giantItem = {
      id: 'giant',
      name: 'Gigant 100m',
      dimensionsMm: { lengthMm: 100_000, widthMm: 50_000, heightMm: 20_000 },
      weightKg: 50_000,
      rotationConstraint: 'XYZ' as const,
      isFragile: false,
      isSoft: false,
      allowStacking: false,
    };

    const res = packItemsInTrunk([giantItem], standardTrunk);
    expect(res.isFullyPacked).toBe(false);
    expect(res.unplacedItems).toHaveLength(1);
    expect(res.placements).toHaveLength(0);
  });

  it('handles negative passenger numbers by clamping safely to 0', () => {
    const vehicle = {
      curbWeightKg: 1300,
      grossVehicleWeightKg: 1800,
      maxRoofLoadKg: 75,
    };

    const res = calculatePayloadDMC(vehicle, -5, 100);
    expect(res.passengerDeductionKg).toBe(0);
    expect(res.status).toBe('SAFE');
  });

  it('safely handles degenerate niche where skirting boards are thicker than niche itself', () => {
    // Niche width 30 mm, but skirting boards are 20 mm on each side (total 40 mm)
    const res = evaluateNicheFit(
      { widthMm: 20, depthMm: 20, heightMm: 20 },
      {
        widthTopMm: 30,
        widthMiddleMm: 30,
        widthBottomMm: 30,
        depthMm: 50,
        heightMm: 50,
        skirtingBoardThicknessMm: 20,
        hasSkirtingBoards: true,
      }
    );

    expect(res.effectiveWidthAtFloorMm).toBe(0);
    expect(res.fitsWidth).toBe(false);
    expect(res.isSkirtingCollision).toBe(true);
  });

  it('safely handles doorway with 0 mm nominal width', () => {
    const res = calculateDoorwayClearance(
      { lengthMm: 500, widthMm: 400, heightMm: 300 },
      {
        nominalWidthMm: 0,
        doorSwingAngleDeg: 90,
        isDoorLeafRemovable: false,
        isHandleRemovable: false,
      }
    );

    expect(res.canPass).toBe(false);
    expect(res.marginMm).toBeLessThan(0);
  });

  it('safely handles zero-dimension staircase ceiling height', () => {
    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 1000, widthMm: 500, heightMm: 500 },
      {
        flightWidthMm: 1000,
        landingDepthMm: 1000,
        ceilingHeightMm: 0, // Impossible physical ceiling
        turnAngleDeg: 90,
        hasHandrailObstruction: false,
      }
    );

    expect(res.canPass).toBe(false);
  });

  it('handles zero-depth niche for refrigerator safely', () => {
    const res = evaluateRefrigeratorFit(
      { widthMm: 600, depthMm: 600, heightMm: 1800, distanceToSideWallMm: 0 },
      { widthMm: 700, depthMm: 0, heightMm: 1900 }
    );

    expect(res.canVentilateSafely).toBe(false);
  });
});
