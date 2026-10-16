import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
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
} from '../../src/domain/room-fitting/atticAndErgonomics';
import { sharedCraftTokens } from '../../src/core/craft-suite-theme';

import { NicheVisualizer } from '../../src/components/NicheVisualizer';
import { DoorwayVisualizer } from '../../src/components/DoorwayVisualizer';
import { StaircaseVisualizer } from '../../src/components/StaircaseVisualizer';
import { ElevatorVisualizer } from '../../src/components/ElevatorVisualizer';
import { ApplianceClearanceView } from '../../src/components/ApplianceClearanceView';
import { AtticSlopeVisualizer } from '../../src/components/AtticSlopeVisualizer';
import { SelfStorageVisualizer } from '../../src/components/SelfStorageVisualizer';
import { Apps4BrewPassModal } from '../../src/components/Apps4BrewPassModal';
import { useAppAccess } from '../../src/services/app-access';
import { getDatabaseService, triggerAutoBackup } from '../../src/data/db';
import {
  useUnitSystem,
  formatDimension,
  formatVolume,
  formatWeight,
} from '../../src/lib/unit-converter';
import { t, useLang } from '../../src/lib/i18n';

export default function RelocationScreen() {
  useLang();
  const unitSystem = useUnitSystem();
  const access = useAppAccess();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

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

  // Boks self-storage (RD-50, Z-166)
  const [storageLenM, setStorageLenM] = useState('3.0');
  const [storageWidthM, setStorageWidthM] = useState('2.0');
  const [hasStorageCorridor, setHasStorageCorridor] = useState(true);

  // Ergonomia stref mebli i przejść (Z-172, Z-177, RD-51, DEC-45)
  const [clearanceType, setClearanceType] = useState<FurnitureClearanceType>('HINGED_WARDROBE');
  const [availableClearanceCm, setAvailableClearanceCm] = useState('80');

  // Tragarze i normy BHP (Z-188, RD-53)
  const [porterCargoWeightKg, setPorterCargoWeightKg] = useState('120');
  const [portersCount, setPortersCount] = useState(2);
  const [isOccasionalHandling, setIsOccasionalHandling] = useState(true);

  // Stan windy (RD-35)
  const [elevDepth, setElevDepth] = useState('100'); // cm
  const [elevWidth, setElevWidth] = useState('90'); // cm
  const [elevHeight, setElevHeight] = useState('210'); // cm
  const [elevDoorWidth, setElevDoorWidth] = useState('70'); // cm
  const [elevItemLen, setElevItemLen] = useState('220'); // cm
  const [elevItemWidth, setElevItemWidth] = useState('60'); // cm
  const [elevItemHeight, setElevItemHeight] = useState('4'); // cm

  // Wczytywanie zapisanego projektu z bazy SQLite przy starcie (Persystencja)
  useEffect(() => {
    try {
      const db = getDatabaseService();
      const proj = db.getLatestRelocationProject();
      if (proj) {
        if (proj.origin_area_m2) setAreaM2(String(proj.origin_area_m2));
        if (proj.residents_count) setResidents(String(proj.residents_count));
        if (proj.clutter_level) setClutter(proj.clutter_level as ClutterLevel);
      }
    } catch {
      // fallback
    }
  }, []);

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

  const functionalClearanceResult = evaluateFunctionalClearance(
    clearanceType,
    Math.max(0, (parseFloat(availableClearanceCm) || 0) * 10)
  );

  const porterBhpResult = evaluatePorterManualHandling(
    Math.max(1, parseFloat(porterCargoWeightKg) || 1),
    Math.max(1, portersCount),
    isOccasionalHandling
  );

  const persistRelocationToSQLite = () => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    access.recordProject();
    try {
      const db = getDatabaseService();
      db.saveRelocationProject({
        id: 'default_relocation_project',
        name: `Projekt ${areaM2}m²`,
        origin_type: 'apartment',
        origin_area_m2: parseFloat(areaM2) || 50,
        residents_count: parseInt(residents, 10) || 2,
        clutter_level: clutter,
        total_volume_m3: relocResult.estimatedVolumeM3,
        total_weight_kg: relocResult.estimatedWeightKg,
        recommended_vehicle_type: relocResult.fleetDescription,
      });
      triggerAutoBackup();
      Alert.alert(t('Sukces'), t('Projekt przeprowadzki został trwale zapisany w bazie SQLite i kopii zapasowej.'));
    } catch (e: any) {
      Alert.alert(t('Błąd zapisu'), e?.message ?? 'SQLite error');
    }
  };

  const checkAccessAndSet = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, val: T) => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    setter(val);
  };

  const handleShareRelocationManifest = async () => {
    const lines: string[] = [
      `🚚 ${t('PLAN PRZEPROWADZKI I SEKWENCJA ZAŁADUNKU — FitCheck Manifest (Z-186, RD-49)')}`,
      `${t('Metraż lokalu:')} ${areaM2} m² (${residents} os., umeblowanie: ${clutter})`,
      `${t('Szacowana kubatura:')} ${relocResult.estimatedVolumeM3} m³ (${t('masa mienia:')} ~${formatWeight(relocResult.estimatedWeightKg, unitSystem)})`,
      `${t('Rekomendowana flota:')} ${relocResult.fleetDescription}`,
      `${t('Boks self-storage:')} min. ${relocResult.recommendedSelfStorageAreaM2} m² (wys. 2.7m)`,
      `${t('Szacowane kartony:')} ~${relocResult.recommendedBoxesCount} szt.`,
      '',
      `--- ${t('ZASADA 4 FAZY ZAŁADUNKU FURGONU')} ---`,
      `1. ${t('Faza 1: Ciężkie AGD (pralka, lodówka) i korpusy szaf — montowane przy grodzi czołowej furgonu')}`,
      `2. ${t('Faza 2: Meble skrzyniowe, komody, stoły i standardowe kartony bazowe')}`,
      `3. ${t('Faza 3: Wypełniacze, miękkie torby, pościel (blokowanie luzów w furgonie)')}`,
      `4. ${t('Faza 4: Karton „Pierwsza Noc” (przy drzwiach tylnych / wyjmowany jako 1.)')}`,
      `--- ${t('ZALECENIA BEZPIECZEŃSTWA LOGISTYCZNEGO')} ---`,
      `• ${t('AGD chłodnicze przewoź w pionie lub odczekaj 12-24h przed włączeniem zasilania (Z-189)')}`,
      `• ${t('Używaj pasów transportowych o wytrzymałości min. 500 daN')}`,
      `• ${t('Zespół tragarzy: max 50 kg/osobę dorywczo wg norm BHP (Z-188)')}`,
    ];

    try {
      await Share.share({
        message: lines.join('\n'),
        title: `FitCheck - ${t('Plan Przeprowadzki')} (${areaM2} m²)`,
      });
    } catch {
      // Ignoruj anulowanie
    }
  };

  const dimUnitLabel = unitSystem === 'imperial' ? 'in' : 'cm';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Wnętrza & Przeprowadzki')}</Text>
          <Text style={styles.subtitle}>
            {t('Kalkulator floty, wnęki z listwami, ościeżnice i schody (Moving Sofa)')}
          </Text>
        </View>

        {!access.canCreate && (
          <TouchableOpacity
            style={styles.readOnlyBanner}
            onPress={() => setIsPaywallOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.readOnlyBannerText}>
              🔒 {t('Przeglądasz kalkulacje w trybie do odczytu. Aktywuj Apps4Brew Pass ($0.99), aby edytować parametry i tworzyć nowe plany.')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Sacred Numbers Panel (Przestrzenie Architektoniczne) */}
        <View style={styles.sacredPanel} testID="relocation-sacred-panel">
          <View style={styles.sacredItem}>
            <Text style={styles.sacredLabel}>{t('LUZ DRZWI')}</Text>
            <Text
              style={[
                styles.sacredValue,
                doorResult.canPass ? styles.sacredValueSuccess : styles.sacredValueDanger,
              ]}
            >
              {doorResult.canPass ? '+' : ''}{Math.round(doorResult.netClearanceWithHandsMm / 10)} cm
            </Text>
            <Text style={styles.sacredSub}>
              {doorResult.canPass ? t('Przejdzie') : t('Zablokowanie')}
            </Text>
          </View>
          <View style={styles.sacredDivider} />
          <View style={styles.sacredItem}>
            <Text style={styles.sacredLabel}>{t('OBRÓT SCHODY')}</Text>
            <Text
              style={[
                styles.sacredValue,
                stairsResult.canPass ? styles.sacredValueSuccess : styles.sacredValueDanger,
              ]}
            >
              {stairsResult.canTurnHorizontally
                ? '0°'
                : stairsResult.canTurnWithVerticalTilt
                ? `${stairsResult.requiredTiltAngleDeg}°`
                : 'KOLIZJA'}
            </Text>
            <Text style={styles.sacredSub}>
              {stairsResult.canTurnHorizontally
                ? t('Płaski')
                : stairsResult.canTurnWithVerticalTilt
                ? t('Pionizacja')
                : t('Brak przejścia')}
            </Text>
          </View>
          <View style={styles.sacredDivider} />
          <View style={styles.sacredItem}>
            <Text style={styles.sacredLabel}>{t('NORMA BHP')}</Text>
            <Text
              style={[
                styles.sacredValue,
                porterBhpResult.isCompliant ? styles.sacredValueSuccess : styles.sacredValueDanger,
              ]}
            >
              {Math.round(porterBhpResult.weightPerPorterKg)} kg/os.
            </Text>
            <Text style={styles.sacredSub}>
              {porterBhpResult.isCompliant ? t('Dozwolone') : t('Zakaz!')}
            </Text>
          </View>
        </View>

        {/* Sekcja 1: Kalkulator Przeprowadzki */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚚 {t('Kalkulator Floty Przeprowadzkowej (RD-49)')}</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Metraż (m²):')}</Text>
              <TextInput
                style={styles.input}
                value={areaM2}
                onChangeText={(val) => checkAccessAndSet(setAreaM2, val)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Liczba osób:')}</Text>
              <TextInput
                style={styles.input}
                value={residents}
                onChangeText={(val) => checkAccessAndSet(setResidents, val)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>{t('Poziom umeblowania / zagracenia:')}</Text>
          <View style={styles.clutterSelector}>
            {(['minimalist', 'standard', 'cluttered'] as ClutterLevel[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.clutterBtn, clutter === c && styles.clutterBtnActive]}
                onPress={() => checkAccessAndSet(setClutter, c)}
              >
                <Text
                  style={[styles.clutterBtnText, clutter === c && styles.clutterBtnTextActive]}
                >
                  {c === 'minimalist' ? t('Minimalny') : c === 'standard' ? t('Standard') : t('Duży')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultMain}>
              {t('Szacowana kubatura: {vol} m³', { vol: relocResult.estimatedVolumeM3 })}
            </Text>
            <Text style={styles.resultHighlight}>
              {t('Rekomendowany pojazd: {vehicle}', { vehicle: relocResult.fleetDescription })}
            </Text>
            <Text style={styles.subtext}>
              {t('Boks self-storage: min. {area} m²', { area: relocResult.recommendedSelfStorageAreaM2 })}
            </Text>
            <Text style={styles.subtext}>
              {t('Potrzebne kartony: ~{boxes} szt.', { boxes: relocResult.recommendedBoxesCount })} • {t('Waga mienia: ~{weight}', { weight: formatWeight(relocResult.estimatedWeightKg, unitSystem) })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.manifestToggleBtn}
            onPress={() => setShowManifest(!showManifest)}
          >
            <Text style={styles.manifestToggleText}>
              {showManifest ? t('▲ Ukryj Manifest 4 Fazy') : t('▼ Zobacz Manifest Załadunku (Zasada 4 Fazy)')}
            </Text>
          </TouchableOpacity>

          {showManifest && (
            <View style={styles.manifestBox}>
              <Text style={styles.manifestTitle}>📋 {t('Zasada 4 Fazy Załadunku (FitCheck Manifest):')}</Text>
              <Text style={styles.manifestPhase}>1. {t('Ciężkie AGD i korpusy szaf (Przy grodzi czołowej furgonu)')}</Text>
              <Text style={styles.manifestPhase}>2. {t('Meble skrzyniowe, komody, stoły i kartony bazowe')}</Text>
              <Text style={styles.manifestPhase}>3. {t('Wypełniacze, miękkie torby, pościel (Blokowanie luzów)')}</Text>
              <Text style={styles.manifestPhaseHighlight}>4. {t('Karton „Pierwsza Noc” (Przy drzwiach kontenera / Wyjmowany jako 1.)')}</Text>
            </View>
          )}

          {/* Przycisk Zapisania w SQLite */}
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: '#10B981', marginTop: 12 }]}
            onPress={persistRelocationToSQLite}
          >
            <Text style={styles.shareBtnText}>💾 {t('Zapisz Projekt Przeprowadzki w SQLite')}</Text>
          </TouchableOpacity>

          {/* Przycisk Udostępnienia Manifestu (Z-186) */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareRelocationManifest}
          >
            <Text style={styles.shareBtnText}>📤 {t('Udostępnij Raport Przeprowadzki (Z-186)')}</Text>
          </TouchableOpacity>
        </View>

        {/* Sekcja 1b: Boks Self-Storage z Korytarzem 50 cm (RD-50, Z-166) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 {t('Boks Self-Storage & Ścieżka Inspekcyjna (RD-50)')}</Text>
          <Text style={styles.label}>
            {t('Wymiary boksu magazynowego (Długość × Szerokość w metrach):')}
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Długość (m):')}</Text>
              <TextInput
                style={styles.input}
                value={storageLenM}
                onChangeText={(val) => checkAccessAndSet(setStorageLenM, val)}
                keyboardType="numeric"
                placeholder="3.0"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Szerokość (m):')}</Text>
              <TextInput
                style={styles.input}
                value={storageWidthM}
                onChangeText={(val) => checkAccessAndSet(setStorageWidthM, val)}
                keyboardType="numeric"
                placeholder="2.0"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.manifestToggleBtn, hasStorageCorridor && { borderColor: '#F59E0B' }]}
            onPress={() => checkAccessAndSet(setHasStorageCorridor, !hasStorageCorridor)}
          >
            <Text style={[styles.manifestToggleText, hasStorageCorridor && { color: '#FCD34D' }]}>
              {hasStorageCorridor
                ? t('🚶 Korytarz inspekcyjny 50 cm: AKTYWNY (Łatwy dostęp do kartonów)')
                : t('📦 Bez korytarza: Zapełnienie 100% (Ryzyko braku dostępu)')}
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
          <Text style={styles.cardTitle}>📐 {t('Pasowanie we Wnęce i Listwy (RD-36)')}</Text>
          <Text style={styles.label}>{t('Szerokość wnęki ({u}) vs Szerokość szafy ({u}):', { u: dimUnitLabel })}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={nicheWidth}
              onChangeText={(val) => checkAccessAndSet(setNicheWidth, val)}
              keyboardType="numeric"
              placeholder={t('Wnęka')}
            />
            <Text style={styles.vsText}>vs</Text>
            <TextInput
              style={styles.input}
              value={furnWidth}
              onChangeText={(val) => checkAccessAndSet(setFurnWidth, val)}
              keyboardType="numeric"
              placeholder={t('Szafa')}
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
                ? t('✅ Szafa mieści się we wnęce!')
                : t('❌ Kolizja! Mebel nie wejdzie')}
            </Text>
            {nicheResult.isSkirtingCollision && (
              <Text style={styles.warningText}>
                ⚠️ {t('Uwaga: Mebel mieści się u góry, ale koliduje z listwami przypodłogowymi! (Szerokość przy podłodze to {val} cm)', { val: formatDimension(nicheResult.effectiveWidthAtFloorMm / 10, unitSystem) })}
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
          <Text style={styles.cardTitle}>📐 {t('Skosy Poddasza & Wysokość Użytkowa (RD-48)')}</Text>
          <Text style={styles.label}>
            {t('Wysokość ścianki kolankowej i kąt połaci dachu:')}
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Ścianka kolankowa ({u}):', { u: dimUnitLabel })}</Text>
              <TextInput
                style={styles.input}
                value={kneeWallCm}
                onChangeText={(val) => checkAccessAndSet(setKneeWallCm, val)}
                keyboardType="numeric"
                placeholder="np. 80"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Kąt dachu (stopnie):')}</Text>
              <TextInput
                style={styles.input}
                value={roofPitchDeg}
                onChangeText={(val) => checkAccessAndSet(setRoofPitchDeg, val)}
                keyboardType="numeric"
                placeholder="np. 40"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>{t('Mebel pod skosem (Głęb. × Wys. | Od ściany w cm):')}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={atticFurnDepthCm}
              onChangeText={(val) => checkAccessAndSet(setAtticFurnDepthCm, val)}
              keyboardType="numeric"
              placeholder="Głęb."
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={atticFurnHeightCm}
              onChangeText={(val) => checkAccessAndSet(setAtticFurnHeightCm, val)}
              keyboardType="numeric"
              placeholder="Wys."
            />
            <Text style={styles.vsText}>|</Text>
            <TextInput
              style={styles.input}
              value={atticFurnDistCm}
              onChangeText={(val) => checkAccessAndSet(setAtticFurnDistCm, val)}
              keyboardType="numeric"
              placeholder="Od ściany"
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
          <Text style={styles.cardTitle}>🚪 {t('Przejście przez Drzwi i Klamka (RD-33)')}</Text>
          <Text style={styles.label}>{t('Szerokość drzwi ({u}) vs Najmniejszy wymiar mebla ({u}):', { u: dimUnitLabel })}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={doorWidth}
              onChangeText={(val) => checkAccessAndSet(setDoorWidth, val)}
              keyboardType="numeric"
              placeholder={t('Drzwi')}
            />
            <Text style={styles.vsText}>vs</Text>
            <TextInput
              style={styles.input}
              value={itemSmallestDim}
              onChangeText={(val) => checkAccessAndSet(setItemSmallestDim, val)}
              keyboardType="numeric"
              placeholder={t('Mebel')}
            />
          </View>

          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultHighlight,
                doorResult.canPass ? styles.successText : styles.alertText,
              ]}
            >
              {doorResult.canPass ? t('✅ Przejdzie bezpiecznie z tragarzami') : t('❌ Zablokuje się w drzwiach!')}
            </Text>
            <Text style={styles.subtext}>
              {t('Efektywne światło (klamka -6cm, skrzydło -4.5cm, dłonie -10cm): {val} cm', { val: formatDimension(doorResult.netClearanceWithHandsMm / 10, unitSystem) })}
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
          <Text style={styles.cardTitle}>🪜 {t('Schody & Spocznik (Moving Sofa 3D, RD-34)')}</Text>
          
          <Text style={styles.label}>{t('Kształt klatki schodowej:')}</Text>
          <View style={styles.turnSelector}>
            <TouchableOpacity
              style={[styles.turnBtn, turnAngle === 90 && styles.turnBtnActive]}
              onPress={() => {
                if (!access.canCreate) {
                  setIsPaywallOpen(true);
                  return;
                }
                setTurnAngle(90);
              }}
            >
              <Text style={[styles.turnBtnText, turnAngle === 90 && styles.turnBtnTextActive]}>
                {t('Zakręt L (90°)')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.turnBtn, turnAngle === 180 && styles.turnBtnActive]}
              onPress={() => {
                if (!access.canCreate) {
                  setIsPaywallOpen(true);
                  return;
                }
                setTurnAngle(180);
              }}
            >
              <Text style={[styles.turnBtnText, turnAngle === 180 && styles.turnBtnTextActive]}>
                {t('Nawrót U (180°)')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Bieg W1 ({u}):', { u: dimUnitLabel })}</Text>
              <TextInput
                style={styles.input}
                value={flightWidth}
                onChangeText={(val) => checkAccessAndSet(setFlightWidth, val)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <Text style={styles.label}>{t('Spocznik W2 ({u}):', { u: dimUnitLabel })}</Text>
              <TextInput
                style={styles.input}
                value={landingDepth}
                onChangeText={(val) => checkAccessAndSet(setLandingDepth, val)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Sufit ({u}):', { u: dimUnitLabel })}</Text>
              <TextInput
                style={styles.input}
                value={ceilingHeight}
                onChangeText={(val) => checkAccessAndSet(setCeilingHeight, val)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>{t('Wymiary mebla (Dł. × Szer. × Wys. w cm):')}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={sofaLength}
              onChangeText={(val) => checkAccessAndSet(setSofaLength, val)}
              keyboardType="numeric"
              placeholder="Długość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={sofaWidth}
              onChangeText={(val) => checkAccessAndSet(setSofaWidth, val)}
              keyboardType="numeric"
              placeholder="Szerokość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={sofaHeight}
              onChangeText={(val) => checkAccessAndSet(setSofaHeight, val)}
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
                ? t('✅ Obrót płaski możliwy bez unoszenia')
                : stairsResult.canTurnWithVerticalTilt
                ? t('⤴️ Wymaga pionizacji / uniesienia pod kątem {angle}°', { angle: stairsResult.requiredTiltAngleDeg ?? 0 })
                : t('❌ Zablokowanie! Mebel zaklinuje się na schodach')}
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
          <Text style={styles.cardTitle}>🛗 {t('Winda Osobowa & Towarowa (Przekątna 3D, RD-35)')}</Text>
          <Text style={styles.label}>{t('Typowa kabina windy w bloku:')}</Text>
          <View style={styles.quickPresetRow}>
            {[
              { labelKey: '4-osobowa (Wielka płyta)', d: '100', w: '90', h: '210', door: '70' },
              { labelKey: '8-osobowa (Nowe bloki)', d: '140', w: '110', h: '215', door: '80' },
              { labelKey: 'Towarowa / Szpitalna', d: '210', w: '120', h: '220', door: '90' },
            ].map((p) => {
              const active = elevDepth === p.d && elevWidth === p.w;
              return (
                <TouchableOpacity
                  key={p.labelKey}
                  style={[styles.smallChip, active && styles.smallChipActive]}
                  onPress={() => {
                    if (!access.canCreate) {
                      setIsPaywallOpen(true);
                      return;
                    }
                    setElevDepth(p.d);
                    setElevWidth(p.w);
                    setElevHeight(p.h);
                    setElevDoorWidth(p.door);
                  }}
                >
                  <Text style={[styles.smallChipText, active && styles.smallChipTextActive]}>
                    {t(p.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('Wymiary kabiny (Gł. × Szer. × Wys. w cm) i Drzwi (cm):')}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={elevDepth}
              onChangeText={(val) => checkAccessAndSet(setElevDepth, val)}
              keyboardType="numeric"
              placeholder="Gł"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevWidth}
              onChangeText={(val) => checkAccessAndSet(setElevWidth, val)}
              keyboardType="numeric"
              placeholder="Szer"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevHeight}
              onChangeText={(val) => checkAccessAndSet(setElevHeight, val)}
              keyboardType="numeric"
              placeholder="Wys"
            />
            <Text style={styles.vsText}>|</Text>
            <TextInput
              style={[styles.input, { flex: 0.9 }]}
              value={elevDoorWidth}
              onChangeText={(val) => checkAccessAndSet(setElevDoorWidth, val)}
              keyboardType="numeric"
              placeholder="Drzwi"
            />
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>{t('Przedmiot / Blat / Materac (Dł. × Szer. × Wys. w cm):')}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={elevItemLen}
              onChangeText={(val) => checkAccessAndSet(setElevItemLen, val)}
              keyboardType="numeric"
              placeholder="Długość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevItemWidth}
              onChangeText={(val) => checkAccessAndSet(setElevItemWidth, val)}
              keyboardType="numeric"
              placeholder="Szerokość"
            />
            <Text style={styles.vsText}>×</Text>
            <TextInput
              style={styles.input}
              value={elevItemHeight}
              onChangeText={(val) => checkAccessAndSet(setElevItemHeight, val)}
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
                ? t('✅ Wjedzie windą po przekątnej przestrzennej')
                : !elevatorResult.fitsThroughDoor
                ? t('❌ Zablokuje się w drzwiach windy!')
                : t('❌ Za długi na przekątną (wymagane wnoszenie schodami)')}
            </Text>
            <Text style={styles.subtext}>
              {t('Przekątna kabiny 3D: {diag} • Max długość z buforem 5 cm: {len}', {
                diag: formatDimension(elevatorResult.spatialDiagonalMm / 10, unitSystem),
                len: formatDimension(elevatorResult.maxRigidItemLengthMm / 10, unitSystem),
              })}
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
          <Text style={styles.cardTitle}>❄️ {t('Wymiarowanie Montażowe & Wentylacja AGD (RD-37…RD-51)')}</Text>
          <ApplianceClearanceView />
        </View>

        {/* Sekcja 7: Ergonomia Stref Mebli i Ciągów Komunikacyjnych (Z-172, Z-177, RD-51, DEC-45) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 {t('Ergonomia Stref Mebli i Przejść (RD-51, DEC-45)')}</Text>
          <Text style={styles.subtext}>
            {t('Weryfikacja minimalnych stref wysuwu szuflad, otwarcia frontów i swobody przejścia:')}
          </Text>

          <Text style={[styles.label, { marginTop: 10 }]}>{t('Rodzaj strefy użytkowej:')}</Text>
          <View style={styles.turnSelector}>
            {[
              { type: 'HINGED_WARDROBE', labelKey: '🚪 Szafa (70 cm)' },
              { type: 'CHEST_OF_DRAWERS', labelKey: '🗄️ Szuflady (90 cm)' },
              { type: 'DISHWASHER', labelKey: '🧼 Zmywarka (105 cm)' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.turnBtn, clearanceType === opt.type && styles.turnBtnActive]}
                onPress={() => checkAccessAndSet(setClearanceType, opt.type as FurnitureClearanceType)}
              >
                <Text style={[styles.turnBtnText, clearanceType === opt.type && styles.turnBtnTextActive]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.turnSelector, { marginTop: 6 }]}>
            {[
              { type: 'DINING_CHAIR', labelKey: '🍽️ Krzesło (75 cm)' },
              { type: 'DINING_PASSAGE', labelKey: '🚶‍♂️ Ciąg ze stołem (100 cm)' },
              { type: 'BED_SIDE', labelKey: '🛏️ Bok łóżka (60 cm)' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.turnBtn, clearanceType === opt.type && styles.turnBtnActive]}
                onPress={() => checkAccessAndSet(setClearanceType, opt.type as FurnitureClearanceType)}
              >
                <Text style={[styles.turnBtnText, clearanceType === opt.type && styles.turnBtnTextActive]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Dostępna przestrzeń przed meblem (cm):')}</Text>
              <TextInput
                style={styles.input}
                value={availableClearanceCm}
                onChangeText={(val) => checkAccessAndSet(setAvailableClearanceCm, val)}
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
                ? t('✅ Strefa ergonomiczna i swobodna')
                : t('❌ Zbyt ciasno na swobodne użytkowanie!')}
            </Text>
            <Text style={styles.subtext}>
              {t('Norma: {req} cm • Dostępne: {avail} cm', {
                req: functionalClearanceResult.requiredClearanceMm / 10,
                avail: functionalClearanceResult.availableClearanceMm / 10,
              })} •{' '}
              {functionalClearanceResult.marginMm >= 0
                ? t('Zapas: +{val} cm', { val: functionalClearanceResult.marginMm / 10 })
                : t('Brak: {val} cm', { val: Math.abs(functionalClearanceResult.marginMm / 10) })}
            </Text>
            <Text style={[styles.subtext, { marginTop: 4, color: '#F8FAFC' }]}>
              💡 {functionalClearanceResult.recommendation}
            </Text>
          </View>
        </View>

        {/* Sekcja 8: Tragarze i Dopuszczalne Normy Dźwigania BHP (Z-188, RD-53) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👷 {t('Zespół Tragarzy i Normy Dźwigania BHP (RD-53, Z-188)')}</Text>
          <Text style={styles.subtext}>
            {t('Kontrola dopuszczalnych norm dźwigania ręcznego monolitów (pianino, sejf, szafy dębowe):')}
          </Text>

          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Masa ładunku ({u}):', { u: unitSystem === 'imperial' ? 'lbs' : 'kg' })}</Text>
              <TextInput
                style={styles.input}
                value={porterCargoWeightKg}
                onChangeText={(val) => checkAccessAndSet(setPorterCargoWeightKg, val)}
                keyboardType="numeric"
                placeholder="120"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Liczba tragarzy:')}</Text>
              <View style={styles.turnSelector}>
                {[1, 2, 3, 4].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.turnBtn, portersCount === n && styles.turnBtnActive]}
                    onPress={() => checkAccessAndSet(setPortersCount, n)}
                  >
                    <Text style={[styles.turnBtnText, portersCount === n && styles.turnBtnTextActive]}>
                      {t('{n} os.', { n })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.quickPresetRow}>
            {[
              { labelKey: 'Pralka (65 kg)', w: '65' },
              { labelKey: 'Szafa dąb (90 kg)', w: '90' },
              { labelKey: 'Sejf (120 kg)', w: '120' },
              { labelKey: 'Pianino (220 kg)', w: '220' },
            ].map((p) => (
              <TouchableOpacity
                key={p.w}
                style={[styles.smallChip, porterCargoWeightKg === p.w && styles.smallChipActive]}
                onPress={() => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setPorterCargoWeightKg(p.w);
                }}
              >
                <Text style={[styles.smallChipText, porterCargoWeightKg === p.w && styles.smallChipTextActive]}>
                  {t(p.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 6 }]}>
            <TouchableOpacity
              style={[styles.turnBtn, isOccasionalHandling && styles.turnBtnActive, { flex: 1 }]}
              onPress={() => {
                if (!access.canCreate) {
                  setIsPaywallOpen(true);
                  return;
                }
                setIsOccasionalHandling(true);
              }}
            >
              <Text style={[styles.turnBtnText, isOccasionalHandling && styles.turnBtnTextActive]}>
                {t('Praca dorywcza (50 kg/os.)')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.turnBtn, !isOccasionalHandling && styles.turnBtnActive, { flex: 1, marginLeft: 8 }]}
              onPress={() => {
                if (!access.canCreate) {
                  setIsPaywallOpen(true);
                  return;
                }
                setIsOccasionalHandling(false);
              }}
            >
              <Text style={[styles.turnBtnText, !isOccasionalHandling && styles.turnBtnTextActive]}>
                {t('Praca stała (30 kg/os.)')}
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
                ? t('✅ Zgodne z przepisami BHP')
                : t('❌ ZAKAZ WNOSZENIA RĘCZNEGO!')}
            </Text>
            <Text style={styles.subtext}>
              {t('Obciążenie:')} <Text style={{ fontWeight: '800' }}>{formatWeight(porterBhpResult.weightPerPorterKg, unitSystem)}/osobę</Text> (limit: {porterBhpResult.isOccasionalHandling ? 50 : 30} kg/os.)
            </Text>
            <Text style={[styles.subtext, { marginTop: 4, color: '#F8FAFC' }]}>
              {porterBhpResult.legalAdvisory}
            </Text>
            {porterBhpResult.requiresMechanicalEquipment && (
              <Text style={[styles.warningText, { marginTop: 6 }]}>
                ⚠️ {t('Waga przekracza 150 kg — bezwzględny wymóg użycia schodołazu lub pasów nośnych na ramiona.')}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal Paywalla impulsowego Apps4Brew Pass */}
      <Apps4BrewPassModal
        visible={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
  },
  sacredPanel: {
    flexDirection: 'row',
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: sharedCraftTokens.colors.border,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sacredItem: {
    alignItems: 'center',
    flex: 1,
  },
  sacredDivider: {
    width: 1,
    height: '70%',
    backgroundColor: sharedCraftTokens.colors.border,
  },
  sacredLabel: {
    color: sharedCraftTokens.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  sacredValue: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sacredValueSuccess: {
    color: '#10B981',
  },
  sacredValueDanger: {
    color: '#EF4444',
  },
  sacredSub: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
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
  readOnlyBanner: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  readOnlyBannerText: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: '#38BDF8',
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
  },
  manifestPhase: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  manifestPhaseHighlight: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '700',
    marginTop: 4,
  },
  turnSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  turnBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  turnBtnActive: {
    backgroundColor: '#0284C7',
  },
  turnBtnText: {
    color: '#CBD5E1',
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
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  smallChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  smallChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  smallChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  smallChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  resultBoxSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
  },
  resultBoxAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#F87171',
  },
  shareBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
