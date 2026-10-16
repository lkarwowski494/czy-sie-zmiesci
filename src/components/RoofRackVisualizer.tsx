/**
 * Czy się zmieści? (FitCheck) — Wizualizator Bagażnika Dachowego i Zwisów Ładunku
 * Zgodność z RD-45, RD-52, art. 61 PoRD oraz DEC-54, DEC-55.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface RoofRackVisualizerProps {
  readonly effectiveLimitKg: number;
  readonly totalMountedWeightKg: number;
  readonly remainingCapacityKg: number;
  readonly isOverloaded: boolean;
  readonly capacityUtilizationPct: number;
  readonly frontOverhangMm: number;
  readonly rearOverhangMm: number;
  readonly isOverhangLegal: boolean;
  readonly requiredMarkings: readonly string[];
}

export function RoofRackVisualizer({
  effectiveLimitKg,
  totalMountedWeightKg,
  remainingCapacityKg,
  isOverloaded,
  capacityUtilizationPct,
  frontOverhangMm,
  rearOverhangMm,
  isOverhangLegal,
  requiredMarkings,
}: RoofRackVisualizerProps) {
  const progressPct = Math.min(100, capacityUtilizationPct);
  const barColor = isOverloaded ? '#EF4444' : progressPct > 85 ? '#F59E0B' : '#10B981';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛶 Nośność Dachu & Zwisy Ładunku (RD-45, RD-52)</Text>

      {/* Pasek Obciążenia Dachu */}
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeLabelRow}>
          <Text style={styles.gaugeLabel}>
            Obciążenie dachu: <Text style={styles.bold}>{totalMountedWeightKg} kg</Text> / {effectiveLimitKg} kg
          </Text>
          <Text style={[styles.gaugePct, { color: barColor }]}>
            {capacityUtilizationPct}% {isOverloaded ? 'PRZECIĄŻENIE' : ''}
          </Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPct}%`, backgroundColor: barColor }]} />
        </View>

        <Text style={styles.capacitySub}>
          {isOverloaded
            ? `Przekroczenie o ${Math.round((totalMountedWeightKg - effectiveLimitKg) * 10) / 10} kg!`
            : `Pozostały zapas nośności: ${remainingCapacityKg} kg`}
        </Text>
      </View>

      {/* Schemat zwisów ładunku (Art. 61 PoRD) */}
      <View style={styles.overhangBox}>
        <Text style={styles.overhangTitle}>🚗 Kontrola Zwisów (art. 61 ust. 6 PoRD):</Text>
        <View style={styles.overhangMetricsRow}>
          <View style={styles.overhangMetric}>
            <Text style={styles.metricLabel}>Zwis przedni (max 50 cm):</Text>
            <Text style={[styles.metricVal, frontOverhangMm > 500 ? styles.alertText : styles.safeText]}>
              {Math.round(frontOverhangMm / 10)} cm {frontOverhangMm > 500 ? '❌' : '✅'}
            </Text>
          </View>
          <View style={styles.overhangMetric}>
            <Text style={styles.metricLabel}>Zwis tylny (max 200 cm):</Text>
            <Text style={[styles.metricVal, rearOverhangMm > 2000 ? styles.alertText : styles.safeText]}>
              {Math.round(rearOverhangMm / 10)} cm {rearOverhangMm > 2000 ? '❌' : '✅'}
            </Text>
          </View>
        </View>

        {rearOverhangMm > 500 && (
          <View style={styles.flagNotice}>
            <Text style={styles.flagIcon}>🚩</Text>
            <Text style={styles.flagText}>
              Wymagana czerwona chorągiewka (min. 50×50 cm) — zwis tylny {Math.round(rearOverhangMm / 10)} cm {'>'} 50 cm!
            </Text>
          </View>
        )}

        {!isOverhangLegal && (
          <View style={styles.illegalBanner}>
            <Text style={styles.illegalText}>⚠️ ZAKAZ JAZDY: Przekroczono dopuszczalne zwisy ładunku!</Text>
          </View>
        )}

        {requiredMarkings.length > 0 && isOverhangLegal && (
          <View style={styles.markingsList}>
            {requiredMarkings.map((m, idx) => (
              <Text key={idx} style={styles.markingItem}>
                • {m}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  gaugeContainer: {
    marginBottom: 12,
  },
  gaugeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gaugeLabel: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  gaugePct: {
    fontSize: 12,
    fontWeight: '800',
  },
  bold: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  track: {
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  capacitySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  overhangBox: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  overhangTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 6,
  },
  overhangMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  overhangMetric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  safeText: {
    color: '#10B981',
  },
  alertText: {
    color: '#EF4444',
  },
  flagNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  flagIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  flagText: {
    fontSize: 11,
    color: '#FCA5A5',
    flex: 1,
  },
  illegalBanner: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  illegalText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  markingsList: {
    marginTop: 6,
  },
  markingItem: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
