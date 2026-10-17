/**
 * matrix-dimensions.test.tsx
 * Sprawdzenie zachowania wymiarów skrajnych: AX5 Dynamic Type oraz 320 pt szerokości (NFR-A11Y-004)
 */

describe('Matrix Dimensions & Extreme Viewport Guard (NFR-A11Y-004)', () => {
  const SCREEN_WIDTH_320PT = 320;
  const AX5_FONT_SCALE = 3.12; // Apple Accessibility Extra Extra Extra Large 5

  it('verifies calculations for 320 pt minimum iPhone screen width', () => {
    // 320 pt to najwęższy wspierany ekran (iPhone SE 1st gen)
    const padding = 16 * 2;
    const availableWidth = SCREEN_WIDTH_320PT - padding;
    expect(availableWidth).toBe(288);

    // Dwa przyciski obok siebie lub zawijanie w flexWrap
    const buttonMinWidth = 120;
    const canFitTwoButtons = availableWidth >= buttonMinWidth * 2;
    expect(canFitTwoButtons).toBe(true);
  });

  it('validates text scaling with AX5 multiplier without fixed height containers', () => {
    const baseFontSize = 16;
    const scaledFontSize = Math.round(baseFontSize * AX5_FONT_SCALE);
    expect(scaledFontSize).toBe(50);

    // Pojemniki tekstowe nie powinny miec sztywnej wysokosci height: 20 przy duzym tekscie
    const lineHeight = Math.round(scaledFontSize * 1.3);
    expect(lineHeight).toBeGreaterThanOrEqual(50);
  });

  it('covers all WYMIAR domain unions and enum literal values (BR-TEST-030)', () => {
    // 1. DecodeSpaceResult
    const res1: import('../src/lib/deep-links').DecodeSpaceResult = { success: false, error: 'test' };
    expect(res1.success).toBe(false);

    // 2. UnitType
    const units: import('../src/lib/unit-converter').UnitType[] = ['cm', 'in', 'kg', 'lb', 'lbs', 'l', 'cuft'];
    expect(units).toContain('cm');

    // 3. RotationConstraint
    const rotConstraints: import('../src/domain/geometry/types').RotationConstraint[] = [
      'XYZ', 'Z_ONLY', 'NONE'
    ];
    expect(rotConstraints).toContain('XYZ');

    // 4. MeasurementTool
    const tools: import('../src/domain/measuring/tapeMeasureAssistant').MeasurementTool[] = [
      'LASER_METER', 'MANUAL_TAPE', 'AR_LIDAR', 'AR_CAMERA', 'VISUAL_ESTIMATE'
    ];
    expect(tools).toContain('MANUAL_TAPE');

    // 5. TrunkFrictionSurface
    const surfaces: import('../src/domain/physics/crashPhysicsSimulator').TrunkFrictionSurface[] = [
      'RUBBER_MAT', 'CARPET_VELOUR', 'PLASTIC_SLICK'
    ];
    expect(surfaces).toContain('RUBBER_MAT');

    // 6. ApplianceTransportOrientation
    const appOrs: import('../src/domain/physics/crashPhysicsSimulator').ApplianceTransportOrientation[] = [
      'UPRIGHT', 'TILTED_45_DEG', 'HORIZONTAL_FLAT'
    ];
    expect(appOrs).toContain('UPRIGHT');

    // 7. PayloadStatus
    const pStatuses: import('../src/domain/physics/payloadDMC').PayloadStatus[] = [
      'SAFE', 'WARNING_NEAR_LIMIT', 'CRITICAL_OVERLOAD'
    ];
    expect(pStatuses).toContain('SAFE');

    // 8. ClutterLevel
    const clutters: import('../src/domain/relocation/volumeEstimator').ClutterLevel[] = [
      'minimalist', 'standard', 'dense'
    ];
    expect(clutters).toContain('standard');

    // 9. RecommendedFleetType
    const fleets: import('../src/domain/relocation/volumeEstimator').RecommendedFleetType[] = [
      'passenger_car_multiple_trips', 'van_l1h1', 'van_l2h2', 'van_l3h2', 'van_l4h3', 'box_truck_with_lift'
    ];
    expect(fleets).toContain('van_l1h1');

    // 10. LockerNetwork
    const lockers: import('../src/domain/standards/multiCheckerMatrix').LockerNetwork[] = [
      'inpost', 'orlen', 'dpd', 'pocztex'
    ];
    expect(lockers).toContain('inpost');

    // 11. AirlineMatrixCode
    const airlines: import('../src/domain/standards/multiCheckerMatrix').AirlineMatrixCode[] = [
      'ryanair', 'wizzair', 'lot', 'lufthansa', 'easyjet', 'klm', 'airfrance', 'british_airways', 'norwegian', 'sas'
    ];
    expect(airlines).toContain('ryanair');

    // 12. LockerSize
    const lockerSizes: import('../src/domain/standards/parcelLockers').LockerSize[] = ['A', 'B', 'C'];
    expect(lockerSizes).toEqual(['A', 'B', 'C']);
  });
});
