/**
 * Czy się zmieści? (FitCheck) — ElevatorVisualizer
 * Rzut przestrzenny kabiny windy i weryfikacja przekątnej 3D sqrt(D^2 + S^2 + W^2) (RD-35).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ElevatorVisualizerProps {
  readonly cabinDepthCm: number;
  readonly cabinWidthCm: number;
  readonly cabinHeightCm: number;
  readonly doorWidthCm: number;
  readonly itemLengthCm: number;
  readonly itemWidthCm: number;
  readonly spatialDiagonalCm: number;
  readonly maxRigidLengthCm: number;
  readonly fitsThroughDoor: boolean;
  readonly fitsInsideCabin: boolean;
}

export function ElevatorVisualizer({
  cabinDepthCm,
  cabinWidthCm,
  cabinHeightCm,
  doorWidthCm,
  itemLengthCm,
  itemWidthCm,
  spatialDiagonalCm,
  maxRigidLengthCm,
  fitsThroughDoor,
  fitsInsideCabin,
}: ElevatorVisualizerProps) {
  const canvasWidth = 280;
  const canvasHeight = 150;
  const padding = 15;

  const maxBound = Math.max(cabinWidthCm + cabinDepthCm * 0.5, cabinHeightCm, itemLengthCm, 180);
  const scale = (canvasHeight - padding * 2) / maxBound;

  const wRender = Math.max(50, cabinWidthCm * scale);
  const hRender = Math.max(70, cabinHeightCm * scale);
  const dOffset = Math.max(20, (cabinDepthCm * 0.4) * scale);

  let statusBg = '#064E3B';
  let statusBorder = '#059669';
  let statusTitle = '✅ MIEŚCI SIĘ W WINDZIE (PO PRZEKĄTNEJ)';

  if (!fitsThroughDoor) {
    statusBg = '#451A1A';
    statusBorder = '#EF4444';
    statusTitle = '❌ ZBYT SZEROKI NA DRZWI WINDY';
  } else if (!fitsInsideCabin) {
    statusBg = '#451A1A';
    statusBorder = '#EF4444';
    statusTitle = '❌ ZA DŁUGI NA PRZEKĄTNĄ KABINY';
  }

  return (
    <View style={styles.container}>
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {/* Tylna ściana kabiny */}
        <View
          style={[
            styles.cabinBackWall,
            {
              left: padding + dOffset,
              top: padding,
              width: wRender,
              height: hRender,
            },
          ]}
        />

        {/* Podłoga kabiny (rzut ukośny) */}
        <View
          style={[
            styles.cabinFloor,
            {
              left: padding,
              top: padding + hRender - dOffset,
              width: wRender,
              height: dOffset,
            },
          ]}
        />

        {/* Przednia ściana kabiny z drzwiami */}
        <View
          style={[
            styles.cabinFrontWall,
            {
              left: padding,
              top: padding + dOffset,
              width: wRender,
              height: hRender,
            },
          ]}
        >
          {/* Obrys drzwi */}
          <View
            style={[
              styles.doorOutline,
              {
                width: Math.min(wRender - 8, doorWidthCm * scale),
                height: hRender - 10,
              },
            ]}
          >
            <Text style={styles.doorText}>Drzwi {doorWidthCm} cm</Text>
          </View>
        </View>

        {/* Linia przekątnej przestrzennej 3D */}
        <View
          style={[
            styles.diagonalLine,
            {
              left: padding + 6,
              bottom: padding + 6,
              width: Math.sqrt(Math.pow(wRender + dOffset, 2) + Math.pow(hRender, 2)),
              transform: [
                {
                  rotate: `-${Math.round(
                    (Math.atan2(hRender, wRender + dOffset) * 180) / Math.PI
                  )}deg`,
                },
              ],
              borderColor: fitsInsideCabin ? '#38BDF8' : '#EF4444',
            },
          ]}
        />

        {/* Etykieta przekątnej */}
        <View style={styles.diagBadge}>
          <Text style={styles.diagBadgeText}>
            Przekątna 3D: {Math.round(spatialDiagonalCm)} cm (Max dł: {Math.round(maxRigidLengthCm)} cm)
          </Text>
        </View>
      </View>

      {/* Pasek statusu */}
      <View style={[styles.statusBar, { backgroundColor: statusBg, borderColor: statusBorder }]}>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusSub}>
          Mebel {itemLengthCm}×{itemWidthCm} cm vs Światło drzwi {doorWidthCm} cm
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
  cabinBackWall: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cabinFloor: {
    position: 'absolute',
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  cabinFrontWall: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  doorOutline: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
  },
  diagonalLine: {
    position: 'absolute',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    transformOrigin: 'bottom left',
  },
  diagBadge: {
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
  diagBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
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
