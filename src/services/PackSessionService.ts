/**
 * Czy się zmieści? (FitCheck) — PackSessionService
 * Orkiestracja sesji załadunku: 3D bin packing, kontrola DMC i rozkład masy (BRD Rozdz. 11)
 */

import { DatabaseService } from '../data/db/database';
import { packItemsInTrunk } from '../domain/geometry/extremePoints';
import { calculatePayloadDMC, PayloadCalculationResult } from '../domain/physics/payloadDMC';
import { calculateCenterOfGravity, CenterOfGravityResult } from '../domain/physics/centerOfGravity';
import { CargoItem, PackingResult, TrunkGeometry } from '../domain/geometry/types';

export interface FullPackReport {
  readonly sessionId: string;
  readonly sessionName: string;
  readonly vehicleName: string;
  readonly isFullyPacked: boolean;
  readonly packingResult: PackingResult;
  readonly payloadResult: PayloadCalculationResult;
  readonly cogResult: CenterOfGravityResult;
  readonly combinedWarnings: readonly string[];
  readonly combinedRecommendations: readonly string[];
}

export class PackSessionService {
  constructor(private readonly db: DatabaseService) {}

  public createSession(params: {
    id: string;
    name: string;
    targetSpaceId: string;
    passengersCount: number;
  }): void {
    this.db.createPackSession({
      id: params.id,
      name: params.name,
      target_space_id: params.targetSpaceId,
      passengers_count: params.passengersCount,
    });
  }

  public runPacking(sessionId: string, itemIds: readonly string[]): FullPackReport {
    const session = this.db.getPackSession(sessionId);
    if (!session) {
      throw new Error(`Sesja pakowania o ID ${sessionId} nie istnieje`);
    }

    const spaceId = String(session['target_space_id']);
    const space = this.db.getSpace(spaceId);
    if (!space) {
      throw new Error(`Przestrzeń pojazdu o ID ${spaceId} nie istnieje`);
    }

    const vehicleId = String(space['vehicle_id']);
    const vehicle = this.db.getVehicle(vehicleId);
    if (!vehicle) {
      throw new Error(`Pojazd o ID ${vehicleId} nie istnieje`);
    }

    // Konwersja geometrii bagażnika z cm na mm
    const trunkGeometry: TrunkGeometry = {
      lengthFloorMm: Number(space['length_floor_cm']) * 10,
      lengthRoofMm: Number(space['length_floor_cm']) * 10 * 0.75, // Estymacja skosu szyby
      widthMinMm: Number(space['width_min_cm']) * 10,
      widthMaxMm: Number(space['width_max_cm']) * 10,
      heightRoofMm: Number(space['height_roof_cm']) * 10,
      heightShelfMm: Number(space['height_shelf_cm']) * 10,
      apertureWidthMm: Number(space['aperture_width_cm']) * 10,
      apertureHeightMm: Number(space['aperture_height_cm']) * 10,
      thresholdHeightMm: Number(space['threshold_height_cm']) * 10,
    };

    // Ładowanie i konwersja przedmiotów ładunku
    const allCargoRecords = this.db.getCargoItems();
    const cargoItems: CargoItem[] = [];
    const itemWeights: Record<string, number> = {};

    for (const id of itemIds) {
      const rec = allCargoRecords.find(c => c['id'] === id);
      if (rec) {
        const item: CargoItem = {
          id: String(rec['id']),
          name: String(rec['name']),
          dimensionsMm: {
            lengthMm: Number(rec['length_cm']) * 10,
            widthMm: Number(rec['width_cm']) * 10,
            heightMm: Number(rec['height_cm']) * 10,
          },
          weightKg: Number(rec['weight_kg']),
          rotationConstraint: Number(rec['allow_rotation_xyz']) === 1 ? 'XYZ' : Number(rec['allow_rotation_z_only']) === 1 ? 'Z_ONLY' : 'NONE',
          isFragile: Number(rec['is_fragile']) === 1,
          isSoft: Number(rec['is_soft']) === 1,
          allowStacking: Number(rec['is_fragile']) !== 1,
        };
        cargoItems.push(item);
        itemWeights[item.id] = item.weightKg;
      }
    }

    // 1. Solver Extreme Points 3D
    const packingResult = packItemsInTrunk(cargoItems, trunkGeometry);

    // 2. Walidacja masy DMC
    const vehicleMassSpecs = {
      curbWeightKg: Number(vehicle['curb_weight_kg']),
      grossVehicleWeightKg: Number(vehicle['gvw_kg']),
      maxRoofLoadKg: Number(vehicle['roof_load_limit_kg']),
    };
    const passengersCount = Number(session['passengers_count'] ?? 1);
    const payloadResult = calculatePayloadDMC(
      vehicleMassSpecs,
      passengersCount,
      packingResult.totalWeightKg
    );

    // 3. Rozkład masy i środek ciężkości
    const cogResult = calculateCenterOfGravity(
      packingResult.placements,
      itemWeights,
      trunkGeometry
    );

    // 4. Zapis wyników do bazy SQLite
    this.db.clearSessionItems(sessionId);
    for (const p of packingResult.placements) {
      this.db.insertSessionItem({
        id: `psi_${sessionId}_${p.itemId}`,
        session_id: sessionId,
        cargo_item_id: p.itemId,
        pos_x_cm: p.positionMm.xMm / 10,
        pos_y_cm: p.positionMm.yMm / 10,
        pos_z_cm: p.positionMm.zMm / 10,
        dim_x_cm: p.orientedDimensionsMm.lengthMm / 10,
        dim_y_cm: p.orientedDimensionsMm.widthMm / 10,
        dim_z_cm: p.orientedDimensionsMm.heightMm / 10,
        sequence_order: p.sequenceOrder,
        is_packed: false,
      });
    }

    const isValid = packingResult.isFullyPacked && payloadResult.status !== 'CRITICAL_OVERLOAD';
    this.db.updateSessionStatus(
      sessionId,
      packingResult.totalWeightKg,
      packingResult.packingEfficiencyPct,
      isValid
    );

    // Sklejanie ostrzeżeń i rekomendacji
    const combinedWarnings = [
      ...payloadResult.warnings,
      ...cogResult.warnings,
    ];
    if (!packingResult.isFullyPacked) {
      combinedWarnings.push(
        `Nie zmieszczono ${packingResult.unplacedItems.length} z ${cargoItems.length} przedmiotów z powodu ograniczeń kubatury lub skosu szyby`
      );
    }

    const combinedRecommendations = [
      ...payloadResult.legalReferences,
    ];
    if (!cogResult.isLateralSymmetric) {
      combinedRecommendations.push(
        'Przełóż najcięższe walizki w stronę przeciwnej burty bagażnika, aby wyrównać rozkład masy'
      );
    }
    if (cogResult.isAxleLoadDangerous) {
      combinedRecommendations.push(
        'Przesuń najcięższy ładunek bezpośrednio za oparcie tylnej kanapy, odciążając zwis tylny'
      );
    }

    return {
      sessionId,
      sessionName: String(session['name']),
      vehicleName: `${vehicle['make']} ${vehicle['model']}`,
      isFullyPacked: packingResult.isFullyPacked,
      packingResult,
      payloadResult,
      cogResult,
      combinedWarnings,
      combinedRecommendations,
    };
  }
}
