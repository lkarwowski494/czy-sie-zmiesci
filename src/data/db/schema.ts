/**
 * Czy się zmieści? (FitCheck) — Schemat DDL SQLite i Migracje (BRD Rozdział 12)
 */

export const SCHEMA_VERSION = 2;

export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

-- 1. Tabela predefiniowanych modeli pojazdów
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    generation TEXT NOT NULL,
    body_type TEXT NOT NULL,
    year_from INTEGER NOT NULL,
    year_to INTEGER,
    curb_weight_kg REAL NOT NULL,
    max_payload_kg REAL NOT NULL,
    gvw_kg REAL NOT NULL,
    width_with_mirrors_cm REAL NOT NULL DEFAULT 205.0,
    width_folded_mirrors_cm REAL NOT NULL DEFAULT 190.0,
    roof_load_limit_kg REAL NOT NULL DEFAULT 75.0,
    towbar_s_limit_kg REAL DEFAULT 75.0,
    tailgate_max_height_cm REAL DEFAULT 210.0,
    created_at INTEGER NOT NULL
);

-- 2. Tabela parametrów geometrycznych przestrzeni bagażowych
CREATE TABLE IF NOT EXISTS vehicle_spaces (
    id TEXT PRIMARY KEY NOT NULL,
    vehicle_id TEXT NOT NULL,
    space_name TEXT NOT NULL,
    length_floor_cm REAL NOT NULL,
    length_folded_cm REAL NOT NULL,
    width_min_cm REAL NOT NULL,
    width_max_cm REAL NOT NULL,
    height_roof_cm REAL NOT NULL,
    height_shelf_cm REAL NOT NULL,
    tailgate_angle_deg REAL NOT NULL,
    aperture_width_cm REAL NOT NULL,
    aperture_height_cm REAL NOT NULL,
    threshold_height_cm REAL NOT NULL,
    vda_liters INTEGER NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 3. Tabela własnych przestrzeni użytkownika
CREATE TABLE IF NOT EXISTS custom_spaces (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    space_category TEXT NOT NULL,
    length_cm REAL NOT NULL,
    width_cm REAL NOT NULL,
    height_cm REAL NOT NULL,
    is_slanted INTEGER NOT NULL DEFAULT 0,
    slant_angle_deg REAL DEFAULT 0,
    aperture_width_cm REAL,
    aperture_height_cm REAL,
    max_payload_kg REAL DEFAULT 500,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- 4. Tabela katalogu przedmiotów i ładunków
CREATE TABLE IF NOT EXISTS cargo_items (
    id TEXT PRIMARY KEY NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    length_cm REAL NOT NULL,
    width_cm REAL NOT NULL,
    height_cm REAL NOT NULL,
    weight_kg REAL NOT NULL,
    allow_rotation_xyz INTEGER NOT NULL DEFAULT 1,
    allow_rotation_z_only INTEGER NOT NULL DEFAULT 0,
    is_fragile INTEGER NOT NULL DEFAULT 0,
    is_soft INTEGER NOT NULL DEFAULT 0,
    color_hex TEXT NOT NULL DEFAULT '#3B82F6',
    is_preset INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- 5. Tabela aktywnych i zapisanych sesji załadunku
CREATE TABLE IF NOT EXISTS pack_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    target_space_id TEXT NOT NULL,
    passengers_count INTEGER NOT NULL DEFAULT 1,
    total_weight_kg REAL NOT NULL DEFAULT 0,
    packing_efficiency_pct REAL NOT NULL DEFAULT 0,
    is_valid INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 6. Tabela alokacji przedmiotów w sesji załadunku (Pozycje 3D)
CREATE TABLE IF NOT EXISTS pack_session_items (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    cargo_item_id TEXT NOT NULL,
    pos_x_cm REAL NOT NULL,
    pos_y_cm REAL NOT NULL,
    pos_z_cm REAL NOT NULL,
    dim_x_cm REAL NOT NULL,
    dim_y_cm REAL NOT NULL,
    dim_z_cm REAL NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_packed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES pack_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (cargo_item_id) REFERENCES cargo_items(id) ON DELETE RESTRICT
);

-- 7. Tabela projektów przeprowadzek
CREATE TABLE IF NOT EXISTS relocation_projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    origin_type TEXT NOT NULL,
    origin_area_m2 REAL,
    residents_count INTEGER DEFAULT 2,
    clutter_level TEXT DEFAULT 'standard',
    total_volume_m3 REAL NOT NULL DEFAULT 0,
    total_weight_kg REAL NOT NULL DEFAULT 0,
    recommended_vehicle_type TEXT,
    created_at INTEGER NOT NULL
);

-- 8. Tabela pomieszczeń w lokalu
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    name TEXT NOT NULL,
    length_cm REAL NOT NULL,
    width_cm REAL NOT NULL,
    height_cm REAL NOT NULL DEFAULT 260.0,
    skirting_board_thickness_mm REAL NOT NULL DEFAULT 20.0,
    has_attic_slant INTEGER NOT NULL DEFAULT 0,
    knee_wall_height_cm REAL DEFAULT 0,
    roof_angle_deg REAL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES relocation_projects(id) ON DELETE CASCADE
);

-- 9. Tabela elementów stałych i wnęk pomieszczeń
CREATE TABLE IF NOT EXISTS room_fixtures (
    id TEXT PRIMARY KEY NOT NULL,
    room_id TEXT NOT NULL,
    fixture_type TEXT NOT NULL,
    pos_x_cm REAL NOT NULL,
    pos_y_cm REAL NOT NULL,
    width_cm REAL NOT NULL,
    depth_cm REAL NOT NULL,
    height_cm REAL NOT NULL,
    protrusion_cm REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 10. Tabela ciągów komunikacyjnych (Ościeżnice, schody, windy)
CREATE TABLE IF NOT EXISTS access_pathways (
    id TEXT PRIMARY KEY NOT NULL,
    room_id TEXT,
    pathway_type TEXT NOT NULL,
    nominal_width_cm REAL NOT NULL,
    effective_aperture_cm REAL NOT NULL,
    height_cm REAL NOT NULL,
    door_swing_deg REAL DEFAULT 90.0,
    handle_offset_cm REAL DEFAULT 6.0,
    stair_width_cm REAL,
    landing_depth_cm REAL,
    ceiling_clearance_cm REAL,
    elevator_diagonal_cm REAL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 11. Tabela inwentarza przeprowadzki
CREATE TABLE IF NOT EXISTS relocation_items (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    room_id TEXT,
    cargo_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    box_label TEXT,
    destination_room TEXT,
    phase_category TEXT NOT NULL DEFAULT 'base',
    is_loaded INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES relocation_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (cargo_item_id) REFERENCES cargo_items(id) ON DELETE RESTRICT
);

-- 12. Tabela profili garażowych i parkingów
CREATE TABLE IF NOT EXISTS garage_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    gate_width_cm REAL NOT NULL,
    interior_width_cm REAL NOT NULL,
    ceiling_height_cm REAL NOT NULL,
    gate_runner_height_cm REAL,
    obstacle_x_cm REAL,
    obstacle_width_cm REAL,
    max_entry_sign_m REAL,
    created_at INTEGER NOT NULL
);

-- 13. Tabela konfiguracji haków i dachów
CREATE TABLE IF NOT EXISTS towbar_roof_configs (
    id TEXT PRIMARY KEY NOT NULL,
    vehicle_id TEXT NOT NULL,
    towbar_s_limit_kg REAL NOT NULL,
    bike_rack_weight_kg REAL NOT NULL,
    bikes_count INTEGER NOT NULL DEFAULT 2,
    bikes_total_weight_kg REAL NOT NULL,
    roof_limit_kg REAL NOT NULL,
    bars_weight_kg REAL NOT NULL,
    roof_box_weight_kg REAL NOT NULL,
    roof_cargo_weight_kg REAL NOT NULL,
    total_roof_height_cm REAL NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 14. Tabela ustawień aplikacji i stanu licencji (Key-Value)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Indeksy wydajnościowe
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_cargo_category ON cargo_items(category);
CREATE INDEX IF NOT EXISTS idx_session_items_order ON pack_session_items(session_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_relocation_items_project ON relocation_items(project_id, phase_category);
CREATE INDEX IF NOT EXISTS idx_room_fixtures_room ON room_fixtures(room_id);
`;

export const PRESET_CARGO_ITEMS = [
  {
    id: 'preset_suitcase_l',
    category: 'luggage',
    name: 'Walizka duża (twarda, 100L)',
    length_cm: 75.0,
    width_cm: 50.0,
    height_cm: 30.0,
    weight_kg: 22.0,
    allow_rotation_xyz: 1,
    allow_rotation_z_only: 0,
    is_fragile: 0,
    is_soft: 0,
    color_hex: '#1E40AF',
    is_preset: 1,
  },
  {
    id: 'preset_suitcase_m',
    category: 'luggage',
    name: 'Walizka kabinowa (twarda, 40L)',
    length_cm: 55.0,
    width_cm: 40.0,
    height_cm: 20.0,
    weight_kg: 10.0,
    allow_rotation_xyz: 1,
    allow_rotation_z_only: 0,
    is_fragile: 0,
    is_soft: 0,
    color_hex: '#3B82F6',
    is_preset: 1,
  },
  {
    id: 'preset_pram',
    category: 'luggage',
    name: 'Wózek dziecięcy gondola (złożony)',
    length_cm: 90.0,
    width_cm: 60.0,
    height_cm: 45.0,
    weight_kg: 14.0,
    allow_rotation_xyz: 0,
    allow_rotation_z_only: 1,
    is_fragile: 0,
    is_soft: 0,
    color_hex: '#10B981',
    is_preset: 1,
  },
  {
    id: 'preset_washing_machine',
    category: 'appliance',
    name: 'Pralka automatyczna 60cm',
    length_cm: 60.0,
    width_cm: 60.0,
    height_cm: 85.0,
    weight_kg: 68.0,
    allow_rotation_xyz: 0,
    allow_rotation_z_only: 1,
    is_fragile: 1,
    is_soft: 0,
    color_hex: '#9CA3AF',
    is_preset: 1,
  },
  {
    id: 'preset_fridge_standard',
    category: 'appliance',
    name: 'Lodówka wolnostojąca 185cm',
    length_cm: 65.0,
    width_cm: 60.0,
    height_cm: 185.0,
    weight_kg: 74.0,
    allow_rotation_xyz: 0,
    allow_rotation_z_only: 1,
    is_fragile: 1,
    is_soft: 0,
    color_hex: '#6B7280',
    is_preset: 1,
  },
  {
    id: 'preset_ikea_billy',
    category: 'furniture',
    name: 'Regał Billy Ikea (paczka płaska)',
    length_cm: 205.0,
    width_cm: 40.0,
    height_cm: 15.0,
    weight_kg: 35.0,
    allow_rotation_xyz: 1,
    allow_rotation_z_only: 0,
    is_fragile: 0,
    is_soft: 0,
    color_hex: '#D97706',
    is_preset: 1,
  },
  {
    id: 'preset_moving_box_std',
    category: 'parcel',
    name: 'Karton przeprowadzkowy standard 60L',
    length_cm: 60.0,
    width_cm: 40.0,
    height_cm: 40.0,
    weight_kg: 20.0,
    allow_rotation_xyz: 1,
    allow_rotation_z_only: 0,
    is_fragile: 0,
    is_soft: 0,
    color_hex: '#B45309',
    is_preset: 1,
  },
  {
    id: 'preset_ebike',
    category: 'sport',
    name: 'Rower elektryczny MTB',
    length_cm: 185.0,
    width_cm: 75.0,
    height_cm: 110.0,
    weight_kg: 24.5,
    allow_rotation_xyz: 0,
    allow_rotation_z_only: 1,
    is_fragile: 0,
    is_soft: 0,
    color_hex: '#059669',
    is_preset: 1,
  },
];

export const PRESET_VEHICLES = [
  {
    vehicle: {
      id: 'veh_skoda_octavia_4_combi',
      make: 'Skoda',
      model: 'Octavia Combi',
      generation: 'IV',
      body_type: 'kombi',
      year_from: 2020,
      year_to: 2026,
      curb_weight_kg: 1395.0,
      max_payload_kg: 560.0,
      gvw_kg: 1955.0,
      width_with_mirrors_cm: 200.3,
      width_folded_mirrors_cm: 182.9,
      roof_load_limit_kg: 75.0,
      towbar_s_limit_kg: 80.0,
      tailgate_max_height_cm: 207.0,
    },
    spaces: [
      {
        id: 'space_octavia_standard',
        space_name: 'Bagażnik standard (5 miejsc)',
        length_floor_cm: 105.0,
        length_folded_cm: 105.0,
        width_min_cm: 101.0,
        width_max_cm: 115.0,
        height_roof_cm: 82.0,
        height_shelf_cm: 50.0,
        tailgate_angle_deg: 26.0,
        aperture_width_cm: 102.0,
        aperture_height_cm: 78.0,
        threshold_height_cm: 6.0,
        vda_liters: 640,
      },
      {
        id: 'space_octavia_folded',
        space_name: 'Fotele tylne złożone (2 miejsca)',
        length_floor_cm: 185.0,
        length_folded_cm: 185.0,
        width_min_cm: 101.0,
        width_max_cm: 115.0,
        height_roof_cm: 82.0,
        height_shelf_cm: 82.0,
        tailgate_angle_deg: 26.0,
        aperture_width_cm: 102.0,
        aperture_height_cm: 78.0,
        threshold_height_cm: 6.0,
        vda_liters: 1700,
      },
    ],
  },
  {
    vehicle: {
      id: 'veh_vw_passat_b8_variant',
      make: 'Volkswagen',
      model: 'Passat Variant',
      generation: 'B8',
      body_type: 'kombi',
      year_from: 2014,
      year_to: 2023,
      curb_weight_kg: 1470.0,
      max_payload_kg: 610.0,
      gvw_kg: 2080.0,
      width_with_mirrors_cm: 208.3,
      width_folded_mirrors_cm: 183.2,
      roof_load_limit_kg: 100.0,
      towbar_s_limit_kg: 90.0,
      tailgate_max_height_cm: 209.0,
    },
    spaces: [
      {
        id: 'space_passat_standard',
        space_name: 'Bagażnik standard',
        length_floor_cm: 115.0,
        length_folded_cm: 115.0,
        width_min_cm: 100.5,
        width_max_cm: 118.0,
        height_roof_cm: 80.0,
        height_shelf_cm: 48.0,
        tailgate_angle_deg: 24.0,
        aperture_width_cm: 105.0,
        aperture_height_cm: 76.0,
        threshold_height_cm: 4.0,
        vda_liters: 650,
      },
    ],
  },
];
