/**
 * Czy się zmieści? (FitCheck) — Unit Converter (Metric / Imperial — DEC-21, NFR-I18N)
 * Obsługa jednostek metrycznych (mm, cm, m, kg, litry, m³) i imperialnych (in, ft, lbs, cu ft)
 */

import { useState, useEffect } from 'react';

export type UnitSystem = 'metric' | 'imperial';

let currentUnitSystem: UnitSystem = 'metric';
type UnitListener = (sys: UnitSystem) => void;
const listeners = new Set<UnitListener>();

export function setUnitSystem(system: UnitSystem): void {
  currentUnitSystem = system;
  listeners.forEach((fn) => fn(system));
}

export function getUnitSystem(): UnitSystem {
  return currentUnitSystem;
}

export function useUnitSystem(): UnitSystem {
  const [sys, setSys] = useState<UnitSystem>(currentUnitSystem);
  useEffect(() => {
    listeners.add(setSys);
    return () => {
      listeners.delete(setSys);
    };
  }, []);
  return sys;
}

// ==========================================
// Konwersja Wymiarów Liniowych (Długość/Szerokość/Wysokość)
// ==========================================

export function mmToInches(mm: number): number {
  return parseFloat((mm / 25.4).toFixed(1));
}

export function inchesToMm(inches: number): number {
  return Math.round(inches * 25.4);
}

export function cmToInches(cm: number): number {
  return parseFloat((cm / 2.54).toFixed(1));
}

export function inchesToCm(inches: number): number {
  return parseFloat((inches * 2.54).toFixed(1));
}

export function cmToFeet(cm: number): number {
  return parseFloat((cm / 30.48).toFixed(2));
}

export function feetToCm(feet: number): number {
  return parseFloat((feet * 30.48).toFixed(1));
}

export function formatDimension(cm: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${cmToInches(cm)} in`;
  }
  return `${Math.round(cm)} cm`;
}

export function formatDimensions3D(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  unitSystem: UnitSystem = currentUnitSystem
): string {
  if (unitSystem === 'imperial') {
    return `${cmToInches(lengthCm)} × ${cmToInches(widthCm)} × ${cmToInches(heightCm)} in`;
  }
  return `${Math.round(lengthCm)} × ${Math.round(widthCm)} × ${Math.round(heightCm)} cm`;
}

// ==========================================
// Konwersja Objętości i Litrażu (VDA, Bagażniki, Paki, Boxy)
// ==========================================

export function litersToCubicFeet(liters: number): number {
  return parseFloat((liters * 0.0353146667).toFixed(1));
}

export function cubicFeetToLiters(cuFt: number): number {
  return Math.round(cuFt / 0.0353146667);
}

export function m3ToCubicFeet(m3: number): number {
  return parseFloat((m3 * 35.3146667).toFixed(1));
}

export function cubicFeetToM3(cuFt: number): number {
  return parseFloat((cuFt / 35.3146667).toFixed(2));
}

export function formatVolume(liters: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${litersToCubicFeet(liters)} cu ft`;
  }
  return `${Math.round(liters)} L`;
}

export function formatM3(m3: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${m3ToCubicFeet(m3)} cu ft`;
  }
  return `${m3} m³`;
}

// ==========================================
// Konwersja Masy (DMC, Ładunek, Hak S, Belki)
// ==========================================

export function kgToPounds(kg: number): number {
  return parseFloat((kg * 2.2046226218).toFixed(1));
}

export function poundsToKg(lbs: number): number {
  return parseFloat((lbs / 2.2046226218).toFixed(1));
}

export function formatWeight(kg: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${kgToPounds(kg)} lbs`;
  }
  return `${Math.round(kg)} kg`;
}
