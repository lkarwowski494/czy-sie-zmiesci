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

export default function GarageScreen() {
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

  const handleSelectCarPreset = (preset: 'octavia' | 'passat' | 'rav4' | 'duster') => {
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
  };

  const handleSelectGaragePreset = (preset: 'standard' | 'underground' | 'wide') => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏢 Garaż & Hak Holowniczy</Text>
          <Text style={styles.subtitle}>
            Skrajnie wjazdowe bramy, parkingi podziemne (B-16) i nacisk kuli haka S
          </Text>
        </View>

        {/* Sekcja 1: Wjazd do garażu i brama */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚪 Skrajnia Bramy & Klapa Bagażnika (RD-41, RD-42)</Text>
          
          {/* Szybki wybór auta */}
          <Text style={styles.subLabel}>Szybki model pojazdu:</Text>
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
          <Text style={[styles.subLabel, { marginTop: 4 }]}>Typ garażu / bramy:</Text>
          <View style={styles.chipRow}>
            {[
              { id: 'standard', label: '🏠 Brama 240 / Sufit 220' },
              { id: 'underground', label: '🏢 Parking 230 / B-16 2.0m' },
              { id: 'wide', label: '🚪 Szeroka 260 / Sufit 240' },
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
              <Text style={styles.label}>Szerokość bramy (cm):</Text>
              <TextInput
                style={styles.input}
                value={gateWidth}
                onChangeText={setGateWidth}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Szer. z lusterkami (cm):</Text>
              <TextInput
                style={styles.input}
                value={carWidthMirrors}
                onChangeText={setCarWidthMirrors}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Szer. ze złożonymi (cm):</Text>
              <TextInput
                style={styles.input}
                value={carWidthFolded}
                onChangeText={setCarWidthFolded}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Wys. uniesionej klapy (cm):</Text>
              <TextInput
                style={styles.input}
                value={tailgateHeight}
                onChangeText={setTailgateHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.resultBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Wjazd z rozłożonymi lusterkami:</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: garageFit.canEnterWithOpenMirrors ? '#22C55E' : '#EF4444' },
                ]}
              >
                {garageFit.canEnterWithOpenMirrors ? '✅ ZMIEŚCI SIĘ' : '⚠️ ZA CIASNO'}
              </Text>
            </View>
            <Text style={styles.dimSubtext}>
              Luz po bokach: {Math.round(garageFit.entryMarginOpenMirrorsMm / 10)} cm
            </Text>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Wjazd ze złożonymi lusterkami:</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: garageFit.canEnterWithFoldedMirrors ? '#22C55E' : '#EF4444' },
                ]}
              >
                {garageFit.canEnterWithFoldedMirrors ? '✅ ZMIEŚCI SIĘ' : '⛔ KOLIZJA'}
              </Text>
            </View>
            <Text style={styles.dimSubtext}>
              Luz po bokach: {Math.round(garageFit.entryMarginFoldedMirrorsMm / 10)} cm
            </Text>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Kolizja klapy z sufitem ({garageCeiling} cm):</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: !garageFit.willTailgateHitCeiling ? '#22C55E' : '#EF4444' },
                ]}
              >
                {!garageFit.willTailgateHitCeiling ? '✅ BEZPIECZNIE' : '💥 UDERZY W SUFIT'}
              </Text>
            </View>
            <Text style={styles.dimSubtext}>
              Margines nad klapą: {Math.round(garageFit.tailgateCeilingMarginMm / 10)} cm
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
          <Text style={styles.cardTitle}>🚗 Box Dachowy vs Parking Podziemny (RD-43)</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Wys. auta (cm):</Text>
              <TextInput
                style={styles.input}
                value={carHeight}
                onChangeText={setCarHeight}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Belki dachowe (cm):</Text>
              <TextInput
                style={styles.input}
                value={roofBarsHeight}
                onChangeText={setRoofBarsHeight}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Box / Rowery (cm):</Text>
              <TextInput
                style={styles.input}
                value={roofCargoHeight}
                onChangeText={setRoofCargoHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultHeader}>
              Wysokość całkowita (z buforem +3 cm na nierówności):
            </Text>
            <Text style={styles.bigHighlight}>
              {(roofFit.totalHeightWithBounceMm / 1000).toFixed(2)} m ({roofFit.totalHeightWithBounceMm} mm)
            </Text>

            <View style={styles.signGrid}>
              <View
                style={[
                  styles.signBadge,
                  { backgroundColor: roofFit.canEnterSign210m ? '#065F46' : '#991B1B' },
                ]}
              >
                <Text style={styles.signTitle}>Znak 2.1 m</Text>
                <Text style={styles.signVerdict}>
                  {roofFit.canEnterSign210m ? 'WJAZD OK' : 'ZAKAZ'}
                </Text>
              </View>

              <View
                style={[
                  styles.signBadge,
                  { backgroundColor: roofFit.canEnterSign200m ? '#065F46' : '#991B1B' },
                ]}
              >
                <Text style={styles.signTitle}>Znak 2.0 m</Text>
                <Text style={styles.signVerdict}>
                  {roofFit.canEnterSign200m ? 'WJAZD OK' : 'ZAKAZ'}
                </Text>
              </View>

              <View
                style={[
                  styles.signBadge,
                  { backgroundColor: roofFit.canEnterSign190m ? '#065F46' : '#991B1B' },
                ]}
              >
                <Text style={styles.signTitle}>Znak 1.9 m</Text>
                <Text style={styles.signVerdict}>
                  {roofFit.canEnterSign190m ? 'WJAZD OK' : 'ZAKAZ'}
                </Text>
              </View>
            </View>

            {/* Kontrola Nośności Dachu i Zwisów */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>Limit nośności relingów dachowych:</Text>
              <View style={styles.buttonRow}>
                {(['50', '75', '100'] as const).map((lim) => (
                  <TouchableOpacity
                    key={lim}
                    style={[styles.pill, roofRailLimit === lim && styles.pillActive]}
                    onPress={() => setRoofRailLimit(lim)}
                  >
                    <Text style={[styles.pillText, roofRailLimit === lim && styles.pillTextActive]}>
                      {lim} kg
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Pusty box + belki (kg):</Text>
                  <TextInput
                    style={styles.input}
                    value={roofBoxWeightKg}
                    onChangeText={setRoofBoxWeightKg}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>Bagaż w boxie (kg):</Text>
                  <TextInput
                    style={styles.input}
                    value={roofCargoWeightKg}
                    onChangeText={setRoofCargoWeightKg}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Zwis przód (cm, max 50):</Text>
                  <TextInput
                    style={styles.input}
                    value={frontOverhangCm}
                    onChangeText={setFrontOverhangCm}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>Zwis tył (cm, max 200):</Text>
                  <TextInput
                    style={styles.input}
                    value={rearOverhangCm}
                    onChangeText={setRearOverhangCm}
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
          <Text style={styles.cardTitle}>🚲 Platforma na Hak & Rowery (RD-44, Nośność S)</Text>

          <Text style={styles.label}>Dopuszczalny nacisk pionowy haka S (tabliczka znamionowa):</Text>
          <View style={styles.buttonRow}>
            {(['50', '75', '100'] as const).map((limit) => (
              <TouchableOpacity
                key={limit}
                style={[styles.pill, hookLimit === limit && styles.pillActive]}
                onPress={() => setHookLimit(limit)}
              >
                <Text style={[styles.pillText, hookLimit === limit && styles.pillTextActive]}>
                  S = {limit} kg
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Waga platformy (kg):</Text>
              <TextInput
                style={styles.input}
                value={rackWeight}
                onChangeText={setRackWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Liczba rowerów:</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setBikeCount(Math.max(1, bikeCount - 1))}
                >
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{bikeCount}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setBikeCount(Math.min(4, bikeCount + 1))}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.toggleBtn, isEBike && styles.toggleBtnActive]}
            onPress={() => setIsEBike(!isEBike)}
          >
            <Text style={styles.toggleBtnText}>
              {isEBike ? '⚡ Rowery elektryczne E-Bike (~24 kg/szt.)' : '🚲 Rowery tradycyjne (~13 kg/szt.)'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resultBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Całkowity nacisk na kulę haka:</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: !towbarFit.isOverloaded ? '#22C55E' : '#EF4444' },
                ]}
              >
                {towbarFit.totalVerticalLoadKg} kg / {hookLimit} kg
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status bezpieczeństwa:</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: !towbarFit.isOverloaded ? '#22C55E' : '#EF4444' },
                ]}
              >
                {!towbarFit.isOverloaded ? '✅ W NORMIE' : '⚠️ PRZECIĄŻENIE HAKA!'}
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
          <Text style={styles.cardTitle}>🐕 Klatka Kennelowa a Skos Szyby Bagażnika (RD-46)</Text>
          <Text style={styles.label}>
            Wymiary klatki (Dół × Góra × Wys. w cm) vs Kąt szyby klapy:
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Dno (cm):</Text>
              <TextInput
                style={styles.input}
                value={kennelDepthBottomCm}
                onChangeText={setKennelDepthBottomCm}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>Dach (cm):</Text>
              <TextInput
                style={styles.input}
                value={kennelDepthTopCm}
                onChangeText={setKennelDepthTopCm}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>Wys. (cm):</Text>
              <TextInput
                style={styles.input}
                value={kennelHeightCm}
                onChangeText={setKennelHeightCm}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>Szyba (°):</Text>
              <TextInput
                style={styles.input}
                value={windowSlopeDeg}
                onChangeText={setWindowSlopeDeg}
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
          <Text style={styles.cardTitle}>🛡️ Nośność Podwójnej Podłogi Bagażnika (RD-47)</Text>
          <Text style={styles.label}>
            Ochrona modułowych szyn i półki przed załamaniem przy transporcie materiałów (cement, glazura):
          </Text>

          <TouchableOpacity
            style={[styles.toggleBtn, hasFalseFloor && styles.toggleBtnActive]}
            onPress={() => setHasFalseFloor(!hasFalseFloor)}
          >
            <Text style={styles.toggleBtnText}>
              {hasFalseFloor
                ? '📦 Auto posiada podwójną / podwyższoną podłogę bagażnika (limit ~120 kg)'
                : '🚙 Zwykła stalowa podłoga fabryczna (pełna nośność bagażnika)'}
            </Text>
          </TouchableOpacity>

          {hasFalseFloor && (
            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Ciężar skupiony ładunku (kg):</Text>
                <TextInput
                  style={styles.input}
                  value={pointLoadKg}
                  onChangeText={setPointLoadKg}
                  keyboardType="numeric"
                  placeholder="np. 150 kg cementu"
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
                ? '⛔ RYZYKO ZAŁAMANIA PÓŁKI!'
                : falseFloorFit.warningRisk === 'MODERATE'
                ? '⚠️ UWAGA NA NACISK PUNKTOWY'
                : '✅ OBCIĄŻENIE BEZPIECZNE'}
            </Text>
            <Text style={[styles.dimSubtext, { marginTop: 4, color: '#E2E8F0' }]}>
              {falseFloorFit.advice}
            </Text>
          </View>
        </View>
      </ScrollView>
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
});
