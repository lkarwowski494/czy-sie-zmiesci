import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { evaluateGarageFit, evaluateRoofSetupHeight } from '../../src/domain/garage/garageClearance';
import { evaluateTowbarLoad, Bicycle } from '../../src/domain/garage/towbarPhysics';
import {
  calculateRoofRackLoad,
  validateCargoOverhang,
  evaluateFalseFloorLoad,
} from '../../src/domain/garage/roofAndOverhang';
import { evaluateDogKennelFit } from '../../src/domain/garage/dogKennel';
import { GarageVisualizer } from '../../src/components/GarageVisualizer';
import { TowbarVisualizer } from '../../src/components/TowbarVisualizer';
import { RoofRackVisualizer } from '../../src/components/RoofRackVisualizer';
import { DogKennelVisualizer } from '../../src/components/DogKennelVisualizer';
import { Apps4BrewPassModal } from '../../src/components/Apps4BrewPassModal';
import { useAppAccess } from '../../src/services/app-access';
import { getDatabaseService, triggerAutoBackup } from '../../src/data/db';
import { useUnitSystem, formatDimension, formatWeight } from '../../src/lib/unit-converter';
import { t } from '../../src/lib/i18n';

export default function GarageScreen() {
  const access = useAppAccess();
  const unitSystem = useUnitSystem();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Garaż: wymiary pojazdu i bramy
  const [gateWidth, setGateWidth] = useState('240'); // cm
  const [carWidthMirrors, setCarWidthMirrors] = useState('208'); // cm
  const [carWidthFolded, setCarWidthFolded] = useState('188'); // cm
  const [garageCeiling, setGarageCeiling] = useState('220'); // cm
  const [tailgateHeight, setTailgateHeight] = useState('205'); // cm

  // Box dachowy / parking podziemny
  const [carHeight, setCarHeight] = useState('155'); // cm
  const [roofBarsHeight, setRoofBarsHeight] = useState('8'); // cm
  const [roofCargoHeight, setRoofCargoHeight] = useState('42'); // cm (np. Thule Motion 3)

  // Obciążenie dachu i zwisy (RD-45, RD-52)
  const [roofRailLimit, setRoofRailLimit] = useState<'50' | '75' | '100'>('75');
  const [crossbarsWeightKg, setCrossbarsWeightKg] = useState('5');
  const [roofBoxWeightKg, setRoofBoxWeightKg] = useState('18');
  const [roofCargoWeightKg, setRoofCargoWeightKg] = useState('35');
  const [frontOverhangCm, setFrontOverhangCm] = useState('20');
  const [rearOverhangCm, setRearOverhangCm] = useState('45');

  // Hak holowniczy i rowery
  const [hookLimit, setHookLimit] = useState<'50' | '75' | '100'>('75');
  const [rackWeight, setRackWeight] = useState('18'); // kg
  const [bikeCount, setBikeCount] = useState<number>(2);
  const [isEBike, setIsEBike] = useState<boolean>(true);

  // Klatka kennelowa dla psa (RD-46, Z-184)
  const [kennelWidthCm, setKennelWidthCm] = useState('65');
  const [kennelDepthBottomCm, setKennelDepthBottomCm] = useState('85');
  const [kennelDepthTopCm, setKennelDepthTopCm] = useState('50');
  const [kennelHeightCm, setKennelHeightCm] = useState('65');
  const [windowSlopeDeg, setWindowSlopeDeg] = useState('35');

  // Podwójna podłoga bagażnika (RD-47, Z-185)
  const [hasFalseFloor, setHasFalseFloor] = useState(true);
  const [pointLoadKg, setPointLoadKg] = useState('80');

  // Wczytywanie zapisanego profilu garażu i haka z SQLite przy starcie (Persystencja)
  useEffect(() => {
    try {
      const db = getDatabaseService();
      const profile = db.getLatestGarageProfile();
      if (profile) {
        if (profile.gate_width_cm) setGateWidth(String(profile.gate_width_cm));
        if (profile.ceiling_height_cm) setGarageCeiling(String(profile.ceiling_height_cm));
      }

      const vehicles = db.getAllVehicles();
      const vehicleId = String(vehicles[0]?.id ?? 'veh_skoda_octavia_4_combi');
      const towbar = db.getTowbarRoofConfig(vehicleId);
      if (towbar) {
        if (towbar.towbar_s_limit_kg) setHookLimit(String(towbar.towbar_s_limit_kg) as any);
        if (towbar.bike_rack_weight_kg) setRackWeight(String(towbar.bike_rack_weight_kg));
        if (typeof towbar.bikes_count === 'number') setBikeCount(towbar.bikes_count);
        if (towbar.roof_limit_kg) setRoofRailLimit(String(towbar.roof_limit_kg) as any);
        if (towbar.bars_weight_kg) setCrossbarsWeightKg(String(towbar.bars_weight_kg));
        if (towbar.roof_box_weight_kg) setRoofBoxWeightKg(String(towbar.roof_box_weight_kg));
        if (towbar.roof_cargo_weight_kg) setRoofCargoWeightKg(String(towbar.roof_cargo_weight_kg));
      }
    } catch {
      // fallback
    }
  }, []);

  const persistGarageToSQLite = () => {
    try {
      const db = getDatabaseService();
      db.saveGarageProfile({
        id: 'default_garage',
        name: 'Mój Garaż',
        gate_width_cm: parseFloat(gateWidth) || 240,
        interior_width_cm: (parseFloat(gateWidth) || 240) + 40,
        ceiling_height_cm: parseFloat(garageCeiling) || 220,
        gate_runner_height_cm: 210,
        obstacle_x_cm: 0,
        obstacle_width_cm: 0,
        max_entry_sign_m: 2.0,
      });

      const vehicles = db.getAllVehicles();
      const vehicleId = String(vehicles[0]?.id ?? 'veh_skoda_octavia_4_combi');
      db.saveTowbarRoofConfig({
        id: 'default_towbar_roof',
        vehicle_id: vehicleId,
        towbar_s_limit_kg: parseFloat(hookLimit) || 75,
        bike_rack_weight_kg: parseFloat(rackWeight) || 18,
        bikes_count: bikeCount,
        bikes_total_weight_kg: bikeCount * (isEBike ? 24 : 13),
        roof_limit_kg: parseFloat(roofRailLimit) || 75,
        bars_weight_kg: parseFloat(crossbarsWeightKg) || 5,
        roof_box_weight_kg: parseFloat(roofBoxWeightKg) || 18,
        roof_cargo_weight_kg: parseFloat(roofCargoWeightKg) || 35,
        total_roof_height_cm: (parseFloat(carHeight) || 155) + (parseFloat(roofBarsHeight) || 8) + (parseFloat(roofCargoHeight) || 42),
      });

      triggerAutoBackup();
    } catch {
      // fallback
    }
  };

  const handleSelectCarPreset = (preset: 'octavia' | 'passat' | 'rav4' | 'duster') => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    access.recordProject();

    switch (preset) {
      case 'octavia':
        setCarWidthMirrors('200');
        setCarWidthFolded('183');
        setCarHeight('147');
        setTailgateHeight('207');
        setHookLimit('75');
        break;
      case 'passat':
        setCarWidthMirrors('208');
        setCarWidthFolded('183');
        setCarHeight('151');
        setTailgateHeight('209');
        setHookLimit('100');
        break;
      case 'rav4':
        setCarWidthMirrors('217');
        setCarWidthFolded('186');
        setCarHeight('168');
        setTailgateHeight('214');
        setHookLimit('75');
        break;
      case 'duster':
        setCarWidthMirrors('207');
        setCarWidthFolded('181');
        setCarHeight('166');
        setTailgateHeight('205');
        setHookLimit('75');
        break;
    }
    persistGarageToSQLite();
  };

  const handleSelectGaragePreset = (preset: 'standard' | 'underground' | 'wide') => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    access.recordProject();

    switch (preset) {
      case 'standard':
        setGateWidth('240');
        setGarageCeiling('220');
        break;
      case 'underground':
        setGateWidth('230');
        setGarageCeiling('200');
        break;
      case 'wide':
        setGateWidth('260');
        setGarageCeiling('240');
        break;
    }
    persistGarageToSQLite();
  };

  const handleManualSave = () => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    access.recordProject();
    persistGarageToSQLite();
    Alert.alert(t('Sukces'), t('Konfiguracja garażu i haka została zapisana w bazie SQLite.'));
  };

  // Kalkulacja wjazdu do garażu
  const garageFit = evaluateGarageFit(
    {
      bodyWidthMm: (parseFloat(carWidthFolded) || 0) * 10,
      widthWithMirrorsMm: (parseFloat(carWidthMirrors) || 0) * 10,
      widthWithFoldedMirrorsMm: (parseFloat(carWidthFolded) || 0) * 10,
      baseHeightMm: (parseFloat(carHeight) || 0) * 10,
      tailgateMaxOpenHeightMm: (parseFloat(tailgateHeight) || 0) * 10,
    },
    {
      gateWidthMm: (parseFloat(gateWidth) || 0) * 10,
      interiorWidthMm: 3000,
      ceilingHeightMm: (parseFloat(garageCeiling) || 0) * 10,
    }
  );

  // Kalkulacja wysokości dachu i parkingów podziemnych
  const roofFit = evaluateRoofSetupHeight({
    vehicleHeightMm: (parseFloat(carHeight) || 0) * 10,
    roofBarsHeightMm: (parseFloat(roofBarsHeight) || 0) * 10,
    roofCargoHeightMm: (parseFloat(roofCargoHeight) || 0) * 10,
  });

  // Kalkulacja nośności dachu i zwisów (RD-45, RD-52)
  const roofRackLoad = calculateRoofRackLoad({
    roofRailLimitKg: parseInt(roofRailLimit, 10),
    crossbarsWeightKg: parseFloat(crossbarsWeightKg) || 0,
    roofBoxWeightKg: parseFloat(roofBoxWeightKg) || 0,
    cargoItemsWeightKg: parseFloat(roofCargoWeightKg) || 0,
  });

  const overhangResult = validateCargoOverhang({
    vehicleLengthMm: 4500,
    vehicleWidthMm: (parseFloat(carWidthFolded) || 185) * 10,
    frontOverhangMm: (parseFloat(frontOverhangCm) || 0) * 10,
    rearOverhangMm: (parseFloat(rearOverhangCm) || 0) * 10,
    sideProtrusionLeftMm: 0,
    sideProtrusionRightMm: 0,
  });

  // Kalkulacja obciążenia haka
  const sampleBikes: Bicycle[] = [];
  const bikeWeight = isEBike ? 24 : 13;
  for (let i = 0; i < bikeCount; i++) {
    sampleBikes.push({
      id: `bike_${i + 1}`,
      name: `${isEBike ? 'E-Bike' : 'Rower MTB'} #${i + 1}`,
      weightKg: bikeWeight,
      isElectric: isEBike,
      batteryWeightKg: isEBike ? 3.5 : 0,
    });
  }

  const towbarFit = evaluateTowbarLoad(sampleBikes, {
    towbarSLimitKg: parseInt(hookLimit, 10),
    rackWeightKg: parseFloat(rackWeight) || 15,
    maxBikesCapacity: 4,
  });

  // Kalkulacja klatki kennelowej (RD-46, Z-184)
  const parsedKennelWidth = Math.max(10, (parseFloat(kennelWidthCm) || 65) * 10);
  const parsedKennelDepthBottom = Math.max(10, (parseFloat(kennelDepthBottomCm) || 85) * 10);
  const parsedKennelDepthTop = Math.min(
    parsedKennelDepthBottom,
    Math.max(10, (parseFloat(kennelDepthTopCm) || 50) * 10)
  );
  const parsedKennelHeight = Math.max(10, (parseFloat(kennelHeightCm) || 65) * 10);
  const parsedWindowSlope = Math.min(85, Math.max(5, parseFloat(windowSlopeDeg) || 35));

  const dogKennelFit = evaluateDogKennelFit(
    {
      widthMm: parsedKennelWidth,
      depthBottomMm: parsedKennelDepthBottom,
      depthTopMm: parsedKennelDepthTop,
      heightMm: parsedKennelHeight,
    },
    {
      lengthFloorMm: 1000,
      widthMinMm: 1000,
      heightApertureMm: 750,
      heightAtSeatBackMm: 800,
      windowSlopeAngleDeg: parsedWindowSlope,
    }
  );

  // Kalkulacja nacisku punktowego na podłogę (RD-47, Z-185)
  const falseFloorFit = evaluateFalseFloorLoad({
    hasModularFalseFloor: hasFalseFloor,
    cargoWeightKg: Math.max(0, parseFloat(pointLoadKg) || 0),
    isPointLoadConcentrated: true,
  });

  const unitSuffix = unitSystem === 'imperial' ? 'in' : 'cm';
  const weightSuffix = unitSystem === 'imperial' ? 'lbs' : 'kg';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t('🏢 Garaż & Hak Holowniczy')}</Text>
          <Text style={styles.subtitle}>
            {t('Skrajnie wjazdowe bramy, parkingi podziemne (B-16) i nacisk kuli haka S')}
          </Text>
        </View>

        {/* Baner Read-Only po trialu */}
        {access.status === 'trial_expired' && (
          <TouchableOpacity
            testID="garage-read-only-banner"
            style={styles.readOnlyBanner}
            onPress={() => setIsPaywallOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.readOnlyBannerTitle}>
              {t('Tryb Archiwalny (Read-Only) — Dotknij, aby odblokować pełną wersję')}
            </Text>
            <Text style={styles.readOnlyBannerDesc}>
              {t('Przeglądasz zapisane profile. Wybierz Apps4Brew Pass ($0.99), aby modyfikować i tworzyć nowe.')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Sekcja 1: Wjazd do garażu i brama */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('🚪 Skrajnia Bramy & Klapa Bagażnika (RD-41, RD-42)')}</Text>

          {/* Szybki wybór auta */}
          <Text style={styles.subLabel}>{t('Szybki model pojazdu:')}</Text>
          <View style={styles.chipRow}>
            {[
              { id: 'octavia', label: '🚗 Škoda Octavia' },
              { id: 'passat', label: '🚗 VW Passat' },
              { id: 'rav4', label: '🚗 Toyota RAV4' },
              { id: 'duster', label: '🚗 Dacia Duster' },
            ].map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.chipBtn}
                onPress={() => handleSelectCarPreset(c.id as any)}
              >
                <Text style={styles.chipBtnText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Szybki typ garażu */}
          <Text style={[styles.subLabel, { marginTop: 4 }]}>{t('Typ garażu / bramy:')}</Text>
          <View style={styles.chipRow}>
            {[
              { id: 'standard', label: `🏠 ${t('Brama 240 / Sufit 220')}` },
              { id: 'underground', label: `🏢 ${t('Parking 230 / B-16 2.0m')}` },
              { id: 'wide', label: `🚪 ${t('Szeroka 260 / Sufit 240')}` },
            ].map((g) => (
              <TouchableOpacity
                key={g.id}
                style={styles.chipBtn}
                onPress={() => handleSelectGaragePreset(g.id as any)}
              >
                <Text style={styles.chipBtnText}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Szerokość bramy ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={gateWidth}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setGateWidth(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Szer. z lusterkami ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={carWidthMirrors}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setCarWidthMirrors(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Szer. ze złożonymi ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={carWidthFolded}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setCarWidthFolded(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Wys. uniesionej klapy ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={tailgateHeight}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setTailgateHeight(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.resultBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t('Wjazd z rozłożonymi lusterkami:')}</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: garageFit.canEnterWithOpenMirrors ? '#22C55E' : '#EF4444' },
                ]}
              >
                {garageFit.canEnterWithOpenMirrors ? t('✅ ZMIEŚCI SIĘ') : t('⚠️ ZA CIASNO')}
              </Text>
            </View>
            <Text style={styles.dimSubtext}>
              {t('Luz po bokach: {val}', { val: formatDimension(garageFit.entryMarginOpenMirrorsMm / 10, unitSystem) })}
            </Text>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t('Wjazd ze złożonymi lusterkami:')}</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: garageFit.canEnterWithFoldedMirrors ? '#22C55E' : '#EF4444' },
                ]}
              >
                {garageFit.canEnterWithFoldedMirrors ? t('✅ ZMIEŚCI SIĘ') : t('⛔ KOLIZJA')}
              </Text>
            </View>
            <Text style={styles.dimSubtext}>
              {t('Luz po bokach: {val}', { val: formatDimension(garageFit.entryMarginFoldedMirrorsMm / 10, unitSystem) })}
            </Text>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                {t('Kolizja klapy z sufitem ({val}):', { val: formatDimension(parseFloat(garageCeiling) || 220, unitSystem) })}
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: !garageFit.willTailgateHitCeiling ? '#22C55E' : '#EF4444' },
                ]}
              >
                {!garageFit.willTailgateHitCeiling ? t('✅ BEZPIECZNIE') : t('💥 UDERZY W SUFIT')}
              </Text>
            </View>
            <Text style={styles.dimSubtext}>
              {t('Margines nad klapą: {val}', { val: formatDimension(garageFit.tailgateCeilingMarginMm / 10, unitSystem) })}
            </Text>
          </View>

          {/* Rzut frontowy wjazdu i skrajni */}
          <GarageVisualizer
            gateWidthCm={parseFloat(gateWidth) || 240}
            carWidthMirrorsCm={parseFloat(carWidthMirrors) || 208}
            carWidthFoldedCm={parseFloat(carWidthFolded) || 188}
            garageCeilingCm={parseFloat(garageCeiling) || 220}
            tailgateHeightCm={parseFloat(tailgateHeight) || 205}
            canEnterOpenMirrors={garageFit.canEnterWithOpenMirrors}
            canEnterFoldedMirrors={garageFit.canEnterWithFoldedMirrors}
            willTailgateHitCeiling={garageFit.willTailgateHitCeiling}
            entryMarginOpenMirrorsCm={garageFit.entryMarginOpenMirrorsMm / 10}
          />
        </View>

        {/* Sekcja 2: Box dachowy & Parking podziemny B-16 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('🚗 Box Dachowy vs Parking Podziemny (RD-43)')}</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Wys. auta ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={carHeight}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setCarHeight(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Belki dachowe ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={roofBarsHeight}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setRoofBarsHeight(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Box / Rowery ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={roofCargoHeight}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setRoofCargoHeight(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultHeader}>
              {t('Wysokość całkowita (z buforem +3 cm na nierówności):')}
            </Text>
            <Text style={styles.bigHighlight}>
              {(roofFit.totalHeightWithBounceMm / 1000).toFixed(2)} m ({formatDimension(roofFit.totalHeightWithBounceMm / 10, unitSystem)})
            </Text>

            <View style={styles.signGrid}>
              <View
                style={[
                  styles.signBadge,
                  { backgroundColor: roofFit.canEnterSign210m ? '#065F46' : '#991B1B' },
                ]}
              >
                <Text style={styles.signTitle}>{t('Znak 2.1 m')}</Text>
                <Text style={styles.signVerdict}>
                  {roofFit.canEnterSign210m ? t('WJAZD OK') : t('ZAKAZ')}
                </Text>
              </View>

              <View
                style={[
                  styles.signBadge,
                  { backgroundColor: roofFit.canEnterSign200m ? '#065F46' : '#991B1B' },
                ]}
              >
                <Text style={styles.signTitle}>{t('Znak 2.0 m')}</Text>
                <Text style={styles.signVerdict}>
                  {roofFit.canEnterSign200m ? t('WJAZD OK') : t('ZAKAZ')}
                </Text>
              </View>

              <View
                style={[
                  styles.signBadge,
                  { backgroundColor: roofFit.canEnterSign190m ? '#065F46' : '#991B1B' },
                ]}
              >
                <Text style={styles.signTitle}>{t('Znak 1.9 m')}</Text>
                <Text style={styles.signVerdict}>
                  {roofFit.canEnterSign190m ? t('WJAZD OK') : t('ZAKAZ')}
                </Text>
              </View>
            </View>

            {/* Kontrola Nośności Dachu i Zwisów */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>{t('Limit nośności relingów dachowych:')}</Text>
              <View style={styles.buttonRow}>
                {(['50', '75', '100'] as const).map((lim) => (
                  <TouchableOpacity
                    key={lim}
                    style={[styles.pill, roofRailLimit === lim && styles.pillActive]}
                    onPress={() => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setRoofRailLimit(lim);
                      persistGarageToSQLite();
                    }}
                  >
                    <Text style={[styles.pillText, roofRailLimit === lim && styles.pillTextActive]}>
                      {formatWeight(parseInt(lim, 10), unitSystem)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('Pusty box + belki ({u}):', { u: weightSuffix })}</Text>
                  <TextInput
                    style={styles.input}
                    value={roofBoxWeightKg}
                    onChangeText={(v) => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setRoofBoxWeightKg(v);
                      persistGarageToSQLite();
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>{t('Bagaż w boxie ({u}):', { u: weightSuffix })}</Text>
                  <TextInput
                    style={styles.input}
                    value={roofCargoWeightKg}
                    onChangeText={(v) => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setRoofCargoWeightKg(v);
                      persistGarageToSQLite();
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('Zwis przód ({u}):', { u: unitSuffix })}</Text>
                  <TextInput
                    style={styles.input}
                    value={frontOverhangCm}
                    onChangeText={(v) => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setFrontOverhangCm(v);
                      persistGarageToSQLite();
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>{t('Zwis tył ({u}):', { u: unitSuffix })}</Text>
                  <TextInput
                    style={styles.input}
                    value={rearOverhangCm}
                    onChangeText={(v) => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setRearOverhangCm(v);
                      persistGarageToSQLite();
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <RoofRackVisualizer
                effectiveLimitKg={roofRackLoad.effectiveLimitKg}
                totalMountedWeightKg={roofRackLoad.totalMountedWeightKg}
                remainingCapacityKg={roofRackLoad.remainingCapacityKg}
                isOverloaded={roofRackLoad.isOverloaded}
                capacityUtilizationPct={roofRackLoad.capacityUtilizationPct}
                frontOverhangMm={overhangResult.frontOverhangMm}
                rearOverhangMm={overhangResult.rearOverhangMm}
                isOverhangLegal={overhangResult.isLegal}
                requiredMarkings={overhangResult.requiredMarkings}
              />
            </View>
          </View>
        </View>

        {/* Sekcja 3: Hak holowniczy & Rowery */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('🚲 Platforma na Hak & Rowery (RD-44, Nośność S)')}</Text>

          <Text style={styles.label}>{t('Dopuszczalny nacisk pionowy haka S (tabliczka znamionowa):')}</Text>
          <View style={styles.buttonRow}>
            {(['50', '75', '100'] as const).map((limit) => (
              <TouchableOpacity
                key={limit}
                style={[styles.pill, hookLimit === limit && styles.pillActive]}
                onPress={() => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setHookLimit(limit);
                  persistGarageToSQLite();
                }}
              >
                <Text style={[styles.pillText, hookLimit === limit && styles.pillTextActive]}>
                  S = {formatWeight(parseInt(limit, 10), unitSystem)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('Waga platformy ({u}):', { u: weightSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={rackWeight}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setRackWeight(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>{t('Liczba rowerów:')}</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => {
                    if (!access.canCreate) {
                      setIsPaywallOpen(true);
                      return;
                    }
                    setBikeCount(Math.max(1, bikeCount - 1));
                    persistGarageToSQLite();
                  }}
                >
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{bikeCount}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => {
                    if (!access.canCreate) {
                      setIsPaywallOpen(true);
                      return;
                    }
                    setBikeCount(Math.min(4, bikeCount + 1));
                    persistGarageToSQLite();
                  }}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.toggleBtn, isEBike && styles.toggleBtnActive]}
            onPress={() => {
              if (!access.canCreate) {
                setIsPaywallOpen(true);
                return;
              }
              setIsEBike(!isEBike);
              persistGarageToSQLite();
            }}
          >
            <Text style={styles.toggleBtnText}>
              {isEBike
                ? t('⚡ Rowery elektryczne E-Bike (~24 kg/szt.)')
                : t('🚲 Rowery tradycyjne (~13 kg/szt.)')}
            </Text>
          </TouchableOpacity>

          <View style={styles.resultBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t('Całkowity nacisk na kulę haka:')}</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: !towbarFit.isOverloaded ? '#22C55E' : '#EF4444' },
                ]}
              >
                {formatWeight(towbarFit.totalVerticalLoadKg, unitSystem)} / {formatWeight(parseFloat(hookLimit) || 75, unitSystem)}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t('Status bezpieczeństwa:')}</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: !towbarFit.isOverloaded ? '#22C55E' : '#EF4444' },
                ]}
              >
                {!towbarFit.isOverloaded ? t('✅ W NORMIE') : t('⚠️ PRZECIĄŻENIE HAKA!')}
              </Text>
            </View>

            {towbarFit.warnings.map((w, idx) => (
              <Text key={idx} style={styles.warningLine}>
                ⚠️ {w}
              </Text>
            ))}
          </View>

          {/* Wskaźnik obciążenia haka i ratunek dla e-bike */}
          <TowbarVisualizer
            totalLoadKg={towbarFit.totalVerticalLoadKg}
            limitKg={parseFloat(hookLimit) || 75}
            isOverloaded={towbarFit.isOverloaded}
            remainingCapacityKg={towbarFit.remainingCapacityKg}
            overloadKg={towbarFit.overloadKg}
            eBikesCount={towbarFit.eBikesCount}
            batterySavingsPotentialKg={towbarFit.batterySavingsPotentialKg}
            loadWithBatteriesRemovedKg={towbarFit.loadWithBatteriesRemovedKg}
            canBeResolvedByRemovingBatteries={towbarFit.canBeResolvedByRemovingBatteries}
          />
        </View>

        {/* Sekcja 4: Klatka kennelowa dla psa (RD-46, Z-184) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('🐕 Klatka Kennelowa a Skos Szyby Bagażnika (RD-46)')}</Text>
          <Text style={styles.label}>
            {t('Wymiary klatki (Dół × Góra × Wys. w cm) vs Kąt szyby klapy:')}
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>{t('Dno ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={kennelDepthBottomCm}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setKennelDepthBottomCm(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>{t('Dach ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={kennelDepthTopCm}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setKennelDepthTopCm(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>{t('Wys. ({u}):', { u: unitSuffix })}</Text>
              <TextInput
                style={styles.input}
                value={kennelHeightCm}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setKennelHeightCm(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>{t('Szyba (°):')}</Text>
              <TextInput
                style={styles.input}
                value={windowSlopeDeg}
                onChangeText={(v) => {
                  if (!access.canCreate) {
                    setIsPaywallOpen(true);
                    return;
                  }
                  setWindowSlopeDeg(v);
                  persistGarageToSQLite();
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <DogKennelVisualizer
            kennelDepthBottomCm={parsedKennelDepthBottom / 10}
            kennelDepthTopCm={parsedKennelDepthTop / 10}
            kennelHeightCm={parsedKennelHeight / 10}
            trunkFloorLengthCm={100}
            windowSlopeAngleDeg={parsedWindowSlope}
            rearBevelAngleDeg={dogKennelFit.rearBevelAngleDeg}
            fitsInTrunk={dogKennelFit.fitsInTrunk}
            fitsWindowSlope={dogKennelFit.fitsWindowSlope}
            windowClearanceAtTopRearMm={dogKennelFit.windowClearanceAtTopRearMm}
          />
        </View>

        {/* Sekcja 5: Ochrona podwójnej podłogi bagażnika (RD-47, Z-185) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('🛡️ Nośność Podwójnej Podłogi Bagażnika (RD-47)')}</Text>
          <Text style={styles.label}>
            {t('Ochrona modułowych szyn i półki przed załamaniem przy transporcie materiałów (cement, glazura):')}
          </Text>

          <TouchableOpacity
            style={[styles.toggleBtn, hasFalseFloor && styles.toggleBtnActive]}
            onPress={() => {
              if (!access.canCreate) {
                setIsPaywallOpen(true);
                return;
              }
              setHasFalseFloor(!hasFalseFloor);
            }}
          >
            <Text style={styles.toggleBtnText}>
              {hasFalseFloor
                ? t('📦 Auto posiada podwójną / podwyższoną podłogę bagażnika (limit ~120 kg)')
                : t('🚙 Zwykła stalowa podłoga fabryczna (pełna nośność bagażnika)')}
            </Text>
          </TouchableOpacity>

          {hasFalseFloor && (
            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>{t('Ciężar skupiony ładunku ({u}):', { u: weightSuffix })}</Text>
                <TextInput
                  style={styles.input}
                  value={pointLoadKg}
                  onChangeText={(v) => {
                    if (!access.canCreate) {
                      setIsPaywallOpen(true);
                      return;
                    }
                    setPointLoadKg(v);
                  }}
                  keyboardType="numeric"
                  placeholder={t('np. 150 kg cementu')}
                />
              </View>
            </View>
          )}

          <View
            style={[
              styles.resultBox,
              {
                backgroundColor:
                  falseFloorFit.warningRisk === 'CRITICAL_COLLAPSE'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : falseFloorFit.warningRisk === 'MODERATE'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(16, 185, 129, 0.2)',
                borderColor:
                  falseFloorFit.warningRisk === 'CRITICAL_COLLAPSE'
                    ? '#EF4444'
                    : falseFloorFit.warningRisk === 'MODERATE'
                    ? '#F59E0B'
                    : '#10B981',
              },
            ]}
          >
            <Text
              style={[
                styles.statusTitle,
                {
                  color:
                    falseFloorFit.warningRisk === 'CRITICAL_COLLAPSE'
                      ? '#EF4444'
                      : falseFloorFit.warningRisk === 'MODERATE'
                      ? '#F59E0B'
                      : '#10B981',
                },
              ]}
            >
              {falseFloorFit.warningRisk === 'CRITICAL_COLLAPSE'
                ? t('⛔ RYZYKO ZAŁAMANIA PÓŁKI!')
                : falseFloorFit.warningRisk === 'MODERATE'
                ? t('⚠️ UWAGA NA NACISK PUNKTOWY')
                : t('✅ OBCIĄŻENIE BEZPIECZNE')}
            </Text>
            <Text style={[styles.dimSubtext, { marginTop: 4, color: '#E2E8F0' }]}>
              {falseFloorFit.advice}
            </Text>
          </View>
        </View>

        {/* Zapis konfiguracji do SQLite */}
        <TouchableOpacity
          testID="save-garage-btn"
          style={styles.saveGarageBtn}
          onPress={handleManualSave}
        >
          <Text style={styles.saveGarageBtnText}>💾 {t('Zapisz konfigurację garażu w SQLite')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Paywall modal */}
      <Apps4BrewPassModal
        visible={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onPurchaseSuccess={() => access.refresh()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  readOnlyBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  readOnlyBannerTitle: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
  },
  readOnlyBannerDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  resultBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  dimSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  resultHeader: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bigHighlight: {
    fontSize: 24,
    fontWeight: '900',
    color: '#38BDF8',
    marginVertical: 8,
  },
  signGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  signBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  signTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  signVerdict: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    height: 42,
  },
  counterBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#334155',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  counterValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  toggleBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleBtnActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  toggleBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  warningLine: {
    color: '#F59E0B',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  subLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chipBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  chipBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  saveGarageBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveGarageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
