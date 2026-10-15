import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { packItemsInTrunk } from '../../src/domain/geometry/extremePoints';
import { calculatePayloadDMC } from '../../src/domain/physics/payloadDMC';
import { calculateCenterOfGravity } from '../../src/domain/physics/centerOfGravity';
import { CargoItem, TrunkGeometry } from '../../src/domain/geometry/types';

const SAMPLE_VEHICLES = [
  {
    id: 'skoda_octavia',
    name: 'Skoda Octavia IV Combi',
    trunk: {
      lengthFloorMm: 1050,
      lengthRoofMm: 750,
      widthMinMm: 1010,
      widthMaxMm: 1150,
      heightRoofMm: 820,
      heightShelfMm: 500,
      apertureWidthMm: 1020,
      apertureHeightMm: 780,
      thresholdHeightMm: 60,
    } as TrunkGeometry,
    specs: {
      curbWeightKg: 1395,
      grossVehicleWeightKg: 1955,
      maxRoofLoadKg: 75,
    },
  },
  {
    id: 'vw_passat',
    name: 'VW Passat Variant B8',
    trunk: {
      lengthFloorMm: 1150,
      lengthRoofMm: 850,
      widthMinMm: 1005,
      widthMaxMm: 1180,
      heightRoofMm: 800,
      heightShelfMm: 480,
      apertureWidthMm: 1050,
      apertureHeightMm: 760,
      thresholdHeightMm: 40,
    } as TrunkGeometry,
    specs: {
      curbWeightKg: 1470,
      grossVehicleWeightKg: 2080,
      maxRoofLoadKg: 100,
    },
  },
];

const AVAILABLE_ITEMS: CargoItem[] = [
  {
    id: 'item_1',
    name: 'Walizka duża 100L',
    dimensionsMm: { lengthMm: 750, widthMm: 500, heightMm: 300 },
    weightKg: 22,
    rotationConstraint: 'XYZ',
    isFragile: false,
    isSoft: false,
    allowStacking: true,
  },
  {
    id: 'item_2',
    name: 'Walizka kabinowa 40L',
    dimensionsMm: { lengthMm: 550, widthMm: 400, heightMm: 200 },
    weightKg: 10,
    rotationConstraint: 'XYZ',
    isFragile: false,
    isSoft: false,
    allowStacking: true,
  },
  {
    id: 'item_3',
    name: 'Wózek dziecięcy gondola',
    dimensionsMm: { lengthMm: 900, widthMm: 600, heightMm: 450 },
    weightKg: 14,
    rotationConstraint: 'Z_ONLY',
    isFragile: false,
    isSoft: false,
    allowStacking: false,
  },
  {
    id: 'item_4',
    name: 'Zastawa porcelanowa (Kruche)',
    dimensionsMm: { lengthMm: 400, widthMm: 300, heightMm: 250 },
    weightKg: 8,
    rotationConstraint: 'Z_ONLY',
    isFragile: true,
    isSoft: false,
    allowStacking: false,
  },
  {
    id: 'item_5',
    name: 'Karton przeprowadzkowy 60L',
    dimensionsMm: { lengthMm: 600, widthMm: 400, heightMm: 400 },
    weightKg: 18,
    rotationConstraint: 'XYZ',
    isFragile: false,
    isSoft: false,
    allowStacking: true,
  },
];

export default function SimulatorScreen() {
  const [selectedVehicleIdx, setSelectedVehicleIdx] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(['item_1', 'item_2', 'item_3']);
  const [passengersCount, setPassengersCount] = useState(2);

  const vehicle = SAMPLE_VEHICLES[selectedVehicleIdx];

  const activeItems = useMemo(() => {
    return AVAILABLE_ITEMS.filter(i => selectedItemIds.includes(i.id));
  }, [selectedItemIds]);

  const packingResult = useMemo(() => {
    return packItemsInTrunk(activeItems, vehicle.trunk);
  }, [activeItems, vehicle]);

  const payloadResult = useMemo(() => {
    return calculatePayloadDMC(vehicle.specs, passengersCount, packingResult.totalWeightKg);
  }, [vehicle, passengersCount, packingResult.totalWeightKg]);

  const cogResult = useMemo(() => {
    const weightMap: Record<string, number> = {};
    activeItems.forEach(i => {
      weightMap[i.id] = i.weightKg;
    });
    return calculateCenterOfGravity(packingResult.placements, weightMap, vehicle.trunk);
  }, [packingResult.placements, activeItems, vehicle.trunk]);

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Symulator Załadunku 3D</Text>
          <Text style={styles.subtitle}>Deterministyczny algorytm Extreme Points (RD-02)</Text>
        </View>

        {/* Wybór Samochodu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wybierz Samochód</Text>
          <View style={styles.selectorRow}>
            {SAMPLE_VEHICLES.map((v, idx) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.selectorButton,
                  selectedVehicleIdx === idx && styles.selectorButtonActive,
                ]}
                onPress={() => setSelectedVehicleIdx(idx)}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    selectedVehicleIdx === idx && styles.selectorButtonTextActive,
                  ]}
                >
                  {v.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Wybór Bagaży */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Przedmioty do zapakowania</Text>
          {AVAILABLE_ITEMS.map(item => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.name} {item.isFragile && '⚠️ Kruche'}
                  </Text>
                  <Text style={styles.itemDims}>
                    {item.dimensionsMm.lengthMm / 10} × {item.dimensionsMm.widthMm / 10} ×{' '}
                    {item.dimensionsMm.heightMm / 10} cm • {item.weightKg} kg
                  </Text>
                </View>
                <Text style={styles.checkboxText}>{isSelected ? '✅' : '⬜'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Główny Wynik: Czy się zmieści? */}
        <View
          style={[
            styles.card,
            packingResult.isFullyPacked ? styles.cardSuccess : styles.cardWarning,
          ]}
        >
          <Text style={styles.resultBadge}>
            {packingResult.isFullyPacked ? '✅ WSZYSTKO SIĘ MIEŚCI!' : '⚠️ CZĘŚĆ PRZEDMIOTÓW NIE WEJDZIE'}
          </Text>
          <Text style={styles.resultSummary}>
            Zapakowano {packingResult.placements.length} z {activeItems.length} przedmiotów
          </Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Wykorzystanie</Text>
              <Text style={styles.metricValue}>{packingResult.packingEfficiencyPct}%</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Waga ładunku</Text>
              <Text style={styles.metricValue}>{packingResult.totalWeightKg} kg</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Status DMC</Text>
              <Text
                style={[
                  styles.metricValue,
                  payloadResult.status === 'SAFE' ? styles.safeText : styles.alertText,
                ]}
              >
                {payloadResult.status === 'SAFE' ? 'Bezpieczny' : 'Przeciążenie!'}
              </Text>
            </View>
          </View>
        </View>

        {/* Instrukcja Krok po Kroku (Kolejność wkładania) */}
        {packingResult.placements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Kolejność Załadunku (Krok po Kroku)</Text>
            {packingResult.placements.map(p => {
              const itm = activeItems.find(i => i.id === p.itemId);
              return (
                <View key={p.itemId} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>#{p.sequenceOrder}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{itm?.name}</Text>
                    <Text style={styles.stepSub}>
                      Pozycja: X={Math.round(p.positionMm.xMm / 10)} cm, Y=
                      {Math.round(p.positionMm.yMm / 10)} cm, Z={Math.round(p.positionMm.zMm / 10)} cm
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Fizyka: Środek Ciężkości i Asymetria */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Balans i Środek Ciężkości (RD-20)</Text>
          <Text style={styles.bodyText}>
            Symetria poprzeczna:{' '}
            <Text style={{ fontWeight: '700', color: cogResult.isLateralSymmetric ? '#34D399' : '#F87171' }}>
              {cogResult.isLateralSymmetric ? 'Idealna (Równy rozkład masy)' : `Asymetria (${cogResult.lateralOffsetMm} mm)`}
            </Text>
          </Text>
          {cogResult.warnings.map((w: string, i: number) => (
            <Text key={i} style={styles.warningText}>
              • {w}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#0284C7',
  },
  selectorButtonText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 12,
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  itemRowSelected: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  itemDims: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 18,
    marginLeft: 8,
  },
  cardSuccess: {
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
  },
  cardWarning: {
    borderColor: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  resultBadge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  resultSummary: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 4,
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  safeText: {
    color: '#34D399',
  },
  alertText: {
    color: '#F87171',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  stepTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  stepSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  warningText: {
    color: '#FBBF24',
    fontSize: 12,
    marginTop: 4,
  },
});
