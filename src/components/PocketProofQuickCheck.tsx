// ============================================================================
// Czy się zmieści? (FitCheck) — Pocket-Proof Quick Check (Store-to-Trunk Instant Verdict)
// Szybka weryfikacja w 5 sekund w sklepie IKEA lub na parkingu:
// Wybierz mebel + wybierz auto -> NATYCHMIASTOWY WERDYKT (TAK / ZŁÓŻ KANAPĘ / NIE).
// Zgodne ze standardem UX Pocket-Proof (DEC-05, DEC-30, DEC-42).
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { POPULAR_VEHICLES_PRESETS, VehiclePreset } from '../data/presets/vehicles';
import { CARGO_ITEMS_PRESETS, ExtendedCargoItemPreset } from '../data/presets/cargoItems';
import { packItemsInTrunk, isInsideTrunkBoundary } from '../domain/geometry/extremePoints';
import { TrunkGeometry } from '../domain/geometry/types';
import {
  useUnitSystem,
  formatDimension,
  formatDimensions3D,
  formatVolume,
} from '../lib/unit-converter';
import { t, useLang } from '../lib/i18n';
import { useAppAccess } from '../services/app-access';

export interface PocketProofQuickCheckProps {
  readonly onOpenFullSimulator?: (vehicleId: string, itemId: string) => void;
  readonly onRequestPaywall?: () => void;
}

export type VerdictStatus = 'FITS_TRUNK' | 'FITS_FOLDED_SEATS' | 'DOES_NOT_FIT';

export interface VerdictResult {
  readonly status: VerdictStatus;
  readonly title: string;
  readonly message: string;
  readonly lengthMarginCm: number;
  readonly widthMarginCm: number;
  readonly heightMarginCm: number;
  readonly criticalDimensionName?: string;
  readonly requiresVerticalTransport?: boolean;
}

export function calculateQuickVerdict(
  trunk: TrunkGeometry,
  item: {
    dimensionsMm: { lengthMm: number; widthMm: number; heightMm: number };
    rotationConstraint?: 'XYZ' | 'Z_ONLY' | 'NONE';
  }
): VerdictResult {
  const cargoItem = {
    id: 'quick-check-item',
    name: 'Quick Check Item',
    dimensionsMm: item.dimensionsMm,
    weightKg: 20,
    rotationConstraint: item.rotationConstraint ?? ('XYZ' as const),
    isFragile: false,
    isSoft: false,
    allowStacking: true,
  };

  // 1. Sprawdzenie w standardowym bagażniku
  const standardResult = packItemsInTrunk([cargoItem as any], trunk);
  const lenMargin = Math.round((trunk.lengthFloorMm - item.dimensionsMm.lengthMm) / 10);
  const widthMargin = Math.round((trunk.widthMinMm - item.dimensionsMm.widthMm) / 10);
  const heightMargin = Math.round((trunk.heightRoofMm - item.dimensionsMm.heightMm) / 10);

  if (standardResult.placements.length === 1) {
    return {
      status: 'FITS_TRUNK',
      title: t('ZAPAKUJESZ BEZ PROBLEMU!'),
      message: t(
        'Mebel mieści się w bagażniku bez składania kanapy. Zapas do klapy: {margin} cm.',
        { margin: Math.max(0, lenMargin) }
      ),
      lengthMarginCm: lenMargin,
      widthMarginCm: widthMargin,
      heightMarginCm: heightMargin,
    };
  }

  // 2. Sprawdzenie w wariancie ze złożoną tylną kanapą
  const foldedLengthMm = Math.round(trunk.lengthFloorMm * 1.75); // Typowe przedłużenie po złożeniu oparcia
  const foldedTrunk: TrunkGeometry = {
    ...trunk,
    lengthFloorMm: foldedLengthMm,
    lengthRoofMm: Math.round(foldedLengthMm * 0.8),
  };

  const foldedResult = packItemsInTrunk([cargoItem as any], foldedTrunk);
  const foldedLenMargin = Math.round((foldedLengthMm - item.dimensionsMm.lengthMm) / 10);

  if (foldedResult.placements.length === 1) {
    return {
      status: 'FITS_FOLDED_SEATS',
      title: t('ZŁÓŻ TYLNĄ KANAPĘ!'),
      message: t(
        'Mebel jest za długi na standardowy bagażnik, ale wejdzie na płasko po złożeniu foteli (długość ładunkowa: {len} cm).',
        { len: Math.round(foldedLengthMm / 10) }
      ),
      lengthMarginCm: foldedLenMargin,
      widthMarginCm: widthMargin,
      heightMarginCm: heightMargin,
    };
  }

  // 3. Nie mieści się nawet po złożeniu kanapy
  let reason = t('Wymiary paczki przekraczają maksymalną przestrzeń ładunkową auta.');
  if (item.dimensionsMm.lengthMm > foldedLengthMm) {
    const deficit = Math.round((item.dimensionsMm.lengthMm - foldedLengthMm) / 10);
    reason = t('Paczka wystaje o {deficit} cm poza krawędź bagażnika nawet przy złożonej kanapie!', {
      deficit,
    });
  } else if (item.dimensionsMm.widthMm > trunk.widthMaxMm) {
    reason = t('Szerokość mebla przekracza szerokość otworu bagażnika między nadkolami.');
  } else if (item.dimensionsMm.heightMm > trunk.heightRoofMm) {
    reason = t('Wysokość mebla przekracza wysokość dachu bagażnika.');
  }

  return {
    status: 'DOES_NOT_FIT',
    title: t('NIE ZMIEŚCI SIĘ!'),
    message: reason,
    lengthMarginCm: foldedLenMargin,
    widthMarginCm: widthMargin,
    heightMarginCm: heightMargin,
    criticalDimensionName: t('Długość'),
  };
}

export function PocketProofQuickCheck({
  onOpenFullSimulator,
  onRequestPaywall,
}: PocketProofQuickCheckProps) {
  useLang();
  const unitSystem = useUnitSystem();
  const access = useAppAccess();

  const [selectedCarId, setSelectedCarId] = useState<string>(POPULAR_VEHICLES_PRESETS[0].id);
  const [selectedItemId, setSelectedItemId] = useState<string>(CARGO_ITEMS_PRESETS[0].id);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Własne wymiary (jeśli mebel spoza katalogu)
  const [customLen, setCustomLen] = useState<string>('120');
  const [customWidth, setCustomWidth] = useState<string>('60');
  const [customHeight, setCustomHeight] = useState<string>('40');

  const handleSelectCar = (carId: string) => {
    if (!access.canCreate) {
      onRequestPaywall?.();
      return;
    }
    setSelectedCarId(carId);
  };

  const handleSelectItem = (itemId: string) => {
    if (!access.canCreate) {
      onRequestPaywall?.();
      return;
    }
    setSelectedItemId(itemId);
    access.recordProject();
  };

  const handleSwitchMode = (custom: boolean) => {
    if (!access.canCreate) {
      onRequestPaywall?.();
      return;
    }
    setIsCustomMode(custom);
    if (custom) {
      access.recordProject();
    }
  };

  const handleOpenSimulator = () => {
    if (!access.canCreate) {
      onRequestPaywall?.();
      return;
    }
    access.recordProject();
    onOpenFullSimulator?.(selectedCarId, activeCargoItem.id);
  };

  const selectedVehicle = useMemo<VehiclePreset>(() => {
    return (
      POPULAR_VEHICLES_PRESETS.find((v) => v.id === selectedCarId) ??
      POPULAR_VEHICLES_PRESETS[0]
    );
  }, [selectedCarId]);

  const activeCargoItem = useMemo(() => {
    if (isCustomMode) {
      const unitMultiplier = unitSystem === 'imperial' ? 25.4 : 10;
      const l = Math.max(10, (parseFloat(customLen) || 100) * unitMultiplier);
      const w = Math.max(10, (parseFloat(customWidth) || 50) * unitMultiplier);
      const h = Math.max(10, (parseFloat(customHeight) || 40) * unitMultiplier);
      return {
        id: 'custom-input',
        name: t('Własny mebel / gabaryt'),
        dimensionsMm: { lengthMm: l, widthMm: w, heightMm: h },
        weightKg: 20,
        rotationConstraint: 'XYZ' as const,
        isFragile: false,
        isSoft: false,
        allowStacking: true,
      };
    }
    return (
      CARGO_ITEMS_PRESETS.find((i) => i.id === selectedItemId) ??
      CARGO_ITEMS_PRESETS[0]
    );
  }, [isCustomMode, customLen, customWidth, customHeight, selectedItemId]);

  // Obliczenie natychmiastowego werdyktu Store-to-Trunk
  const verdict = useMemo<VerdictResult>(() => {
    return calculateQuickVerdict(selectedVehicle.trunk, activeCargoItem);
  }, [selectedVehicle, activeCargoItem]);

  const verdictTheme = useMemo(() => {
    switch (verdict.status) {
      case 'FITS_TRUNK':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '#10B981',
          text: '#34D399',
          badge: t('✅ TAK (Bagażnik)'),
        };
      case 'FITS_FOLDED_SEATS':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '#F59E0B',
          text: '#FBBF24',
          badge: t('⚠️ ZŁÓŻ KANAPĘ'),
        };
      case 'DOES_NOT_FIT':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#EF4444',
          text: '#F87171',
          badge: t('❌ NIE WEJDZIE'),
        };
    }
  }, [verdict.status]);

  return (
    <View style={styles.card}>
      {/* Nagłówek Pocket-Proof */}
      <View style={styles.cardHeader}>
        <View style={styles.pocketBadge}>
          <Text style={styles.pocketBadgeText}>{t('POCKET-PROOF · STORE-TO-TRUNK')}</Text>
        </View>
        <Text style={styles.cardTitle}>{t('Błyskawiczna weryfikacja w sklepie')}</Text>
        <Text style={styles.cardSubtitle}>
          {t('Wybierz auto i mebel, aby w 3 sekundy poznać werdykt przed pójściem do kasy.')}
        </Text>
      </View>

      {/* Szybki wybór samochodu */}
      <Text style={styles.sectionLabel}>{t('Twój samochód:')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} keyboardShouldPersistTaps="handled">
        {POPULAR_VEHICLES_PRESETS.map((v) => {
          const isSelected = v.id === selectedCarId;
          return (
            <TouchableOpacity
              key={v.id}
              testID={`quick-car-${v.id}`}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleSelectCar(v.id)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {v.make} {v.model}
              </Text>
              <Text style={[styles.chipSubtext, isSelected && styles.chipSubtextSelected]}>
                {formatVolume(v.vdaVolumeLiters, unitSystem)} · {v.bodyType}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Wybór trybu: z katalogu vs własne wymiary */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, !isCustomMode && styles.modeTabActive]}
          onPress={() => handleSwitchMode(false)}
        >
          <Text style={[styles.modeTabText, !isCustomMode && styles.modeTabTextActive]}>
            {t('Popularne meble i AGD')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, isCustomMode && styles.modeTabActive]}
          onPress={() => handleSwitchMode(true)}
        >
          <Text style={[styles.modeTabText, isCustomMode && styles.modeTabTextActive]}>
            {t('Wpisz wymiary z etykiety')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista mebli z bazy */}
      {!isCustomMode ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} keyboardShouldPersistTaps="handled">
          {CARGO_ITEMS_PRESETS.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <TouchableOpacity
                key={item.id}
                testID={`quick-item-${item.id}`}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => handleSelectItem(item.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {item.name}
                </Text>
                <Text style={[styles.chipSubtext, isSelected && styles.chipSubtextSelected]}>
                  {formatDimensions3D(
                    item.dimensionsMm.lengthMm / 10,
                    item.dimensionsMm.widthMm / 10,
                    item.dimensionsMm.heightMm / 10,
                    unitSystem
                  )}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        /* Formularz wpisywania wymiarów z kartonu w IKEA */
        <View style={styles.customDimRow}>
          <View style={styles.dimField}>
            <Text style={styles.dimLabel}>
              {unitSystem === 'imperial' ? t('Długość (in):') : t('Długość (cm):')}
            </Text>
            <TextInput
              testID="custom-len-input"
              style={styles.dimInput}
              keyboardType="numeric"
              value={customLen}
              onChangeText={(val) => {
                if (!access.canCreate) {
                  onRequestPaywall?.();
                  return;
                }
                setCustomLen(val);
              }}
            />
          </View>
          <View style={styles.dimField}>
            <Text style={styles.dimLabel}>
              {unitSystem === 'imperial' ? t('Szerokość (in):') : t('Szerokość (cm):')}
            </Text>
            <TextInput
              testID="custom-width-input"
              style={styles.dimInput}
              keyboardType="numeric"
              value={customWidth}
              onChangeText={(val) => {
                if (!access.canCreate) {
                  onRequestPaywall?.();
                  return;
                }
                setCustomWidth(val);
              }}
            />
          </View>
          <View style={styles.dimField}>
            <Text style={styles.dimLabel}>
              {unitSystem === 'imperial' ? t('Wysokość (in):') : t('Wysokość (cm):')}
            </Text>
            <TextInput
              testID="custom-height-input"
              style={styles.dimInput}
              keyboardType="numeric"
              value={customHeight}
              onChangeText={(val) => {
                if (!access.canCreate) {
                  onRequestPaywall?.();
                  return;
                }
                setCustomHeight(val);
              }}
            />
          </View>
        </View>
      )}

      {/* WIDOK WERDYKTU POCKET-PROOF (1-TAP RESULT) */}
      <View
        testID="verdict-banner"
        style={[
          styles.verdictCard,
          { backgroundColor: verdictTheme.bg, borderColor: verdictTheme.border },
        ]}
      >
        <View style={styles.verdictHeader}>
          <Text style={[styles.verdictBadge, { color: verdictTheme.text }]}>
            {verdictTheme.badge}
          </Text>
          <Text style={[styles.verdictTitle, { color: verdictTheme.text }]}>
            {verdict.title}
          </Text>
        </View>

        <Text style={styles.verdictMessage}>{verdict.message}</Text>

        {/* Szczegóły marginesów */}
        <View style={styles.marginsRow}>
          <Text style={styles.marginText}>
            {t('Zapas długości: {val}', { val: formatDimension(verdict.lengthMarginCm, unitSystem) })}
          </Text>
          <Text style={styles.marginText}>
            {t('Zapas szerokości: {val}', { val: formatDimension(verdict.widthMarginCm, unitSystem) })}
          </Text>
          <Text style={styles.marginText}>
            {t('Zapas wysokości: {val}', { val: formatDimension(verdict.heightMarginCm, unitSystem) })}
          </Text>
        </View>
      </View>

      {/* Przycisk przejścia do 3D */}
      {onOpenFullSimulator && (
        <TouchableOpacity
          testID="open-full-sim-btn"
          style={styles.actionBtn}
          onPress={handleOpenSimulator}
        >
          <Text style={styles.actionBtnText}>{t('Zobacz ułożenie w symulatorze 3D →')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    marginBottom: 12,
  },
  pocketBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginBottom: 6,
  },
  pocketBadgeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  horizontalScroll: {
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A8A33',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#F8FAFC',
  },
  chipSubtext: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  chipSubtextSelected: {
    color: '#60A5FA',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 2,
    marginBottom: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: '#3B82F6',
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customDimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  dimField: {
    flex: 1,
  },
  dimLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 4,
  },
  dimInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  verdictCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  verdictHeader: {
    marginBottom: 6,
  },
  verdictBadge: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  verdictTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  verdictMessage: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  marginsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    gap: 2,
  },
  marginText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  actionBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
