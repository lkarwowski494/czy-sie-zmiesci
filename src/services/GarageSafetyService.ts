/**
 * Czy się zmieści? (FitCheck) — GarageSafetyService
 * Weryfikacja bezpieczeństwa garażu, wjazdu na parkingi podziemne i platform na hak (BRD B9, RD-41..44)
 */

import {
  evaluateGarageFit,
  evaluateRoofSetupHeight,
  GarageFitResult,
  GarageSpecs,
  RoofSetupSpecs,
  UndergroundParkingCheckResult,
  VehicleDimensions,
} from '../domain/garage/garageClearance';
import {
  Bicycle,
  evaluateTowbarLoad,
  TowbarPhysicsResult,
  TowbarRackSpecs,
} from '../domain/garage/towbarPhysics';

export interface ComprehensiveGarageSafetyReport {
  readonly garageFit: GarageFitResult;
  readonly roofFit?: UndergroundParkingCheckResult;
  readonly towbarFit?: TowbarPhysicsResult;
  readonly isSafeToEnter: boolean;
  readonly summaryVerdict: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export class GarageSafetyService {
  public checkGarageParking(
    vehicle: VehicleDimensions,
    garage: GarageSpecs,
    roofSetup?: RoofSetupSpecs,
    towbarSetup?: { bikes: readonly Bicycle[]; rackSpecs: TowbarRackSpecs }
  ): ComprehensiveGarageSafetyReport {
    const garageFit = evaluateGarageFit(vehicle, garage);

    let roofFit: UndergroundParkingCheckResult | undefined;
    if (roofSetup) {
      roofFit = evaluateRoofSetupHeight(roofSetup);
    }

    let towbarFit: TowbarPhysicsResult | undefined;
    if (towbarSetup) {
      towbarFit = evaluateTowbarLoad(towbarSetup.bikes, towbarSetup.rackSpecs);
    }

    const isRoofSafe = roofFit === undefined || roofFit.canEnterSign200m;
    const isTowbarSafe = towbarFit === undefined || !towbarFit.isOverloaded;

    const isSafeToEnter =
      (garageFit.canEnterWithOpenMirrors || garageFit.canEnterWithFoldedMirrors) &&
      !garageFit.willTailgateHitCeiling &&
      isRoofSafe &&
      isTowbarSafe;

    const warnings: string[] = [
      ...garageFit.warnings,
      ...(towbarFit?.warnings ?? []),
    ];

    if (roofFit && !roofFit.canEnterSign200m) {
      warnings.push(
        `Wysokość zestawu z boksem (${roofFit.totalHeightWithBounceMm} mm) przekracza standardowy znak B-16 2.0m na parkingu podziemnym`
      );
    }

    const recommendations: string[] = [
      ...garageFit.recommendations,
      ...(towbarFit?.recommendations ?? []),
    ];

    if (roofFit && !roofFit.canEnterSign200m) {
      recommendations.push(
        'Sprawdź znaki wysokościowe B-16 przed wjazdem do galerii lub na parking podziemny'
      );
    }

    let summaryVerdict = 'Wjazd do garażu jest w pełni bezpieczny.';
    if (!isSafeToEnter) {
      if (!garageFit.canEnterWithFoldedMirrors) {
        summaryVerdict = 'Kolizja bramy garażowej: pojazd jest za szeroki nawet po złożeniu lusterek!';
      } else if (garageFit.willTailgateHitCeiling) {
        summaryVerdict = 'Ryzyko uszkodzenia: otwarta klapa bagażnika uderzy w sufit lub prowadnice bramy!';
      } else if (roofFit && !roofFit.canEnterSign200m) {
        summaryVerdict = `Zestaw dachowy przekracza skrajnię wjazdu 2.0m (${roofFit.totalHeightWithBounceMm} mm > 2000 mm)!`;
      } else if (towbarFit && towbarFit.isOverloaded) {
        summaryVerdict = `Przekroczenie dopuszczalnego nacisku pionowego S na hak o ${towbarFit.overloadKg} kg!`;
      }
    }

    return {
      garageFit,
      roofFit,
      towbarFit,
      isSafeToEnter,
      summaryVerdict,
      warnings,
      recommendations,
    };
  }
}
