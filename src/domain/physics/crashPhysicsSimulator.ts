/**
 * Czy się zmieści? (FitCheck) — Moduł Fizyki Zderzeń i Mocowania Ładunku (BR-EDU-001…BR-EDU-003, RD-17)
 * Wylicza energię kinetyczną, siłę uderzenia przy przeciążeniu 25g oraz wymogi pasów mocujących (PN-EN 12195-1).
 */

export interface CrashSimulationResult {
  readonly cargoMassKg: number;
  readonly speedKmh: number;
  readonly speedMs: number;
  readonly kineticEnergyJoules: number;
  readonly decelerationG: number;
  readonly impactForceNewtons: number;
  readonly equivalentImpactMassKg: number;
  readonly dangerSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'LETHAL';
  readonly safetyAdvisory: string;
}

export type TrunkFrictionSurface =
  | 'RUBBER_MAT'   // Mata gumowa antypoślizgowa: współczynnik twardy mu = 0.6
  | 'CARPET_VELOUR' // Fabryczny welur/dywanik bagażnika: mu = 0.3
  | 'PLASTIC_SLICK'; // Gładkie tworzywo/blacha: mu = 0.2

export interface LashingRequirementResult {
  readonly cargoMassKg: number;
  readonly surfaceFrictionMu: number;
  readonly requiredRestrainingForceNewtons: number;
  readonly minimumLashingCapacityDaN: number; // w daN (1 daN = 10 N ~ 1 kg)
  readonly recommendedStrapsCount: number;
  readonly complianceStandard: string;
}

export type ApplianceTransportOrientation = 'UPRIGHT' | 'TILTED_45_DEG' | 'HORIZONTAL_FLAT';

export interface ApplianceTransportProtocol {
  readonly applianceType: 'REFRIGERATOR' | 'WASHING_MACHINE' | 'DISHWASHER' | 'TV_OLED';
  readonly orientation: ApplianceTransportOrientation;
  readonly minimumSettlingHours: number;
  readonly requiresTransitBolts: boolean;
  readonly criticalWarnings: readonly string[];
}

export const G_ACCELERATION = 9.80665;
export const CRASH_DECELERATION_G = 25.0; // Standard testów zderzeniowych Euro NCAP

export const FRICTION_COEFFICIENTS: Record<TrunkFrictionSurface, number> = {
  RUBBER_MAT: 0.6,
  CARPET_VELOUR: 0.3,
  PLASTIC_SLICK: 0.2,
};

/**
 * Wylicza parametry fizyczne zderzenia wg BR-EDU-002.
 */
export function calculateCrashPhysics(
  massKg: number,
  speedKmh: number,
  decelerationG: number = CRASH_DECELERATION_G
): CrashSimulationResult {
  if (massKg <= 0 || speedKmh < 0 || decelerationG <= 0) {
    throw new Error('Masa i przeciążenie muszą być dodatnie, a prędkość nieujemna');
  }

  const speedMs = speedKmh / 3.6;
  const kineticEnergy = 0.5 * massKg * Math.pow(speedMs, 2);
  const impactForce = massKg * decelerationG * G_ACCELERATION;
  const equivalentMass = massKg * decelerationG;

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'LETHAL' = 'LOW';
  let advisory = '';

  if (equivalentMass < 50) {
    severity = 'LOW';
    advisory = 'Niewielka siła uderzenia, jednak niezamocowany przedmiot może rozproszyć uwagę kierowcy.';
  } else if (equivalentMass < 200) {
    severity = 'MEDIUM';
    advisory = 'Średnia siła uderzenia. Przedmiot może spowodować poważne obrażenia pasażerów tylnej kanapy.';
  } else if (equivalentMass < 500) {
    severity = 'HIGH';
    advisory = 'Wysokie zagrożenie! Niezabezpieczony ładunek przebija oparcie kanapy i stwarza śmiertelne ryzyko.';
  } else {
    severity = 'LETHAL';
    advisory = 'Śmiertelne niebezpieczeństwo! Ładunek działa jak taran z siłą ponad pół tony. Bezwzględny nakaz kotwiczenia pasami!';
  }

  return {
    cargoMassKg: Math.round(massKg * 10) / 10,
    speedKmh: Math.round(speedKmh * 10) / 10,
    speedMs: Math.round(speedMs * 100) / 100,
    kineticEnergyJoules: Math.round(kineticEnergy),
    decelerationG,
    impactForceNewtons: Math.round(impactForce),
    equivalentImpactMassKg: Math.round(equivalentMass),
    dangerSeverity: severity,
    safetyAdvisory: advisory,
  };
}

/**
 * Wylicza siłę mocowania pasami ściągającymi wg normy PN-EN 12195-1 (BR-EDU-001).
 * Współczynnik przyspieszenia wzdłużnego dla hamowania awaryjnego c_x = 0.8.
 */
export function calculateLashingRequirements(
  cargoMassKg: number,
  surface: TrunkFrictionSurface
): LashingRequirementResult {
  if (cargoMassKg <= 0) {
    throw new Error('Masa ładunku musi być dodatnia');
  }

  const mu = FRICTION_COEFFICIENTS[surface];
  const cx = 0.8; // Przyspieszenie wzdłużne w kierunku jazdy (80% masy)

  const gravityForce = cargoMassKg * G_ACCELERATION;
  const inertialForce = gravityForce * cx;
  const frictionForce = gravityForce * mu;

  const netRestrainingForce = Math.max(0, inertialForce - frictionForce);
  // 1 daN = 10 N
  const lashingCapacityDaN = Math.ceil(netRestrainingForce / 10);

  // Założenie: standardowy pas ściągający bagażnika ma LC = 250 daN
  const recommendedStraps = Math.max(1, Math.ceil(lashingCapacityDaN / 250));

  return {
    cargoMassKg,
    surfaceFrictionMu: mu,
    requiredRestrainingForceNewtons: Math.round(netRestrainingForce),
    minimumLashingCapacityDaN: lashingCapacityDaN,
    recommendedStrapsCount: recommendedStraps,
    complianceStandard: 'PN-EN 12195-1 (Europejska norma zabezpieczania ładunków)',
  };
}

/**
 * Weryfikuje protokół transportu urządzeń AGD/RTV i czas aklimatyzacji/odstania płynów chłodniczych.
 */
export function evaluateApplianceTransportProtocol(
  applianceType: 'REFRIGERATOR' | 'WASHING_MACHINE' | 'DISHWASHER' | 'TV_OLED',
  orientation: ApplianceTransportOrientation
): ApplianceTransportProtocol {
  const warnings: string[] = [];
  let settlingHours = 0;
  let requiresTransitBolts = false;

  switch (applianceType) {
    case 'REFRIGERATOR':
      if (orientation === 'HORIZONTAL_FLAT') {
        settlingHours = 24;
        warnings.push('Olej z kompresora wpłynął do parownika. Bezwzględny wymóg odstania 24h w pionie przed włączeniem!');
        warnings.push('Ryzyko pęknięcia rurek skraplacza pod własnym ciężarem agregatu.');
      } else if (orientation === 'TILTED_45_DEG') {
        settlingHours = 6;
        warnings.push('Transport w pochyleniu: zalecane minimum 6 godzin odstania w pionie przed podłączeniem do sieci.');
      } else {
        settlingHours = 2;
        warnings.push('Transport pionowy bezpieczny: wystarczą 2 godziny na stabilizację oleju chłodniczego.');
      }
      break;

    case 'WASHING_MACHINE':
      requiresTransitBolts = true;
      settlingHours = 0;
      warnings.push('OBOWIĄZKOWE BLOKADY TRANSPORTOWE: Bęben musi być zablokowany śrubami fabrycznymi!');
      if (orientation !== 'UPRIGHT') {
        warnings.push('Z pralki może wyciec woda resztkowa z pompy spustowej i uszkodzić elektronikę.');
      }
      break;

    case 'DISHWASHER':
      settlingHours = 0;
      if (orientation !== 'UPRIGHT') {
        warnings.push('Woda z płaszcza wodnego lub soli regeneracyjnej może zalać moduł sterujący.');
      }
      break;

    case 'TV_OLED':
      settlingHours = 1;
      if (orientation === 'HORIZONTAL_FLAT') {
        warnings.push('KRYTYCZNE: Matryca OLED/LCD nie jest odporna na drgania w poziomie! Ryzyko pęknięcia szkła na wybojach.');
      }
      warnings.push('W chłodne dni odczekaj 1h na wyrównanie temperatury matrycy, aby uniknąć kondensacji pary.');
      break;
  }

  return {
    applianceType,
    orientation,
    minimumSettlingHours: settlingHours,
    requiresTransitBolts,
    criticalWarnings: warnings,
  };
}
