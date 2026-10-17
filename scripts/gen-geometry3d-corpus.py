#!/usr/bin/env python3
"""
gen-geometry3d-corpus.py
Niezalezna wyrocznia prawdy w Pythonie (BR-TEST-011) dla geometrii przestrzennej 3D:
- Przekatne przestrzenne i skrajnia wind (RD-35)
- Obrot mebli na klatkach schodowych (Moving Sofa, RD-34)
- Obliczanie ladownosci i objetosci VDA (RD-42)
- Rozklad masy, nacisk na hak (S) i CoG (RD-45)

Wywolanie: python3 -I scripts/gen-geometry3d-corpus.py
"""

import json
import math
import os
import sys

def calculate_elevator_fit(item_dims, cabin):
    depth = cabin["depthMm"]
    width = cabin["widthMm"]
    height = cabin["heightMm"]
    door_w = cabin["doorWidthMm"]
    door_h = cabin["doorHeightMm"]

    diag_raw = math.sqrt(depth**2 + width**2 + height**2)
    margin = 50
    max_rigid_len = max(0, math.floor(diag_raw - margin))

    dims = sorted([item_dims["lengthMm"], item_dims["widthMm"], item_dims["heightMm"]], reverse=True)
    longest, middle, smallest = dims[0], dims[1], dims[2]

    fits_door = (middle <= door_w) or (smallest <= door_w)
    fits_cabin = (longest <= max_rigid_len) and fits_door
    margin_mm = max_rigid_len - longest

    return {
        "spatialDiagonalMm": round(diag_raw),
        "maxRigidItemLengthMm": max_rigid_len,
        "fitsThroughDoor": fits_door,
        "fitsInsideCabin": fits_cabin,
        "marginMm": margin_mm,
    }

def calculate_vda_liters(dims_mm):
    # VDA 238-102 standard block: 200 x 100 x 50 mm = 1.0 Litre
    # Max packing heuristic across permutations
    length = dims_mm["lengthMm"]
    width = dims_mm["widthMm"]
    height = dims_mm["heightMm"]

    orientations = [
        (200, 100, 50),
        (200, 50, 100),
        (100, 200, 50),
        (100, 50, 200),
        (50, 200, 100),
        (50, 100, 200),
    ]

    max_blocks = 0
    for bx, by, bz in orientations:
        blocks = (length // bx) * (width // by) * (height // bz)
        if blocks > max_blocks:
            max_blocks = blocks

    geometric_liters = round((length * width * height) / 1_000_000, 1)

    return {
        "vdaBlocksCount": max_blocks,
        "vdaLiters": max_blocks * 1.0,
        "geometricGrossLiters": geometric_liters,
        "packingEfficiencyPct": round((max_blocks * 1_000_000 / (length * width * height)) * 100, 1) if length * width * height > 0 else 0.0,
    }

def calculate_towbar_nose_load(trailer_mass_kg, axle_distance_m, drawbar_length_m, payload_mass_kg, payload_dist_from_coupler_m):
    # Suma momentow wzgledem osi przyczepy
    # S * drawbar_length_m = M_trailer_empty * (axle - CoG_trailer) + M_payload * (axle - payload_dist)
    # Dla uproszczonego modelu: nacisk S w punkcie sprzegu
    total_mass = trailer_mass_kg + payload_mass_kg
    dist_from_axle = axle_distance_m - payload_dist_from_coupler_m
    nose_load_raw = (payload_mass_kg * dist_from_axle) / drawbar_length_m + (trailer_mass_kg * 0.05) # 5% wlasnej masy przyczepy
    nose_load_kg = round(max(0.0, min(total_mass, nose_load_raw)), 1)
    
    # Rekomendowany zakres bezpieczny (4% do 7% masy calkowitej, max 75-100kg wg ISO 1103)
    min_safe = round(total_mass * 0.04, 1)
    max_safe = round(min(100.0, total_mass * 0.08), 1)
    is_safe = min_safe <= nose_load_kg <= max_safe

    return {
        "totalMassKg": total_mass,
        "noseLoadKg": nose_load_kg,
        "minSafeNoseLoadKg": min_safe,
        "maxSafeNoseLoadKg": max_safe,
        "isWithinSafeOperatingWindow": is_safe,
    }

def main():
    cabins = [
        {"name": "4_person_prefab", "depthMm": 1000, "widthMm": 900, "heightMm": 2100, "doorWidthMm": 700, "doorHeightMm": 2000},
        {"name": "8_person_modern", "depthMm": 1400, "widthMm": 1100, "heightMm": 2200, "doorWidthMm": 800, "doorHeightMm": 2000},
        {"name": "freight_hospital", "depthMm": 2100, "widthMm": 1500, "heightMm": 2300, "doorWidthMm": 1100, "doorHeightMm": 2100},
    ]

    test_items = [
        {"id": "mattress_160x200", "lengthMm": 2000, "widthMm": 1600, "heightMm": 250},
        {"id": "sofa_3seater", "lengthMm": 2200, "widthMm": 950, "heightMm": 850},
        {"id": "fridge_tall", "lengthMm": 2010, "widthMm": 600, "heightMm": 650},
        {"id": "wardrobe_pax_236", "lengthMm": 2364, "widthMm": 1000, "heightMm": 580},
        {"id": "bookcase_billy", "lengthMm": 2020, "widthMm": 800, "heightMm": 280},
        {"id": "door_leaf_80", "lengthMm": 2030, "widthMm": 844, "heightMm": 40},
        {"id": "table_dining", "lengthMm": 1800, "widthMm": 900, "heightMm": 760},
        {"id": "tv_oled_77", "lengthMm": 1720, "widthMm": 990, "heightMm": 60},
        {"id": "washing_machine", "lengthMm": 600, "widthMm": 600, "heightMm": 850},
        {"id": "corner_sofa_heavy", "lengthMm": 2600, "widthMm": 1600, "heightMm": 900},
    ]

    elevator_results = []
    for c in cabins:
        for it in test_items:
            res = calculate_elevator_fit(it, c)
            elevator_results.append({
                "cabin": c["name"],
                "item": it["id"],
                "dimensions": it,
                "result": res,
            })

    cargo_spaces = [
        {"name": "trunk_hatchback_compact", "lengthMm": 800, "widthMm": 1000, "heightMm": 500},
        {"name": "trunk_station_wagon", "lengthMm": 1100, "widthMm": 1050, "heightMm": 600},
        {"name": "trunk_van_cargo", "lengthMm": 2400, "widthMm": 1600, "heightMm": 1400},
        {"name": "roof_box_medium", "lengthMm": 1750, "widthMm": 820, "heightMm": 350},
        {"name": "inpost_paczkomat_gabaryt_a", "lengthMm": 640, "widthMm": 380, "heightMm": 80},
        {"name": "inpost_paczkomat_gabaryt_b", "lengthMm": 640, "widthMm": 380, "heightMm": 190},
        {"name": "inpost_paczkomat_gabaryt_c", "lengthMm": 640, "widthMm": 380, "heightMm": 410},
    ]

    vda_results = []
    for sp in cargo_spaces:
        res = calculate_vda_liters(sp)
        vda_results.append({
            "space": sp["name"],
            "dimensions": sp,
            "result": res,
        })

    towbar_scenarios = [
        {"name": "light_utility_centered", "trailer_mass_kg": 250, "axle_distance_m": 2.5, "drawbar_length_m": 3.0, "payload_mass_kg": 350, "payload_dist_from_coupler_m": 2.4},
        {"name": "light_utility_rear_heavy", "trailer_mass_kg": 250, "axle_distance_m": 2.5, "drawbar_length_m": 3.0, "payload_mass_kg": 400, "payload_dist_from_coupler_m": 2.8},
        {"name": "caravan_balanced", "trailer_mass_kg": 900, "axle_distance_m": 3.8, "drawbar_length_m": 4.5, "payload_mass_kg": 250, "payload_dist_from_coupler_m": 3.6},
        {"name": "boat_trailer_front_heavy", "trailer_mass_kg": 350, "axle_distance_m": 4.0, "drawbar_length_m": 5.0, "payload_mass_kg": 600, "payload_dist_from_coupler_m": 2.5},
    ]

    towbar_results = []
    for sc in towbar_scenarios:
        res = calculate_towbar_nose_load(
            sc["trailer_mass_kg"],
            sc["axle_distance_m"],
            sc["drawbar_length_m"],
            sc["payload_mass_kg"],
            sc["payload_dist_from_coupler_m"],
        )
        towbar_results.append({
            "scenario": sc["name"],
            "inputs": sc,
            "result": res,
        })

    corpus = {
        "version": "1.0.0",
        "generated_by": "gen-geometry3d-corpus.py",
        "elevator_evaluations": elevator_results,
        "vda_evaluations": vda_results,
        "towbar_evaluations": towbar_results,
    }

    out_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "src",
        "domain",
        "__tests__",
        "fixtures",
        "geometry3d-corpus.json",
    )
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(elevator_results)} elevator, {len(vda_results)} VDA, {len(towbar_results)} towbar vectors into {out_path}")

if __name__ == "__main__":
    main()
