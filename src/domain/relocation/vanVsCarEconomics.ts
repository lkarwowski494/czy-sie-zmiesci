/**
 * Czy się zmieści? (FitCheck) — Moduł Ekonomiczny: Porównanie Kursów Osobówką vs Wynajem Busa
 * Zgodność z wymaganiem Z-164 i regułą RD-49.
 * Porównuje koszty paliwa, amortyzacji i czas dla N kursów autem osobowym (kombi) vs 1 kurs wynajętym vanem.
 */

export interface RelocationTripComparisonSpecs {
  readonly totalVolumeM3: number;              // Całkowita kubatura mienia do przewiezienia (np. 15 m3)
  readonly distanceOneWayKm: number;           // Odległość w jedną stronę między lokalami (km)
  readonly carTrunkVolumeM3?: number;          // Objętość użytkowa kombi ze złożonymi siedzeniami (domyślnie 1.2 m3)
  readonly vanCargoVolumeM3?: number;          // Objętość ładunkowa busa L2H2 (domyślnie 10.5 m3)
  readonly fuelPricePerLiterPln?: number;      // Cena paliwa za litr (domyślnie 6.50 zł)
  readonly carFuelConsumptionLPer100Km?: number; // Spalanie osobówki (domyślnie 7.5 L/100km)
  readonly vanFuelConsumptionLPer100Km?: number; // Spalanie vana (domyślnie 10.5 L/100km)
  readonly vanDailyRentalFeePln?: number;      // Koszt dobowego wynajmu busa (domyślnie 180 zł)
  readonly averageSpeedKmh?: number;           // Średnia prędkość miejska/podmiejska (domyślnie 40 km/h)
  readonly loadUnloadTimePerTripMinutes?: number; // Czas załadunku/rozładunku na kurs (domyślnie 40 min)
}

export interface RelocationTripComparisonResult {
  readonly carTripsCount: number;
  readonly vanTripsCount: number;
  readonly carTotalDistanceKm: number;
  readonly vanTotalDistanceKm: number;
  readonly carFuelCostPln: number;
  readonly vanFuelCostPln: number;
  readonly vanRentalCostPln: number;
  readonly carTotalCostPln: number;
  readonly vanTotalCostPln: number;
  readonly costDifferencePln: number; // Ujemna = osobówka tańsza, dodatnia = bus tańszy
  readonly carTotalTimeHours: number;
  readonly vanTotalTimeHours: number;
  readonly timeSavedHours: number;
  readonly isVanRecommended: boolean;
  readonly economicVerdict: string;
  readonly recommendation: string;
}

export const DEFAULT_CAR_TRUNK_M3 = 1.2;
export const DEFAULT_VAN_CARGO_M3 = 10.5;
export const DEFAULT_FUEL_PRICE_PLN = 6.5;
export const DEFAULT_CAR_CONSUMPTION = 7.5;
export const DEFAULT_VAN_CONSUMPTION = 10.5;
export const DEFAULT_VAN_RENTAL_PLN = 180;
export const DEFAULT_AVG_SPEED_KMH = 40;
export const DEFAULT_LOAD_TIME_MIN = 40;

/**
 * Oblicza i porównuje koszty oraz czas przeprowadzki autem osobowym vs wynajętym busem (Z-164).
 */
export function compareCarVsVanRelocation(
  specs: RelocationTripComparisonSpecs
): RelocationTripComparisonResult {
  if (specs.totalVolumeM3 <= 0 || specs.distanceOneWayKm <= 0) {
    throw new Error('Kubatura mienia i odległość muszą być dodatnie');
  }

  const carVol = specs.carTrunkVolumeM3 ?? DEFAULT_CAR_TRUNK_M3;
  const vanVol = specs.vanCargoVolumeM3 ?? DEFAULT_VAN_CARGO_M3;
  const fuelPrice = specs.fuelPricePerLiterPln ?? DEFAULT_FUEL_PRICE_PLN;
  const carConsumption = specs.carFuelConsumptionLPer100Km ?? DEFAULT_CAR_CONSUMPTION;
  const vanConsumption = specs.vanFuelConsumptionLPer100Km ?? DEFAULT_VAN_CONSUMPTION;
  const vanRental = specs.vanDailyRentalFeePln ?? DEFAULT_VAN_RENTAL_PLN;
  const avgSpeed = specs.averageSpeedKmh ?? DEFAULT_AVG_SPEED_KMH;
  const loadTimeMin = specs.loadUnloadTimePerTripMinutes ?? DEFAULT_LOAD_TIME_MIN;

  if (carVol <= 0 || vanVol <= 0 || fuelPrice <= 0 || carConsumption <= 0 || vanConsumption <= 0 || avgSpeed <= 0) {
    throw new Error('Wszystkie parametry kosztowe i eksploatacyjne muszą być dodatnie');
  }

  // Liczba kursów w obie strony
  const carTrips = Math.ceil(specs.totalVolumeM3 / carVol);
  const vanTrips = Math.ceil(specs.totalVolumeM3 / vanVol);

  const carTotalDistance = carTrips * 2 * specs.distanceOneWayKm;
  const vanTotalDistance = vanTrips * 2 * specs.distanceOneWayKm;

  // Koszty paliwa
  const carFuelCost = Math.round((carTotalDistance / 100) * carConsumption * fuelPrice);
  const vanFuelCost = Math.round((vanTotalDistance / 100) * vanConsumption * fuelPrice);

  const carTotalCost = carFuelCost;
  const vanTotalCost = vanFuelCost + vanRental;
  const costDiff = carTotalCost - vanTotalCost; // >0 oznacza, że van jest tańszy

  // Czas realizacji
  const driveTimePerTripHours = (2 * specs.distanceOneWayKm) / avgSpeed;
  const loadTimeHours = loadTimeMin / 60;

  const carTotalTime = Math.round((carTrips * (driveTimePerTripHours + loadTimeHours)) * 10) / 10;
  const vanTotalTime = Math.round((vanTrips * (driveTimePerTripHours + loadTimeHours * 1.5)) * 10) / 10;
  const timeSaved = Math.round(Math.max(0, carTotalTime - vanTotalTime) * 10) / 10;

  const isVanRec = carTrips >= 4 || timeSaved >= 3 || costDiff >= 0;

  let verdict = '';
  let recommendation = '';

  if (carTrips <= 2 && costDiff < 0) {
    verdict = `Osobówka tańsza o ${Math.abs(costDiff)} zł (tylko ${carTrips} kursy).`;
    recommendation = `Przy małym mieniu (${specs.totalVolumeM3} m³) wynajem vana jest nieopłacalny. 1-2 kursy kombi załatwią sprawę.`;
  } else if (costDiff >= 0) {
    verdict = `Wynajem vana jest TAŃSZY o ${costDiff} zł i szybszy o ${timeSaved} godz.!`;
    recommendation = `Zdecydowanie wynajmij vana: ${vanTrips} kurs zamiast ${carTrips} męczących kursów osobówką.`;
  } else {
    verdict = `Van droższy o ${Math.abs(costDiff)} zł, ale OSZCZĘDZA ${timeSaved} godz. i ${carTrips - vanTrips} kursów!`;
    recommendation = `Zalecany wynajem vana: za dopłatę ${Math.abs(costDiff)} zł oszczędzasz ${timeSaved}h pracy i zużycie własnego auta.`;
  }

  return {
    carTripsCount: carTrips,
    vanTripsCount: vanTrips,
    carTotalDistanceKm: carTotalDistance,
    vanTotalDistanceKm: vanTotalDistance,
    carFuelCostPln: carFuelCost,
    vanFuelCostPln: vanFuelCost,
    vanRentalCostPln: vanRental,
    carTotalCostPln: carTotalCost,
    vanTotalCostPln: vanTotalCost,
    costDifferencePln: costDiff,
    carTotalTimeHours: carTotalTime,
    vanTotalTimeHours: vanTotalTime,
    timeSavedHours: timeSaved,
    isVanRecommended: isVanRec,
    economicVerdict: verdict,
    recommendation,
  };
}
