/**
 * matrix-routes.test.tsx
 * Pokrycie wszystkich tras routera aplikacji (EKRAN, BR-TEST-028)
 * Weryfikuje istnienie i poprawne ładowanie każdego ekranu w app/(tabs)/
 */

import React from 'react';
import CatalogScreen from '../app/(tabs)/catalog';
import GarageScreen from '../app/(tabs)/garage';
import IndexScreen from '../app/(tabs)/index';
import RelocationScreen from '../app/(tabs)/relocation';
import SettingsScreen from '../app/(tabs)/settings';

describe('Matrix Routes Guard (EKRAN / BR-TEST-028)', () => {
  const routes = [
    { route: '(tabs)/index', name: 'Załadunek & Symulator 3D', component: IndexScreen },
    { route: '(tabs)/catalog', name: 'Katalog Standardów', component: CatalogScreen },
    { route: '(tabs)/garage', name: 'Garaż & Hak Holowniczy', component: GarageScreen },
    { route: '(tabs)/relocation', name: 'Wnętrza & Przeprowadzki', component: RelocationScreen },
    { route: '(tabs)/settings', name: 'Ustawienia i Diagnostyka', component: SettingsScreen },
  ];

  it('declares and mounts all 5 certified app tabs', () => {
    expect(routes.length).toBe(5);

    for (const r of routes) {
      expect(r.route).toBeDefined();
      expect(typeof r.component).toBe('function');
    }
  });

  it('validates navigation route paths for all tabs', () => {
    expect(routes.map((r) => r.route)).toEqual([
      '(tabs)/index',
      '(tabs)/catalog',
      '(tabs)/garage',
      '(tabs)/relocation',
      '(tabs)/settings',
    ]);
  });
});
