/**
 * Czy się zmieści? (FitCheck) — Serwis Bazy Danych SQLite (DatabaseService)
 * Implementuje 13 tabel, transakcje atomowe i eksport/import JSON (BRD Rozdział 12)
 */

import { ISQLiteDriver } from './driver';
import {
  CREATE_TABLES_SQL,
  PRESET_CARGO_ITEMS,
  PRESET_VEHICLES,
  SCHEMA_VERSION,
} from './schema';

export interface BackupExportPayload {
  readonly schema_version: number;
  readonly bundle_id: string;
  readonly exported_at: string;
  readonly device_model: string;
  readonly app_version: string;
  readonly data: {
    readonly custom_spaces: readonly Record<string, unknown>[];
    readonly user_cargo_items: readonly Record<string, unknown>[];
    readonly pack_sessions: readonly Record<string, unknown>[];
    readonly pack_session_items: readonly Record<string, unknown>[];
    readonly relocation_projects: readonly Record<string, unknown>[];
    readonly rooms: readonly Record<string, unknown>[];
    readonly room_fixtures: readonly Record<string, unknown>[];
    readonly access_pathways: readonly Record<string, unknown>[];
    readonly relocation_items: readonly Record<string, unknown>[];
    readonly garage_profiles: readonly Record<string, unknown>[];
    readonly towbar_roof_configs: readonly Record<string, unknown>[];
  };
}

export interface BackupImportResult {
  readonly success: boolean;
  readonly restoredRecordsCount: number;
  readonly error?: string;
}

export class DatabaseService {
  constructor(private readonly driver: ISQLiteDriver) {}

  public initialize(): void {
    this.driver.execSync(CREATE_TABLES_SQL);
    this.seedPresetsIfEmpty();
  }

  private seedPresetsIfEmpty(): void {
    const existingVehicles = this.driver.getAllSync('SELECT * FROM vehicles');
    if (existingVehicles.length === 0) {
      const now = Date.now();
      for (const entry of PRESET_VEHICLES) {
        const v = entry.vehicle;
        this.driver.runSync(
          `INSERT INTO vehicles (id, make, model, generation, body_type, year_from, year_to, curb_weight_kg, max_payload_kg, gvw_kg, width_with_mirrors_cm, width_folded_mirrors_cm, roof_load_limit_kg, towbar_s_limit_kg, tailgate_max_height_cm, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            v.id,
            v.make,
            v.model,
            v.generation,
            v.body_type,
            v.year_from,
            v.year_to,
            v.curb_weight_kg,
            v.max_payload_kg,
            v.gvw_kg,
            v.width_with_mirrors_cm,
            v.width_folded_mirrors_cm,
            v.roof_load_limit_kg,
            v.towbar_s_limit_kg,
            v.tailgate_max_height_cm,
            now,
          ]
        );

        for (const s of entry.spaces) {
          this.driver.runSync(
            `INSERT INTO vehicle_spaces (id, vehicle_id, space_name, length_floor_cm, length_folded_cm, width_min_cm, width_max_cm, height_roof_cm, height_shelf_cm, tailgate_angle_deg, aperture_width_cm, aperture_height_cm, threshold_height_cm, vda_liters) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.id,
              v.id,
              s.space_name,
              s.length_floor_cm,
              s.length_folded_cm,
              s.width_min_cm,
              s.width_max_cm,
              s.height_roof_cm,
              s.height_shelf_cm,
              s.tailgate_angle_deg,
              s.aperture_width_cm,
              s.aperture_height_cm,
              s.threshold_height_cm,
              s.vda_liters,
            ]
          );
        }
      }
    }

    const existingCargo = this.driver.getAllSync('SELECT * FROM cargo_items WHERE is_preset = 1');
    if (existingCargo.length === 0) {
      const now = Date.now();
      for (const item of PRESET_CARGO_ITEMS) {
        this.driver.runSync(
          `INSERT INTO cargo_items (id, category, name, length_cm, width_cm, height_cm, weight_kg, allow_rotation_xyz, allow_rotation_z_only, is_fragile, is_soft, color_hex, is_preset, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.category,
            item.name,
            item.length_cm,
            item.width_cm,
            item.height_cm,
            item.weight_kg,
            item.allow_rotation_xyz,
            item.allow_rotation_z_only,
            item.is_fragile,
            item.is_soft,
            item.color_hex,
            item.is_preset,
            now,
          ]
        );
      }
    }
  }

  // --- Pojazdy i Przestrzenie ---
  public getAllVehicles(): Record<string, unknown>[] {
    return this.driver.getAllSync('SELECT * FROM vehicles ORDER BY make ASC, model ASC');
  }

  public getVehicle(id: string): Record<string, unknown> | null {
    return this.driver.getFirstSync('SELECT * FROM vehicles WHERE id = ?', [id]);
  }

  public getVehicleSpaces(vehicleId: string): Record<string, unknown>[] {
    return this.driver.getAllSync('SELECT * FROM vehicle_spaces WHERE vehicle_id = ?', [vehicleId]);
  }

  public getSpace(id: string): Record<string, unknown> | null {
    return this.driver.getFirstSync('SELECT * FROM vehicle_spaces WHERE id = ?', [id]);
  }

  // --- Przedmioty Ładunku ---
  public getCargoItems(): Record<string, unknown>[] {
    return this.driver.getAllSync('SELECT * FROM cargo_items ORDER BY category ASC, name ASC');
  }

  public getCargoItem(id: string): Record<string, unknown> | null {
    return this.driver.getFirstSync('SELECT * FROM cargo_items WHERE id = ?', [id]);
  }

  public insertCustomCargoItem(item: {
    id: string;
    category: string;
    name: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    weight_kg: number;
    allow_rotation_xyz?: boolean;
    allow_rotation_z_only?: boolean;
    is_fragile?: boolean;
    is_soft?: boolean;
    color_hex?: string;
  }): void {
    this.driver.runSync(
      `INSERT INTO cargo_items (id, category, name, length_cm, width_cm, height_cm, weight_kg, allow_rotation_xyz, allow_rotation_z_only, is_fragile, is_soft, color_hex, is_preset, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.category,
        item.name,
        item.length_cm,
        item.width_cm,
        item.height_cm,
        item.weight_kg,
        item.allow_rotation_xyz ? 1 : 0,
        item.allow_rotation_z_only ? 1 : 0,
        item.is_fragile ? 1 : 0,
        item.is_soft ? 1 : 0,
        item.color_hex ?? '#3B82F6',
        0, // user created
        Date.now(),
      ]
    );
  }

  // --- Sesje Pakowania ---
  public createPackSession(session: {
    id: string;
    name: string;
    target_space_id: string;
    passengers_count: number;
  }): void {
    const now = Date.now();
    this.driver.runSync(
      `INSERT INTO pack_sessions (id, name, target_space_id, passengers_count, total_weight_kg, packing_efficiency_pct, is_valid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.name, session.target_space_id, session.passengers_count, 0, 0, 1, now, now]
    );
  }

  public getPackSession(id: string): Record<string, unknown> | null {
    return this.driver.getFirstSync('SELECT * FROM pack_sessions WHERE id = ?', [id]);
  }

  public deletePackSession(id: string): void {
    this.driver.runSync('DELETE FROM pack_sessions WHERE id = ?', [id]);
  }

  public updateSessionStatus(
    sessionId: string,
    totalWeightKg: number,
    packingEfficiencyPct: number,
    isValid: boolean
  ): void {
    this.driver.runSync(
      `UPDATE pack_sessions SET total_weight_kg = ?, packing_efficiency_pct = ?, is_valid = ?, updated_at = ? WHERE id = ?`,
      [totalWeightKg, packingEfficiencyPct, isValid ? 1 : 0, Date.now(), sessionId]
    );
  }

  public getSessionItems(sessionId: string): Record<string, unknown>[] {
    return this.driver.getAllSync(
      'SELECT * FROM pack_session_items WHERE session_id = ? ORDER BY sequence_order ASC',
      [sessionId]
    );
  }

  public clearSessionItems(sessionId: string): void {
    this.driver.runSync('DELETE FROM pack_session_items WHERE session_id = ?', [sessionId]);
  }

  public insertSessionItem(item: {
    id: string;
    session_id: string;
    cargo_item_id: string;
    pos_x_cm: number;
    pos_y_cm: number;
    pos_z_cm: number;
    dim_x_cm: number;
    dim_y_cm: number;
    dim_z_cm: number;
    sequence_order: number;
    is_packed?: boolean;
  }): void {
    this.driver.runSync(
      `INSERT INTO pack_session_items (id, session_id, cargo_item_id, pos_x_cm, pos_y_cm, pos_z_cm, dim_x_cm, dim_y_cm, dim_z_cm, sequence_order, is_packed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.session_id,
        item.cargo_item_id,
        item.pos_x_cm,
        item.pos_y_cm,
        item.pos_z_cm,
        item.dim_x_cm,
        item.dim_y_cm,
        item.dim_z_cm,
        item.sequence_order,
        item.is_packed ? 1 : 0,
      ]
    );
  }

  public toggleSessionItemPacked(itemId: string, isPacked: boolean): void {
    this.driver.runSync('UPDATE pack_session_items SET is_packed = ? WHERE id = ?', [
      isPacked ? 1 : 0,
      itemId,
    ]);
  }

  // --- Projekty Przeprowadzek ---
  public createRelocationProject(project: {
    id: string;
    name: string;
    origin_type: string;
    origin_area_m2: number;
    residents_count: number;
    clutter_level: string;
    total_volume_m3: number;
    total_weight_kg: number;
    recommended_vehicle_type: string;
  }): void {
    this.driver.runSync(
      `INSERT INTO relocation_projects (id, name, origin_type, origin_area_m2, residents_count, clutter_level, total_volume_m3, total_weight_kg, recommended_vehicle_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project.id,
        project.name,
        project.origin_type,
        project.origin_area_m2,
        project.residents_count,
        project.clutter_level,
        project.total_volume_m3,
        project.total_weight_kg,
        project.recommended_vehicle_type,
        Date.now(),
      ]
    );
  }

  public getRelocationProject(id: string): Record<string, unknown> | null {
    return this.driver.getFirstSync('SELECT * FROM relocation_projects WHERE id = ?', [id]);
  }

  // --- Kopie Zapasowe JSON (Rozdział 12.2) ---
  public exportBackupJson(): BackupExportPayload {
    return {
      schema_version: SCHEMA_VERSION,
      bundle_id: 'com.apps4brew.fitcheck',
      exported_at: new Date().toISOString(),
      device_model: 'LocalDevice',
      app_version: '1.0.0',
      data: {
        custom_spaces: this.driver.getAllSync('SELECT * FROM custom_spaces'),
        user_cargo_items: this.driver.getAllSync('SELECT * FROM cargo_items WHERE is_preset = 0'),
        pack_sessions: this.driver.getAllSync('SELECT * FROM pack_sessions'),
        pack_session_items: this.driver.getAllSync('SELECT * FROM pack_session_items'),
        relocation_projects: this.driver.getAllSync('SELECT * FROM relocation_projects'),
        rooms: this.driver.getAllSync('SELECT * FROM rooms'),
        room_fixtures: this.driver.getAllSync('SELECT * FROM room_fixtures'),
        access_pathways: this.driver.getAllSync('SELECT * FROM access_pathways'),
        relocation_items: this.driver.getAllSync('SELECT * FROM relocation_items'),
        garage_profiles: this.driver.getAllSync('SELECT * FROM garage_profiles'),
        towbar_roof_configs: this.driver.getAllSync('SELECT * FROM towbar_roof_configs'),
      },
    };
  }

  public importBackupJson(backup: BackupExportPayload): BackupImportResult {
    if (!backup || typeof backup !== 'object') {
      return { success: false, restoredRecordsCount: 0, error: 'Nieprawidłowy format pliku kopii zapasowej' };
    }

    if (backup.schema_version !== SCHEMA_VERSION) {
      return {
        success: false,
        restoredRecordsCount: 0,
        error: `Niezgodna wersja schematu: oczekiwano ${SCHEMA_VERSION}, otrzymano ${backup.schema_version}`,
      };
    }

    try {
      let count = 0;
      this.driver.withTransactionSync(() => {
        // Czyszczenie tabel użytkownika w odpowiedniej kolejności (najpierw tabele podrzędne)
        this.driver.runSync('DELETE FROM relocation_items');
        this.driver.runSync('DELETE FROM access_pathways');
        this.driver.runSync('DELETE FROM room_fixtures');
        this.driver.runSync('DELETE FROM rooms');
        this.driver.runSync('DELETE FROM relocation_projects');
        this.driver.runSync('DELETE FROM pack_session_items');
        this.driver.runSync('DELETE FROM pack_sessions');
        this.driver.runSync('DELETE FROM cargo_items WHERE is_preset = 0');
        this.driver.runSync('DELETE FROM custom_spaces');
        this.driver.runSync('DELETE FROM garage_profiles');
        this.driver.runSync('DELETE FROM towbar_roof_configs');

        // Przywracanie danych
        for (const item of backup.data.user_cargo_items ?? []) {
          this.driver.runSync(
            `INSERT INTO cargo_items (id, category, name, length_cm, width_cm, height_cm, weight_kg, allow_rotation_xyz, allow_rotation_z_only, is_fragile, is_soft, color_hex, is_preset, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.id,
              item.category,
              item.name,
              item.length_cm,
              item.width_cm,
              item.height_cm,
              item.weight_kg,
              item.allow_rotation_xyz,
              item.allow_rotation_z_only,
              item.is_fragile,
              item.is_soft,
              item.color_hex,
              0,
              item.created_at ?? Date.now(),
            ]
          );
          count++;
        }

        for (const s of backup.data.pack_sessions ?? []) {
          this.driver.runSync(
            `INSERT INTO pack_sessions (id, name, target_space_id, passengers_count, total_weight_kg, packing_efficiency_pct, is_valid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.id,
              s.name,
              s.target_space_id,
              s.passengers_count,
              s.total_weight_kg,
              s.packing_efficiency_pct,
              s.is_valid,
              s.created_at,
              s.updated_at,
            ]
          );
          count++;
        }

        for (const r of backup.data.relocation_projects ?? []) {
          this.driver.runSync(
            `INSERT INTO relocation_projects (id, name, origin_type, origin_area_m2, residents_count, clutter_level, total_volume_m3, total_weight_kg, recommended_vehicle_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id,
              r.name,
              r.origin_type,
              r.origin_area_m2,
              r.residents_count,
              r.clutter_level,
              r.total_volume_m3,
              r.total_weight_kg,
              r.recommended_vehicle_type,
              r.created_at,
            ]
          );
          count++;
        }

        for (const g of backup.data.garage_profiles ?? []) {
          this.driver.runSync(
            `INSERT INTO garage_profiles (id, name, gate_width_cm, interior_width_cm, ceiling_height_cm, gate_runner_height_cm, obstacle_x_cm, obstacle_width_cm, max_entry_sign_m, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              g.id,
              g.name,
              g.gate_width_cm,
              g.interior_width_cm,
              g.ceiling_height_cm,
              g.gate_runner_height_cm,
              g.obstacle_x_cm,
              g.obstacle_width_cm,
              g.max_entry_sign_m,
              g.created_at,
            ]
          );
          count++;
        }
      });

      return { success: true, restoredRecordsCount: count };
    } catch (e: any) {
      return { success: false, restoredRecordsCount: 0, error: e.message };
    }
  }

  public getAppSetting(key: string, defaultValue: string = ''): string {
    try {
      const row = this.driver.getFirstSync<Record<string, unknown>>(
        'SELECT value FROM app_settings WHERE key = ?',
        [key]
      );
      return row && row.value !== undefined ? String(row.value) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  public setAppSetting(key: string, value: string): void {
    try {
      this.driver.runSync(
        'INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        [key, value, Date.now()]
      );
    } catch {
      // Fallback
    }
  }

  public close(): void {
    this.driver.closeSync();
  }
}

