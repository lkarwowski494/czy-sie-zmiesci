import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { t, useLang } from '../../src/lib/i18n';

export default function TabLayout() {
  useLang();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Symulator 3D'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: t('Katalog'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚗</Text>,
        }}
      />
      <Tabs.Screen
        name="relocation"
        options={{
          title: t('Wnętrza & Dom'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🛋️</Text>,
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: t('Garaż & Hak'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏢</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('Ustawienia'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
