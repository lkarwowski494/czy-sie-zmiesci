#!/usr/bin/env python3
"""
gen-theme-contrast-corpus.py
Niezalezna wyrocznia prawdy w Pythonie (BR-TEST-014) dla kontrastu kolorow wg WCAG 2.1:
Wzor luminancji wzglednej (Relative Luminance):
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
Wspolczynnik kontrastu:
(L1 + 0.05) / (L2 + 0.05) gdzie L1 > L2

Wywolanie: python3 -I scripts/gen-theme-contrast-corpus.py
"""

import json
import math
import os
import re
import sys

def parse_hex_color(hex_str):
    h = hex_str.strip().lstrip("#")
    if len(h) == 3:
        h = "".join([c * 2 for c in h])
    if len(h) >= 6:
        r = int(h[0:2], 16)
        g = int(h[2:4], 16)
        b = int(h[4:6], 16)
        return r, g, b
    raise ValueError(f"Invalid hex color: {hex_str}")

def srgb_to_linear(val_8bit):
    c = val_8bit / 255.0
    if c <= 0.04045:
        return c / 12.92
    else:
        return math.pow((c + 0.055) / 1.055, 2.4)

def relative_luminance(hex_str):
    r, g, b = parse_hex_color(hex_str)
    rl = srgb_to_linear(r)
    gl = srgb_to_linear(g)
    bl = srgb_to_linear(b)
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl

def contrast_ratio(hex1, hex2):
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    ratio = (lighter + 0.05) / (darker + 0.05)
    return round(ratio, 2)

def main():
    # Tokeny z sharedCraftTokens i CRAFT_APPS (FitCheck & Culinary Suite)
    colors = {
        "bgBasalt": "#121214",
        "bgCard": "#1C1C1F",
        "bgCardSecondary": "#242428",
        "border": "#2E2E34",
        "borderLight": "#3E3E46",
        "textPrimary": "#F4EFEA",
        "textSecondary": "#A09C96",
        "textMuted": "#686561",
        "danger": "#D9534F",
        "statusSuccess": "#4E9F3D",
        "fitcheck_accent": "#38BDF8",
        "fitcheck_accentLight": "#BAE6FD",
        "fitcheck_secondaryAccent": "#0284C7",
        "napar_accent": "#C86A28",
        "piekarz_accent": "#D49B42",
        "sloik_accent": "#5B8A61",
    }

    pairs_to_evaluate = [
        # Glowne kombinacje tekstu i tla
        {"fg": "textPrimary", "bg": "bgBasalt", "role": "primary_body_text", "req_level": "AAA"},
        {"fg": "textPrimary", "bg": "bgCard", "role": "card_headline_text", "req_level": "AAA"},
        {"fg": "textPrimary", "bg": "bgCardSecondary", "role": "subcard_text", "req_level": "AAA"},
        {"fg": "textSecondary", "bg": "bgBasalt", "role": "secondary_body_text", "req_level": "AA"},
        {"fg": "textSecondary", "bg": "bgCard", "role": "card_secondary_text", "req_level": "AA"},
        {"fg": "textSecondary", "bg": "bgCardSecondary", "role": "subcard_secondary_text", "req_level": "AA"},
        # Akcenty i UI
        {"fg": "fitcheck_accent", "bg": "bgBasalt", "role": "primary_brand_accent", "req_level": "AA_large_ui"},
        {"fg": "fitcheck_accentLight", "bg": "bgBasalt", "role": "highlight_accent_text", "req_level": "AAA"},
        {"fg": "fitcheck_accentLight", "bg": "bgCard", "role": "card_highlight_text", "req_level": "AAA"},
        {"fg": "fitcheck_secondaryAccent", "bg": "bgBasalt", "role": "secondary_accent_ui", "req_level": "AA_large_ui"},
        # Statusy i alerty
        {"fg": "danger", "bg": "bgBasalt", "role": "danger_destructive_text", "req_level": "AA_large_ui"},
        {"fg": "statusSuccess", "bg": "bgBasalt", "role": "success_validation_badge", "req_level": "AA_large_ui"},
    ]

    results = []
    for pair in pairs_to_evaluate:
        fg_hex = colors[pair["fg"]]
        bg_hex = colors[pair["bg"]]
        ratio = contrast_ratio(fg_hex, bg_hex)

        req = pair["req_level"]
        min_ratio = 4.5 if req == "AA" else (7.0 if req == "AAA" else 3.0)
        passes = ratio >= min_ratio

        results.append({
            "foreground": pair["fg"],
            "foregroundHex": fg_hex,
            "background": pair["bg"],
            "backgroundHex": bg_hex,
            "role": pair["role"],
            "requiredLevel": req,
            "minRequiredRatio": min_ratio,
            "calculatedRatio": ratio,
            "passes": passes,
        })

    corpus = {
        "version": "1.0.0",
        "generated_by": "gen-theme-contrast-corpus.py",
        "algorithm": "WCAG 2.1 relative luminance (0.2126*R + 0.7152*G + 0.0722*B)",
        "evaluations": results,
    }

    out_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "src",
        "domain",
        "__tests__",
        "fixtures",
        "theme-contrast-corpus.json",
    )

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(results)} theme contrast evaluations into {out_path}")

if __name__ == "__main__":
    main()
