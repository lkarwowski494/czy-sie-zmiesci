/**
 * Czy się zmieści? (FitCheck) — Reguły RD-17 i RD-18: Kontrola masy ładunku i DMC
 */

export interface VehicleMassSpecs {
  readonly curbWeightKg: number; // Pozycja G w dowodzie rejestracyjnym (z kierowcą 75 kg i 90% paliwa)
  readonly grossVehicleWeightKg: number; // Pozycja F.2 (DMC)
  readonly maxRoofLoadKg: number; // Nośność dachu z homologacji
}

export type PayloadStatus = 'SAFE' | 'WARNING_NEAR_LIMIT' | 'CRITICAL_OVERLOAD';

export interface PayloadCalculationResult {
  readonly factoryPayloadKg: number;
  readonly passengerDeductionKg: number;
  readonly netAvailableCargoPayloadKg: number;
  readonly currentCargoWeightKg: number;
  readonly remainingPayloadKg: number;
  readonly status: PayloadStatus;
  readonly overloadKg: number;
  readonly payloadUtilizationPct: number;
  readonly warnings: readonly string[];
  readonly legalReferences: readonly string[];
}

export const AVERAGE_PASSENGER_WEIGHT_KG = 75; // Norma unijna (kierowca jest już w masie G)
export const NEAR_LIMIT_THRESHOLD_PCT = 90; // Ostrzeżenie bursztynowe powyżej 90%

export function calculatePayloadDMC(
  vehicle: VehicleMassSpecs,
  additionalPassengersCount: number, // Pasażerowie poza kierowcą (0 do 4 w aucie 5-os.)
  cargoItemsWeightKg: number
): PayloadCalculationResult {
  const warnings: string[] = [];
  const legalReferences: string[] = [];

  const factoryPayload = vehicle.grossVehicleWeightKg - vehicle.curbWeightKg;
  const passengerDeduction = Math.max(0, additionalPassengersCount) * AVERAGE_PASSENGER_WEIGHT_KG;
  const netAvailableCargo = Math.max(0, factoryPayload - passengerDeduction);

  const remainingPayloadKg = netAvailableCargo - cargoItemsWeightKg;
  const utilizationPct = netAvailableCargo > 0
    ? Math.round((cargoItemsWeightKg / netAvailableCargo) * 100)
    : (cargoItemsWeightKg > 0 ? 999 : 0);

  let status: PayloadStatus = 'SAFE';
  let overloadKg = 0;

  if (remainingPayloadKg < 0) {
    status = 'CRITICAL_OVERLOAD';
    overloadKg = Math.abs(remainingPayloadKg);
    warnings.push(
      `PRZEKROCZENIE ŁADOWNOŚCI o ${overloadKg} kg! Całkowita masa pojazdu przekracza DMC (${vehicle.grossVehicleWeightKg} kg)`
    );
    legalReferences.push('Art. 61 ust. 1 i 2 ustawy Prawo o Ruchu Drogowym — zakaz przekraczania DMC pojazdu pod rygorem mandatu i zatrzymania dowodu rejestracyjnego');
  } else if (utilizationPct >= NEAR_LIMIT_THRESHOLD_PCT) {
    status = 'WARNING_NEAR_LIMIT';
    warnings.push(
      `Zbliżasz się do limitu ładowności (${utilizationPct}% wykorzystania, pozostało zaledwie ${remainingPayloadKg} kg)`
    );
  }

  return {
    factoryPayloadKg: factoryPayload,
    passengerDeductionKg: passengerDeduction,
    netAvailableCargoPayloadKg: netAvailableCargo,
    currentCargoWeightKg: cargoItemsWeightKg,
    remainingPayloadKg,
    status,
    overloadKg,
    payloadUtilizationPct: utilizationPct,
    warnings,
    legalReferences,
  };
}
