import { calculateCenterOfGravity } from '../physics/centerOfGravity';
import { PackedPlacement } from '../geometry/types';

describe('CenterOfGravity (RD-20)', () => {
  const trunk = {
    lengthFloorMm: 1000,
    widthMaxMm: 1000,
    heightRoofMm: 800,
  };

  it('handles empty placements gracefully', () => {
    const res = calculateCenterOfGravity([], {}, trunk);
    expect(res.totalWeightKg).toBe(0);
    expect(res.isLateralSymmetric).toBe(true);
    expect(res.isAxleLoadDangerous).toBe(false);
  });

  it('handles placements with zero total weight gracefully', () => {
    const zeroPlacement: PackedPlacement = {
      itemId: 'zero_box',
      positionMm: { xMm: 0, yMm: 0, zMm: 0 },
      orientedDimensionsMm: { lengthMm: 100, widthMm: 100, heightMm: 100 },
      sequenceOrder: 1,
    };
    const res = calculateCenterOfGravity([zeroPlacement], { zero_box: 0 }, trunk);
    expect(res.totalWeightKg).toBe(0);
  });

  it('calculates balanced center of gravity for symmetrically placed boxes', () => {
    // Two 10 kg boxes placed symmetrically across trunk centerline (Y = 500)
    const placements: PackedPlacement[] = [
      {
        itemId: '1',
        positionMm: { xMm: 100, yMm: 100, zMm: 0 },
        orientedDimensionsMm: { lengthMm: 400, widthMm: 300, heightMm: 200 },
        sequenceOrder: 1,
      },
      {
        itemId: '2',
        positionMm: { xMm: 100, yMm: 600, zMm: 0 },
        orientedDimensionsMm: { lengthMm: 400, widthMm: 300, heightMm: 200 },
        sequenceOrder: 2,
      },
    ];

    // Box 1 center: X = 300, Y = 250, Z = 100
    // Box 2 center: X = 300, Y = 750, Z = 100
    // Total CoG: X = 300, Y = 500 (exact center), Z = 100
    const res = calculateCenterOfGravity(
      placements,
      { '1': 10, '2': 10 },
      trunk
    );

    expect(res.totalWeightKg).toBe(20);
    expect(res.centerOfGravityMm.xMm).toBe(300);
    expect(res.centerOfGravityMm.yMm).toBe(500);
    expect(res.centerOfGravityMm.zMm).toBe(100);
    expect(res.isLateralSymmetric).toBe(true);
    expect(res.lateralOffsetMm).toBe(0);
    expect(res.isAxleLoadDangerous).toBe(false);
  });

  it('detects severe lateral asymmetry when heavy box is on one side', () => {
    const placements: PackedPlacement[] = [
      {
        itemId: 'heavy',
        positionMm: { xMm: 100, yMm: 50, zMm: 0 },
        orientedDimensionsMm: { lengthMm: 400, widthMm: 300, heightMm: 200 },
        sequenceOrder: 1,
      },
    ];

    // Center Y = 50 + 150 = 200 mm. Centerline is 500 mm -> offset = 300 mm > 150 mm tolerance!
    const res = calculateCenterOfGravity(
      placements,
      { heavy: 50 },
      trunk
    );

    expect(res.isLateralSymmetric).toBe(false);
    expect(res.lateralOffsetMm).toBe(300);
    expect(res.warnings.some(w => w.includes('Asymetria'))).toBe(true);
  });

  it('detects dangerous axle load when CoG is too close to tailgate threshold', () => {
    // Danger threshold is 75% of 1000 mm = 750 mm
    const placements: PackedPlacement[] = [
      {
        itemId: 'rear_heavy',
        positionMm: { xMm: 700, yMm: 350, zMm: 0 },
        orientedDimensionsMm: { lengthMm: 200, widthMm: 300, heightMm: 200 },
        sequenceOrder: 1,
      },
    ];

    // Center X = 700 + 100 = 800 mm > 750 mm
    const res = calculateCenterOfGravity(
      placements,
      { rear_heavy: 40 },
      trunk
    );

    expect(res.isAxleLoadDangerous).toBe(true);
    expect(res.warnings.some(w => w.includes('tylnego zderzaka'))).toBe(true);
  });

  it('detects asymmetry on the right side and falls back to default 1.0 kg if weight omitted', () => {
    const placements: PackedPlacement[] = [
      {
        itemId: 'right_side',
        positionMm: { xMm: 100, yMm: 700, zMm: 0 },
        orientedDimensionsMm: { lengthMm: 400, widthMm: 200, heightMm: 200 },
        sequenceOrder: 1,
      },
    ];

    // center Y = 700 + 100 = 800 > 500 (prawej stronie)
    // No weight provided -> fallback to 1.0 kg
    const res = calculateCenterOfGravity(
      placements,
      {},
      trunk
    );

    expect(res.totalWeightKg).toBe(1.0);
    expect(res.isLateralSymmetric).toBe(false);
    expect(res.warnings.some(w => w.includes('prawej'))).toBe(true);
  });
});
