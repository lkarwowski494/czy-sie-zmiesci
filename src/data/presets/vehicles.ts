/**
 * Czy się zmieści? (FitCheck) — Baza Pojazdów Referencyjnych (RD-03, RD-04, B2)
 * Precyzyjna geometria przestrzeni ładunkowych dla popularnych aut na rynku europejskim.
 */

import { TrunkGeometry } from '../../domain/geometry/types';

export interface VehiclePreset {
  readonly id: string;
  readonly make: string;
  readonly model: string;
  readonly generation: string;
  readonly productionYears: string;
  readonly bodyType: 'kombi' | 'suv' | 'hatchback' | 'sedan' | 'liftback' | 'van';
  readonly vdaVolumeLiters: number;
  readonly trunk: TrunkGeometry;
  readonly specs: {
    readonly curbWeightKg: number;
    readonly grossVehicleWeightKg: number;
    readonly maxRoofLoadKg: number;
    readonly maxTowbarLoadKg: number;
  };
}

export const POPULAR_VEHICLES_PRESETS: readonly VehiclePreset[] = [
  {
    id: 'skoda-octavia-iv-combi',
    make: 'Škoda',
    model: 'Octavia IV Combi',
    generation: 'IV (NX)',
    productionYears: '2020-2026',
    bodyType: 'kombi',
    vdaVolumeLiters: 640,
    trunk: {
      lengthFloorMm: 1050,
      lengthRoofMm: 750,
      widthMinMm: 1010,
      widthMaxMm: 1150,
      heightRoofMm: 820,
      heightShelfMm: 500,
      apertureWidthMm: 1020,
      apertureHeightMm: 780,
      thresholdHeightMm: 60,
    },
    specs: {
      curbWeightKg: 1395,
      grossVehicleWeightKg: 1955,
      maxRoofLoadKg: 75,
      maxTowbarLoadKg: 75,
    },
  },
  {
    id: 'vw-passat-b8-variant',
    make: 'Volkswagen',
    model: 'Passat Variant B8',
    generation: 'B8 (3G)',
    productionYears: '2014-2023',
    bodyType: 'kombi',
    vdaVolumeLiters: 650,
    trunk: {
      lengthFloorMm: 1150,
      lengthRoofMm: 850,
      widthMinMm: 1005,
      widthMaxMm: 1180,
      heightRoofMm: 800,
      heightShelfMm: 480,
      apertureWidthMm: 1050,
      apertureHeightMm: 760,
      thresholdHeightMm: 40,
    },
    specs: {
      curbWeightKg: 1470,
      grossVehicleWeightKg: 2080,
      maxRoofLoadKg: 100,
      maxTowbarLoadKg: 90,
    },
  },
  {
    id: 'toyota-rav4-v',
    make: 'Toyota',
    model: 'RAV4 V Hybrid',
    generation: 'V (XA50)',
    productionYears: '2018-2026',
    bodyType: 'suv',
    vdaVolumeLiters: 580,
    trunk: {
      lengthFloorMm: 1000,
      lengthRoofMm: 720,
      widthMinMm: 1000,
      widthMaxMm: 1350,
      heightRoofMm: 850,
      heightShelfMm: 510,
      apertureWidthMm: 1040,
      apertureHeightMm: 810,
      thresholdHeightMm: 0,
    },
    specs: {
      curbWeightKg: 1675,
      grossVehicleWeightKg: 2225,
      maxRoofLoadKg: 80,
      maxTowbarLoadKg: 75,
    },
  },
  {
    id: 'dacia-duster-iii',
    make: 'Dacia',
    model: 'Duster III',
    generation: 'III',
    productionYears: '2024-2026',
    bodyType: 'suv',
    vdaVolumeLiters: 472,
    trunk: {
      lengthFloorMm: 900,
      lengthRoofMm: 680,
      widthMinMm: 980,
      widthMaxMm: 1200,
      heightRoofMm: 830,
      heightShelfMm: 490,
      apertureWidthMm: 990,
      apertureHeightMm: 790,
      thresholdHeightMm: 120,
    },
    specs: {
      curbWeightKg: 1300,
      grossVehicleWeightKg: 1780,
      maxRoofLoadKg: 80,
      maxTowbarLoadKg: 75,
    },
  },
  {
    id: 'vw-golf-viii-variant',
    make: 'Volkswagen',
    model: 'Golf VIII Variant',
    generation: 'VIII (CD)',
    productionYears: '2020-2026',
    bodyType: 'kombi',
    vdaVolumeLiters: 611,
    trunk: {
      lengthFloorMm: 1040,
      lengthRoofMm: 740,
      widthMinMm: 1000,
      widthMaxMm: 1140,
      heightRoofMm: 790,
      heightShelfMm: 490,
      apertureWidthMm: 1010,
      apertureHeightMm: 750,
      thresholdHeightMm: 50,
    },
    specs: {
      curbWeightKg: 1370,
      grossVehicleWeightKg: 1930,
      maxRoofLoadKg: 75,
      maxTowbarLoadKg: 80,
    },
  },
  {
    id: 'tesla-model-y',
    make: 'Tesla',
    model: 'Model Y',
    generation: 'I',
    productionYears: '2021-2026',
    bodyType: 'suv',
    vdaVolumeLiters: 854,
    trunk: {
      lengthFloorMm: 1080,
      lengthRoofMm: 700,
      widthMinMm: 940,
      widthMaxMm: 1180,
      heightRoofMm: 740,
      heightShelfMm: 460,
      apertureWidthMm: 960,
      apertureHeightMm: 730,
      thresholdHeightMm: 0,
    },
    specs: {
      curbWeightKg: 1980,
      grossVehicleWeightKg: 2448,
      maxRoofLoadKg: 75,
      maxTowbarLoadKg: 72,
    },
  },
  {
    id: 'ford-focus-iv-kombi',
    make: 'Ford',
    model: 'Focus IV Kombi',
    generation: 'IV (C519)',
    productionYears: '2018-2025',
    bodyType: 'kombi',
    vdaVolumeLiters: 608,
    trunk: {
      lengthFloorMm: 1040,
      lengthRoofMm: 730,
      widthMinMm: 1020,
      widthMaxMm: 1160,
      heightRoofMm: 800,
      heightShelfMm: 500,
      apertureWidthMm: 1030,
      apertureHeightMm: 770,
      thresholdHeightMm: 45,
    },
    specs: {
      curbWeightKg: 1380,
      grossVehicleWeightKg: 1940,
      maxRoofLoadKg: 75,
      maxTowbarLoadKg: 75,
    },
  },
  {
    id: 'bmw-3-touring-g21',
    make: 'BMW',
    model: 'Seria 3 Touring (G21)',
    generation: 'G21',
    productionYears: '2019-2026',
    bodyType: 'kombi',
    vdaVolumeLiters: 500,
    trunk: {
      lengthFloorMm: 1020,
      lengthRoofMm: 720,
      widthMinMm: 980,
      widthMaxMm: 1100,
      heightRoofMm: 760,
      heightShelfMm: 470,
      apertureWidthMm: 990,
      apertureHeightMm: 720,
      thresholdHeightMm: 30,
    },
    specs: {
      curbWeightKg: 1640,
      grossVehicleWeightKg: 2185,
      maxRoofLoadKg: 75,
      maxTowbarLoadKg: 75,
    },
  },
];
