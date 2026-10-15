/**
 * Czy się zmieści? (FitCheck) — Komponent Wizualizatora Bagażnika 2.5D / 2D
 * Rzut izometryczny, z góry i z boku z interaktywną kontrolą kroków załadunku (Kolejność wkładania).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dimensions3D, Position3D, TrunkGeometry } from '../domain/geometry/types';
import {
  calculateIsometricBox,
  projectToSideView,
  projectToTopView,
} from './projectionMath';

export type ProjectionMode = 'ISOMETRIC' | 'TOP_VIEW' | 'SIDE_VIEW';

export interface VisualizerItem {
  readonly itemId: string;
  readonly name: string;
  readonly positionMm: Position3D;
  readonly dimensionsMm: Dimensions3D;
  readonly sequenceOrder: number;
  readonly color?: string;
}

export interface TrunkVisualizerProps {
  readonly trunk: TrunkGeometry;
  readonly items: readonly VisualizerItem[];
  readonly vehicleName: string;
}

const ITEM_COLORS = ['#38BDF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#FB923C'];

export const TrunkVisualizer: React.FC<TrunkVisualizerProps> = ({
  trunk,
  items,
  vehicleName,
}) => {
  const [mode, setMode] = useState<ProjectionMode>('ISOMETRIC');
  const [currentStepLimit, setCurrentStepLimit] = useState<number>(items.length);

  const visibleItems = items.filter((i) => i.sequenceOrder <= currentStepLimit);

  // Wymiary kontenera rysunku
  const CANVAS_WIDTH = 320;
  const CANVAS_HEIGHT = 200;
  const ISO_SCALE = 0.11;
  const ISO_ORIGIN = { x: 160, y: 70 };

  return (
    <View style={styles.container}>
      {/* Pasek wyboru trybu projekcji */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, mode === 'ISOMETRIC' && styles.tabBtnActive]}
          onPress={() => setMode('ISOMETRIC')}
        >
          <Text style={[styles.tabText, mode === 'ISOMETRIC' && styles.tabTextActive]}>
            🧊 Izometria 2.5D
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, mode === 'TOP_VIEW' && styles.tabBtnActive]}
          onPress={() => setMode('TOP_VIEW')}
        >
          <Text style={[styles.tabText, mode === 'TOP_VIEW' && styles.tabTextActive]}>
            📐 Z góry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, mode === 'SIDE_VIEW' && styles.tabBtnActive]}
          onPress={() => setMode('SIDE_VIEW')}
        >
          <Text style={[styles.tabText, mode === 'SIDE_VIEW' && styles.tabTextActive]}>
            🚗 Z boku (Skos)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Kanwa wizualizatora */}
      <View style={styles.canvasContainer}>
        {mode === 'ISOMETRIC' && (
          <View style={[styles.canvasBox, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}>
            {/* Siatka podłogi bagażnika */}
            <View style={styles.floorOutline}>
              <Text style={styles.canvasLabel}>Ściana oparcia kanapy (Głębokość: {Math.round(trunk.lengthFloorMm / 10)} cm)</Text>
            </View>

            {/* Bryły ładunku renderowane jako bloki izometryczne */}
            {visibleItems.map((item, idx) => {
              const color = item.color ?? ITEM_COLORS[idx % ITEM_COLORS.length];
              const box = calculateIsometricBox(
                item.positionMm,
                item.dimensionsMm,
                ISO_SCALE,
                ISO_ORIGIN,
                item.itemId,
                item.sequenceOrder,
                color
              );

              return (
                <View
                  key={item.itemId}
                  style={[
                    styles.isoBlockBadge,
                    {
                      left: Math.max(10, Math.min(CANVAS_WIDTH - 90, box.center2D.x - 40)),
                      top: Math.max(10, Math.min(CANVAS_HEIGHT - 35, box.center2D.y - 12)),
                      backgroundColor: color,
                    },
                  ]}
                >
                  <Text style={styles.isoBlockText} numberOfLines={1}>
                    #{item.sequenceOrder} {item.name}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {mode === 'TOP_VIEW' && (
          <View style={[styles.canvasBox, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}>
            <View style={styles.topViewFrame}>
              <Text style={styles.apertureLabel}>⬇️ Otwór klapy załadunkowej ⬇️</Text>
              {visibleItems.map((item, idx) => {
                const rect = projectToTopView(
                  item.positionMm,
                  item.dimensionsMm,
                  CANVAS_WIDTH - 40,
                  trunk
                );
                const color = item.color ?? ITEM_COLORS[idx % ITEM_COLORS.length];
                return (
                  <View
                    key={item.itemId}
                    style={[
                      styles.topRect,
                      {
                        left: rect.x + 20,
                        top: rect.y + 20,
                        width: Math.max(15, rect.width),
                        height: Math.max(15, rect.height),
                        backgroundColor: color,
                      },
                    ]}
                  >
                    <Text style={styles.rectText}>#{item.sequenceOrder}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {mode === 'SIDE_VIEW' && (
          <View style={[styles.canvasBox, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}>
            <View style={styles.sideViewFrame}>
              <View style={styles.shelfLimitLine}>
                <Text style={styles.shelfText}>-- Linia półki ({Math.round(trunk.heightShelfMm / 10)} cm) --</Text>
              </View>
              {visibleItems.map((item, idx) => {
                const rect = projectToSideView(
                  item.positionMm,
                  item.dimensionsMm,
                  CANVAS_WIDTH - 40,
                  trunk
                );
                const color = item.color ?? ITEM_COLORS[idx % ITEM_COLORS.length];
                return (
                  <View
                    key={item.itemId}
                    style={[
                      styles.sideRect,
                      {
                        left: rect.x + 20,
                        top: Math.max(0, rect.y),
                        width: Math.max(15, rect.width),
                        height: Math.max(15, rect.height),
                        backgroundColor: color,
                      },
                    ]}
                  >
                    <Text style={styles.rectText}>#{item.sequenceOrder}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Pasek kontrolera kroków załadunku */}
      {items.length > 0 && (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            disabled={currentStepLimit <= 0}
            onPress={() => setCurrentStepLimit(Math.max(0, currentStepLimit - 1))}
          >
            <Text style={styles.stepBtnText}>◀ Cofnij</Text>
          </TouchableOpacity>

          <Text style={styles.stepStatusText}>
            Krok: {currentStepLimit} / {items.length}
          </Text>

          <TouchableOpacity
            style={styles.stepBtn}
            disabled={currentStepLimit >= items.length}
            onPress={() => setCurrentStepLimit(Math.min(items.length, currentStepLimit + 1))}
          >
            <Text style={styles.stepBtnText}>Dalej ▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 10,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasBox: {
    backgroundColor: '#0A0F1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
  },
  floorOutline: {
    position: 'absolute',
    top: 6,
    left: 8,
  },
  canvasLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  isoBlockBadge: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  isoBlockText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  topViewFrame: {
    flex: 1,
    position: 'relative',
  },
  apertureLabel: {
    position: 'absolute',
    bottom: 4,
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '700',
  },
  topRect: {
    position: 'absolute',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sideViewFrame: {
    flex: 1,
    position: 'relative',
  },
  shelfLimitLine: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    alignItems: 'center',
  },
  shelfText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '700',
  },
  sideRect: {
    position: 'absolute',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rectText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  stepBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  stepStatusText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
});
