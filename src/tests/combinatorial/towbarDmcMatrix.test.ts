/**
 * Czy się zmieści? (FitCheck) — Wyczerpująca macierz kombinatoryczna: Hak holowniczy (Nacisk pionowy S)
 * Testuje regułę RD-44: Bilans nacisku pionowego na kulę haka, akumulatory e-bike i przeciążenia.
 */

import {
  evaluateTowbarLoad,
  Bicycle,
  TowbarRackSpecs,
  DEFAULT_EBIKE_BATTERY_WEIGHT_KG,
} from '../../domain/garage/towbarPhysics';

describe('Exhaustive Combinatorial: Towbar Physics & Vertical Load S Matrix', () => {
  const towbarLimits = [50, 60, 75, 85, 100]; // Parametr S w kg
  const rackWeights = [14, 16, 18, 20]; // Masa samej platformy w kg
  const rackCapacities = [2, 3, 4]; // Pojemność uchwytów

  // 20 zróżnicowanych konfiguracji rowerów (szosa, trekking, dziecięce, e-bike, enduro)
  const bikeConfigurations: Array<{
    readonly label: string;
    readonly bikes: readonly Bicycle[];
  }> = [
    {
      label: '1x Lekka szosa (8 kg)',
      bikes: [{ id: 'b1', name: 'Szosa Carbon', weightKg: 8, isElectric: false }],
    },
    {
      label: '1x Standard trekking (15 kg)',
      bikes: [{ id: 'b1', name: 'Trekking', weightKg: 15, isElectric: false }],
    },
    {
      label: '1x E-bike miejski (24 kg)',
      bikes: [{ id: 'b1', name: 'E-city', weightKg: 24, isElectric: true }],
    },
    {
      label: '2x Szosa (8 + 9 kg)',
      bikes: [
        { id: 'b1', name: 'Szosa 1', weightKg: 8, isElectric: false },
        { id: 'b2', name: 'Szosa 2', weightKg: 9, isElectric: false },
      ],
    },
    {
      label: '2x Trekking (14 + 16 kg)',
      bikes: [
        { id: 'b1', name: 'Trek 1', weightKg: 14, isElectric: false },
        { id: 'b2', name: 'Trek 2', weightKg: 16, isElectric: false },
      ],
    },
    {
      label: '1x E-bike (24 kg) + 1x Dziecięcy (10 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike', weightKg: 24, isElectric: true },
        { id: 'b2', name: 'Junior', weightKg: 10, isElectric: false },
      ],
    },
    {
      label: '2x E-bike (24 + 26 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike 1', weightKg: 24, isElectric: true },
        { id: 'b2', name: 'E-bike 2', weightKg: 26, isElectric: true },
      ],
    },
    {
      label: '2x E-bike z cięższą baterią 4.5kg (26 + 28 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike Enduro 1', weightKg: 26, isElectric: true, batteryWeightKg: 4.5 },
        { id: 'b2', name: 'E-bike Enduro 2', weightKg: 28, isElectric: true, batteryWeightKg: 4.5 },
      ],
    },
    {
      label: '3x Rower tradycyjny (13 + 14 + 15 kg)',
      bikes: [
        { id: 'b1', name: 'Górski 1', weightKg: 13, isElectric: false },
        { id: 'b2', name: 'Górski 2', weightKg: 14, isElectric: false },
        { id: 'b3', name: 'Trekking', weightKg: 15, isElectric: false },
      ],
    },
    {
      label: '1x E-bike (25 kg) + 2x Tradycyjne (13 + 14 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike', weightKg: 25, isElectric: true },
        { id: 'b2', name: 'Rower A', weightKg: 13, isElectric: false },
        { id: 'b3', name: 'Rower B', weightKg: 14, isElectric: false },
      ],
    },
    {
      label: '2x E-bike (23 + 25 kg) + 1x Dziecięcy (11 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike 1', weightKg: 23, isElectric: true },
        { id: 'b2', name: 'E-bike 2', weightKg: 25, isElectric: true },
        { id: 'b3', name: 'Junior', weightKg: 11, isElectric: false },
      ],
    },
    {
      label: '3x E-bike (23 + 24 + 25 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike 1', weightKg: 23, isElectric: true },
        { id: 'b2', name: 'E-bike 2', weightKg: 24, isElectric: true },
        { id: 'b3', name: 'E-bike 3', weightKg: 25, isElectric: true },
      ],
    },
    {
      label: '4x Rowery tradycyjne (10 + 12 + 14 + 15 kg)',
      bikes: [
        { id: 'b1', name: 'Junior', weightKg: 10, isElectric: false },
        { id: 'b2', name: 'Szosa', weightKg: 12, isElectric: false },
        { id: 'b3', name: 'Górski', weightKg: 14, isElectric: false },
        { id: 'b4', name: 'Trekking', weightKg: 15, isElectric: false },
      ],
    },
    {
      label: '2x E-bike (24 + 24 kg) + 2x Tradycyjne (12 + 13 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike 1', weightKg: 24, isElectric: true },
        { id: 'b2', name: 'E-bike 2', weightKg: 24, isElectric: true },
        { id: 'b3', name: 'Rower 1', weightKg: 12, isElectric: false },
        { id: 'b4', name: 'Rower 2', weightKg: 13, isElectric: false },
      ],
    },
    {
      label: '3x E-bike (22 + 24 + 25 kg) + 1x Tradycyjny (14 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike 1', weightKg: 22, isElectric: true },
        { id: 'b2', name: 'E-bike 2', weightKg: 24, isElectric: true },
        { id: 'b3', name: 'E-bike 3', weightKg: 25, isElectric: true },
        { id: 'b4', name: 'Rower', weightKg: 14, isElectric: false },
      ],
    },
    {
      label: '4x E-bike ciężkie (25 + 26 + 27 + 28 kg)',
      bikes: [
        { id: 'b1', name: 'E-bike 1', weightKg: 25, isElectric: true },
        { id: 'b2', name: 'E-bike 2', weightKg: 26, isElectric: true },
        { id: 'b3', name: 'E-bike 3', weightKg: 27, isElectric: true },
        { id: 'b4', name: 'E-bike 4', weightKg: 28, isElectric: true },
      ],
    },
    {
      label: 'Nadmiar: 5 rowerów (przekroczenie pojemności uchwytu)',
      bikes: [
        { id: 'b1', name: 'R1', weightKg: 10, isElectric: false },
        { id: 'b2', name: 'R2', weightKg: 11, isElectric: false },
        { id: 'b3', name: 'R3', weightKg: 12, isElectric: false },
        { id: 'b4', name: 'R4', weightKg: 13, isElectric: false },
        { id: 'b5', name: 'R5', weightKg: 14, isElectric: false },
      ],
    },
    {
      label: '1x E-Cargo rower (34 kg)',
      bikes: [{ id: 'b1', name: 'E-Cargo', weightKg: 34, isElectric: true, batteryWeightKg: 5.0 }],
    },
    {
      label: '1x E-Cargo (34 kg) + 1x E-bike (24 kg)',
      bikes: [
        { id: 'b1', name: 'E-Cargo', weightKg: 34, isElectric: true, batteryWeightKg: 5.0 },
        { id: 'b2', name: 'E-bike', weightKg: 24, isElectric: true },
      ],
    },
    {
      label: 'Brak rowerów (pusta platforma 0 kg)',
      bikes: [],
    },
  ];

  const testCases: Array<{
    sLimit: number;
    rackWeight: number;
    capacity: number;
    bikeConfig: { label: string; bikes: readonly Bicycle[] };
  }> = [];

  for (const sLimit of towbarLimits) {
    for (const rackWeight of rackWeights) {
      for (const capacity of rackCapacities) {
        for (const bikeConfig of bikeConfigurations) {
          testCases.push({ sLimit, rackWeight, capacity, bikeConfig });
        }
      }
    }
  }

  test.each(
    testCases.map(tc => [
      `S=${tc.sLimit}kg_Platforma=${tc.rackWeight}kg_Uchwyty=${tc.capacity}_${tc.bikeConfig.label}`,
      tc,
    ])
  )('Hak: %s', (_label, tc) => {
    const specs: TowbarRackSpecs = {
      towbarSLimitKg: tc.sLimit,
      rackWeightKg: tc.rackWeight,
      maxBikesCapacity: tc.capacity,
    };

    const res = evaluateTowbarLoad(tc.bikeConfig.bikes, specs);

    const bikesWeight = tc.bikeConfig.bikes.reduce((acc, b) => acc + b.weightKg, 0);
    const expectedTotalLoad = tc.rackWeight + bikesWeight;

    expect(res.totalVerticalLoadKg).toBe(expectedTotalLoad);
    expect(res.maxAllowedLoadKg).toBe(tc.sLimit);

    const expectedOverloaded = expectedTotalLoad > tc.sLimit;
    expect(res.isOverloaded).toBe(expectedOverloaded);

    if (expectedOverloaded) {
      expect(res.overloadKg).toBeCloseTo(expectedTotalLoad - tc.sLimit, 1);
      expect(res.remainingCapacityKg).toBe(0);
      expect(res.warnings.some(w => w.includes('Przeciążenie kuli haka'))).toBe(true);
    } else {
      expect(res.overloadKg).toBe(0);
      expect(res.remainingCapacityKg).toBeCloseTo(tc.sLimit - expectedTotalLoad, 1);
    }

    // Weryfikacja pojemności platformy
    if (tc.bikeConfig.bikes.length > tc.capacity) {
      expect(res.warnings.some(w => w.includes('przekracza dopuszczalną pojemność'))).toBe(true);
    }

    // Weryfikacja kalkulacji akumulatorów e-bike
    const expectedEBikes = tc.bikeConfig.bikes.filter(b => b.isElectric);
    expect(res.eBikesCount).toBe(expectedEBikes.length);

    let expectedBatterySavings = 0;
    for (const eb of expectedEBikes) {
      expectedBatterySavings += eb.batteryWeightKg ?? DEFAULT_EBIKE_BATTERY_WEIGHT_KG;
    }
    expect(res.batterySavingsPotentialKg).toBeCloseTo(expectedBatterySavings, 1);
    expect(res.loadWithBatteriesRemovedKg).toBeCloseTo(
      expectedTotalLoad - expectedBatterySavings,
      1
    );

    if (expectedOverloaded && res.loadWithBatteriesRemovedKg <= tc.sLimit) {
      expect(res.canBeResolvedByRemovingBatteries).toBe(true);
      expect(res.recommendations.some(r => r.includes('Zdemontuj akumulatory'))).toBe(true);
    }
  });
});
