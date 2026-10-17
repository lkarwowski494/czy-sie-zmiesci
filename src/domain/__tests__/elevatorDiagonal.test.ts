import {
  calculateElevatorFit,
  ELEVATOR_MANEUVER_MARGIN_MM,
  ElevatorCabinSpecs,
} from '../doors-stairs/elevatorDiagonal';

describe('ElevatorDiagonal & 3D Spatial Geometry Deep Coverage (RD-35)', () => {
  const standardPassengerElevator: ElevatorCabinSpecs = {
    depthMm: 1200,
    widthMm: 900,
    heightMm: 2100,
    doorWidthMm: 800,
    doorHeightMm: 2000,
  };

  const goodsElevator: ElevatorCabinSpecs = {
    depthMm: 2400,
    widthMm: 1500,
    heightMm: 2200,
    doorWidthMm: 1200,
    doorHeightMm: 2100,
  };

  it('validates maneuver safety margin constant is 50 mm', () => {
    expect(ELEVATOR_MANEUVER_MARGIN_MM).toBe(50);
  });

  describe('Standard Passenger Elevator (900 x 1200 x 2100 mm)', () => {
    it('calculates exact 3D spatial diagonal and approves 2400 mm countertop', () => {
      // diagonal = sqrt(1200^2 + 900^2 + 2100^2) = sqrt(1440000 + 810000 + 4410000) = sqrt(6660000) ≈ 2580.697 -> 2581 mm
      // maxRigidLength = 2580 - 50 = 2530 mm
      const res = calculateElevatorFit(
        { lengthMm: 2400, widthMm: 600, heightMm: 38 },
        standardPassengerElevator
      );

      expect(res.spatialDiagonalMm).toBe(2581);
      expect(res.maxRigidItemLengthMm).toBe(2530);
      expect(res.fitsThroughDoor).toBe(true);
      expect(res.fitsInsideCabin).toBe(true);
      expect(res.marginMm).toBe(130); // 2530 - 2400
      expect(res.warnings).toHaveLength(0);
    });

    it('rejects long piece of lumber exceeding spatial diagonal', () => {
      // 2600 mm exceeds 2530 mm limit
      const res = calculateElevatorFit(
        { lengthMm: 2600, widthMm: 100, heightMm: 50 },
        standardPassengerElevator
      );

      expect(res.fitsThroughDoor).toBe(true);
      expect(res.fitsInsideCabin).toBe(false);
      expect(res.marginMm).toBe(-70);
      expect(res.warnings.some((w) => w.includes('przekracza maksymalną przekątną'))).toBe(true);
    });

    it('rejects wide wardrobe that cannot pass through elevator door opening', () => {
      // Item cross-section is 850 x 850 mm -> exceeds doorWidthMm of 800 mm
      const res = calculateElevatorFit(
        { lengthMm: 1200, widthMm: 850, heightMm: 850 },
        standardPassengerElevator
      );

      expect(res.fitsThroughDoor).toBe(false);
      expect(res.fitsInsideCabin).toBe(false);
      expect(res.warnings.some((w) => w.includes('drzwi windy'))).toBe(true);
    });

    it('permits item with one dimension larger than door width as long as smallest dimension fits door', () => {
      // Mattress 2000 x 900 x 250 mm:
      // Door is 800 mm wide, 900 mm > 800 mm, but 250 mm <= 800 mm!
      // So mattress can pass through door sideways (on its 250 mm edge).
      const res = calculateElevatorFit(
        { lengthMm: 2000, widthMm: 900, heightMm: 250 },
        standardPassengerElevator
      );

      expect(res.fitsThroughDoor).toBe(true);
      expect(res.fitsInsideCabin).toBe(true);
    });
  });

  describe('Freight / Goods Elevator (1500 x 2400 x 2200 mm)', () => {
    it('fits large 3-seater sofa diagonally with generous margin', () => {
      // 3D diagonal = sqrt(2400^2 + 1500^2 + 2200^2) = sqrt(5760000 + 2250000 + 4840000) = sqrt(12850000) ≈ 3584.68 -> 3585 mm
      // maxRigidLength = 3584 - 50 = 3534 mm
      const res = calculateElevatorFit(
        { lengthMm: 2800, widthMm: 1000, heightMm: 900 },
        goodsElevator
      );

      expect(res.spatialDiagonalMm).toBe(3585);
      expect(res.maxRigidItemLengthMm).toBe(3534);
      expect(res.fitsThroughDoor).toBe(true);
      expect(res.fitsInsideCabin).toBe(true);
      expect(res.marginMm).toBe(734); // 3534 - 2800
    });
  });
});
