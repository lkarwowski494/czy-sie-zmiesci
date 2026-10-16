/**
 * Czy się zmieści? (FitCheck) — DoorwayVisualizer (Rzut Poziomy Ościeżnicy, Skrzydła Drzwi i Klamki)
 * Prezentuje światło przejścia, grubość otwartego skrzydła (90° vs 180°) i kolizję z klamką (RD-33, RD-34).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface DoorwayVisualizerProps {
  readonly nominalWidthCm: number;
  readonly itemCrossSectionCm: number;
  readonly doorSwingDeg?: number;
  readonly handleOffsetCm?: number;
  readonly effectiveWidthCm: number;
  readonly canPass: boolean;
  readonly warningReason?: string;
}

export function DoorwayVisualizer({
  nominalWidthCm,
  itemCrossSectionCm,
  doorSwingDeg = 90,
  handleOffsetCm = 6,
  effectiveWidthCm,
  canPass,
  warningReason,
}: DoorwayVisualizerProps) {
  const canvasWidth = 280;
  const canvasHeight = 120;
  const padding = 20;

  const maxDimension = Math.max(nominalWidthCm, itemCrossSectionCm, 90);
  const scale = (canvasWidth - padding * 2) / maxDimension;

  const doorRenderW = nominalWidthCm * scale;
  const effectiveRenderW = effectiveWidthCm * scale;
  const itemRenderW = itemCrossSectionCm * scale;
  const doorStartX = (canvasWidth - doorRenderW) / 2;

  return (
    <View style={styles.container}>
      {/* Płótno rzutu ościeżnicy */}
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {/* Lewy węgieł ściany */}
        <View style={[styles.wallBlock, { left: 0, top: 20, width: doorStartX, height: 24 }]} />

        {/* Prawy węgieł ściany */}
        <View
          style={[
            styles.wallBlock,
            {
              left: doorStartX + doorRenderW,
              top: 20,
              width: canvasWidth - (doorStartX + doorRenderW),
              height: 24,
            },
          ]}
        />

        {/* Światło ościeżnicy (nominalne) */}
        <View
          style={[
            styles.doorOpening,
            {
              left: doorStartX,
              top: 20,
              width: doorRenderW,
              height: 24,
            },
          ]}
        />

        {/* Otwarte skrzydło drzwi (zawias po lewej) */}
        <View
          style={[
            styles.doorLeaf,
            {
              left: doorStartX,
              top: 20,
              width: Math.max(6, 4 * scale),
              height: Math.min(60, doorRenderW * (doorSwingDeg === 90 ? 0.8 : 0.4)),
            },
          ]}
        />

        {/* Wystająca klamka (-6 cm) */}
        <View
          style={[
            styles.doorHandle,
            {
              left: doorStartX + (doorSwingDeg === 90 ? Math.max(6, 4 * scale) : 0),
              top: 20 + 20,
              width: handleOffsetCm * scale,
              height: 5,
            },
          ]}
        />

        {/* Przesuwany mebel */}
        <View
          style={[
            styles.itemPassBox,
            {
              left: (canvasWidth - itemRenderW) / 2,
              top: 60,
              width: itemRenderW,
              height: 36,
              borderColor: canPass ? '#22C55E' : '#EF4444',
              backgroundColor: canPass ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.35)',
            },
          ]}
        >
          <Text style={styles.itemPassText} numberOfLines={1}>
            Mebel {itemCrossSectionCm} cm
          </Text>
        </View>

        {/* Wymiar efektywny */}
        <View style={[styles.clearanceLine, { left: doorStartX, width: effectiveRenderW, top: 48 }]}>
          <Text style={styles.clearanceLineText}>Światło: {effectiveWidthCm.toFixed(1)} cm</Text>
        </View>
      </View>

      {/* Komunikat o klamce i ościeżnicy */}
      <View
        style={[
          styles.statusBox,
          {
            backgroundColor: canPass ? '#064E3B' : '#451A1A',
            borderColor: canPass ? '#059669' : '#EF4444',
          },
        ]}
      >
        <Text style={styles.statusTitle}>
          {canPass ? '✅ PRZEJDZIE BEZPIECZNIE' : '❌ ZA CIASNO W ŚWIETLE DRZWI'}
        </Text>
        <Text style={styles.statusDesc}>
          Ościeżnica {nominalWidthCm} cm − klamka ({handleOffsetCm} cm) − grubość skrzydła = {effectiveWidthCm.toFixed(1)} cm światła
        </Text>
        {warningReason && <Text style={styles.warningAlert}>⚠️ {warningReason}</Text>}
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
  wallBlock: {
    position: 'absolute',
    backgroundColor: '#475569',
  },
  doorOpening: {
    position: 'absolute',
    borderBottomWidth: 1,
    borderBottomColor: '#64748B',
    borderStyle: 'dashed',
  },
  doorLeaf: {
    position: 'absolute',
    backgroundColor: '#0284C7',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  doorHandle: {
    position: 'absolute',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  itemPassBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPassText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  clearanceLine: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: '#38BDF8',
    alignItems: 'center',
  },
  clearanceLineText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBox: {
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
  statusDesc: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  warningAlert: {
    color: '#FDE68A',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});
