import {
  compareCarVsVanRelocation,
  DEFAULT_CAR_TRUNK_M3,
  DEFAULT_VAN_CARGO_M3,
} from '../relocation/vanVsCarEconomics';

describe('Van vs Personal Car Relocation Economic Comparison (Z-164)', () => {
  it('recommends personal car for very small volume (e.g. 2 m3, 1-2 trips)', () => {
    const result = compareCarVsVanRelocation({
      totalVolumeM3: 2.0,
      distanceOneWayKm: 15,
      carTrunkVolumeM3: 1.2,
      vanCargoVolumeM3: 10.5,
      vanDailyRentalFeePln: 200,
    });

    expect(result.carTripsCount).toBe(2);
    expect(result.vanTripsCount).toBe(1);
    expect(result.isVanRecommended).toBe(false);
    expect(result.costDifferencePln).toBeLessThan(0); // Car is cheaper
    expect(result.economicVerdict).toContain('Osobówka tańsza');
    expect(result.recommendation).toContain('wynajem vana jest nieopłacalny');
  });

  it('recommends van when van rental saves significant trips and time', () => {
    // 18 m3 volume, 20 km distance
    const result = compareCarVsVanRelocation({
      totalVolumeM3: 18.0,
      distanceOneWayKm: 20,
      carTrunkVolumeM3: 1.2, // 18 / 1.2 = 15 car trips!
      vanCargoVolumeM3: 10.5, // 18 / 10.5 = 2 van trips!
      vanDailyRentalFeePln: 180,
    });

    expect(result.carTripsCount).toBe(15);
    expect(result.vanTripsCount).toBe(2);
    expect(result.carTotalDistanceKm).toBe(15 * 40); // 600 km
    expect(result.vanTotalDistanceKm).toBe(2 * 40); // 80 km
    expect(result.isVanRecommended).toBe(true);
    expect(result.timeSavedHours).toBeGreaterThan(5);
  });

  it('detects when van is cheaper than car due to long distance multiple trips', () => {
    // 12 m3 volume, long distance: 150 km one way
    // Car: 10 trips * 300 km = 3000 km! Fuel alone: 30 * 7.5 * 6.5 = 1462 zł
    // Van: 2 trips * 300 km = 600 km. Fuel: 6 * 10.5 * 6.5 = 409 zł + 200 zł rental = 609 zł -> VAN IS CHEAPER!
    const result = compareCarVsVanRelocation({
      totalVolumeM3: 12.0,
      distanceOneWayKm: 150,
      carTrunkVolumeM3: 1.2,
      vanCargoVolumeM3: 10.5,
      vanDailyRentalFeePln: 200,
    });

    expect(result.costDifferencePln).toBeGreaterThan(0);
    expect(result.isVanRecommended).toBe(true);
    expect(result.economicVerdict).toContain('Wynajem vana jest TAŃSZY');
  });

  it('uses default values when optional parameters are omitted', () => {
    const result = compareCarVsVanRelocation({
      totalVolumeM3: 10.5,
      distanceOneWayKm: 10,
    });

    expect(result.vanTripsCount).toBe(1); // 10.5 / 10.5 = 1
    expect(result.carTripsCount).toBe(Math.ceil(10.5 / DEFAULT_CAR_TRUNK_M3));
    expect(result.carFuelCostPln).toBeGreaterThan(0);
    expect(result.vanRentalCostPln).toBe(180);
  });

  it('throws error for non-positive volume, distance, or invalid parameters', () => {
    expect(() =>
      compareCarVsVanRelocation({ totalVolumeM3: 0, distanceOneWayKm: 10 })
    ).toThrow('Kubatura mienia i odległość muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({ totalVolumeM3: 10, distanceOneWayKm: -5 })
    ).toThrow('Kubatura mienia i odległość muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({
        totalVolumeM3: 10,
        distanceOneWayKm: 10,
        carTrunkVolumeM3: 0,
      })
    ).toThrow('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({
        totalVolumeM3: 10,
        distanceOneWayKm: 10,
        vanCargoVolumeM3: 0,
      })
    ).toThrow('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({
        totalVolumeM3: 10,
        distanceOneWayKm: 10,
        fuelPricePerLiterPln: 0,
      })
    ).toThrow('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({
        totalVolumeM3: 10,
        distanceOneWayKm: 10,
        carFuelConsumptionLPer100Km: 0,
      })
    ).toThrow('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({
        totalVolumeM3: 10,
        distanceOneWayKm: 10,
        vanFuelConsumptionLPer100Km: 0,
      })
    ).toThrow('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');

    expect(() =>
      compareCarVsVanRelocation({
        totalVolumeM3: 10,
        distanceOneWayKm: 10,
        averageSpeedKmh: 0,
      })
    ).toThrow('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');
  });
});
