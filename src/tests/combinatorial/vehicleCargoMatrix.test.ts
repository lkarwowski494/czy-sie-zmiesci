/**
 * Czy się zmieści? (FitCheck) — Wyczerpująca macierz kombinatoryczna: Pojazdy vs Ładunki
 * Testuje algorytm 3D Extreme Points Bin Packing, rozkład masy CoG i DMC dla
 * wszystkich kombinacji pojazdów referencyjnych i ładunków z bazy presetów.
 */

import { POPULAR_VEHICLES_PRESETS } from '../../data/presets/vehicles';
import { CARGO_ITEMS_PRESETS } from '../../data/presets/cargoItems';
import {
  packItemsInTrunk,
  doesOverlap,
  isInsideTrunkBoundary,
  getOrientations,
} from '../../domain/geometry/extremePoints';
import { calculateCenterOfGravity } from '../../domain/physics/centerOfGravity';
import { calculatePayloadDMC } from '../../domain/physics/payloadDMC';
import { CargoItem, TrunkGeometry } from '../../domain/geometry/types';

describe('Exhaustive Combinatorial: Vehicle Trunk vs Cargo Presets Matrix', () => {
  describe('Pojedynczy ładunek we wszystkich pojazdach referencyjnych', () => {
    describe.each(POPULAR_VEHICLES_PRESETS.map(v => [v.id, v.make + ' ' + v.model, v]))(
      'Pojazd: %s (%s)',
      (_vehicleId, _vehicleName, vehicle) => {
        test.each(CARGO_ITEMS_PRESETS.map(c => [c.id, c.name, c]))(
          'próba załadunku: %s (%s)',
          (_cargoId, _cargoName, cargo) => {
            const trunk = vehicle.trunk;
            const result = packItemsInTrunk([cargo], trunk);

            // Niezmienniki solvera
            expect(result.usableVolumeMm3).toBeGreaterThan(0);
            expect(result.packingEfficiencyPct).toBeGreaterThanOrEqual(0);
            expect(result.packingEfficiencyPct).toBeLessThanOrEqual(100);

            if (result.placements.length === 1) {
              const placed = result.placements[0];
              expect(placed.itemId).toBe(cargo.id);

              // Pozycja nie może być ujemna
              expect(placed.positionMm.xMm).toBeGreaterThanOrEqual(0);
              expect(placed.positionMm.yMm).toBeGreaterThanOrEqual(0);
              expect(placed.positionMm.zMm).toBeGreaterThanOrEqual(0);

              // Sprawdzenie granic bagażnika
              const fitsBounds = isInsideTrunkBoundary(
                placed.positionMm,
                placed.orientedDimensionsMm,
                trunk
              );
              expect(fitsBounds).toBe(true);

              // Orientacja musi być jedną z dopuszczalnych permutacji
              const allowedOrientations = getOrientations(cargo);
              const isValidOrientation = allowedOrientations.some(
                o =>
                  o.lengthMm === placed.orientedDimensionsMm.lengthMm &&
                  o.widthMm === placed.orientedDimensionsMm.widthMm &&
                  o.heightMm === placed.orientedDimensionsMm.heightMm
              );
              expect(isValidOrientation).toBe(true);

              // Objętość spakowana musi odpowiadać objętości przedmiotu
              const expectedVolMm3 =
                cargo.dimensionsMm.lengthMm *
                cargo.dimensionsMm.widthMm *
                cargo.dimensionsMm.heightMm;
              expect(result.usedVolumeMm3).toBe(expectedVolMm3);
              expect(result.totalWeightKg).toBe(cargo.weightKg);
            } else {
              // Przedmiot nie zmieścił się
              expect(result.unplacedItems.length).toBe(1);
              expect(result.unplacedItems[0].id).toBe(cargo.id);
              expect(result.usedVolumeMm3).toBe(0);
              expect(result.packingEfficiencyPct).toBe(0);
            }
          }
        );
      }
    );
  });

  describe('Pakiety multi-ładunkowe i weryfikacja braku kolizji 3D', () => {
    // 5 typowych scenariuszy załadunkowych
    const scenarios: Array<{
      readonly name: string;
      readonly itemIds: readonly string[];
    }> = [
      {
        name: 'Wakacje Rodzinne (2x walizka duża, 1x wózek, 2x karton M)',
        itemIds: ['luggage-large-checkin', 'luggage-large-checkin', 'sport-pram-stroller', 'box-m', 'box-m'],
      },
      {
        name: 'Przeprowadzka drobna (3x karton L, 2x karton S)',
        itemIds: ['box-l', 'box-l', 'box-l', 'box-s', 'box-s'],
      },
      {
        name: 'Sprzęt sportowy (1x klatka psa L, 2x walizka średnia)',
        itemIds: ['sport-dog-crate-l', 'luggage-medium-checkin', 'luggage-medium-checkin'],
      },
      {
        name: 'Zakupy meblowe (1x stolik Lack, 2x karton M)',
        itemIds: ['ikea-lack-coffee-table', 'box-m', 'box-m'],
      },
      {
        name: 'Pakiet małych kartonów (6x karton S)',
        itemIds: ['box-s', 'box-s', 'box-s', 'box-s', 'box-s', 'box-s'],
      },
    ];

    describe.each(POPULAR_VEHICLES_PRESETS.map(v => [v.id, v.make + ' ' + v.model, v]))(
      'Pojazd: %s (%s)',
      (_vehicleId, _vehicleName, vehicle) => {
        test.each(scenarios.map(s => [s.name, s]))(
          'scenariusz multi: %s',
          (_scenarioName, scenario) => {
            const items: CargoItem[] = scenario.itemIds.map((id, index) => {
              const preset = CARGO_ITEMS_PRESETS.find(c => c.id === id);
              if (!preset) throw new Error(`Nieznany preset ${id}`);
              return {
                ...preset,
                id: `${preset.id}-${index}`, // Unikalny ID dla każdej instancji
              };
            });

            const trunk = vehicle.trunk;
            const result = packItemsInTrunk(items, trunk);

            // 1. Sprawdzenie, że żaden umieszczony przedmiot nie koliduje z innym (brak przenikania)
            for (let i = 0; i < result.placements.length; i++) {
              for (let j = i + 1; j < result.placements.length; j++) {
                const itemA = result.placements[i];
                const itemB = result.placements[j];

                const overlap = doesOverlap(
                  itemA.positionMm,
                  itemA.orientedDimensionsMm,
                  itemB.positionMm,
                  itemB.orientedDimensionsMm
                );
                expect(overlap).toBe(false);
              }
            }

            // 2. Każdy umieszczony przedmiot musi mieścić się w obrysie bagażnika
            for (const placed of result.placements) {
              expect(
                isInsideTrunkBoundary(placed.positionMm, placed.orientedDimensionsMm, trunk)
              ).toBe(true);
            }

            // 3. Sprawdzenie środka ciężkości (CoG) jeśli cokolwiek zostało umieszczone
            if (result.placements.length > 0) {
              const itemWeights: Record<string, number> = {};
              for (const it of items) {
                itemWeights[it.id] = it.weightKg;
              }

              const cog = calculateCenterOfGravity(result.placements, itemWeights, trunk);
              expect(cog.totalWeightKg).toBeGreaterThan(0);
              expect(cog.centerOfGravityMm.xMm).toBeGreaterThanOrEqual(0);
              expect(cog.centerOfGravityMm.yMm).toBeGreaterThanOrEqual(0);
              expect(cog.centerOfGravityMm.zMm).toBeGreaterThanOrEqual(0);

              // CoG nie może przekraczać gabarytów bagażnika
              expect(cog.centerOfGravityMm.xMm).toBeLessThanOrEqual(trunk.lengthFloorMm);
              expect(cog.centerOfGravityMm.yMm).toBeLessThanOrEqual(trunk.widthMaxMm);
              expect(cog.centerOfGravityMm.zMm).toBeLessThanOrEqual(trunk.heightRoofMm);
            }

            // 4. Sprawdzenie dopuszczalnej masy całkowitej (DMC) dla 2 dodatkowych pasażerów
            const payload = calculatePayloadDMC(
              {
                curbWeightKg: vehicle.specs.curbWeightKg,
                grossVehicleWeightKg: vehicle.specs.grossVehicleWeightKg,
                maxRoofLoadKg: vehicle.specs.maxRoofLoadKg,
              },
              2, // additionalPassengersCount
              result.totalWeightKg
            );

            expect(payload.factoryPayloadKg).toBe(
              vehicle.specs.grossVehicleWeightKg - vehicle.specs.curbWeightKg
            );
            expect(payload.passengerDeductionKg).toBe(150); // 2 * 75 kg
            expect(payload.currentCargoWeightKg).toBe(result.totalWeightKg);
          }
        );
      }
    );
  });

  describe('Parametryczna macierz geometrii bagażnika (Grid 250 wariantów)', () => {
    // 10 długości x 5 szerokości x 5 wysokości = 250 wariantów
    const floorLengths = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700];
    const minWidths = [850, 950, 1050, 1150, 1250];
    const roofHeights = [600, 700, 800, 900, 1000];

    const gridVariations: Array<{
      readonly length: number;
      readonly width: number;
      readonly height: number;
    }> = [];

    for (const length of floorLengths) {
      for (const width of minWidths) {
        for (const height of roofHeights) {
          gridVariations.push({ length, width, height });
        }
      }
    }

    test.each(gridVariations.map(g => [`${g.length}x${g.width}x${g.height}mm`, g]))(
      'Parametryczny bagażnik: %s z kartonem M i walizką L',
      (_label, g) => {
        const parametricTrunk: TrunkGeometry = {
          lengthFloorMm: g.length,
          lengthRoofMm: Math.round(g.length * 0.7),
          widthMinMm: g.width,
          widthMaxMm: g.width + 120,
          heightRoofMm: g.height,
          heightShelfMm: Math.round(g.height * 0.6),
          apertureWidthMm: g.width,
          apertureHeightMm: Math.round(g.height * 0.9),
          thresholdHeightMm: 50,
        };

        const testItems: CargoItem[] = [
          {
            id: 'param-box-m',
            name: 'Karton M',
            dimensionsMm: { lengthMm: 500, widthMm: 350, heightMm: 350 },
            weightKg: 12,
            rotationConstraint: 'XYZ',
            isFragile: false,
            isSoft: false,
            allowStacking: true,
          },
          {
            id: 'param-suitcase-l',
            name: 'Walizka L',
            dimensionsMm: { lengthMm: 750, widthMm: 500, heightMm: 300 },
            weightKg: 20,
            rotationConstraint: 'XYZ',
            isFragile: false,
            isSoft: false,
            allowStacking: true,
          },
        ];

        const result = packItemsInTrunk(testItems, parametricTrunk);

        // Niezmiennik: brak kolizji między paczkami
        if (result.placements.length === 2) {
          const [a, b] = result.placements;
          expect(
            doesOverlap(
              a.positionMm,
              a.orientedDimensionsMm,
              b.positionMm,
              b.orientedDimensionsMm
            )
          ).toBe(false);
        }

        for (const placed of result.placements) {
          expect(
            isInsideTrunkBoundary(
              placed.positionMm,
              placed.orientedDimensionsMm,
              parametricTrunk
            )
          ).toBe(true);
        }

        expect(result.packingEfficiencyPct).toBeGreaterThanOrEqual(0);
        expect(result.packingEfficiencyPct).toBeLessThanOrEqual(100);
      }
    );
  });
});
