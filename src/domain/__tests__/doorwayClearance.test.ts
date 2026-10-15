import { calculateDoorwayClearance } from '../doors-stairs/doorwayClearance';

describe('DoorwayClearance (RD-33, RD-22)', () => {
  const standardDoor80 = {
    nominalWidthMm: 800,
    doorSwingAngleDeg: 90,
    isDoorLeafRemovable: false,
    isHandleRemovable: false,
  };

  it('calculates effective doorway aperture correctly with handle and door leaf deductions', () => {
    // 800 nominal - 20 rebate - 60 handle - 45 leaf = 675 mm
    // With 2 * 50 mm hand margin: 675 - 100 = 575 mm
    const res = calculateDoorwayClearance(
      { lengthMm: 700, widthMm: 600, heightMm: 1800 },
      standardDoor80,
      true
    );

    expect(res.effectiveApertureWidthMm).toBe(675);
    expect(res.netClearanceWithHandsMm).toBe(575);
    // Smallest item dimension is 600 mm. 600 > 575 mm -> cannot pass safely with hands
    expect(res.canPass).toBe(false);
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it('allows passage when handle and leaf are removed and hands have clearance', () => {
    const optimizedDoor = {
      nominalWidthMm: 800,
      doorSwingAngleDeg: 180,
      isDoorLeafRemovable: true,
      isHandleRemovable: true,
    };

    // 800 - 20 = 780 mm. Net with hands = 780 - 100 = 680 mm
    // Item smallest dim is 600 mm < 680 mm -> can pass!
    const res = calculateDoorwayClearance(
      { lengthMm: 700, widthMm: 600, heightMm: 1800 },
      optimizedDoor,
      true
    );

    expect(res.effectiveApertureWidthMm).toBe(780);
    expect(res.netClearanceWithHandsMm).toBe(680);
    expect(res.canPass).toBe(true);
    expect(res.marginMm).toBe(80);
  });

  it('allows passing without hand clearance if transport straps are used', () => {
    // Net without hands = 675 mm. Item = 600 mm <= 675 mm -> can pass!
    const res = calculateDoorwayClearance(
      { lengthMm: 700, widthMm: 600, heightMm: 1800 },
      standardDoor80,
      false
    );

    expect(res.canPass).toBe(true);
  });

  it('uses default requireHandClearance = true when 3rd param is omitted', () => {
    const res = calculateDoorwayClearance(
      { lengthMm: 700, widthMm: 600, heightMm: 1800 },
      standardDoor80
    );
    expect(res.canPass).toBe(false);
  });
});
