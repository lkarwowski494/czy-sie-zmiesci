import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { packItemsInTrunk } from '../../src/domain/geometry/extremePoints';
import { calculatePayloadDMC } from '../../src/domain/physics/payloadDMC';
import { calculateCenterOfGravity } from '../../src/domain/physics/centerOfGravity';
import { TrunkVisualizer } from '../../src/components/TrunkVisualizer';
import { PocketProofQuickCheck } from '../../src/components/PocketProofQuickCheck';
import { Apps4BrewPassModal } from '../../src/components/Apps4BrewPassModal';
import { POPULAR_VEHICLES_PRESETS, VehiclePreset } from '../../src/data/presets/vehicles';
import { CARGO_ITEMS_PRESETS, ExtendedCargoItemPreset } from '../../src/data/presets/cargoItems';
import { useAppAccess } from '../../src/services/app-access';
import { t } from '../../src/lib/i18n';

export default function SimulatorScreen() {
  const access = useAppAccess();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'simulator' | 'pocket_proof'>('simulator');

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(POPULAR_VEHICLES_PRESETS[0].id);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([
    'luggage-medium-checkin',
    'luggage-cabin-standard',
    'box-m',
  ]);
  const [passengersCount, setPassengersCount] = useState(2);
  const [cargoFilter, setCargoFilter] = useState<'wszystkie' | 'karton' | 'walizka' | 'mebel_ikea' | 'agd' | 'sport'>('wszystkie');

  const vehicle: VehiclePreset =
    POPULAR_VEHICLES_PRESETS.find((v) => v.id === selectedVehicleId) ?? POPULAR_VEHICLES_PRESETS[0];

  const activeItems = useMemo(() => {
    return CARGO_ITEMS_PRESETS.filter((i) => selectedItemIds.includes(i.id));
  }, [selectedItemIds]);

  const packingResult = useMemo(() => {
    return packItemsInTrunk(activeItems, vehicle.trunk);
  }, [activeItems, vehicle]);

  const payloadResult = useMemo(() => {
    return calculatePayloadDMC(vehicle.specs, passengersCount, packingResult.totalWeightKg);
  }, [vehicle, passengersCount, packingResult.totalWeightKg]);

  const cogResult = useMemo(() => {
    const weightMap: Record<string, number> = {};
    activeItems.forEach((i) => {
      weightMap[i.id] = i.weightKg;
    });
    return calculateCenterOfGravity(packingResult.placements, weightMap, vehicle.trunk);
  }, [packingResult.placements, activeItems, vehicle.trunk]);

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectQuickPreset = (presetType: 'wakacje' | 'ikea' | 'przeprowadzka') => {
    switch (presetType) {
      case 'wakacje':
        setSelectedItemIds([
          'luggage-large-checkin',
          'luggage-medium-checkin',
          'luggage-cabin-standard',
          'box-m',
        ]);
        setPassengersCount(3);
        break;
      case 'ikea':
        setSelectedItemIds(['ikea-billy-bookcase', 'ikea-kallax-4x4', 'ikea-lack-coffee-table']);
        setPassengersCount(1);
        break;
      case 'przeprowadzka':
        setSelectedItemIds([
          'appliance-washing-machine',
          'box-l',
          'box-m',
          'box-s',
        ]);
        setPassengersCount(1);
        break;
    }
  };

  const handleSharePlan = async () => {
    const lines: string[] = [
      `📦 PLAN ZAŁADUNKU BAGAŻNIKA — FitCheck Manifest (Z-128, Z-130)`,
      `Pojazd: ${vehicle.make} ${vehicle.model} (${vehicle.bodyType.toUpperCase()}, VDA: ${vehicle.vdaVolumeLiters}L)`,
      `Status: ${packingResult.isFullyPacked ? '✅ Wszystkie przedmioty zmieszczone' : '⚠️ Niektóre przedmioty nie zmieściły się'}`,
      `Masa ładunku: ${packingResult.totalWeightKg} kg (DMC: ${payloadResult.status === 'SAFE' ? 'Bezpieczna' : 'Przeciążenie!'})`,
      `Wykorzystanie przestrzeni: ${packingResult.packingEfficiencyPct}%`,
      `Balans poprzeczny: ${cogResult.isLateralSymmetric ? 'Idealny (symetryczny)' : `Asymetria ${cogResult.lateralOffsetMm} mm`}`,
      '',
      '--- KOLEJNOŚĆ ZAŁADUNKU (KROK PO KROKU) ---',
    ];

    packingResult.placements.forEach((p) => {
      const itm = activeItems.find((i) => i.id === p.itemId);
      lines.push(
        `#${p.sequenceOrder}. ${itm?.name ?? p.itemId} — ${Math.round(p.orientedDimensionsMm.lengthMm / 10)}×${Math.round(p.orientedDimensionsMm.widthMm / 10)}×${Math.round(p.orientedDimensionsMm.heightMm / 10)} cm (poz: ${Math.round(p.positionMm.xMm / 10)}/${Math.round(p.positionMm.yMm / 10)}/${Math.round(p.positionMm.zMm / 10)} cm)`
      );
    });

    if (payloadResult.warnings.length > 0 || cogResult.warnings.length > 0) {
      lines.push('');
      lines.push('--- OSTRZEŻENIA I ZALECENIA BEZPIECZEŃSTWA ---');
      payloadResult.warnings.forEach((w) => lines.push(`• ${w}`));
      cogResult.warnings.forEach((w) => lines.push(`• ${w}`));
    }

    try {
      await Share.share({
        message: lines.join('\n'),
        title: `FitCheck Plan Załadunku — ${vehicle.make} ${vehicle.model}`,
      });
    } catch {
      // Ignoruj anulowanie przez użytkownika
    }
  };

  const filteredItems = CARGO_ITEMS_PRESETS.filter((item) => {
    if (cargoFilter === 'wszystkie') return true;
    return item.category === cargoFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Nagłówek */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Symulator Załadunku 3D')}</Text>
          <Text style={styles.subtitle}>
            {t('Deterministyczny algorytm Extreme Points & Rzuty 2.5D (RD-02)')}
          </Text>
        </View>

        {/* Baner Trialu / Read-Only */}
        {access.status === 'trial_expired' && (
          <TouchableOpacity
            testID="read-only-expired-banner"
            style={styles.readOnlyBanner}
            onPress={() => setIsPaywallOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.readOnlyBannerTitle}>
              {t('Tryb Archiwalny (Read-Only) — Dotknij, aby odblokować pełną wersję')}
            </Text>
            <Text style={styles.readOnlyBannerDesc}>
              {t('Twoja historia i pomiary są bezpieczne. Wybierz plan od $0.99/msc, aby tworzyć nowe załadunki.')}
            </Text>
          </TouchableOpacity>
        )}

        {access.status === 'trial_active' && (
          <View style={styles.trialBadgeRow}>
            <Text style={styles.trialBadgeText}>
              {t('Trial: {count} wolnych projektów ({days} dni)', {
                count: access.projectsRemaining,
                days: access.daysRemaining,
              })}
            </Text>
            <TouchableOpacity onPress={() => setIsPaywallOpen(true)}>
              <Text style={styles.trialUpgradeLink}>{t('Apps4Brew Pass ($0.99) →')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Przełącznik Widoku: Pełny Symulator vs Pocket-Proof Store-to-Trunk */}
        <View style={styles.tabSwitchContainer}>
          <TouchableOpacity
            testID="tab-simulator-btn"
            style={[styles.tabSwitchBtn, viewMode === 'simulator' && styles.tabSwitchBtnActive]}
            onPress={() => setViewMode('simulator')}
          >
            <Text style={[styles.tabSwitchText, viewMode === 'simulator' && styles.tabSwitchTextActive]}>
              {t('📦 Symulator 3D')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-pocket-proof-btn"
            style={[styles.tabSwitchBtn, viewMode === 'pocket_proof' && styles.tabSwitchBtnActive]}
            onPress={() => setViewMode('pocket_proof')}
          >
            <Text
              style={[
                styles.tabSwitchText,
                viewMode === 'pocket_proof' && styles.tabSwitchTextActive,
              ]}
            >
              {t('⚡ Szybki Werdykt (Pocket-Proof)')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Widok Pocket-Proof w sklepie */}
        {viewMode === 'pocket_proof' ? (
          <PocketProofQuickCheck
            onOpenFullSimulator={(vId, itemId) => {
              setSelectedVehicleId(vId);
              setSelectedItemIds([itemId]);
              setViewMode('simulator');
            }}
            onRequestPaywall={() => setIsPaywallOpen(true)}
          />
        ) : (
          <>
            {/* Szybkie Szablony */}
            <View style={styles.quickPresetsCard}>
              <Text style={styles.quickPresetsLabel}>{t('⚡ Szybki Scenariusz:')}</Text>
              <View style={styles.quickPresetsRow}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleSelectQuickPreset('wakacje')}
            >
              <Text style={styles.quickBtnText}>🏖️ Wakacje (4 walizki)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleSelectQuickPreset('ikea')}
            >
              <Text style={styles.quickBtnText}>🛋️ Zakupy IKEA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleSelectQuickPreset('przeprowadzka')}
            >
              <Text style={styles.quickBtnText}>📦 AGD + Kartony</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wybór Pojazdu */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🚗 Wybierz Samochód</Text>
            <Text style={styles.vdaBadge}>{vehicle.vdaVolumeLiters} L (VDA)</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
            {POPULAR_VEHICLES_PRESETS.map((v) => {
              const isActive = v.id === vehicle.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleChip, isActive && styles.vehicleChipActive]}
                  onPress={() => setSelectedVehicleId(v.id)}
                >
                  <Text style={[styles.vehicleChipMake, isActive && styles.vehicleChipMakeActive]}>
                    {v.make}
                  </Text>
                  <Text style={[styles.vehicleChipModel, isActive && styles.vehicleChipModelActive]}>
                    {v.model}
                  </Text>
                  <Text style={styles.vehicleChipDim}>
                    {Math.round(v.trunk.lengthFloorMm / 10)} × {Math.round(v.trunk.widthMinMm / 10)} cm
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Liczba Pasażerów */}
          <View style={styles.passengersRow}>
            <Text style={styles.passengersLabel}>
              👥 Pasażerowie (poza kierowcą): <Text style={styles.bold}>{passengersCount}</Text>
            </Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setPassengersCount((c) => Math.max(0, c - 1))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperVal}>{passengersCount}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setPassengersCount((c) => Math.min(4, c + 1))}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Główny Wynik: Czy się zmieści? */}
        <View
          style={[
            styles.card,
            packingResult.isFullyPacked ? styles.cardSuccess : styles.cardWarning,
          ]}
        >
          <Text style={styles.resultBadge}>
            {packingResult.isFullyPacked ? '✅ WSZYSTKO SIĘ MIEŚCI!' : '⚠️ CZĘŚĆ PRZEDMIOTÓW NIE WEJDZIE'}
          </Text>
          <Text style={styles.resultSummary}>
            Zapakowano {packingResult.placements.length} z {activeItems.length} przedmiotów do bagażnika {vehicle.make} {vehicle.model}
          </Text>

          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Wykorzystanie</Text>
              <Text style={styles.metricValue}>{packingResult.packingEfficiencyPct}%</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Waga ładunku</Text>
              <Text style={styles.metricValue}>{packingResult.totalWeightKg} kg</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Status DMC</Text>
              <Text
                style={[
                  styles.metricValue,
                  payloadResult.status === 'SAFE' ? styles.safeText : styles.alertText,
                ]}
              >
                {payloadResult.status === 'SAFE' ? 'Bezpieczny' : 'Przeciążenie!'}
              </Text>
            </View>
          </View>

          {payloadResult.warnings.length > 0 && (
            <View style={styles.dmcWarningBox}>
              {payloadResult.warnings.map((w, idx) => (
                <Text key={idx} style={styles.dmcWarningText}>
                  • {w}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Interaktywny Schemat Przestrzenny Bagażnika 2.5D / 2D */}
        {packingResult.placements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧊 Schemat Załadunku (Rzut 2.5D / 2D)</Text>
            <TrunkVisualizer
              trunk={vehicle.trunk}
              items={packingResult.placements.map((p) => {
                const itm = activeItems.find((i) => i.id === p.itemId);
                return {
                  itemId: p.itemId,
                  name: itm?.name ?? 'Ładunek',
                  positionMm: p.positionMm,
                  dimensionsMm: p.orientedDimensionsMm,
                  sequenceOrder: p.sequenceOrder,
                };
              })}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
            />
          </View>
        )}

        {/* Filtry i Wybór Ładunków */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Przedmioty do zapakowania ({selectedItemIds.length} zaznaczonych)</Text>

          {/* Filtry kategorii */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {(['wszystkie', 'walizka', 'karton', 'mebel_ikea', 'agd', 'sport'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, cargoFilter === cat && styles.filterChipActive]}
                onPress={() => setCargoFilter(cat)}
              >
                <Text style={[styles.filterChipText, cargoFilter === cat && styles.filterChipTextActive]}>
                  {cat === 'wszystkie'
                    ? 'Wszystkie'
                    : cat === 'walizka'
                    ? '🧳 Walizki'
                    : cat === 'karton'
                    ? '📦 Kartony'
                    : cat === 'mebel_ikea'
                    ? '🛋️ Meble IKEA'
                    : cat === 'agd'
                    ? '⚡ AGD/RTV'
                    : '🚲 Sport'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.name} {item.isFragile && '⚠️ Kruche'}{' '}
                    {item.rotationConstraint === 'Z_ONLY' && '↕️ Tylko pion'}
                  </Text>
                  <Text style={styles.itemDims}>
                    {Math.round(item.dimensionsMm.lengthMm / 10)} ×{' '}
                    {Math.round(item.dimensionsMm.widthMm / 10)} ×{' '}
                    {Math.round(item.dimensionsMm.heightMm / 10)} cm • {item.weightKg} kg
                  </Text>
                </View>
                <Text style={styles.checkboxText}>{isSelected ? '✅' : '⬜'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Instrukcja Krok po Kroku (Kolejność wkładania) */}
        {packingResult.placements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Kolejność Załadunku (Krok po Kroku)</Text>
            {packingResult.placements.map((p) => {
              const itm = activeItems.find((i) => i.id === p.itemId);
              return (
                <View key={p.itemId} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>#{p.sequenceOrder}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{itm?.name}</Text>
                    <Text style={styles.stepSub}>
                      Wymiary: {Math.round(p.orientedDimensionsMm.lengthMm / 10)} × {Math.round(p.orientedDimensionsMm.widthMm / 10)} × {Math.round(p.orientedDimensionsMm.heightMm / 10)} cm
                    </Text>
                    <Text style={styles.stepPos}>
                      Pozycja X/Y/Z: {Math.round(p.positionMm.xMm / 10)} / {Math.round(p.positionMm.yMm / 10)} / {Math.round(p.positionMm.zMm / 10)} cm
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Fizyka: Środek Ciężkości i Asymetria */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Balans i Środek Ciężkości (RD-20)</Text>
          <Text style={styles.bodyText}>
            Symetria poprzeczna:{' '}
            <Text
              style={{
                fontWeight: '700',
                color: cogResult.isLateralSymmetric ? '#34D399' : '#F87171',
              }}
            >
              {cogResult.isLateralSymmetric
                ? 'Idealna (Równomierny rozkład)'
                : `Asymetria (${cogResult.lateralOffsetMm} mm)`}
            </Text>
          </Text>
          {cogResult.warnings.map((w: string, i: number) => (
            <Text key={i} style={styles.warningText}>
              • {w}
            </Text>
          ))}
        </View>

        {/* Eksport i Udostępnienie Planu Załadunku (Z-128, Z-130) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📤 Udostępnij Plan Załadunku (Z-128, Z-130)</Text>
          <Text style={styles.bodyText}>
            Wyślij kompletny plan załadunku z kolejnością pakowania, wymiarami paczek i bilansem DMC przez Wiadomości, WhatsApp, AirDrop lub wydrukuj.
          </Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleSharePlan}>
            <Text style={styles.shareBtnText}>📲 Udostępnij / Kopiuj Manifest Załadunku</Text>
          </TouchableOpacity>
        </View>
          </>
        )}
      </ScrollView>

      {/* Modal Apps4Brew Pass ("Cheaper than Espresso") */}
      <Apps4BrewPassModal
        visible={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  readOnlyBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  readOnlyBannerTitle: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
  },
  readOnlyBannerDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  trialBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  trialBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  trialUpgradeLink: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabSwitchBtnActive: {
    backgroundColor: '#0284C7',
  },
  tabSwitchText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabSwitchTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  quickPresetsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickPresetsLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  quickPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  quickBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  vdaBadge: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vehicleScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  vehicleChip: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 130,
  },
  vehicleChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C4A6E',
  },
  vehicleChipMake: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  vehicleChipMakeActive: {
    color: '#BAE6FD',
  },
  vehicleChipModel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  vehicleChipModelActive: {
    color: '#FFFFFF',
  },
  vehicleChipDim: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
  },
  passengersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  passengersLabel: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  bold: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  stepperVal: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  cardSuccess: {
    borderColor: '#059669',
    backgroundColor: '#064E3B',
  },
  cardWarning: {
    borderColor: '#D97706',
    backgroundColor: '#78350F',
  },
  resultBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultSummary: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  safeText: {
    color: '#34D399',
  },
  alertText: {
    color: '#F87171',
  },
  dmcWarningBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  dmcWarningText: {
    color: '#FDE68A',
    fontSize: 11,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    borderColor: '#0284C7',
    backgroundColor: '#0369A1',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  itemRowSelected: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  itemDims: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  stepBadge: {
    backgroundColor: '#0284C7',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  stepTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  stepSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  stepPos: {
    color: '#38BDF8',
    fontSize: 11,
    marginTop: 1,
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginBottom: 6,
  },
  warningText: {
    color: '#FBBF24',
    fontSize: 12,
    marginTop: 2,
  },
  shareBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
