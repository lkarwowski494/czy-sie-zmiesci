/**
 * Czy się zmieści? (FitCheck) — Kombinatoryczna Macierz Przejść przez Drzwi (RD-33, RD-22)
 * Wyczerpujące testy przejścia dla wszystkich mebli i sprzętów AGD przez ościeżnice
 * o szerokościach od 600 do 1100 mm w pełnym spektrum konfiguracji (klamka, skrzydło, ręce tragarzy).
 */

import { calculateDoorwayClearance, DoorwaySpecs } from '../../domain/doors-stairs/doorwayClearance';
import { CARGO_ITEMS_PRESETS } from '../../data/presets/cargoItems';

describe('Combinatorial Doorway Clearance Matrix (RD-33 & RD-22)', () => {
  // Szerokości drzwi od 600 mm (wąskie spiżarnie) do 1000 mm (szerokie wejściowe) co 20 mm
  const doorWidthsMm = [600, 620, 640, 660, 680, 700, 720, 740, 760, 780, 800, 820, 840, 860, 880, 900, 920, 940, 960, 980, 1000];

  const doorConfigs: Array<{ name: string; specs: DoorwaySpecs; hands: boolean }> = [
    {
      name: 'Standard 90° z klamką i dłońmi tragarzy',
      specs: { nominalWidthMm: 800, doorSwingAngleDeg: 90, isDoorLeafRemovable: false, isHandleRemovable: false },
      hands: true,
    },
    {
      name: 'Drzwi 90° z odkręconą klamką',
      specs: { nominalWidthMm: 800, doorSwingAngleDeg: 90, isDoorLeafRemovable: false, isHandleRemovable: true },
      hands: true,
    },
    {
      name: 'Drzwi otwarte 180° na oścież',
      specs: { nominalWidthMm: 800, doorSwingAngleDeg: 180, isDoorLeafRemovable: false, isHandleRemovable: true },
      hands: true,
    },
    {
      name: 'Zdjęte skrzydło (otwór surowy bez rąk)',
      specs: { nominalWidthMm: 800, doorSwingAngleDeg: 180, isDoorLeafRemovable: true, isHandleRemovable: true },
      hands: false,
    },
  ];

  describe.each(CARGO_ITEMS_PRESETS.map((item) => [item.id, item.name, item]))(
    'Mebel / Ładunek: %s (%s)',
    (_id, _name, item) => {
      describe.each(doorConfigs.map((c) => [c.name, c.specs, c.hands]))(
        'Konfiguracja: %s',
        (_cfgName, baseSpecs, hands) => {
          test.each(doorWidthsMm)(
            'w ościeżnicy o szerokości nominalnej %i mm',
            (nominalWidth) => {
              const specs: DoorwaySpecs = {
                ...baseSpecs,
                nominalWidthMm: nominalWidth,
              };

              const result = calculateDoorwayClearance(item.dimensionsMm, specs, hands);

              // 1. Spójność matematyczna wymiarów
              expect(result.effectiveApertureWidthMm).toBeLessThanOrEqual(nominalWidth);
              expect(result.netClearanceWithHandsMm).toBeLessThanOrEqual(result.effectiveApertureWidthMm);

              // 2. Najmniejszy przekrój poprzeczny bryły musi być dodatni
              expect(result.smallestItemDimensionMm).toBeGreaterThan(0);
              const minDim = Math.min(
                item.dimensionsMm.lengthMm,
                item.dimensionsMm.widthMm,
                item.dimensionsMm.heightMm
              );
              expect(result.smallestItemDimensionMm).toBe(minDim);

              // 3. Spójność flagi canPass z marżą
              expect(result.canPass).toBe(result.marginMm >= 0);
              expect(result.marginMm).toBe(result.netClearanceWithHandsMm - result.smallestItemDimensionMm);

              // 4. Ostrzeżenia i rekomendacje (gdy obecna jest klamka lub skrzydło < 180°)
              if (!baseSpecs.isHandleRemovable && baseSpecs.doorSwingAngleDeg <= 90) {
                expect(result.warnings.some((w) => w.includes('Klamka'))).toBe(true);
              }
              if (!baseSpecs.isDoorLeafRemovable && baseSpecs.doorSwingAngleDeg < 180) {
                expect(result.warnings.some((w) => w.includes('Skrzydło'))).toBe(true);
              }
            }
          );
        }
      );
    }
  );
});
