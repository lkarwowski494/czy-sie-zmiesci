/**
 * Czy się zmieści? (FitCheck) — Rzut Techniczny Boksu Self-Storage z Korytarzem Inspekcyjnym
 * Zgodność z regułą RD-50 i wymaganiem Z-166.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface SelfStorageVisualizerProps {
  readonly lengthM: number;
  readonly widthM: number;
  readonly heightM: number;
  readonly hasInspectionCorridor: boolean;
  readonly corridorWidthM: number;
  readonly usableStorageAreaM2: number;
  readonly totalFloorAreaM2: number;
  readonly corridorLossPct: number;
}

export function SelfStorageVisualizer({
  lengthM,
  widthM,
  heightM,
  hasInspectionCorridor,
  corridorWidthM,
  usableStorageAreaM2,
  totalFloorAreaM2,
  corridorLossPct,
}: SelfStorageVisualizerProps) {
  // Skalowanie do obszaru 280x140 px
  const viewWidth = 280;
  const viewHeight = 140;

  const maxDim = Math.max(lengthM, widthM, 2);
  const scale = (viewWidth - 40) / maxDim;

  const boxWidthPx = Math.max(60, widthM * scale);
  const boxLengthPx = Math.max(60, lengthM * scale);

  const corridorWidthPx = hasInspectionCorridor ? Math.max(16, corridorWidthM * scale) : 0;
  const storageZoneWidthPx = (boxWidthPx - corridorWidthPx) / 2;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📦 Rzut z Góry Boksu Self-Storage (RD-50)</Text>

      <View style={styles.canvasContainer}>
        {/* Kontur boksu magazynowego */}
        <View
          style={[
            styles.boxOutline,
            {
              width: boxWidthPx,
              height: boxLengthPx,
            },
          ]}
        >
          {/* Drzwi wejściowe na dole */}
          <View style={styles.doorMarker}>
            <Text style={styles.doorText}>WEJŚCIE</Text>
          </View>

          {hasInspectionCorridor ? (
            <View style={styles.zonesRow}>
              {/* Lewa strefa składowania */}
              <View style={[styles.storageZone, { width: storageZoneWidthPx }]}>
                <Text style={styles.zoneText}>Ładunek</Text>
              </View>

              {/* Centralny korytarz inspekcyjny 50 cm */}
              <View style={[styles.corridorZone, { width: corridorWidthPx }]}>
                <Text style={styles.corridorText}>Ścieżka {Math.round(corridorWidthM * 100)} cm</Text>
              </View>

              {/* Prawa strefa składowania */}
              <View style={[styles.storageZone, { width: storageZoneWidthPx }]}>
                <Text style={styles.zoneText}>Ładunek</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.storageZoneFull, { width: '100%', height: '100%' }]}>
              <Text style={styles.zoneText}>Cała powierzchnia ({totalFloorAreaM2} m²)</Text>
              <Text style={styles.noCorridorWarn}>⚠️ Brak swobodnego dostępu do tylnych kartonów</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pasek statusu */}
      <View style={styles.statusBar}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Powierzchnia użytkowa / całkowita:</Text>
          <Text style={styles.statusVal}>
            {usableStorageAreaM2} m² / {totalFloorAreaM2} m²
          </Text>
        </View>

        <Text style={styles.statusSub}>
          {hasInspectionCorridor
            ? `Rezerwacja korytarza 50 cm: ${corridorLossPct}% powierzchni przeznaczone na wygodny dostęp`
            : 'Zalecane wydzielenie korytarza inspekcyjnego 50 cm na bieżące przeglądanie rzeczy'}
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
    height: 140,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOutline: {
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 6,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  doorMarker: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    zIndex: 10,
  },
  doorText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#0F172A',
  },
  zonesRow: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  storageZone: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  storageZoneFull: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  zoneText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  noCorridorWarn: {
    fontSize: 8,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 2,
  },
  corridorZone: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  corridorText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FCD34D',
    textAlign: 'center',
  },
  statusBar: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  statusVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },
  statusSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
