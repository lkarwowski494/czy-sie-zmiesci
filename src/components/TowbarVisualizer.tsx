/**
 * Czy się zmieści? (FitCheck) — TowbarVisualizer
 * Wizualizacja nacisku pionowego na kulę haka holowniczego S, wskaźnik przeciążenia i demontaż baterii e-bike (RD-44).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface TowbarVisualizerProps {
  readonly totalLoadKg: number;
  readonly limitKg: number;
  readonly isOverloaded: boolean;
  readonly remainingCapacityKg: number;
  readonly overloadKg: number;
  readonly eBikesCount: number;
  readonly batterySavingsPotentialKg: number;
  readonly loadWithBatteriesRemovedKg: number;
  readonly canBeResolvedByRemovingBatteries: boolean;
}

export function TowbarVisualizer({
  totalLoadKg,
  limitKg,
  isOverloaded,
  remainingCapacityKg,
  overloadKg,
  eBikesCount,
  batterySavingsPotentialKg,
  loadWithBatteriesRemovedKg,
  canBeResolvedByRemovingBatteries,
}: TowbarVisualizerProps) {
  const percent = Math.min(150, Math.round((totalLoadKg / limitKg) * 100));

  let barColor = '#10B981';
  if (percent > 100) {
    barColor = '#EF4444';
  } else if (percent > 85) {
    barColor = '#F59E0B';
  }

  return (
    <View style={styles.container}>
      {/* Pasek postępu nacisku pionowego S */}
      <View style={styles.loadHeaderRow}>
        <Text style={styles.loadLabel}>Wykorzystanie limitu haka S:</Text>
        <Text style={[styles.loadPercent, { color: barColor }]}>
          {percent}% ({totalLoadKg} kg / {limitKg} kg)
        </Text>
      </View>

      <View style={styles.trackBackground}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${Math.min(100, (totalLoadKg / limitKg) * 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
        {/* Znacznik limitu 100% */}
        <View style={styles.limitMarker} />
      </View>

      {/* Dynamiczna porada e-bike dot. wyjęcia baterii */}
      {isOverloaded && canBeResolvedByRemovingBatteries && (
        <View style={styles.batteryRescueBox}>
          <Text style={styles.batteryRescueTitle}>
            🔋 Ratunek dla E-Bike: Wyjmij akumulatory!
          </Text>
          <Text style={styles.batteryRescueText}>
            Demontaż baterii z {eBikesCount} rowerów obniży nacisk o {batterySavingsPotentialKg} kg (do {loadWithBatteriesRemovedKg} kg), co pozwoli zmieścić się w limicie haka S ({limitKg} kg)!
          </Text>
        </View>
      )}

      {/* Podsumowanie marginesu */}
      <View style={styles.marginRow}>
        <Text style={styles.marginLabel}>
          {isOverloaded
            ? `⛔ Przekroczenie o: +${overloadKg} kg (Grozi uszkodzeniem haka / utratą homologacji)`
            : `✅ Bezpieczny zapas nośności: ${remainingCapacityKg} kg`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  loadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  loadLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  loadPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  trackBackground: {
    height: 14,
    backgroundColor: '#0F172A',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 6,
  },
  limitMarker: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#EF4444',
  },
  batteryRescueBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  batteryRescueTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  batteryRescueText: {
    color: '#E0F2FE',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  marginRow: {
    marginTop: 6,
  },
  marginLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});
