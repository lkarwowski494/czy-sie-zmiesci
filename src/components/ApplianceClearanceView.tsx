/**
 * Czy się zmieści? (FitCheck) — ApplianceClearanceView
 * Sprawdzanie dylatacji wentylacyjnej lodówki i naddatków instalacyjnych pralki (RD-37, RD-38, RD-39, RD-51).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import {
  evaluateRefrigeratorFit,
  evaluateWashingMachineInstallation,
  evaluateCompressorRest,
  TransportOrientation,
  REFRIGERATOR_REAR_VENT_MM,
  REFRIGERATOR_SIDE_VENT_MM,
  WASHING_MACHINE_PLUMBING_BUFFER_MM,
  WASHING_MACHINE_DOOR_BULGE_MM,
} from '../domain/room-fitting/applianceClearance';

export function ApplianceClearanceView() {
  const [applianceTab, setApplianceTab] = useState<'fridge' | 'washer' | 'oil_timer'>('fridge');

  // Stan lodówki
  const [fridgeW, setFridgeW] = useState('60'); // cm
  const [fridgeD, setFridgeD] = useState('65'); // cm
  const [nicheW, setNicheW] = useState('66'); // cm
  const [nicheD, setNicheD] = useState('72'); // cm
  const [wallDist, setWallDist] = useState('5'); // cm
  const [doorAngle, setDoorAngle] = useState(120); // deg

  // Stan pralki
  const [washerD, setWasherD] = useState('55'); // cm (katalogowa)
  const [closetD, setClosetD] = useState('68'); // cm (głębokość szafy)

  // Stan timera odstania sprężarki (Z-189)
  const [transportOrientation, setTransportOrientation] = useState<TransportOrientation>('HORIZONTAL');
  const [elapsedHoursStr, setElapsedHoursStr] = useState('4');

  const compressorResult = evaluateCompressorRest(
    transportOrientation,
    Math.max(0, parseFloat(elapsedHoursStr) || 0)
  );

  const fridgeResult = evaluateRefrigeratorFit(
    {
      widthMm: (parseFloat(fridgeW) || 0) * 10,
      depthMm: (parseFloat(fridgeD) || 0) * 10,
      heightMm: 1850,
      distanceToSideWallMm: (parseFloat(wallDist) || 0) * 10,
      doorSwingAngleDeg: doorAngle,
    },
    {
      widthMm: (parseFloat(nicheW) || 0) * 10,
      depthMm: (parseFloat(nicheD) || 0) * 10,
      heightMm: 2000,
    }
  );

  const washerResult = evaluateWashingMachineInstallation(
    {
      catalogDepthMm: (parseFloat(washerD) || 0) * 10,
      widthMm: 600,
      heightMm: 850,
    },
    (parseFloat(closetD) || 0) * 10
  );

  return (
    <View style={styles.container}>
      {/* Przełącznik urządzenia */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, applianceTab === 'fridge' && styles.tabBtnActive]}
          onPress={() => setApplianceTab('fridge')}
        >
          <Text style={[styles.tabBtnText, applianceTab === 'fridge' && styles.tabBtnTextActive]}>
            🧊 Wentylacja
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, applianceTab === 'washer' && styles.tabBtnActive]}
          onPress={() => setApplianceTab('washer')}
        >
          <Text style={[styles.tabBtnText, applianceTab === 'washer' && styles.tabBtnTextActive]}>
            🧺 Pralka
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, applianceTab === 'oil_timer' && styles.tabBtnActive]}
          onPress={() => setApplianceTab('oil_timer')}
        >
          <Text style={[styles.tabBtnText, applianceTab === 'oil_timer' && styles.tabBtnTextActive]}>
            ⏱️ Olej w Agregacie
          </Text>
        </TouchableOpacity>
      </View>

      {applianceTab === 'fridge' ? (
        /* PANEL LODÓWKI */
        <View style={styles.panel}>
          <Text style={styles.infoText}>
            Wymiary lodówki vs wnęka kuchenna (wymóg wentylacji skraplacza {REFRIGERATOR_REAR_VENT_MM / 10} cm z tyłu i {REFRIGERATOR_SIDE_VENT_MM / 10} cm po bokach):
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Szer. lodówki (cm):</Text>
              <TextInput
                style={styles.input}
                value={fridgeW}
                onChangeText={setFridgeW}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Głęb. lodówki (cm):</Text>
              <TextInput
                style={styles.input}
                value={fridgeD}
                onChangeText={setFridgeD}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Szer. wnęki (cm):</Text>
              <TextInput
                style={styles.input}
                value={nicheW}
                onChangeText={setNicheW}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Głęb. wnęki (cm):</Text>
              <TextInput
                style={styles.input}
                value={nicheD}
                onChangeText={setNicheD}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Odległość od ściany bocznej i kąt otwarcia */}
          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Odstęp od ściany (cm):</Text>
              <TextInput
                style={styles.input}
                value={wallDist}
                onChangeText={setWallDist}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Kąt otwarcia drzwi:</Text>
              <View style={styles.angleRow}>
                <TouchableOpacity
                  style={[styles.angleBtn, doorAngle === 90 && styles.angleBtnActive]}
                  onPress={() => setDoorAngle(90)}
                >
                  <Text style={[styles.angleBtnText, doorAngle === 90 && styles.angleBtnTextActive]}>
                    90°
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.angleBtn, doorAngle === 120 && styles.angleBtnActive]}
                  onPress={() => setDoorAngle(120)}
                >
                  <Text style={[styles.angleBtnText, doorAngle === 120 && styles.angleBtnTextActive]}>
                    120°
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Podsumowanie wyniku */}
          <View
            style={[
              styles.resultBox,
              fridgeResult.canVentilateSafely && fridgeResult.canOpenFreezerDrawers
                ? styles.resultSuccess
                : styles.resultAlert,
            ]}
          >
            <Text style={styles.resultTitle}>
              {fridgeResult.canVentilateSafely && fridgeResult.canOpenFreezerDrawers
                ? '✅ Bezpieczna wentylacja i pełny wysuw szuflad'
                : '⚠️ Ryzyko przegrzania agregatu lub blokady szuflad'}
            </Text>
            <Text style={styles.resultSub}>
              Wymagana głębokość z wentylacją: {fridgeResult.effectiveDepthRequiredMm / 10} cm (jest {nicheD} cm)
            </Text>
            <Text style={styles.resultSub}>
              Wymagana szerokość z dylatacją: {fridgeResult.effectiveWidthRequiredMm / 10} cm (jest {nicheW} cm)
            </Text>
            {fridgeResult.warnings.map((w, i) => (
              <Text key={i} style={styles.warnText}>
                • {w}
              </Text>
            ))}
            {fridgeResult.recommendations.map((r, i) => (
              <Text key={i} style={styles.recText}>
                💡 {r}
              </Text>
            ))}
          </View>
        </View>
      ) : applianceTab === 'washer' ? (
        /* PANEL PRALKI */
        <View style={styles.panel}>
          <Text style={styles.infoText}>
            Wymiary pralki vs głębokość szafy (naddatek hydrauliczny {WASHING_MACHINE_PLUMBING_BUFFER_MM / 10} cm na wąż AquaStop/syfon + {WASHING_MACHINE_DOOR_BULGE_MM / 10} cm na profil drzwiczek):
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Głębokość z katalogu (cm):</Text>
              <TextInput
                style={styles.input}
                value={washerD}
                onChangeText={setWasherD}
                keyboardType="numeric"
                placeholder="np. 55"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Głębokość szafy (cm):</Text>
              <TextInput
                style={styles.input}
                value={closetD}
                onChangeText={setClosetD}
                keyboardType="numeric"
                placeholder="np. 68"
              />
            </View>
          </View>

          <View style={styles.quickPresetRow}>
            {[
              { label: 'Pralka Slim (45 cm)', d: '45' },
              { label: 'Standard (55 cm)', d: '55' },
              { label: 'Duża / Pralko-suszarka (60 cm)', d: '60' },
            ].map((p) => (
              <TouchableOpacity
                key={p.d}
                style={[styles.smallChip, washerD === p.d && styles.smallChipActive]}
                onPress={() => setWasherD(p.d)}
              >
                <Text style={[styles.smallChipText, washerD === p.d && styles.smallChipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wynik pralki */}
          <View
            style={[
              styles.resultBox,
              washerResult.canFitInEnclosure ? styles.resultSuccess : styles.resultAlert,
            ]}
          >
            <Text style={styles.resultTitle}>
              {washerResult.canFitInEnclosure
                ? '✅ Pralka zmieści się w szafie z zapasem'
                : '❌ Drzwi szafy się nie domkną!'}
            </Text>
            <Text style={styles.resultSub}>
              Rzeczywista głębokość montażowa (z wężami i drzwiami):{' '}
              <Text style={{ fontWeight: '800' }}>
                {washerResult.effectiveInstallationDepthMm / 10} cm
              </Text>{' '}
              vs Szafa: {closetD} cm
            </Text>
            <Text style={styles.resultSub}>
              Margines swobody: {Math.round(washerResult.marginMm / 10)} cm
            </Text>
            {washerResult.warnings.map((w, i) => (
              <Text key={i} style={styles.warnText}>
                • {w}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        /* PANEL TIMERA ODSTANIA OLEJU SPRĘŻARKI (Z-189, DEC-14) */
        <View style={styles.panel}>
          <Text style={styles.infoText}>
            Weryfikacja wymaganego czasu odstoju oleju po transporcie lodówki przed podłączeniem zasilania 230V:
          </Text>

          <Text style={styles.inputLabel}>Pozycja lodówki podczas transportu:</Text>
          <View style={styles.angleRow}>
            {[
              { key: 'HORIZONTAL', label: '🛌 Na leżąco (24h)' },
              { key: 'TILTED', label: '📐 Skos >40° (12h)' },
              { key: 'UPRIGHT', label: '🧍 Pion (2h)' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.angleBtn,
                  transportOrientation === opt.key && styles.angleBtnActive,
                ]}
                onPress={() => setTransportOrientation(opt.key as TransportOrientation)}
              >
                <Text
                  style={[
                    styles.angleBtnText,
                    transportOrientation === opt.key && styles.angleBtnTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Czas od postawienia w pionie (godziny):</Text>
              <TextInput
                style={styles.input}
                value={elapsedHoursStr}
                onChangeText={setElapsedHoursStr}
                keyboardType="numeric"
                placeholder="np. 4"
              />
            </View>
          </View>

          <View style={styles.quickPresetRow}>
            {['1', '2', '6', '12', '18', '24'].map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.smallChip, elapsedHoursStr === h && styles.smallChipActive]}
                onPress={() => setElapsedHoursStr(h)}
              >
                <Text style={[styles.smallChipText, elapsedHoursStr === h && styles.smallChipTextActive]}>
                  +{h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wynik statusu sprężarki */}
          <View
            style={[
              styles.resultBox,
              compressorResult.canPowerOnSafely ? styles.resultSuccess : styles.resultAlert,
            ]}
          >
            <Text style={styles.resultTitle}>
              {compressorResult.canPowerOnSafely
                ? '✅ BEZPIECZNY ROZRUCH AGD'
                : '❌ ZAKAZ WŁĄCZANIA DO PRĄDU!'}
            </Text>
            <Text style={styles.resultSub}>
              Wymagany czas odstoju: <Text style={{ fontWeight: '800' }}>{compressorResult.requiredRestHours}h</Text> •
              Upłynęło: <Text style={{ fontWeight: '800' }}>{compressorResult.elapsedHours}h</Text>
            </Text>
            {!compressorResult.canPowerOnSafely && (
              <Text style={[styles.resultSub, { color: '#F87171', fontWeight: '800', marginTop: 4 }]}>
                ⏳ Pozostało do odczekania: {compressorResult.remainingHours} godz.
              </Text>
            )}
            <Text style={[styles.resultSub, { marginTop: 4 }]}>
              {compressorResult.riskDescription}
            </Text>

            <View style={{ marginTop: 8 }}>
              {compressorResult.safetyGuidelines.map((g, i) => (
                <Text key={i} style={styles.recText}>
                  💡 {g}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#0284C7',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  panel: {
    width: '100%',
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  angleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  angleBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  angleBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  angleBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  angleBtnTextActive: {
    color: '#FFFFFF',
  },
  quickPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  smallChip: {
    paddingVertical: 4,
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
  resultBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: '#059669',
  },
  resultAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  warnText: {
    color: '#F87171',
    fontSize: 10,
    marginTop: 3,
  },
  recText: {
    color: '#38BDF8',
    fontSize: 10,
    marginTop: 3,
  },
});
