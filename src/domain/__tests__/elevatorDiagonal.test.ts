import { calculateElevatorFit } from '../doors-stairs/elevatorDiagonal';

describe('ElevatorDiagonal (RD-35)', () => {
  const standardPassengerElevator = {
    depthMm: 1200,
    widthMm: 900,
    heightMm: 2100,
    doorWidthMm: 800,
    doorHeightMm: 2000,
  };

  it('determines if long kitchen countertop can fit diagonally in the elevator', () => {
    // 3D diagonal = sqrt(1200² + 900² + 2100²) = sqrt(1.44 + 0.81 + 4.41)*1000 = sqrt(6.66)*1000 ≈ 2580 mm
    // Max rigid length with 50 mm margin = 2580 - 50 = 2530 mm
    const res = calculateElevatorFit(
      { lengthMm: 2400, widthMm: 600, heightMm: 38 },
      standardPassengerElevator
    );

    expect(res.spatialDiagonalMm).toBe(2581);
    expect(res.maxRigidItemLengthMm).toBe(2530);
    expect(res.fitsThroughDoor).toBe(true);
    expect(res.fitsInsideCabin).toBe(true);
    expect(res.marginMm).toBe(130);
  });

  it('rejects countertop that exceeds elevator 3D diagonal', () => {
    // 2600 mm > 2531 mm
    const res = calculateElevatorFit(
      { lengthMm: 2600, widthMm: 600, heightMm: 38 },
      standardPassengerElevator
    );

    expect(res.fitsInsideCabin).toBe(false);
    expect(res.marginMm).toBeLessThan(0);
    expect(res.warnings.some(w => w.includes('przekracza'))).toBe(true);
  });

  it('rejects item too wide for elevator door', () => {
    // Both width and height are 950 mm > 800 mm door
    const res = calculateElevatorFit(
      { lengthMm: 1000, widthMm: 950, heightMm: 950 },
      standardPassengerElevator
    );

    expect(res.fitsThroughDoor).toBe(false);
    expect(res.fitsInsideCabin).toBe(false);
    expect(res.warnings.some(w => w.includes('drzwi'))).toBe(true);
  });
});
