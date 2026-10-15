import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { estimateRelocationVolume, ClutterLevel } from '../../src/domain/relocation/volumeEstimator';
import { evaluateNicheFit } from '../../src/domain/room-fitting/nicheCalculator';
import { calculateDoorwayClearance } from '../../src/domain/doors-stairs/doorwayClearance';

export default function RelocationScreen() {
  // Stan kalkulatora przeprowadzki
  const [areaM2, setAreaM2] = useState('50');
  const [residents, setResidents] = useState('2');
  const [clutter, setClutter] = useState<ClutterLevel>('standard');

  // Stan kalkulatora wnęki
  const [nicheWidth, setNicheWidth] = useState('152');
  const [nicheDepth, setNicheDepth] = useState('65');
  const [furnWidth, setFurnWidth] = useState('150');
  const [furnDepth, setFurnDepth] = useState('60');

  // Stan drzwi / ościeżnicy
  const [doorWidth, setDoorWidth] = useState('80');
  const [itemSmallestDim, setItemSmallestDim] = useState('65');

  const relocResult = estimateRelocationVolume({
    floorAreaM2: parseFloat(areaM2) || 0,
    residentsCount: parseInt(residents, 10) || 1,
    clutterLevel: clutter,
  });

  const nicheResult = evaluateNicheFit(
    {
      widthMm: (parseFloat(furnWidth) || 0) * 10,
      depthMm: (parseFloat(furnDepth) || 0) * 10,
      heightMm: 2200,
    },
    {
      widthTopMm: (parseFloat(nicheWidth) || 0) * 10,
      widthMiddleMm: (parseFloat(nicheWidth) || 0) * 10,
      widthBottomMm: (parseFloat(nicheWidth) || 0) * 10,
      depthMm: (parseFloat(nicheDepth) || 0) * 10,
      heightMm: 2500,
      skirtingBoardThicknessMm: 20,
      hasSkirtingBoards: true,
    }
  );

  const doorResult = calculateDoorwayClearance(
    {
      lengthMm: 1200,
      widthMm: (parseFloat(itemSmallestDim) || 0) * 10,
      heightMm: (parseFloat(itemSmallestDim) || 0) * 10,
    },
    {
      nominalWidthMm: (parseFloat(doorWidth) || 0) * 10,
      doorSwingAngleDeg: 90,
      isDoorLeafRemovable: false,
      isHandleRemovable: false,
    },
    true
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Wnętrza & Przeprowadzki</Text>
          <Text style={styles.subtitle}>
            Kalkulator floty, pasowanie we wnękach, ościeżnice
          </Text>
        </View>

        {/* Sekcja 1: Kalkulator Przeprowadzki */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚚 Kalkulator Floty Przeprowadzkowej (RD-49)</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Metraż (m²):</Text>
              <TextInput
                style={styles.input}
                value={areaM2}
                onChangeText={setAreaM2}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Liczba osób:</Text>
              <TextInput
                style={styles.input}
                value={residents}
                onChangeText={setResidents}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.clutterSelector}>
            {(['minimalist', 'standard', 'dense'] as ClutterLevel[]).map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.clutterBtn, clutter === c && styles.clutterBtnActive]}
                onPress={() => setClutter(c)}
              >
                <Text
                  style={[
                    styles.clutterBtnText,
                    clutter === c && styles.clutterBtnTextActive,
                  ]}
                >
                  {c === 'minimalist' ? 'Minimalizm' : c === 'standard' ? 'Standard' : 'Dużo rzeczy'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultMain}>
              Szacowana kubatura: <Text style={{ color: '#38BDF8' }}>{relocResult.estimatedVolumeM3} m³</Text>
            </Text>
            <Text style={styles.subtext}>
              Rekomendowany pojazd: <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>{relocResult.fleetDescription}</Text>
            </Text>
            <Text style={styles.subtext}>
              Potrzebne kartony: ~{relocResult.recommendedBoxesCount} szt. • Waga mienia: ~{relocResult.estimatedWeightKg} kg
            </Text>
          </View>
        </View>

        {/* Sekcja 2: Pasowanie we wnęce i listwy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 Pasowanie we Wnęce i Listwy (RD-36)</Text>
          <Text style={styles.label}>Szerokość wnęki (cm) vs Szerokość szafy (cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={nicheWidth}
              onChangeText={setNicheWidth}
              keyboardType="numeric"
              placeholder="Wnęka"
            />
            <Text style={styles.vsText}>vs</Text>
            <TextInput
              style={styles.input}
              value={furnWidth}
              onChangeText={setFurnWidth}
              keyboardType="numeric"
              placeholder="Szafa"
            />
          </View>

          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultHighlight,
                nicheResult.fitsOverall ? styles.successText : styles.alertText,
              ]}
            >
              {nicheResult.fitsOverall
                ? '✅ Szafa mieści się we wnęce!'
                : '❌ Kolizja! Mebel nie wejdzie'}
            </Text>
            {nicheResult.isSkirtingCollision && (
              <Text style={styles.warningText}>
                ⚠️ Uwaga: Mebel mieści się u góry, ale koliduje z listwami przypodłogowymi! (Szerokość przy podłodze to {nicheResult.effectiveWidthAtFloorMm / 10} cm)
              </Text>
            )}
            {nicheResult.recommendations.map((r: string, i: number) => (
              <Text key={i} style={styles.recommendationText}>
                💡 {r}
              </Text>
            ))}
          </View>
        </View>

        {/* Sekcja 3: Przejście przez Drzwi */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚪 Światło Drzwi i Klamka (RD-33)</Text>
          <Text style={styles.label}>Drzwi nominalne (np. "80") vs Najwęższy bok mebla (cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={doorWidth}
              onChangeText={setDoorWidth}
              keyboardType="numeric"
            />
            <Text style={styles.vsText}>vs</Text>
            <TextInput
              style={styles.input}
              value={itemSmallestDim}
              onChangeText={setItemSmallestDim}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultHighlight,
                doorResult.canPass ? styles.successText : styles.alertText,
              ]}
            >
              {doorResult.canPass ? '✅ Przejdzie bezpiecznie z tragarzami' : '❌ Zablokuje się w drzwiach!'}
            </Text>
            <Text style={styles.subtext}>
              Efektywne światło (klamka -6cm, skrzydło -4.5cm, dłonie -10cm): {doorResult.netClearanceWithHandsMm / 10} cm
            </Text>
            {doorResult.recommendations.map((r: string, i: number) => (
              <Text key={i} style={styles.recommendationText}>
                💡 {r}
              </Text>
            ))}
          </View>
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
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  vsText: {
    color: '#94A3B8',
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  clutterSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  clutterBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  clutterBtnActive: {
    backgroundColor: '#0284C7',
  },
  clutterBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  clutterBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  resultBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  resultMain: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  resultHighlight: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FBBF24',
    marginTop: 6,
  },
  recommendationText: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 4,
  },
  successText: {
    color: '#34D399',
  },
  alertText: {
    color: '#F87171',
  },
});
