/**
 * Czy się zmieści? (FitCheck) — Schemat 2D Klatki Kennelowej i Skosu Szyby Bagażnika
 * Zgodność z RD-46 i Z-184. Rzut boczny bagażnika ze skosem klapy i trapezową klatką.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface DogKennelVisualizerProps {
  readonly kennelDepthBottomCm: number;
  readonly kennelDepthTopCm: number;
  readonly kennelHeightCm: number;
  readonly trunkFloorLengthCm: number;
  readonly windowSlopeAngleDeg: number;
  readonly rearBevelAngleDeg: number;
  readonly fitsInTrunk: boolean;
  readonly fitsWindowSlope: boolean;
  readonly windowClearanceAtTopRearMm: number;
}

export function DogKennelVisualizer({
  kennelDepthBottomCm,
  kennelDepthTopCm,
  kennelHeightCm,
  trunkFloorLengthCm,
  windowSlopeAngleDeg,
  rearBevelAngleDeg,
  fitsInTrunk,
  fitsWindowSlope,
  windowClearanceAtTopRearMm,
}: DogKennelVisualizerProps) {
  // Skalowanie do obszaru 280x150 px
  const viewWidth = 280;
  const viewHeight = 150;
  const scale = viewWidth / Math.max(120, trunkFloorLengthCm + 15);

  const floorPx = Math.min(viewWidth - 20, trunkFloorLengthCm * scale);
  const cageBottomPx = Math.min(floorPx, kennelDepthBottomCm * scale);
  const cageTopPx = Math.min(cageBottomPx, kennelDepthTopCm * scale);
  const cageHeightPx = Math.min(viewHeight - 25, kennelHeightCm * scale);

  const isCollision = !fitsInTrunk || !fitsWindowSlope;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🐕 Rzut Boczny Klatki Kennelowej (RD-46)</Text>

      <View style={styles.canvasContainer}>
        {/* Oparcie kanapy z lewej */}
        <View style={[styles.seatBack, { height: viewHeight - 20 }]} />

        {/* Linia podłogi */}
        <View style={[styles.floorLine, { width: floorPx }]} />

        {/* Obrys skosu szyby (linia ukośna z prawej) */}
        <View style={styles.windowSlopeWrapper}>
          <Text style={styles.windowAngleText}>Szyba {windowSlopeAngleDeg}°</Text>
        </View>

        {/* Bryła klatki kennelowej (trapez boczny) */}
        <View
          style={[
            styles.kennelBox,
            {
              left: 14,
              width: cageBottomPx,
              height: cageHeightPx,
              borderColor: isCollision ? '#EF4444' : '#10B981',
              backgroundColor: isCollision ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            },
          ]}
        >
          <View style={styles.kennelHeaderRow}>
            <Text style={styles.kennelTitle}>
              {isCollision ? '💥 KOLIZJA' : '✅ PASUJE'}
            </Text>
            <Text style={styles.bevelBadge}>Ścięcie {rearBevelAngleDeg}°</Text>
          </View>
          <Text style={styles.kennelDims}>
            Góra: {Math.round(kennelDepthTopCm)} cm • Dół: {Math.round(kennelDepthBottomCm)} cm
          </Text>
        </View>
      </View>

      {/* Pasek podsumowania */}
      <View
        style={[
          styles.statusBar,
          isCollision ? styles.statusAlert : styles.statusSuccess,
        ]}
      >
        <Text style={styles.statusTitle}>
          {isCollision
            ? '⚠️ Klatka uderza w szybę klapy lub jest za długa'
            : `✅ Bezpieczny odstęp od szyby: ${Math.round(windowClearanceAtTopRearMm / 10)} cm`}
        </Text>
        <Text style={styles.statusSub}>
          Kąt ścięcia klatki: {rearBevelAngleDeg}° • Kąt szyby klapy: {windowSlopeAngleDeg}°
        </Text>
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
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  canvasContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  seatBack: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    width: 6,
    backgroundColor: '#64748B',
    borderRadius: 3,
  },
  floorLine: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    height: 4,
    backgroundColor: '#475569',
  },
  windowSlopeWrapper: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  windowAngleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  kennelBox: {
    position: 'absolute',
    bottom: 4,
    borderWidth: 2,
    borderRadius: 6,
    padding: 6,
    justifyContent: 'space-between',
  },
  kennelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kennelTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bevelBadge: {
    fontSize: 9,
    backgroundColor: '#334155',
    color: '#CBD5E1',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  kennelDims: {
    fontSize: 9,
    color: '#94A3B8',
  },
  statusBar: {
    padding: 10,
    borderRadius: 8,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statusAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  statusSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
