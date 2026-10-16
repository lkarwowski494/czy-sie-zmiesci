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
import { evaluateStaircaseLandingTurn } from '../../src/domain/doors-stairs/staircaseRotation';
import { NicheVisualizer } from '../../src/components/NicheVisualizer';
import { DoorwayVisualizer } from '../../src/components/DoorwayVisualizer';

export default function RelocationScreen() {
  // Stan kalkulatora przeprowadzki
  const [areaM2, setAreaM2] = useState('50');
  const [residents, setResidents] = useState('2');
  const [clutter, setClutter] = useState<ClutterLevel>('standard');
  const [showManifest, setShowManifest] = useState(false);

  // Stan kalkulatora wnęki
  const [nicheWidth, setNicheWidth] = useState('152');
  const [nicheDepth, setNicheDepth] = useState('65');
  const [furnWidth, setFurnWidth] = useState('150');
  const [furnDepth, setFurnDepth] = useState('60');

  // Stan drzwi / ościeżnicy
  const [doorWidth, setDoorWidth] = useState('80');
  const [itemSmallestDim, setItemSmallestDim] = useState('65');

  // Stan schodów / spocznika (Moving Sofa)
  const [flightWidth, setFlightWidth] = useState('110'); // cm
  const [landingDepth, setLandingDepth] = useState('120'); // cm
  const [ceilingHeight, setCeilingHeight] = useState('240'); // cm
  const [turnAngle, setTurnAngle] = useState<90 | 180>(90);
  const [sofaLength, setSofaLength] = useState('200'); // cm
  const [sofaWidth, setSofaWidth] = useState('85'); // cm
  const [sofaHeight, setSofaHeight] = useState('80'); // cm

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

  const stairsResult = evaluateStaircaseLandingTurn(
    {
      lengthMm: (parseFloat(sofaLength) || 0) * 10,
      widthMm: (parseFloat(sofaWidth) || 0) * 10,
      heightMm: (parseFloat(sofaHeight) || 0) * 10,
    },
    {
      flightWidthMm: (parseFloat(flightWidth) || 0) * 10,
      landingDepthMm: (parseFloat(landingDepth) || 0) * 10,
      ceilingHeightMm: (parseFloat(ceilingHeight) || 0) * 10,
      turnAngleDeg: turnAngle,
      hasHandrailObstruction: true,
      handrailWidthMm: 80,
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Wnętrza & Przeprowadzki</Text>
          <Text style={styles.subtitle}>
            Kalkulator floty, wnęki z listwami, ościeżnice i schody (Moving Sofa)
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

          <Text style={[styles.label, { marginTop: 10 }]}>Poziom umeblowania / zagracenia:</Text>
          <View style={styles.clutterSelector}>
            {(['minimalist', 'standard', 'cluttered'] as ClutterLevel[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.clutterBtn, clutter === c && styles.clutterBtnActive]}
                onPress={() => setClutter(c)}
              >
                <Text
                  style={[styles.clutterBtnText, clutter === c && styles.clutterBtnTextActive]}
                >
                  {c === 'minimalist' ? 'Minimalny' : c === 'standard' ? 'Standard' : 'Duży'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultMain}>
              Szacowana kubatura: {relocResult.estimatedVolumeM3} m³
            </Text>
            <Text style={styles.resultHighlight}>
              Rekomendowany pojazd: {relocResult.fleetDescription}
            </Text>
            <Text style={styles.subtext}>
              Boks self-storage: min. {relocResult.recommendedSelfStorageAreaM2} m²
            </Text>
            <Text style={styles.subtext}>
              Potrzebne kartony: ~{relocResult.recommendedBoxesCount} szt. • Waga mienia: ~{relocResult.estimatedWeightKg} kg
            </Text>
          </View>

          <TouchableOpacity
            style={styles.manifestToggleBtn}
            onPress={() => setShowManifest(!showManifest)}
          >
            <Text style={styles.manifestToggleText}>
              {showManifest ? '▲ Ukryj Manifest 4 Fazy' : '▼ Zobacz Manifest Załadunku (Zasada 4 Fazy)'}
            </Text>
          </TouchableOpacity>

          {showManifest && (
            <View style={styles.manifestBox}>
              <Text style={styles.manifestTitle}>📋 Zasada 4 Fazy Załadunku (FitCheck Manifest):</Text>
              <Text style={styles.manifestPhase}>1. Ciężkie AGD i korpusy szaf (Przy grodzi czołowej furgonu)</Text>
              <Text style={styles.manifestPhase}>2. Meble skrzyniowe, komody, stoły i kartony bazowe</Text>
              <Text style={styles.manifestPhase}>3. Wypełniacze, miękkie torby, pościel (Blokowanie luzów)</Text>
              <Text style={styles.manifestPhaseHighlight}>4. Karton „Pierwsza Noc” (Przy drzwiach kontenera / Wyjmowany jako 1.)</Text>
            </View>
          )}
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

          {/* Schemat wizualny wnęki i mebla */}
          <NicheVisualizer
            nicheWidthCm={parseFloat(nicheWidth) || 150}
            nicheDepthCm={parseFloat(nicheDepth) || 60}
            furnitureWidthCm={parseFloat(furnWidth) || 140}
            furnitureDepthCm={parseFloat(furnDepth) || 55}
            skirtingThicknessMm={20}
            fitsNominal={nicheResult.fitsWidth}
            fitsWithSkirting={nicheResult.fitsOverall}
            minClearanceMm={nicheResult.marginWidthMm}
          />
        </View>

        {/* Sekcja 3: Przejście przez ościeżnicę drzwi */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚪 Przejście przez Drzwi i Klamka (RD-33)</Text>
          <Text style={styles.label}>Szerokość drzwi (cm) vs Najmniejszy wymiar mebla (cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={doorWidth}
              onChangeText={setDoorWidth}
              keyboardType="numeric"
              placeholder="Drzwi"
            />
            <Text style={styles.vsText}>vs</Text>
            <TextInput
              style={styles.input}
              value={itemSmallestDim}
              onChangeText={setItemSmallestDim}
              keyboardType="numeric"
              placeholder="Mebel"
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

          {/* Schemat przejścia przez ościeżnicę */}
          <DoorwayVisualizer
            nominalWidthCm={parseFloat(doorWidth) || 80}
            itemCrossSectionCm={parseFloat(itemSmallestDim) || 65}
            doorSwingDeg={90}
            handleOffsetCm={6}
            effectiveWidthCm={doorResult.netClearanceWithHandsMm / 10}
            canPass={doorResult.canPass}
          />
        </View>

        {/* Sekcja 4: Schody i Spocznik (Moving Sofa) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🪜 Schody & Spocznik (Moving Sofa 3D, RD-34)</Text>
          
          <Text style={styles.label}>Kształt klatki schodowej:</Text>
          <View style={styles.turnSelector}>
            <TouchableOpacity
              style={[styles.turnBtn, turnAngle === 90 && styles.turnBtnActive]}
              onPress={() => setTurnAngle(90)}
            >
              <Text style={[styles.turnBtnText, turnAngle === 90 && styles.turnBtnTextActive]}>
                Zakręt L (90°)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.turnBtn, turnAngle === 180 && styles.turnBtnActive]}
              onPress={() => setTurnAngle(180)}
            >
              <Text style={[styles.turnBtnText, turnAngle === 180 && styles.turnBtnTextActive]}>
                Nawrót U (180°)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Bieg W1 (cm):</Text>
              <TextInput
                style={styles.input}
                value={flightWidth}
                onChangeText={setFlightWidth}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <Text style={styles.label}>Spocznik W2 (cm):</Text>
              <TextInput
                style={styles.input}
                value={landingDepth}
                onChangeText={setLandingDepth}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Sufit (cm):</Text>
              <TextInput
                style={styles.input}
                value={ceilingHeight}
                onChangeText={setCeilingHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Wymiary mebla (Dł. × Szer. × Wys. w cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={sofaLength}
              onChangeText={setSofaLength}
              keyboardType="numeric"
              placeholder="Długość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={sofaWidth}
              onChangeText={setSofaWidth}
              keyboardType="numeric"
              placeholder="Szerokość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={sofaHeight}
              onChangeText={setSofaHeight}
              keyboardType="numeric"
              placeholder="Wysokość"
            />
          </View>

          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultHighlight,
                stairsResult.canPass ? styles.successText : styles.alertText,
              ]}
            >
              {stairsResult.canTurnHorizontally
                ? '✅ Obrót płaski możliwy bez unoszenia'
                : stairsResult.canTurnWithVerticalTilt
                ? `⤴️ Wymaga pionizacji / uniesienia pod kątem ${stairsResult.requiredTiltAngleDeg}°`
                : '❌ Zablokowanie! Mebel zaklinuje się na schodach'}
            </Text>
            <Text style={styles.subtext}>
              {stairsResult.bottleneckDescription}
            </Text>
            {stairsResult.warnings.map((w: string, i: number) => (
              <Text key={i} style={styles.warningText}>
                ⚠️ {w}
              </Text>
            ))}
            {stairsResult.recommendations.map((r: string, i: number) => (
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
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  clutterSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    marginTop: 2,
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
  manifestToggleBtn: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#334155',
    borderRadius: 6,
    alignItems: 'center',
  },
  manifestToggleText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  manifestBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  manifestTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  manifestPhase: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  manifestPhaseHighlight: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '700',
    marginTop: 2,
  },
  turnSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  turnBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  turnBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  turnBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  turnBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
