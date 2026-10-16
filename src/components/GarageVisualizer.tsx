/**
 * Czy się zmieści? (FitCheck) — GarageVisualizer
 * Rzut frontowy wjazdu do garażu z obrysem lusterek, strefą wysiadania (65 cm) i skrajnią sufitu (RD-40, RD-41).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface GarageVisualizerProps {
  readonly gateWidthCm: number;
  readonly carWidthMirrorsCm: number;
  readonly carWidthFoldedCm: number;
  readonly garageCeilingCm: number;
  readonly tailgateHeightCm: number;
  readonly canEnterOpenMirrors: boolean;
  readonly canEnterFoldedMirrors: boolean;
  readonly willTailgateHitCeiling: boolean;
  readonly entryMarginOpenMirrorsCm: number;
}

export function GarageVisualizer({
  gateWidthCm,
  carWidthMirrorsCm,
  carWidthFoldedCm,
  garageCeilingCm,
  tailgateHeightCm,
  canEnterOpenMirrors,
  canEnterFoldedMirrors,
  willTailgateHitCeiling,
  entryMarginOpenMirrorsCm,
}: GarageVisualizerProps) {
  const canvasWidth = 280;
  const canvasHeight = 150;
  const padding = 15;

  const maxRealW = Math.max(gateWidthCm, carWidthMirrorsCm, 240);
  const scale = (canvasWidth - padding * 2) / maxRealW;

  const gateRenderW = gateWidthCm * scale;
  const carMirrorsRenderW = carWidthMirrorsCm * scale;
  const carBodyRenderW = carWidthFoldedCm * scale;
  const renderH = 90;

  let statusBg = '#064E3B';
  let statusBorder = '#059669';
  let statusTitle = '✅ SWOBODNY WJAZD (ROZŁOŻONE LUSTERKA)';

  if (!canEnterFoldedMirrors) {
    statusBg = '#451A1A';
    statusBorder = '#EF4444';
    statusTitle = '⛔ KOLIZJA NADWOZIA Z OŚCIEŻNICĄ BRAMY';
  } else if (!canEnterOpenMirrors) {
    statusBg = '#451A03';
    statusBorder = '#D97706';
    statusTitle = '⚠️ WYMAGA ZŁOŻENIA LUSTEREK BOCZNYCH';
  }

  return (
    <View style={styles.container}>
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {/* Kontur otworu bramy garażowej */}
        <View
          style={[
            styles.gateOutline,
            {
              left: (canvasWidth - gateRenderW) / 2,
              bottom: padding,
              width: gateRenderW,
              height: renderH,
            },
          ]}
        >
          <Text style={styles.gateLabel}>Światło bramy: {gateWidthCm} cm</Text>
        </View>

        {/* Sylwetka samochodu z rozłożonymi lusterkami */}
        <View
          style={[
            styles.carMirrorsBox,
            {
              left: (canvasWidth - carMirrorsRenderW) / 2,
              bottom: padding + 4,
              width: carMirrorsRenderW,
              height: 45,
              borderColor: canEnterOpenMirrors ? '#38BDF8' : '#F59E0B',
            },
          ]}
        >
          {/* Obrys bryły bez lusterek (złożone) */}
          <View
            style={[
              styles.carBodyBox,
              {
                width: carBodyRenderW,
                borderColor: canEnterFoldedMirrors ? '#22C55E' : '#EF4444',
                backgroundColor: canEnterFoldedMirrors
                  ? 'rgba(34, 197, 94, 0.25)'
                  : 'rgba(239, 68, 68, 0.35)',
              },
            ]}
          >
            <Text style={styles.carText} numberOfLines={1}>
              Auto: {carWidthFoldedCm} cm
            </Text>
          </View>
        </View>

        {/* Wskaźnik skrajni klapy / sufitu */}
        <View style={styles.ceilingIndicator}>
          <Text style={styles.ceilingText}>
            Sufit: {garageCeilingCm} cm • Klapa: {tailgateHeightCm} cm{' '}
            {willTailgateHitCeiling ? '💥 Kolizja' : '✅ Luz'}
          </Text>
        </View>
      </View>

      {/* Pasek statusu */}
      <View style={[styles.statusBar, { backgroundColor: statusBg, borderColor: statusBorder }]}>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusSub}>
          Zapas boczny z lusterkami: {Math.round(entryMarginOpenMirrorsCm)} cm (po {Math.round(entryMarginOpenMirrorsCm / 2)} cm na stronę)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  canvas: {
    backgroundColor: '#090D16',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
    overflow: 'hidden',
  },
  gateOutline: {
    position: 'absolute',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#64748B',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  gateLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  carMirrorsBox: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carBodyBox: {
    height: 38,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '800',
  },
  ceilingIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ceilingText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '600',
  },
  statusBar: {
    marginTop: 8,
    width: '100%',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statusSub: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
  },
});
