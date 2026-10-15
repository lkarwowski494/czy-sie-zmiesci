import { estimateRelocationVolume } from '../relocation/volumeEstimator';

describe('VolumeEstimator (RD-49)', () => {
  it('estimates volume for standard 50m2 apartment with 2 residents', () => {
    // 50 m² * 0.40 * (1 + 0.15 * 1) = 20 * 1.15 = 23.0 m³
    const res = estimateRelocationVolume({
      floorAreaM2: 50,
      clutterLevel: 'standard',
      residentsCount: 2,
    });

    expect(res.estimatedVolumeM3).toBe(23.0);
    expect(res.recommendedBoxesCount).toBe(42); // ceil(23 * 1.8)
    expect(res.estimatedWeightKg).toBe(1495); // 23 * 65
    expect(res.recommendedFleetType).toBe('box_truck_with_lift');
  });

  it('estimates volume for small minimalist studio', () => {
    // 25 m² * 0.25 * 1.0 = 6.25 ≈ 6.3 m³
    const res = estimateRelocationVolume({
      floorAreaM2: 25,
      clutterLevel: 'minimalist',
      residentsCount: 1,
    });

    expect(res.estimatedVolumeM3).toBe(6.3);
    expect(res.recommendedFleetType).toBe('van_l1h1');
  });

  it('estimates volume for dense 40m2 flat fitting medium van L2H2', () => {
    // 20 m² * 0.55 * 1.0 = 11.0 m³
    const res = estimateRelocationVolume({
      floorAreaM2: 20,
      clutterLevel: 'dense',
      residentsCount: 1,
    });

    expect(res.estimatedVolumeM3).toBe(11.0);
    expect(res.recommendedFleetType).toBe('van_l2h2');
  });

  it('estimates volume for micro studio fitting passenger car', () => {
    // 10 m² * 0.25 = 2.5 m³ (<= 3 m³)
    const res = estimateRelocationVolume({
      floorAreaM2: 10,
      clutterLevel: 'minimalist',
      residentsCount: 0,
    });

    expect(res.estimatedVolumeM3).toBe(2.5);
    expect(res.recommendedFleetType).toBe('passenger_car_multiple_trips');
  });

  it('estimates volume for L3H2 van bracket (11 to 14 m3)', () => {
    // 30 m² * 0.40 * 1.0 = 12.0 m³
    const res = estimateRelocationVolume({
      floorAreaM2: 30,
      clutterLevel: 'standard',
      residentsCount: 1,
    });

    expect(res.estimatedVolumeM3).toBe(12.0);
    expect(res.recommendedFleetType).toBe('van_l3h2');
  });

  it('estimates volume for L4H3 van bracket (14 to 18 m3)', () => {
    // 40 m² * 0.40 * 1.0 = 16.0 m³
    const res = estimateRelocationVolume({
      floorAreaM2: 40,
      clutterLevel: 'standard',
      residentsCount: 1,
    });

    expect(res.estimatedVolumeM3).toBe(16.0);
    expect(res.recommendedFleetType).toBe('van_l4h3');
  });
});
