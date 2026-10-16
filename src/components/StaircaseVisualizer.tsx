/**
 * Czy się zmieści? (FitCheck) — StaircaseVisualizer (Rzut Spocznika Schodów i Obrót Mebla w 3D)
 * Wizualizacja kinematyki Moving Sofa w zakręcie 90° L oraz 180° U z kątem pochylenia phi (RD-34).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface StaircaseVisualizerProps {
  readonly flightWidthCm: number;
  readonly landingDepthCm: number;
  readonly turnAngleDeg: 90 | 180;
  readonly itemLengthCm: number;
  readonly itemWidthCm: number;
  readonly canTurnHorizontally: boolean;
  readonly canTurnWithVerticalTilt: boolean;
  readonly requiredTiltAngleDeg?: number;
  readonly canPass: boolean;
  readonly bottleneckDescription: string;
}

export function StaircaseVisualizer({
  flightWidthCm,
  landingDepthCm,
  turnAngleDeg,
  itemLengthCm,
  itemWidthCm,
  canTurnHorizontally,
  canTurnWithVerticalTilt,
  requiredTiltAngleDeg,
  canPass,
  bottleneckDescription,
}: StaircaseVisualizerProps) {
  const canvasWidth = 280;
  const canvasHeight = 150;
  const padding = 15;

  const maxBound = Math.max(flightWidthCm * 2, landingDepthCm, itemLengthCm, 120);
  const scale = (canvasWidth - padding * 2) / maxBound;

  const w1Render = flightWidthCm * scale;
  const w2Render = landingDepthCm * scale;
  const itemLRender = itemLengthCm * scale;
  const itemWRender = Math.max(6, itemWidthCm * scale);

  let statusBg = '#064E3B';
  let statusBorder = '#059669';
  let statusTitle = '✅ MIEŚCI SIĘ NA PŁASKO';

  if (!canPass) {
    statusBg = '#451A1A';
    statusBorder = '#EF4444';
    statusTitle = '❌ ZABLOKUJE SIĘ NA SPOCZNIKU';
  } else if (canTurnWithVerticalTilt) {
    statusBg = '#0C4A6E';
    statusBorder = '#0284C7';
    statusTitle = `📐 WYMAGANE POCHYLENIE (${requiredTiltAngleDeg ?? 35}°)`;
  }

  return (
    <View style={styles.container}>
      {/* Płótno rzutu klatki schodowej */}
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {turnAngleDeg === 90 ? (
          // Zakręt 90 stopni (L-turn)
          <>
            {/* Korytarz wejściowy (z dołu) */}
            <View
              style={[
                styles.corridorPath,
                {
                  left: padding,
                  bottom: padding,
                  width: w1Render,
                  height: canvasHeight - padding * 2,
                },
              ]}
            />
            {/* Korytarz wyjściowy (w prawo) */}
            <View
              style={[
                styles.corridorPath,
                {
                  left: padding,
                  top: padding,
                  width: canvasWidth - padding * 2,
                  height: w1Render,
                },
              ]}
            />
            {/* Pole spocznika (kwadrat narożny) */}
            <View
              style={[
                styles.landingArea,
                {
                  left: padding,
                  top: padding,
                  width: Math.max(w1Render, w2Render),
                  height: Math.max(w1Render, w2Render),
                },
              ]}
            />
            {/* Obracany mebel na zakręcie (pod kątem 45 stopni) */}
            <View
              style={[
                styles.sofaBox,
                {
                  left: padding + Math.max(w1Render, w2Render) / 2 - itemLRender / 2,
                  top: padding + Math.max(w1Render, w2Render) / 2 - itemWRender / 2,
                  width: itemLRender,
                  height: itemWRender,
                  transform: [{ rotate: '45deg' }],
                  borderColor: canPass ? (canTurnHorizontally ? '#22C55E' : '#38BDF8') : '#EF4444',
                  backgroundColor: canPass
                    ? canTurnHorizontally
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(56, 189, 248, 0.3)'
                    : 'rgba(239, 68, 68, 0.4)',
                },
              ]}
            >
              <Text style={styles.sofaText} numberOfLines={1}>
                {itemLengthCm}×{itemWidthCm} cm
              </Text>
            </View>
          </>
        ) : (
          // Zakręt 180 stopni (U-turn)
          <>
            {/* Bieg 1 (z dołu w górę) */}
            <View
              style={[
                styles.corridorPath,
                {
                  left: padding,
                  bottom: padding,
                  width: w1Render,
                  height: canvasHeight - padding * 2,
                },
              ]}
            />
            {/* Bieg 2 (równoległy obok) */}
            <View
              style={[
                styles.corridorPath,
                {
                  left: padding + w1Render + 10,
                  bottom: padding,
                  width: w1Render,
                  height: canvasHeight - padding * 2,
                },
              ]}
            />
            {/* Spocznik górny łączący biegi */}
            <View
              style={[
                styles.landingArea,
                {
                  left: padding,
                  top: padding,
                  width: w1Render * 2 + 10,
                  height: w2Render,
                },
              ]}
            />
            {/* Mebel poprzecznie na spoczniku U-turn */}
            <View
              style={[
                styles.sofaBox,
                {
                  left: padding + (w1Render * 2 + 10) / 2 - itemLRender / 2,
                  top: padding + w2Render / 2 - itemWRender / 2,
                  width: itemLRender,
                  height: itemWRender,
                  borderColor: canPass ? (canTurnHorizontally ? '#22C55E' : '#38BDF8') : '#EF4444',
                  backgroundColor: canPass
                    ? canTurnHorizontally
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(56, 189, 248, 0.3)'
                    : 'rgba(239, 68, 68, 0.4)',
                },
              ]}
            >
              <Text style={styles.sofaText} numberOfLines={1}>
                {itemLengthCm}×{itemWidthCm} cm
              </Text>
            </View>
          </>
        )}

        {/* Wskaźnik wymiarów spocznika */}
        <View style={styles.dimensionBadge}>
          <Text style={styles.dimensionBadgeText}>
            Bieg W1: {flightWidthCm} cm • Spocznik W2: {landingDepthCm} cm
          </Text>
        </View>
      </View>

      {/* Pasek statusu obrotu */}
      <View style={[styles.statusBar, { backgroundColor: statusBg, borderColor: statusBorder }]}>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusSubtitle}>{bottleneckDescription}</Text>
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
  corridorPath: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  landingArea: {
    position: 'absolute',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  sofaBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sofaText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  dimensionBadge: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dimensionBadgeText: {
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
    textAlign: 'center',
  },
});
