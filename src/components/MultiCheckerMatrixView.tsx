/**
 * Czy się zmieści? (FitCheck) — MultiCheckerMatrixView
 * Jednoczesna weryfikacja macierzowa: 4 automaty paczkowe i 10 linii lotniczych (BR-LOT-001...BR-LOT-004).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { evaluateMultiCheckerMatrix } from '../domain/standards/multiCheckerMatrix';

export function MultiCheckerMatrixView() {
  const [lenCm, setLenCm] = useState('36');
  const [widthCm, setWidthCm] = useState('24');
  const [heightCm, setHeightCm] = useState('17');
  const [weightKg, setWeightKg] = useState('4');
  const [isSoftBag, setIsSoftBag] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'lockers' | 'airlines'>('all');

  const matrixResult = evaluateMultiCheckerMatrix({
    lengthMm: (parseFloat(lenCm) || 0) * 10,
    widthMm: (parseFloat(widthCm) || 0) * 10,
    heightMm: (parseFloat(heightCm) || 0) * 10,
    weightKg: parseFloat(weightKg) || 1.0,
    isSoftBag,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>
        ⚡ Szybki Multi-Checker (Wymiary uniwersalne)
      </Text>
      <Text style={styles.subtext}>
        Wpisz wymiary raz — natychmiast sprawdź 4 sieci automatów i 10 linii lotniczych:
      </Text>

      {/* Rząd wejść gabarytowych */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={lenCm}
          onChangeText={setLenCm}
          keyboardType="numeric"
          placeholder="Dł cm"
          placeholderTextColor="#64748B"
        />
        <Text style={styles.multSign}>×</Text>
        <TextInput
          style={styles.input}
          value={widthCm}
          onChangeText={setWidthCm}
          keyboardType="numeric"
          placeholder="Szer cm"
          placeholderTextColor="#64748B"
        />
        <Text style={styles.multSign}>×</Text>
        <TextInput
          style={styles.input}
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="numeric"
          placeholder="Wys cm"
          placeholderTextColor="#64748B"
        />
        <Text style={styles.multSign}>|</Text>
        <TextInput
          style={[styles.input, { flex: 0.9 }]}
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="numeric"
          placeholder="Waga kg"
          placeholderTextColor="#64748B"
        />
        <Text style={styles.unitLabel}>kg</Text>
      </View>

      {/* Przełącznik miękkiej torby */}
      <TouchableOpacity
        style={[styles.toggleButton, isSoftBag && styles.toggleButtonActive]}
        onPress={() => setIsSoftBag((prev) => !prev)}
      >
        <Text style={[styles.toggleText, isSoftBag && styles.toggleTextActive]}>
          {isSoftBag ? '🎒 Miękka torba: uwzględniono ugniecenie -10%' : '🧳 Sztywna walizka / karton (dokładny obrys)'}
        </Text>
      </TouchableOpacity>

      {/* Filtry widoku */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: `Wszystko (${matrixResult.totalLockersPassed + matrixResult.totalAirlinesPassed}/${matrixResult.lockers.length + matrixResult.airlines.length})` },
          { key: 'lockers', label: `Paczkomaty (${matrixResult.totalLockersPassed}/${matrixResult.lockers.length})` },
          { key: 'airlines', label: `Linie lotnicze (${matrixResult.totalAirlinesPassed}/${matrixResult.airlines.length})` },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filterCategory === f.key && styles.filterChipActive]}
            onPress={() => setFilterCategory(f.key as any)}
          >
            <Text style={[styles.filterChipText, filterCategory === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 1. SEKCJA AUTOMATÓW PACZKOWYCH */}
      {(filterCategory === 'all' || filterCategory === 'lockers') && (
        <View style={styles.matrixGroup}>
          <Text style={styles.groupTitle}>📦 Automaty Paczkowe (Polska & UE)</Text>
          <View style={styles.grid}>
            {matrixResult.lockers.map((l) => (
              <View
                key={l.network}
                style={[
                  styles.cardTile,
                  { borderColor: l.fits ? '#059669' : '#EF4444', backgroundColor: l.fits ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)' },
                ]}
              >
                <View style={styles.tileHeader}>
                  <Text style={styles.tileTitle}>{l.networkName}</Text>
                  <Text style={styles.statusEmoji}>{l.fits ? '✅' : '❌'}</Text>
                </View>
                <Text style={[styles.tileBadge, { color: l.fits ? '#34D399' : '#F87171' }]}>
                  {l.recommendedBox ?? 'Brak dopasowania'}
                </Text>
                <Text style={styles.tileDetails}>{l.details}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 2. SEKCJA LINII LOTNICZYCH */}
      {(filterCategory === 'all' || filterCategory === 'airlines') && (
        <View style={styles.matrixGroup}>
          <Text style={styles.groupTitle}>✈️ Sizer Lotniczy (10 Europejskich Przewoźników)</Text>
          <View style={styles.grid}>
            {matrixResult.airlines.map((a) => (
              <View
                key={a.code}
                style={[
                  styles.cardTile,
                  {
                    borderColor: a.fitsSmallFree ? '#10B981' : a.fitsPriorityCabin ? '#0284C7' : '#EF4444',
                    backgroundColor: a.fitsSmallFree
                      ? 'rgba(16, 185, 129, 0.1)'
                      : a.fitsPriorityCabin
                      ? 'rgba(2, 132, 199, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  },
                ]}
              >
                <View style={styles.tileHeader}>
                  <Text style={styles.tileTitle}>{a.name}</Text>
                  <Text style={styles.statusEmoji}>
                    {a.fitsSmallFree ? '🟢 Pod fotel' : a.fitsPriorityCabin ? '🔵 Priority' : '🔴 Luk'}
                  </Text>
                </View>
                <Text style={styles.airlineAdvisory}>{a.advisory}</Text>
                <Text style={styles.airlineDims}>
                  Mały: {a.smallDimsLabel} | Prio: {a.priorityDimsLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  multSign: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  unitLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButtonActive: {
    borderColor: '#0284C7',
    backgroundColor: '#0C4A6E',
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  matrixGroup: {
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTile: {
    width: '48%',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  tileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  statusEmoji: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  tileBadge: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  tileDetails: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  airlineAdvisory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 2,
  },
  airlineDims: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 3,
  },
});
