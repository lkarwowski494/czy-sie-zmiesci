/**
 * Czy się zmieści? (FitCheck) — Reguła RD-44: Bilans nacisku pionowego na kulę haka holowniczego (Parametr S)
 */

export interface Bicycle {
  readonly id: string;
  readonly name: string;
  readonly weightKg: number;
  readonly isElectric: boolean;
  readonly batteryWeightKg?: number; // Domyślnie 3.5 kg dla e-bike
}

export interface TowbarRackSpecs {
  readonly towbarSLimitKg: number; // np. 50, 75 lub 100 kg
  readonly rackWeightKg: number; // Masa własna platformy, np. 18 kg
  readonly maxBikesCapacity: number; // np. 2, 3 lub 4
}

export interface TowbarPhysicsResult {
  readonly totalVerticalLoadKg: number;
  readonly maxAllowedLoadKg: number;
  readonly isOverloaded: boolean;
  readonly overloadKg: number;
  readonly remainingCapacityKg: number;
  readonly eBikesCount: number;
  readonly batterySavingsPotentialKg: number;
  readonly loadWithBatteriesRemovedKg: number;
  readonly canBeResolvedByRemovingBatteries: boolean;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export const DEFAULT_EBIKE_BATTERY_WEIGHT_KG = 3.5;

export function evaluateTowbarLoad(
  bikes: readonly Bicycle[],
  rackSpecs: TowbarRackSpecs
): TowbarPhysicsResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (bikes.length > rackSpecs.maxBikesCapacity) {
    warnings.push(
      `Liczba rowerów (${bikes.length}) przekracza dopuszczalną pojemność platformy (${rackSpecs.maxBikesCapacity})`
    );
  }

  const bikesTotalWeight = bikes.reduce((sum, b) => sum + b.weightKg, 0);
  const totalVerticalLoad = rackSpecs.rackWeightKg + bikesTotalWeight;

  const isOverloaded = totalVerticalLoad > rackSpecs.towbarSLimitKg;
  const overloadKg = isOverloaded ? Math.round((totalVerticalLoad - rackSpecs.towbarSLimitKg) * 10) / 10 : 0;
  const remainingCapacityKg = !isOverloaded
    ? Math.round((rackSpecs.towbarSLimitKg - totalVerticalLoad) * 10) / 10
    : 0;

  let batterySavingsPotentialKg = 0;
  let eBikesCount = 0;

  for (const bike of bikes) {
    if (bike.isElectric) {
      eBikesCount++;
      batterySavingsPotentialKg += bike.batteryWeightKg ?? DEFAULT_EBIKE_BATTERY_WEIGHT_KG;
    }
  }

  const loadWithBatteriesRemoved = totalVerticalLoad - batterySavingsPotentialKg;
  const canBeResolvedByRemovingBatteries = isOverloaded && loadWithBatteriesRemoved <= rackSpecs.towbarSLimitKg;

  if (isOverloaded) {
    warnings.push(
      `Przeciążenie kuli haka o ${overloadKg} kg! Całkowity nacisk wynosi ${totalVerticalLoad} kg przy limicie S = ${rackSpecs.towbarSLimitKg} kg`
    );
    if (canBeResolvedByRemovingBatteries) {
      recommendations.push(
        `Zdemontuj akumulatory z rowerów elektrycznych na czas podróży (redukcja o ${batterySavingsPotentialKg} kg obniży nacisk do ${loadWithBatteriesRemoved} kg)`
      );
    } else {
      recommendations.push(
        'Zdejmij jeden z rowerów i przewieź go wewnątrz bagażnika lub na dachu pojazdu'
      );
    }
  }

  return {
    totalVerticalLoadKg: Math.round(totalVerticalLoad * 10) / 10,
    maxAllowedLoadKg: rackSpecs.towbarSLimitKg,
    isOverloaded,
    overloadKg,
    remainingCapacityKg,
    eBikesCount,
    batterySavingsPotentialKg,
    loadWithBatteriesRemovedKg: Math.round(loadWithBatteriesRemoved * 10) / 10,
    canBeResolvedByRemovingBatteries,
    warnings,
    recommendations,
  };
}
