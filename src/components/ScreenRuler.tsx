/**
 * Czy się zmieści? (FitCheck) — ScreenRuler
 * Ekranowa linijka referencyjna 1:1 z podziałką milimetrową i kalibracją fizyczną (BR-POM-002).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  calculateScreenPointsForMm,
  STANDARD_REFERENCE_OBJECTS,
} from '../domain/measuring/tapeMeasureAssistant';

export interface ScreenRulerProps {
  readonly maxCm?: number;
  readonly screenPpi?: number;
  readonly displayScale?: number;
}

export function ScreenRuler({
  maxCm = 15,
  screenPpi = 460,
  displayScale = 3.0,
}: ScreenRulerProps) {
  const [selectedRef, setSelectedRef] = useState<string>('credit_card');
  const [customMm, setCustomMm] = useState<number>(85.6);

  // Punkty na 1 mm
  const pointsPerMm = calculateScreenPointsForMm(1, screenPpi, displayScale);
  const totalLengthMm = maxCm * 10;
  const totalPoints = calculateScreenPointsForMm(totalLengthMm, screenPpi, displayScale);

  const activeRef = STANDARD_REFERENCE_OBJECTS.find((r) => r.id === selectedRef);
  const targetMm = activeRef ? activeRef.lengthMm : customMm;
  const targetPoints = calculateScreenPointsForMm(targetMm, screenPpi, displayScale);

  // Generowanie podziałki cm (co 1 cm)
  const cmMarks = Array.from({ length: maxCm + 1 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📏 Fizyczna Linijka Ekranowa 1:1 (BR-POM-002)</Text>
      <Text style={styles.subtitle}>
        Przyłóż mały przedmiot bezpośrednio do ekranu. Skalibrowano pod gęstość {screenPpi} PPI:
      </Text>

      {/* Szybki wybór obiektu kalibracyjnego */}
      <View style={styles.presetRow}>
        {STANDARD_REFERENCE_OBJECTS.filter((r) => r.id !== 'a4_paper').map((ref) => {
          const isSelected = selectedRef === ref.id;
          return (
            <TouchableOpacity
              key={ref.id}
              style={[styles.refChip, isSelected && styles.refChipActive]}
              onPress={() => {
                setSelectedRef(ref.id);
                setCustomMm(ref.lengthMm);
              }}
            >
              <Text style={[styles.refChipText, isSelected && styles.refChipTextActive]}>
                {ref.name} ({ref.lengthMm} mm)
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pasek linijki ze znacznikami */}
      <View style={[styles.rulerTrack, { width: Math.min(320, totalPoints + 20) }]}>
        {/* Obszar podświetlający długość referencyjną */}
        <View
          style={[
            styles.referenceOverlay,
            {
              width: targetPoints,
            },
          ]}
        >
          <Text style={styles.overlayText}>
            Wzorzec: {targetMm} mm (±0.5 mm)
          </Text>
        </View>

        {/* Podziałka milimetrowa i centymetrowa */}
        <View style={styles.ticksContainer}>
          {cmMarks.map((cm) => {
            const leftPos = cm * 10 * pointsPerMm;
            return (
              <View key={cm} style={[styles.cmTickGroup, { left: leftPos }]}>
                <View style={styles.cmTick} />
                <Text style={styles.cmLabel}>{cm}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Kontrolki dokładnego pomiaru */}
      <View style={styles.measurementReadout}>
        <Text style={styles.readoutLabel}>Zmierzony wymiar:</Text>
        <Text style={styles.readoutValue}>{targetMm} mm</Text>
        <Text style={styles.readoutSub}>({(targetMm / 10).toFixed(1)} cm / {(targetMm / 25.4).toFixed(2)}″)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
    width: '100%',
  },
  refChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  refChipActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  refChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  refChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rulerTrack: {
    height: 70,
    backgroundColor: '#090D16',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  referenceOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderRightWidth: 2,
    borderRightColor: '#38BDF8',
    justifyContent: 'center',
    paddingLeft: 6,
  },
  overlayText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  ticksContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 35,
  },
  cmTickGroup: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  cmTick: {
    width: 2,
    height: 20,
    backgroundColor: '#F8FAFC',
  },
  cmLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  measurementReadout: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  readoutLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  readoutValue: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
  },
  readoutSub: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});
