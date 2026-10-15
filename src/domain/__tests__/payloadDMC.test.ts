import { calculatePayloadDMC } from '../physics/payloadDMC';

describe('PayloadDMC (RD-17, RD-18, SPRZ-06)', () => {
  const vehicle = {
    curbWeightKg: 1400, // Includes driver 75 kg
    grossVehicleWeightKg: 1950, // DMC
    maxRoofLoadKg: 75,
  };

  it('calculates safe payload when cargo is well within limits', () => {
    // Factory payload = 1950 - 1400 = 550 kg
    // 1 additional passenger = 75 kg
    // Available = 550 - 75 = 475 kg
    // Cargo = 150 kg -> remaining = 325 kg (safe)
    const res = calculatePayloadDMC(vehicle, 1, 150);

    expect(res.factoryPayloadKg).toBe(550);
    expect(res.passengerDeductionKg).toBe(75);
    expect(res.netAvailableCargoPayloadKg).toBe(475);
    expect(res.remainingPayloadKg).toBe(325);
    expect(res.status).toBe('SAFE');
    expect(res.overloadKg).toBe(0);
  });

  it('triggers warning when near limit (> 90% utilization)', () => {
    // Available = 475 kg, Cargo = 450 kg -> utilization = 95%
    const res = calculatePayloadDMC(vehicle, 1, 450);

    expect(res.status).toBe('WARNING_NEAR_LIMIT');
    expect(res.warnings.some(w => w.includes('limitu'))).toBe(true);
  });

  it('triggers critical overload alarm when exceeding GVW (DMC)', () => {
    // Available = 475 kg, Cargo = 550 kg (e.g. ceramic tiles) -> overload = 75 kg
    const res = calculatePayloadDMC(vehicle, 1, 550);

    expect(res.status).toBe('CRITICAL_OVERLOAD');
    expect(res.overloadKg).toBe(75);
    expect(res.warnings.some(w => w.includes('PRZEKROCZENIE'))).toBe(true);
    expect(res.legalReferences.some(l => l.includes('Art. 61'))).toBe(true);
  });

  it('handles negative passenger count as zero', () => {
    const res = calculatePayloadDMC(vehicle, -2, 100);
    expect(res.passengerDeductionKg).toBe(0);
  });

  it('handles zero net available cargo with zero and non-zero cargo', () => {
    const fullyLoadedCar = {
      curbWeightKg: 1500,
      grossVehicleWeightKg: 1500, // Factory payload = 0
      maxRoofLoadKg: 50,
    };

    // 0 cargo items -> utilization 0%
    const resZero = calculatePayloadDMC(fullyLoadedCar, 0, 0);
    expect(resZero.payloadUtilizationPct).toBe(0);
    expect(resZero.status).toBe('SAFE');

    // 10 kg cargo items with 0 capacity -> utilization 999%
    const resOver = calculatePayloadDMC(fullyLoadedCar, 0, 10);
    expect(resOver.payloadUtilizationPct).toBe(999);
    expect(resOver.status).toBe('CRITICAL_OVERLOAD');
  });
});
