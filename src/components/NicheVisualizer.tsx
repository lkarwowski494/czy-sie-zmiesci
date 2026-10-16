/**
 * Czy się zmieści? (FitCheck) — NicheVisualizer (Rzut Wnęki i Mebla z Listwami Przypodłogowymi)
 * Wizualizacja rzutu poziomego wnęki ściennej, dylatacji listew i luzów montażowych (RD-33, RD-34).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface NicheVisualizerProps {
  readonly nicheWidthCm: number;
  readonly nicheDepthCm: number;
  readonly furnitureWidthCm: number;
  readonly furnitureDepthCm: number;
  readonly skirtingThicknessMm?: number;
  readonly fitsNominal: boolean;
  readonly fitsWithSkirting: boolean;
  readonly minClearanceMm: number;
}

export function NicheVisualizer({
  nicheWidthCm,
  nicheDepthCm,
  furnitureWidthCm,
  furnitureDepthCm,
  skirtingThicknessMm = 20,
  fitsNominal,
  fitsWithSkirting,
  minClearanceMm,
}: NicheVisualizerProps) {
  const canvasWidth = 280;
  const canvasHeight = 150;
  const padding = 20;

  const maxRealW = Math.max(nicheWidthCm, furnitureWidthCm, 100);
  const maxRealD = Math.max(nicheDepthCm, furnitureDepthCm, 60);

  const scaleX = (canvasWidth - padding * 2) / maxRealW;
  const scaleY = (canvasHeight - padding * 2) / maxRealD;
  const scale = Math.min(scaleX, scaleY);

  const nicheRenderW = nicheWidthCm * scale;
  const nicheRenderD = nicheDepthCm * scale;

  const furnRenderW = furnitureWidthCm * scale;
  const furnRenderD = furnitureDepthCm * scale;

  const skirtingRenderW = (skirtingThicknessMm / 10) * scale;

  // Wyśrodkowanie wnęki w canvasie
  const nicheStartX = (canvasWidth - nicheRenderW) / 2;
  const nicheStartY = padding;

  // Mebel dosunięty do tylnej ściany, wyśrodkowany w szerokości
  const furnStartX = (canvasWidth - furnRenderW) / 2;
  const furnStartY = nicheStartY;

  let statusBg = '#064E3B';
  let statusBorder = '#059669';
  let statusText = '✅ PASUJE IDEALNIE';

  if (!fitsNominal) {
    statusBg = '#451A1A';
    statusBorder = '#EF4444';
    statusText = '❌ MEBEL ZA SZEROKI NA WNĘKĘ';
  } else if (!fitsWithSkirting) {
    statusBg = '#451A03';
    statusBorder = '#F59E0B';
    statusText = '⚠️ KOLIZJA Z LISTWĄ PRZYPODŁOGOWĄ';
  }

  return (
    <View style={styles.container}>
      {/* Płótno rzutu z góry */}
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {/* Ściana tylna i boczne wnęki */}
        <View
          style={[
            styles.nicheWall,
            {
              left: nicheStartX,
              top: nicheStartY,
              width: nicheRenderW,
              height: nicheRenderD,
            },
          ]}
        >
          {/* Listwa przypodłogowa lewa */}
          <View
            style={[
              styles.skirtingBoard,
              {
                left: 0,
                top: 0,
                bottom: 0,
                width: Math.max(3, skirtingRenderW),
              },
            ]}
          />
          {/* Listwa przypodłogowa prawa */}
          <View
            style={[
              styles.skirtingBoard,
              {
                right: 0,
                top: 0,
                bottom: 0,
                width: Math.max(3, skirtingRenderW),
              },
            ]}
          />
        </View>

        {/* Wstawiony mebel */}
        <View
          style={[
            styles.furnitureBox,
            {
              left: furnStartX,
              top: furnStartY,
              width: furnRenderW,
              height: furnRenderD,
              borderColor: fitsWithSkirting ? '#38BDF8' : '#F87171',
              backgroundColor: fitsWithSkirting ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.35)',
            },
          ]}
        >
          <Text style={styles.furnitureLabel} numberOfLines={1}>
            Mebel {furnitureWidthCm} × {furnitureDepthCm} cm
          </Text>
        </View>

        {/* Etykieta wnęki */}
        <View style={[styles.nicheLabelBadge, { top: nicheStartY + nicheRenderD + 4 }]}>
          <Text style={styles.nicheLabelText}>
            Wnęka: {nicheWidthCm} cm (luz: {Math.round(minClearanceMm)} mm)
          </Text>
        </View>
      </View>

      {/* Pasek statusu */}
      <View style={[styles.statusBar, { backgroundColor: statusBg, borderColor: statusBorder }]}>
        <Text style={styles.statusTitle}>{statusText}</Text>
        <Text style={styles.statusSubtitle}>
          Listwy: {skirtingThicknessMm} mm z obu stron • Wolny luz montażowy: {Math.round(minClearanceMm)} mm
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
  nicheWall: {
    position: 'absolute',
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#64748B',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  skirtingBoard: {
    position: 'absolute',
    backgroundColor: '#F59E0B',
    opacity: 0.8,
  },
  furnitureBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  furnitureLabel: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  nicheLabelBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nicheLabelText: {
    color: '#94A3B8',
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
  statusSubtitle: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
  },
});
