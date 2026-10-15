import { evaluateTowbarLoad } from '../garage/towbarPhysics';

describe('TowbarPhysics (RD-44, SPRZ-10)', () => {
  const standardTowbarRack = {
    towbarSLimitKg: 75,
    rackWeightKg: 18,
    maxBikesCapacity: 3,
  };

  it('approves safe vertical load with traditional lightweight bicycles', () => {
    const bikes = [
      { id: '1', name: 'Rower szosowy', weightKg: 10, isElectric: false },
      { id: '2', name: 'Rower trekkingowy', weightKg: 14, isElectric: false },
    ];

    // 18 + 10 + 14 = 42 kg <= 75 kg
    const res = evaluateTowbarLoad(bikes, standardTowbarRack);

    expect(res.isOverloaded).toBe(false);
    expect(res.totalVerticalLoadKg).toBe(42);
    expect(res.remainingCapacityKg).toBe(33);
    expect(res.warnings).toHaveLength(0);
  });

  it('detects towbar overload with heavy e-bikes and suggests battery removal', () => {
    const bikes = [
      { id: '1', name: 'E-bike MTB 1', weightKg: 25, isElectric: true, batteryWeightKg: 4.0 },
      { id: '2', name: 'E-bike MTB 2', weightKg: 25, isElectric: true, batteryWeightKg: 4.0 },
      { id: '3', name: 'Rower dziecięcy', weightKg: 11, isElectric: false },
    ];

    // 18 + 25 + 25 + 11 = 79 kg > 75 kg (overload 4 kg)
    // Battery savings: 4.0 + 4.0 = 8 kg -> load becomes 71 kg <= 75 kg!
    const res = evaluateTowbarLoad(bikes, standardTowbarRack);

    expect(res.isOverloaded).toBe(true);
    expect(res.overloadKg).toBe(4);
    expect(res.totalVerticalLoadKg).toBe(79);
    expect(res.canBeResolvedByRemovingBatteries).toBe(true);
    expect(res.batterySavingsPotentialKg).toBe(8);
    expect(res.loadWithBatteriesRemovedKg).toBe(71);
    expect(res.recommendations.some(r => r.includes('akumulatory'))).toBe(true);
  });

  it('rejects setup exceeding rack bike capacity', () => {
    const bikes = [
      { id: '1', name: 'B1', weightKg: 10, isElectric: false },
      { id: '2', name: 'B2', weightKg: 10, isElectric: false },
      { id: '3', name: 'B3', weightKg: 10, isElectric: false },
      { id: '4', name: 'B4', weightKg: 10, isElectric: false },
    ];

    const res = evaluateTowbarLoad(bikes, standardTowbarRack);
    expect(res.warnings.some(w => w.includes('pojemność'))).toBe(true);
  });

  it('uses default ebike battery weight when batteryWeightKg is omitted', () => {
    const bikes = [
      { id: '1', name: 'EBike Default', weightKg: 24, isElectric: true }, // no batteryWeightKg
    ];

    const res = evaluateTowbarLoad(bikes, standardTowbarRack);
    expect(res.batterySavingsPotentialKg).toBe(3.5);
  });
});
