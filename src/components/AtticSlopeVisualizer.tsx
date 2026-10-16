/**
 * Czy się zmieści? (FitCheck) — Schemat 2D Skosu Poddasza i Ergonomii Wstawienia Mebla
 * Zgodność z RD-48 i DEC-57. Rysuje ściankę kolankową, profil dachu, linie 190 cm / 140 cm i mebel.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AtticSlopeVisualizerProps {
  readonly kneeWallHeightMm: number;
  readonly roofPitchDeg: number;
  readonly furnitureDepthMm: number;
  readonly furnitureHeightMm: number;
  readonly distanceFromKneeWallMm: number;
  readonly fitsUnderSlope: boolean;
  readonly minRequiredDistanceFromWallMm: number;
  readonly distanceToStandingHeight190Mm: number;
  readonly distanceToLowZone140Mm: number;
}

export function AtticSlopeVisualizer({
  kneeWallHeightMm,
  roofPitchDeg,
  furnitureDepthMm,
  furnitureHeightMm,
  distanceFromKneeWallMm,
  fitsUnderSlope,
  minRequiredDistanceFromWallMm,
  distanceToStandingHeight190Mm,
  distanceToLowZone140Mm,
}: AtticSlopeVisualizerProps) {
  // Skalowanie do obszaru roboczego 300x160 px
  const viewWidth = 300;
  const viewHeight = 160;

  // Przyjmujemy zasięg poziomy 2500 mm i pionowy 2500 mm
  const scaleX = viewWidth / 2500;
  const scaleY = viewHeight / 2500;

  const kneeWallPx = Math.max(15, Math.min(viewHeight - 20, kneeWallHeightMm * scaleY));
  const furnDepthPx = Math.max(15, Math.min(100, furnitureDepthMm * scaleX));
  const furnHeightPx = Math.max(15, Math.min(viewHeight - 10, furnitureHeightMm * scaleY));
  const furnDistPx = Math.max(0, Math.min(viewWidth - furnDepthPx - 10, distanceFromKneeWallMm * scaleX));

  const standing190Px = Math.min(viewWidth - 10, distanceToStandingHeight190Mm * scaleX);
  const lowZone140Px = Math.min(viewWidth - 10, distanceToLowZone140Mm * scaleX);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📐 Przekrój Poprzeczny Poddasza (RD-48)</Text>

      <View style={styles.canvasContainer}>
        {/* Ściana kolankowa (z lewej) */}
        <View style={[styles.kneeWall, { height: kneeWallPx }]} />

        {/* Linia podłogi */}
        <View style={styles.floorLine} />

        {/* Linia strefy niskiej 140 cm */}
        {distanceToLowZone140Mm > 0 && (
          <View style={[styles.guideLine, { left: lowZone140Px }]}>
            <Text style={styles.guideText}>140 cm</Text>
          </View>
        )}

        {/* Linia wysokości stojącej 190 cm */}
        {distanceToStandingHeight190Mm > 0 && (
          <View style={[styles.guideLine190, { left: standing190Px }]}>
            <Text style={styles.guideText190}>190 cm</Text>
          </View>
        )}

        {/* Mebel pod skosem */}
        <View
          style={[
            styles.furnitureBox,
            {
              left: 20 + furnDistPx,
              width: furnDepthPx,
              height: furnHeightPx,
              borderColor: fitsUnderSlope ? '#10B981' : '#EF4444',
              backgroundColor: fitsUnderSlope ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)',
            },
          ]}
        >
          <Text style={styles.furnitureLabel}>
            {fitsUnderSlope ? 'Mebel OK' : 'KOLIZJA'}
          </Text>
          <Text style={styles.furnitureDimText}>
            {Math.round(furnitureDepthMm / 10)}×{Math.round(furnitureHeightMm / 10)} cm
          </Text>
        </View>
      </View>

      {/* Pasek statusu */}
      <View
        style={[
          styles.statusBar,
          fitsUnderSlope ? styles.statusSuccess : styles.statusWarning,
        ]}
      >
        <Text style={styles.statusTitle}>
          {fitsUnderSlope
            ? '✅ Mebel mieści się pod skosem dachu'
            : `⚠️ Kolizja! Odsuń mebel o min. ${minRequiredDistanceFromWallMm} mm od ścianki kolankowej`}
        </Text>
        <Text style={styles.statusSub}>
          Kąt dachu: {roofPitchDeg}° • Ścianka kolankowa: {Math.round(kneeWallHeightMm / 10)} cm •
          Wysokość stojąca (190 cm) od: {Math.round(distanceToStandingHeight190Mm / 10)} cm
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
    height: 160,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  kneeWall: {
    position: 'absolute',
    left: 10,
    bottom: 0,
    width: 10,
    backgroundColor: '#64748B',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  floorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: '#475569',
  },
  guideLine: {
    position: 'absolute',
    bottom: 0,
    height: '65%',
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#F59E0B',
    borderStyle: 'dashed',
    paddingLeft: 2,
  },
  guideText: {
    fontSize: 9,
    color: '#F59E0B',
    fontWeight: '600',
  },
  guideLine190: {
    position: 'absolute',
    bottom: 0,
    height: '85%',
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#38BDF8',
    borderStyle: 'dashed',
    paddingLeft: 2,
  },
  guideText190: {
    fontSize: 9,
    color: '#38BDF8',
    fontWeight: '700',
  },
  furnitureBox: {
    position: 'absolute',
    bottom: 3,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  furnitureLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  furnitureDimText: {
    fontSize: 8,
    color: '#CBD5E1',
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
  statusWarning: {
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
