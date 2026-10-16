import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { estimateRelocationVolume, ClutterLevel } from '../../src/domain/relocation/volumeEstimator';
import { evaluateNicheFit } from '../../src/domain/room-fitting/nicheCalculator';
import { calculateDoorwayClearance } from '../../src/domain/doors-stairs/doorwayClearance';
import { evaluateStaircaseLandingTurn } from '../../src/domain/doors-stairs/staircaseRotation';
import { calculateElevatorFit } from '../../src/domain/doors-stairs/elevatorDiagonal';
import {
  calculateSelfStorageCapacity,
  analyzeAtticSlope,
  evaluateFurnitureUnderSlope,
  evaluateFunctionalClearance,
  evaluatePorterManualHandling,
  FurnitureClearanceType,
  RECOMMENDED_CLEARANCES_MM,
} from '../../src/domain/room-fitting/atticAndErgonomics';
import { compareCarVsVanRelocation } from '../../src/domain/relocation/vanVsCarEconomics';
import { NicheVisualizer } from '../../src/components/NicheVisualizer';
import { DoorwayVisualizer } from '../../src/components/DoorwayVisualizer';
import { StaircaseVisualizer } from '../../src/components/StaircaseVisualizer';
import { ElevatorVisualizer } from '../../src/components/ElevatorVisualizer';
import { ApplianceClearanceView } from '../../src/components/ApplianceClearanceView';
import { AtticSlopeVisualizer } from '../../src/components/AtticSlopeVisualizer';
import { SelfStorageVisualizer } from '../../src/components/SelfStorageVisualizer';

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

  // Stan poddasza i skosów (RD-48)
  const [kneeWallCm, setKneeWallCm] = useState('80');
  const [roofPitchDeg, setRoofPitchDeg] = useState('40');
  const [atticFurnDepthCm, setAtticFurnDepthCm] = useState('60');
  const [atticFurnHeightCm, setAtticFurnHeightCm] = useState('140');
  const [atticFurnDistCm, setAtticFurnDistCm] = useState('50');

  // Porównanie osobówka vs van (Z-164)
  const [distanceKm, setDistanceKm] = useState('25');
  const [vanRentalFee, setVanRentalFee] = useState('180');

  // Boks self-storage (RD-50, Z-166)
  const [storageLenM, setStorageLenM] = useState('3.0');
  const [storageWidthM, setStorageWidthM] = useState('2.0');
  const [hasStorageCorridor, setHasStorageCorridor] = useState(true);

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

  // Stan windy (RD-35)
  const [elevDepth, setElevDepth] = useState('100'); // cm
  const [elevWidth, setElevWidth] = useState('90'); // cm
  const [elevHeight, setElevHeight] = useState('210'); // cm
  const [elevDoorWidth, setElevDoorWidth] = useState('70'); // cm
  const [elevItemLen, setElevItemLen] = useState('220'); // cm
  const [elevItemWidth, setElevItemWidth] = useState('60'); // cm
  const [elevItemHeight, setElevItemHeight] = useState('4'); // cm

  const elevatorResult = calculateElevatorFit(
    {
      lengthMm: (parseFloat(elevItemLen) || 0) * 10,
      widthMm: (parseFloat(elevItemWidth) || 0) * 10,
      heightMm: (parseFloat(elevItemHeight) || 0) * 10,
    },
    {
      depthMm: (parseFloat(elevDepth) || 0) * 10,
      widthMm: (parseFloat(elevWidth) || 0) * 10,
      heightMm: (parseFloat(elevHeight) || 0) * 10,
      doorWidthMm: (parseFloat(elevDoorWidth) || 0) * 10,
      doorHeightMm: 2000,
    }
  );

  const parsedKneeWallMm = Math.max(0, (parseFloat(kneeWallCm) || 80) * 10);
  const parsedRoofPitch = Math.min(89, Math.max(1, parseFloat(roofPitchDeg) || 40));
  const parsedAtticFurnDepthMm = Math.max(10, (parseFloat(atticFurnDepthCm) || 60) * 10);
  const parsedAtticFurnHeightMm = Math.max(10, (parseFloat(atticFurnHeightCm) || 140) * 10);
  const parsedAtticFurnDistMm = Math.max(0, (parseFloat(atticFurnDistCm) || 50) * 10);

  const atticSlopeAnalysis = analyzeAtticSlope({
    kneeWallHeightMm: parsedKneeWallMm,
    roofPitchDeg: parsedRoofPitch,
  });

  const atticFurnCheck = evaluateFurnitureUnderSlope(
    {
      widthMm: 1000,
      depthMm: parsedAtticFurnDepthMm,
      heightMm: parsedAtticFurnHeightMm,
    },
    {
      kneeWallHeightMm: parsedKneeWallMm,
      roofPitchDeg: parsedRoofPitch,
    },
    parsedAtticFurnDistMm
  );

  // Porównanie ekonomiczne: osobówka vs van (Z-164)
  const tripComparison = compareCarVsVanRelocation({
    totalVolumeM3: Math.max(0.5, relocResult.estimatedVolumeM3),
    distanceOneWayKm: Math.max(1, parseFloat(distanceKm) || 25),
    vanDailyRentalFeePln: Math.max(50, parseFloat(vanRentalFee) || 180),
  });

  // Boks self-storage (RD-50, Z-166)
  const parsedStorageLen = Math.max(0.5, parseFloat(storageLenM) || 3.0);
  const parsedStorageWidth = Math.max(0.5, parseFloat(storageWidthM) || 2.0);
  const selfStorageResult = calculateSelfStorageCapacity({
    lengthM: parsedStorageLen,
    widthM: parsedStorageWidth,
    heightM: 2.5,
    hasInspectionCorridor: hasStorageCorridor,
    corridorWidthM: 0.50,
  });

  // Ergonomia stref mebli i przejść (Z-172, Z-177, RD-51, DEC-45)
  const [clearanceType, setClearanceType] = useState<FurnitureClearanceType>('HINGED_WARDROBE');
  const [availableClearanceCm, setAvailableClearanceCm] = useState('80');

  // Tragarze i normy BHP (Z-188, RD-53)
  const [porterCargoWeightKg, setPorterCargoWeightKg] = useState('120');
  const [portersCount, setPortersCount] = useState(2);
  const [isOccasionalHandling, setIsOccasionalHandling] = useState(true);

  const functionalClearanceResult = evaluateFunctionalClearance(
    clearanceType,
    Math.max(0, (parseFloat(availableClearanceCm) || 0) * 10)
  );

  const porterBhpResult = evaluatePorterManualHandling(
    Math.max(1, parseFloat(porterCargoWeightKg) || 1),
    Math.max(1, portersCount),
    isOccasionalHandling
  );

  const handleShareRelocationManifest = async () => {
    const lines: string[] = [
      `🚚 PLAN PRZEPROWADZKI I SEKWENCJA ZAŁADUNKU — FitCheck Manifest (Z-186, RD-49)`,
      `Metraż lokalu: ${areaM2} m² (${residents} os., umeblowanie: ${clutter})`,
      `Szacowana kubatura: ${relocResult.estimatedVolumeM3} m³ (masa mienia: ~${relocResult.estimatedWeightKg} kg)`,
      `Rekomendowana flota: ${relocResult.fleetDescription}`,
      `Boks self-storage: min. ${relocResult.recommendedSelfStorageAreaM2} m² (wys. 2.7m)`,
      `Szacowane kartony: ~${relocResult.recommendedBoxesCount} szt.`,
      '',
      '--- ZASADA 4 FAZY ZAŁADUNKU FURGONU ---',
      '1. Faza 1: Ciężkie AGD (pralka, lodówka) i korpusy szaf — montowane przy grodzi czołowej furgonu',
      '2. Faza 2: Meble skrzyniowe, komody, stoły i standardowe kartony bazowe',
      '3. Faza 3: Wypełniacze, miękkie torby, pościel (blokowanie luzów w furgonie)',
      '4. Faza 4: Karton „Pierwsza Noc” (przy drzwiach tylnych / wyjmowany jako 1.)',
      '',
      '--- RACHUNEK EKONOMICZNY: OSOBÓWKA VS VAN (Z-164) ---',
      `Odległość: ${distanceKm} km (w jedną stronę)`,
      `Rekomendacja: ${tripComparison.isVanRecommended ? 'Wynajem Busa' : 'Kursy Osobówką'}`,
      `Osobówka: ${tripComparison.carTripsCount} kursów, paliwo i amortyzacja: ${tripComparison.carTotalCostPln} zł`,
      `Van: ${tripComparison.vanTripsCount} kurs, koszt łączny: ${tripComparison.vanTotalCostPln} zł`,
      '',
      '--- ZALECENIA BEZPIECZEŃSTWA LOGISTYCZNEGO ---',
      '• AGD chłodnicze przewoź w pionie lub odczekaj 12-24h przed włączeniem zasilania (Z-189)',
      '• Używaj pasów transportowych o wytrzymałości min. 500 daN',
      '• Zespół tragarzy: max 50 kg/osobę dorywczo wg norm BHP (Z-188)',
    ];

    try {
      await Share.share({
        message: lines.join('\n'),
        title: `FitCheck - Plan Przeprowadzki (${areaM2} m²)`,
      });
    } catch {
      // Ignoruj anulowanie
    }
  };

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

          {/* Rachunek Ekonomiczny: Osobówka vs Van (Z-164) */}
          <View style={[styles.resultBox, { marginTop: 12, backgroundColor: '#0F172A' }]}>
            <Text style={[styles.cardTitle, { fontSize: 14, color: '#38BDF8', marginBottom: 8 }]}>
              💰 Porównanie: Osobówka vs Wynajem Busa (Z-164)
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Odległość w 1 stronę (km):</Text>
                <TextInput
                  style={styles.input}
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                  keyboardType="numeric"
                  placeholder="25"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>Koszt vana (zł/doba):</Text>
                <TextInput
                  style={styles.input}
                  value={vanRentalFee}
                  onChangeText={setVanRentalFee}
                  keyboardType="numeric"
                  placeholder="180"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Kombi ({tripComparison.carTripsCount} kursy):</Text>
                <Text style={[styles.resultHighlight, { fontSize: 15, color: '#F8FAFC' }]}>
                  {tripComparison.carTotalCostPln} zł • {tripComparison.carTotalTimeHours}h
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>Bus van ({tripComparison.vanTripsCount} kurs):</Text>
                <Text style={[styles.resultHighlight, { fontSize: 15, color: '#34D399' }]}>
                  {tripComparison.vanTotalCostPln} zł • {tripComparison.vanTotalTimeHours}h
                </Text>
              </View>
            </View>

            <Text style={[styles.subtext, { fontWeight: '700', color: tripComparison.isVanRecommended ? '#34D399' : '#F59E0B' }]}>
              {tripComparison.economicVerdict}
            </Text>
            <Text style={[styles.subtext, { marginTop: 2, color: '#94A3B8' }]}>
              💡 {tripComparison.recommendation}
            </Text>
          </View>

          {/* Przycisk Udostępnienia Manifestu (Z-186) */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareRelocationManifest}
          >
            <Text style={styles.shareBtnText}>📤 Udostępnij Raport Przeprowadzki (Z-186)</Text>
          </TouchableOpacity>
        </View>

        {/* Sekcja 1b: Boks Self-Storage z Korytarzem 50 cm (RD-50, Z-166) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Boks Self-Storage & Ścieżka Inspekcyjna (RD-50)</Text>
          <Text style={styles.label}>
            Wymiary boksu magazynowego (Długość × Szerokość w metrach):
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Długość (m):</Text>
              <TextInput
                style={styles.input}
                value={storageLenM}
                onChangeText={setStorageLenM}
                keyboardType="numeric"
                placeholder="3.0"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Szerokość (m):</Text>
              <TextInput
                style={styles.input}
                value={storageWidthM}
                onChangeText={setStorageWidthM}
                keyboardType="numeric"
                placeholder="2.0"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.manifestToggleBtn, hasStorageCorridor && { borderColor: '#F59E0B' }]}
            onPress={() => setHasStorageCorridor(!hasStorageCorridor)}
          >
            <Text style={[styles.manifestToggleText, hasStorageCorridor && { color: '#FCD34D' }]}>
              {hasStorageCorridor
                ? '🚶 Korytarz inspekcyjny 50 cm: AKTYWNY (Łatwy dostęp do kartonów)'
                : '📦 Bez korytarza: Zapełnienie 100% (Ryzyko braku dostępu)'}
            </Text>
          </TouchableOpacity>

          <SelfStorageVisualizer
            lengthM={parsedStorageLen}
            widthM={parsedStorageWidth}
            heightM={2.5}
            hasInspectionCorridor={hasStorageCorridor}
            corridorWidthM={0.50}
            usableStorageAreaM2={selfStorageResult.usableStorageAreaM2}
            totalFloorAreaM2={selfStorageResult.totalFloorAreaM2}
            corridorLossPct={selfStorageResult.corridorLossPct}
          />
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

        {/* Sekcja 2b: Skosy Poddasza i Wstawienie Mebla (RD-48, DEC-57) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 Skosy Poddasza & Wysokość Użytkowa (RD-48)</Text>
          <Text style={styles.label}>
            Wysokość ścianki kolankowej i kąt połaci dachu:
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ścianka kolankowa (cm):</Text>
              <TextInput
                style={styles.input}
                value={kneeWallCm}
                onChangeText={setKneeWallCm}
                keyboardType="numeric"
                placeholder="np. 80"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Kąt dachu (stopnie):</Text>
              <TextInput
                style={styles.input}
                value={roofPitchDeg}
                onChangeText={setRoofPitchDeg}
                keyboardType="numeric"
                placeholder="np. 40"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Mebel pod skosem (Głęb. × Wys. | Od ściany w cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={atticFurnDepthCm}
              onChangeText={setAtticFurnDepthCm}
              keyboardType="numeric"
              placeholder="Głęb. cm"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={atticFurnHeightCm}
              onChangeText={setAtticFurnHeightCm}
              keyboardType="numeric"
              placeholder="Wys. cm"
            />
            <Text style={styles.vsText}>|</Text>
            <TextInput
              style={styles.input}
              value={atticFurnDistCm}
              onChangeText={setAtticFurnDistCm}
              keyboardType="numeric"
              placeholder="Od ściany cm"
            />
          </View>

          <AtticSlopeVisualizer
            kneeWallHeightMm={parsedKneeWallMm}
            roofPitchDeg={parsedRoofPitch}
            furnitureDepthMm={parsedAtticFurnDepthMm}
            furnitureHeightMm={parsedAtticFurnHeightMm}
            distanceFromKneeWallMm={parsedAtticFurnDistMm}
            fitsUnderSlope={atticFurnCheck.fitsUnderSlope}
            minRequiredDistanceFromWallMm={atticFurnCheck.minRequiredDistanceFromWallMm}
            distanceToStandingHeight190Mm={atticSlopeAnalysis.distanceToStandingHeight190Mm}
            distanceToLowZone140Mm={atticSlopeAnalysis.distanceToLowZone140Mm}
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

          {/* Schemat rzutu spocznika i obrotu mebla */}
          <StaircaseVisualizer
            flightWidthCm={parseFloat(flightWidth) || 110}
            landingDepthCm={parseFloat(landingDepth) || 120}
            turnAngleDeg={turnAngle}
            itemLengthCm={parseFloat(sofaLength) || 200}
            itemWidthCm={parseFloat(sofaWidth) || 85}
            canTurnHorizontally={stairsResult.canTurnHorizontally}
            canTurnWithVerticalTilt={stairsResult.canTurnWithVerticalTilt}
            requiredTiltAngleDeg={stairsResult.requiredTiltAngleDeg}
            canPass={stairsResult.canPass}
            bottleneckDescription={stairsResult.bottleneckDescription}
          />
        </View>

        {/* Sekcja 5: Winda Osobowa & Towarowa (Przekątna 3D, RD-35) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛗 Winda Osobowa & Towarowa (Przekątna 3D, RD-35)</Text>
          <Text style={styles.label}>Typowa kabina windy w bloku:</Text>
          <View style={styles.quickPresetRow}>
            {[
              { label: '4-osobowa (Wielka płyta)', d: '100', w: '90', h: '210', door: '70' },
              { label: '8-osobowa (Nowe bloki)', d: '140', w: '110', h: '215', door: '80' },
              { label: 'Towarowa / Szpitalna', d: '210', w: '120', h: '220', door: '90' },
            ].map((p) => {
              const active = elevDepth === p.d && elevWidth === p.w;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.smallChip, active && styles.smallChipActive]}
                  onPress={() => {
                    setElevDepth(p.d);
                    setElevWidth(p.w);
                    setElevHeight(p.h);
                    setElevDoorWidth(p.door);
                  }}
                >
                  <Text style={[styles.smallChipText, active && styles.smallChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Wymiary kabiny (Gł. × Szer. × Wys. w cm) i Drzwi (cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={elevDepth}
              onChangeText={setElevDepth}
              keyboardType="numeric"
              placeholder="Gł"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevWidth}
              onChangeText={setElevWidth}
              keyboardType="numeric"
              placeholder="Szer"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevHeight}
              onChangeText={setElevHeight}
              keyboardType="numeric"
              placeholder="Wys"
            />
            <Text style={styles.vsText}>|</Text>
            <TextInput
              style={[styles.input, { flex: 0.9 }]}
              value={elevDoorWidth}
              onChangeText={setElevDoorWidth}
              keyboardType="numeric"
              placeholder="Drzwi"
            />
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Przedmiot / Blat / Materac (Dł. × Szer. × Wys. w cm):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={elevItemLen}
              onChangeText={setElevItemLen}
              keyboardType="numeric"
              placeholder="Długość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevItemWidth}
              onChangeText={setElevItemWidth}
              keyboardType="numeric"
              placeholder="Szerokość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevItemHeight}
              onChangeText={setElevItemHeight}
              keyboardType="numeric"
              placeholder="Grubość"
            />
          </View>

          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultHighlight,
                elevatorResult.fitsInsideCabin ? styles.successText : styles.alertText,
              ]}
            >
              {elevatorResult.fitsInsideCabin
                ? '✅ Wjedzie windą po przekątnej przestrzennej'
                : !elevatorResult.fitsThroughDoor
                ? '❌ Zablokuje się w drzwiach windy!'
                : '❌ Za długi na przekątną (wymagane wnoszenie schodami)'}
            </Text>
            <Text style={styles.subtext}>
              Przekątna kabiny 3D: {Math.round(elevatorResult.spatialDiagonalMm / 10)} cm • Max długość z buforem 5 cm: {Math.round(elevatorResult.maxRigidItemLengthMm / 10)} cm
            </Text>
            {elevatorResult.warnings.map((w: string, i: number) => (
              <Text key={i} style={styles.warningText}>
                ⚠️ {w}
              </Text>
            ))}
          </View>

          <ElevatorVisualizer
            cabinDepthCm={parseFloat(elevDepth) || 100}
            cabinWidthCm={parseFloat(elevWidth) || 90}
            cabinHeightCm={parseFloat(elevHeight) || 210}
            doorWidthCm={parseFloat(elevDoorWidth) || 70}
            itemLengthCm={parseFloat(elevItemLen) || 220}
            itemWidthCm={parseFloat(elevItemWidth) || 60}
            spatialDiagonalCm={elevatorResult.spatialDiagonalMm / 10}
            maxRigidLengthCm={elevatorResult.maxRigidItemLengthMm / 10}
            fitsThroughDoor={elevatorResult.fitsThroughDoor}
            fitsInsideCabin={elevatorResult.fitsInsideCabin}
          />
        </View>

        {/* Sekcja 6: Wymiarowanie Montażowe i Wentylacja AGD (RD-37, RD-38, RD-39, RD-51) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>❄️ Wymiarowanie Montażowe & Wentylacja AGD (RD-37…RD-51)</Text>
          <ApplianceClearanceView />
        </View>

        {/* Sekcja 7: Ergonomia Stref Mebli i Ciągów Komunikacyjnych (Z-172, Z-177, RD-51, DEC-45) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 Ergonomia Stref Mebli i Przejść (RD-51, DEC-45)</Text>
          <Text style={styles.subtext}>
            Weryfikacja minimalnych stref wysuwu szuflad, otwarcia frontów i swobody przejścia:
          </Text>

          <Text style={[styles.label, { marginTop: 10 }]}>Rodzaj strefy użytkowej:</Text>
          <View style={styles.turnSelector}>
            {[
              { type: 'HINGED_WARDROBE', label: '🚪 Szafa (70 cm)' },
              { type: 'CHEST_OF_DRAWERS', label: '🗄️ Szuflady (90 cm)' },
              { type: 'DISHWASHER', label: '🧼 Zmywarka (105 cm)' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.turnBtn, clearanceType === opt.type && styles.turnBtnActive]}
                onPress={() => setClearanceType(opt.type as FurnitureClearanceType)}
              >
                <Text style={[styles.turnBtnText, clearanceType === opt.type && styles.turnBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.turnSelector, { marginTop: 6 }]}>
            {[
              { type: 'DINING_CHAIR', label: '🍽️ Krzesło (75 cm)' },
              { type: 'DINING_PASSAGE', label: '🚶‍♂️ Ciąg ze stołem (100 cm)' },
              { type: 'BED_SIDE', label: '🛏️ Bok łóżka (60 cm)' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.turnBtn, clearanceType === opt.type && styles.turnBtnActive]}
                onPress={() => setClearanceType(opt.type as FurnitureClearanceType)}
              >
                <Text style={[styles.turnBtnText, clearanceType === opt.type && styles.turnBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Dostępna przestrzeń przed meblem (cm):</Text>
              <TextInput
                style={styles.input}
                value={availableClearanceCm}
                onChangeText={setAvailableClearanceCm}
                keyboardType="numeric"
                placeholder="np. 80"
              />
            </View>
          </View>

          <View
            style={[
              styles.resultBox,
              functionalClearanceResult.isErgonomic ? styles.resultBoxSuccess : styles.resultBoxAlert,
            ]}
          >
            <Text
              style={[
                styles.resultHighlight,
                functionalClearanceResult.isErgonomic ? styles.successText : styles.alertText,
              ]}
            >
              {functionalClearanceResult.isErgonomic
                ? '✅ Strefa ergonomiczna i swobodna'
                : '❌ Zbyt ciasno na swobodne użytkowanie!'}
            </Text>
            <Text style={styles.subtext}>
              Norma: {functionalClearanceResult.requiredClearanceMm / 10} cm • Dostępne: {functionalClearanceResult.availableClearanceMm / 10} cm •{' '}
              {functionalClearanceResult.marginMm >= 0 ? `Zapas: +${functionalClearanceResult.marginMm / 10} cm` : `Brak: ${Math.abs(functionalClearanceResult.marginMm / 10)} cm`}
            </Text>
            <Text style={[styles.subtext, { marginTop: 4, color: '#F8FAFC' }]}>
              💡 {functionalClearanceResult.recommendation}
            </Text>
          </View>
        </View>

        {/* Sekcja 8: Tragarze i Dopuszczalne Normy Dźwigania BHP (Z-188, RD-53) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👷 Zespół Tragarzy i Normy Dźwigania BHP (RD-53, Z-188)</Text>
          <Text style={styles.subtext}>
            Kontrola dopuszczalnych norm dźwigania ręcznego monolitów (pianino, sejf, szafy dębowe):
          </Text>

          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Masa ładunku (kg):</Text>
              <TextInput
                style={styles.input}
                value={porterCargoWeightKg}
                onChangeText={setPorterCargoWeightKg}
                keyboardType="numeric"
                placeholder="120"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Liczba tragarzy:</Text>
              <View style={styles.turnSelector}>
                {[1, 2, 3, 4].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.turnBtn, portersCount === n && styles.turnBtnActive]}
                    onPress={() => setPortersCount(n)}
                  >
                    <Text style={[styles.turnBtnText, portersCount === n && styles.turnBtnTextActive]}>
                      {n} os.
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.quickPresetRow}>
            {[
              { label: 'Pralka (65 kg)', w: '65' },
              { label: 'Szafa dąb (90 kg)', w: '90' },
              { label: 'Sejf (120 kg)', w: '120' },
              { label: 'Pianino (220 kg)', w: '220' },
            ].map((p) => (
              <TouchableOpacity
                key={p.w}
                style={[styles.smallChip, porterCargoWeightKg === p.w && styles.smallChipActive]}
                onPress={() => setPorterCargoWeightKg(p.w)}
              >
                <Text style={[styles.smallChipText, porterCargoWeightKg === p.w && styles.smallChipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 6 }]}>
            <TouchableOpacity
              style={[styles.turnBtn, isOccasionalHandling && styles.turnBtnActive, { flex: 1 }]}
              onPress={() => setIsOccasionalHandling(true)}
            >
              <Text style={[styles.turnBtnText, isOccasionalHandling && styles.turnBtnTextActive]}>
                Praca dorywcza (50 kg/os.)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.turnBtn, !isOccasionalHandling && styles.turnBtnActive, { flex: 1, marginLeft: 8 }]}
              onPress={() => setIsOccasionalHandling(false)}
            >
              <Text style={[styles.turnBtnText, !isOccasionalHandling && styles.turnBtnTextActive]}>
                Praca stała (30 kg/os.)
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.resultBox,
              porterBhpResult.isCompliant ? styles.resultBoxSuccess : styles.resultBoxAlert,
            ]}
          >
            <Text
              style={[
                styles.resultHighlight,
                porterBhpResult.isCompliant ? styles.successText : styles.alertText,
              ]}
            >
              {porterBhpResult.isCompliant
                ? '✅ Zgodne z przepisami BHP'
                : '❌ ZAKAZ WNOSZENIA RĘCZNEGO!'}
            </Text>
            <Text style={styles.subtext}>
              Obciążenie: <Text style={{ fontWeight: '800' }}>{porterBhpResult.weightPerPorterKg} kg/osobę</Text> (limit: {porterBhpResult.isOccasionalHandling ? 50 : 30} kg/os.)
            </Text>
            <Text style={[styles.subtext, { marginTop: 4, color: '#F8FAFC' }]}>
              {porterBhpResult.legalAdvisory}
            </Text>
            {porterBhpResult.requiresMechanicalEquipment && (
              <Text style={[styles.warningText, { marginTop: 6 }]}>
                ⚠️ Waga przekracza 150 kg — bezwzględny wymóg użycia schodołazu lub pasów nośnych na ramiona.
              </Text>
            )}
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
  quickPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  smallChip: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  smallChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0369A1',
  },
  smallChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  smallChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultBoxSuccess: {
    borderLeftWidth: 3,
    borderLeftColor: '#34D399',
  },
  resultBoxAlert: {
    borderLeftWidth: 3,
    borderLeftColor: '#F87171',
  },
  shareBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
