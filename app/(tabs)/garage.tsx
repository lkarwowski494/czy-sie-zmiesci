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

  // Hak holowniczy i rowery
  const [hookLimit, setHookLimit] = useState<'50' | '75' | '100'>('75');
  const [rackWeight, setRackWeight] = useState('18'); // kg
  const [bikeCount, setBikeCount] = useState<number>(2);
  const [isEBike, setIsEBike] = useState<boolean>(true);

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
});
