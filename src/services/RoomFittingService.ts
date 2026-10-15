/**
 * Czy się zmieści? (FitCheck) — RoomFittingService
 * Kompleksowa ocena pasowania mebli i AGD w pomieszczeniu oraz przejścia przez ciągi komunikacyjne (BRD B8)
 */

import { evaluateNicheFit, WallNicheSpecs, NicheFitResult } from '../domain/room-fitting/nicheCalculator';
import {
  evaluateRefrigeratorFit,
  evaluateWashingMachineInstallation,
  RefrigeratorSpecs,
  WashingMachineSpecs,
  RefrigeratorClearanceResult,
  WashingMachineInstallationResult,
} from '../domain/room-fitting/applianceClearance';
import {
  calculateDoorwayClearance,
  DoorwaySpecs,
  DoorwayClearanceResult,
} from '../domain/doors-stairs/doorwayClearance';
import {
  evaluateStaircaseLandingTurn,
  StaircaseLandingSpecs,
  StaircaseRotationResult,
} from '../domain/doors-stairs/staircaseRotation';
import {
  calculateElevatorFit,
  ElevatorCabinSpecs,
  ElevatorFitResult,
} from '../domain/doors-stairs/elevatorDiagonal';

export interface CompleteFurnitureFitAssessment {
  readonly itemName: string;
  readonly nicheFit: NicheFitResult;
  readonly doorwayClearance: DoorwayClearanceResult;
  readonly staircaseTurn?: StaircaseRotationResult;
  readonly elevatorFit?: ElevatorFitResult;
  readonly isFullyFeasible: boolean;
  readonly summaryVerdict: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export class RoomFittingService {
  public assessFurnitureInstallation(params: {
    itemName: string;
    itemDimensionsMm: { lengthMm: number; widthMm: number; heightMm: number };
    niche: WallNicheSpecs;
    doorway: DoorwaySpecs;
    staircase?: StaircaseLandingSpecs;
    elevator?: ElevatorCabinSpecs;
  }): CompleteFurnitureFitAssessment {
    const nicheFit = evaluateNicheFit(
      {
        widthMm: params.itemDimensionsMm.widthMm,
        depthMm: params.itemDimensionsMm.lengthMm,
        heightMm: params.itemDimensionsMm.heightMm,
      },
      params.niche
    );

    const doorwayClearance = calculateDoorwayClearance(
      params.itemDimensionsMm,
      params.doorway,
      true
    );

    let staircaseTurn: StaircaseRotationResult | undefined;
    if (params.staircase) {
      staircaseTurn = evaluateStaircaseLandingTurn(
        params.itemDimensionsMm,
        params.staircase
      );
    }

    let elevatorFit: ElevatorFitResult | undefined;
    if (params.elevator) {
      elevatorFit = calculateElevatorFit(
        params.itemDimensionsMm,
        params.elevator
      );
    }

    const isFullyFeasible =
      nicheFit.fitsOverall &&
      doorwayClearance.canPass &&
      (staircaseTurn === undefined || staircaseTurn.canPass) &&
      (elevatorFit === undefined || elevatorFit.fitsInsideCabin);

    const warnings: string[] = [
      ...nicheFit.warnings,
      ...doorwayClearance.warnings,
      ...(staircaseTurn?.warnings ?? []),
      ...(elevatorFit?.warnings ?? []),
    ];

    const recommendations: string[] = [
      ...nicheFit.recommendations,
      ...doorwayClearance.recommendations,
      ...(staircaseTurn?.recommendations ?? []),
    ];

    let summaryVerdict = 'Mebel zmieści się we wnęce i bez problemu przejdzie przez wszystkie ciągi komunikacyjne.';
    if (!isFullyFeasible) {
      if (!nicheFit.fitsOverall) {
        summaryVerdict = 'Kolizja we wnęce docelowej: mebel nie zmieści się na szerokość, głębokość lub wysokość.';
      } else if (!doorwayClearance.canPass) {
        summaryVerdict = 'Zablokowanie w otworze drzwiowym: brak wymaganego prześwitu na ościeżnicy lub klamce.';
      } else if (staircaseTurn && !staircaseTurn.canPass) {
        summaryVerdict = 'Zablokowanie na klatce schodowej: mebel zbyt długi na obrót na spoczniku.';
      } else if (elevatorFit && !elevatorFit.fitsInsideCabin) {
        summaryVerdict = 'Mebel przekracza przestrzenną przekątną 3D kabiny windy — wymagane wnoszenie schodami.';
      }
    }

    return {
      itemName: params.itemName,
      nicheFit,
      doorwayClearance,
      staircaseTurn,
      elevatorFit,
      isFullyFeasible,
      summaryVerdict,
      warnings,
      recommendations,
    };
  }

  public assessRefrigerator(fridge: RefrigeratorSpecs, niche: { widthMm: number; depthMm: number; heightMm: number }): RefrigeratorClearanceResult {
    return evaluateRefrigeratorFit(fridge, niche);
  }

  public assessWashingMachine(machine: WashingMachineSpecs, enclosureDepthMm: number): WashingMachineInstallationResult {
    return evaluateWashingMachineInstallation(machine, enclosureDepthMm);
  }
}
