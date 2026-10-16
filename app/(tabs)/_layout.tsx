import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { t, useLang } from '../../src/lib/i18n';
import { sharedCraftTokens } from '../../src/core/craft-suite-theme';

export default function TabLayout() {
  useLang();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: sharedCraftTokens.colors.bgBasalt,
          borderBottomColor: sharedCraftTokens.colors.border,
          borderBottomWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: sharedCraftTokens.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          letterSpacing: -0.3,
        },
        tabBarStyle: {
          backgroundColor: sharedCraftTokens.colors.bgBasalt,
          borderTopColor: sharedCraftTokens.colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: sharedCraftTokens.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* 1. Załadunek (Pack) */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('Załadunek'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />

      {/* 2. Przestrzenie (Spaces: Wnętrza, Moving Sofa, Schody, Garaż) */}
      <Tabs.Screen
        name="relocation"
        options={{
          title: t('Przestrzenie'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📐</Text>,
        }}
      />

      {/* 3. Ekwipunek (Gear & Catalog) */}
      <Tabs.Screen
        name="catalog"
        options={{
          title: t('Ekwipunek'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏷️</Text>,
        }}
      />

      {/* 4. Ustawienia (Settings) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('Ustawienia'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />

      {/* Garaż & Hak pozostaje zarejestrowaną trasą, lecz jest ukryty z dolnego paska nawigacji (Zgodnie z redukcją szumu do 4 zakładek) */}
      <Tabs.Screen
        name="garage"
        options={{
          href: null,
          title: t('Garaż & Hak'),
        }}
      />
    </Tabs>
  );
}
