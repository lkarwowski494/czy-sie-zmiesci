import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from 'react-native';
import { packItemsInTrunk } from '../../src/domain/geometry/extremePoints';
import { calculatePayloadDMC } from '../../src/domain/physics/payloadDMC';
import { calculateCenterOfGravity } from '../../src/domain/physics/centerOfGravity';
import { TrunkVisualizer } from '../../src/components/TrunkVisualizer';
import { PocketProofQuickCheck } from '../../src/components/PocketProofQuickCheck';
import { Apps4BrewPassModal } from '../../src/components/Apps4BrewPassModal';
import { CraftOnboardingModal } from '../../src/components/CraftOnboardingModal';
import { ActiveFocusModeModal, FocusStep } from '../../src/components/ActiveFocusModeModal';
import { useRitualProfile } from '../../src/services/ritual-profile';
import { sharedCraftTokens } from '../../src/core/craft-suite-theme';
import { POPULAR_VEHICLES_PRESETS, VehiclePreset } from '../../src/data/presets/vehicles';
import { CARGO_ITEMS_PRESETS } from '../../src/data/presets/cargoItems';
import { useAppAccess } from '../../src/services/app-access';
import { getDatabaseService, triggerAutoBackup } from '../../src/data/db';
import {
  useUnitSystem,
  formatDimension,
  formatDimensions3D,
  formatVolume,
  formatWeight,
} from '../../src/lib/unit-converter';
import { t } from '../../src/lib/i18n';

export default function SimulatorScreen() {
  const access = useAppAccess();
  const unitSystem = useUnitSystem();
  const { profile, profileInfo, onboardingDone, finishOnboarding } = useRitualProfile();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  // Progressive Disclosure: domyślnie tryb Pocket-Proof dla natychmiastowej decyzji
  const [viewMode, setViewMode] = useState<'simulator' | 'pocket_proof'>('pocket_proof');


  // Akordeon zaawansowanej fizyki załadunku
  const [showPhysicsDetails, setShowPhysicsDetails] = useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(POPULAR_VEHICLES_PRESETS[0].id);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([
    'luggage-medium-checkin',
    'luggage-cabin-standard',
    'box-m',
  ]);
  const [passengersCount, setPassengersCount] = useState(2);
  const [cargoFilter, setCargoFilter] = useState<'wszystkie' | 'karton' | 'walizka' | 'mebel_ikea' | 'agd' | 'sport'>('wszystkie');

  // Wczytywanie ostatnio zapisanej sesji z bazy SQLite przy starcie (Persystencja)
  useEffect(() => {
    try {
      const db = getDatabaseService();
      const latest = db.getLatestPackSession();
      if (latest) {
        if (latest.target_space_id && POPULAR_VEHICLES_PRESETS.some((v) => v.id === latest.target_space_id)) {
          setSelectedVehicleId(String(latest.target_space_id));
        }
        if (typeof latest.passengers_count === 'number') {
          setPassengersCount(latest.passengers_count);
        }
        const items = db.getSessionItems(String(latest.id));
        if (items && items.length > 0) {
          const ids = items
            .map((i) => String(i.cargo_item_id))
            .filter((id) => CARGO_ITEMS_PRESETS.some((p) => p.id === id));
          if (ids.length > 0) {
            setSelectedItemIds(ids);
          }
        }
      }
    } catch {
      // Bezpieczny fallback
    }
  }, []);

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

  const focusSteps: FocusStep[] = useMemo(() => {
    if (packingResult.placements.length === 0) return [];
    return packingResult.placements.map((p, idx) => {
      const itm = activeItems.find((i) => i.id === p.itemId);
      return {
        id: `step-${p.itemId}-${idx}`,
        sequence: p.sequenceOrder,
        title: itm?.name ?? p.itemId,
        dimensions: formatDimensions3D(
          p.orientedDimensionsMm.lengthMm / 10,
          p.orientedDimensionsMm.widthMm / 10,
          p.orientedDimensionsMm.heightMm / 10,
          unitSystem
        ),
        weightKg: itm?.weightKg ?? 10,
        targetLocation: `Bagażnik (${Math.round(p.positionMm.xMm / 10)} / ${Math.round(p.positionMm.yMm / 10)} / ${Math.round(p.positionMm.zMm / 10)} cm)`,
        isHeavy: (itm?.weightKg ?? 0) >= 20,
        isFragile: !!itm?.isFragile,
        advice: itm?.isFragile
          ? t('Unieruchom pasem lub zablokuj miękkim ładunkiem.')
          : t('Dosuń ściśle do krawędzi lub oparcia kanapy.'),
      };
    });
  }, [packingResult.placements, activeItems, unitSystem]);


  // Bezpieczny zapis sesji załadunku do bazy SQLite z automatyczną rotacją 10 kopii zapasowych
  const persistSession = (
    vId: string,
    itemIds: string[],
    passengers: number,
    res: typeof packingResult
  ) => {
    try {
      const db = getDatabaseService();
      db.savePackSession({
        id: 'active_session',
        name: `Załadunek ${vehicle.make} ${vehicle.model}`,
        target_space_id: vId,
        passengers_count: passengers,
        total_weight_kg: res.totalWeightKg,
        packing_efficiency_pct: res.packingEfficiencyPct,
        is_valid: res.isFullyPacked,
        items: res.placements.map((p, idx) => ({
          id: `item_${idx}_${p.itemId}`,
          cargo_item_id: p.itemId,
          pos_x_cm: p.positionMm.xMm / 10,
          pos_y_cm: p.positionMm.yMm / 10,
          pos_z_cm: p.positionMm.zMm / 10,
          dim_x_cm: p.orientedDimensionsMm.lengthMm / 10,
          dim_y_cm: p.orientedDimensionsMm.widthMm / 10,
          dim_z_cm: p.orientedDimensionsMm.heightMm / 10,
          sequence_order: p.sequenceOrder,
          is_packed: true,
        })),
      });
      triggerAutoBackup();
    } catch {
      // Ignoruj błędy zapisu w środowiskach bez dysku
    }
  };

  const handleSelectVehicle = (vId: string) => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    setSelectedVehicleId(vId);
    persistSession(vId, selectedItemIds, passengersCount, packingResult);
  };

  const toggleItem = (id: string) => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    setSelectedItemIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      persistSession(selectedVehicleId, next, passengersCount, packingResult);
      return next;
    });
  };

  const handleSelectQuickPreset = (presetType: 'wakacje' | 'ikea' | 'przeprowadzka') => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    access.recordProject();

    let newItems: string[] = [];
    let newPassengers = passengersCount;

    switch (presetType) {
      case 'wakacje':
        newItems = [
          'luggage-large-checkin',
          'luggage-medium-checkin',
          'luggage-cabin-standard',
          'box-m',
        ];
        newPassengers = 3;
        break;
      case 'ikea':
        newItems = ['ikea-billy-bookcase', 'ikea-kallax-4x4', 'ikea-lack-coffee-table'];
        newPassengers = 1;
        break;
      case 'przeprowadzka':
        newItems = ['appliance-washing-machine', 'box-l', 'box-m', 'box-s'];
        newPassengers = 1;
        break;
    }

    setSelectedItemIds(newItems);
    setPassengersCount(newPassengers);
    persistSession(selectedVehicleId, newItems, newPassengers, packingResult);
  };

  const handleSavePlanToDatabase = () => {
    if (!access.canCreate) {
      setIsPaywallOpen(true);
      return;
    }
    access.recordProject();
    persistSession(selectedVehicleId, selectedItemIds, passengersCount, packingResult);
    Alert.alert(
      t('Sukces'),
      t('Plan załadunku został trwale zapisany w bazie SQLite i kopii zapasowej.')
    );
  };

  const handleSharePlan = async () => {
    const lines: string[] = [
      `📦 ${t('PLAN ZAŁADUNKU BAGAŻNIKA')} — FitCheck Manifest (Z-128, Z-130)`,
      `${t('Pojazd')}: ${vehicle.make} ${vehicle.model} (${vehicle.bodyType.toUpperCase()}, VDA: ${formatVolume(vehicle.vdaVolumeLiters, unitSystem)})`,
      `${t('Status')}: ${packingResult.isFullyPacked ? t('✅ Wszystkie przedmioty zmieszczone') : t('⚠️ Niektóre przedmioty nie zmieściły się')}`,
      `${t('Masa ładunku')}: ${formatWeight(packingResult.totalWeightKg, unitSystem)} (DMC: ${payloadResult.status === 'SAFE' ? t('Bezpieczna') : t('Przeciążenie!')})`,
      `${t('Wykorzystanie przestrzeni')}: ${packingResult.packingEfficiencyPct}%`,
      `${t('Balans poprzeczny')}: ${cogResult.isLateralSymmetric ? t('Idealny (symetryczny)') : t('Asymetria {val} mm', { val: cogResult.lateralOffsetMm })}`,
      '',
      `--- ${t('KOLEJNOŚĆ ZAŁADUNKU (KROK PO KROKU)')} ---`,
    ];

    packingResult.placements.forEach((p) => {
      const itm = activeItems.find((i) => i.id === p.itemId);
      lines.push(
        `#${p.sequenceOrder}. ${itm?.name ?? p.itemId} — ${formatDimensions3D(
          p.orientedDimensionsMm.lengthMm / 10,
          p.orientedDimensionsMm.widthMm / 10,
          p.orientedDimensionsMm.heightMm / 10,
          unitSystem
        )} (${t('poz.')}: ${Math.round(p.positionMm.xMm / 10)}/${Math.round(p.positionMm.yMm / 10)}/${Math.round(p.positionMm.zMm / 10)} cm)`
      );
    });

    if (payloadResult.warnings.length > 0 || cogResult.warnings.length > 0) {
      lines.push('');
      lines.push(`--- ${t('OSTRZEŻENIA I ZALECENIA BEZPIECZEŃSTWA')} ---`);
      payloadResult.warnings.forEach((w) => lines.push(`• ${w}`));
      cogResult.warnings.forEach((w) => lines.push(`• ${w}`));
    }

    try {
      await Share.share({
        message: lines.join('\n'),
        title: `FitCheck — ${vehicle.make} ${vehicle.model}`,
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
          <View style={styles.craftHeaderBar}>
            <View style={styles.profileIndicator} testID="ritual-profile-indicator">
              <Text style={styles.profileIndicatorText}>
                {profileInfo.icon} {t(profileInfo.title)}
              </Text>
            </View>
            <TouchableOpacity
              testID="open-active-focus-btn"
              style={styles.focusModeLaunchBtn}
              onPress={() => setIsFocusModeOpen(true)}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              activeOpacity={0.75}
            >
              <Text style={styles.focusModeLaunchBtnText}>🔍 {t('Tryb Skupienia (Active Focus)')}</Text>
            </TouchableOpacity>
          </View>
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
          <TouchableOpacity
            testID="tab-simulator-btn"
            style={[styles.tabSwitchBtn, viewMode === 'simulator' && styles.tabSwitchBtnActive]}
            onPress={() => setViewMode('simulator')}
          >
            <Text style={[styles.tabSwitchText, viewMode === 'simulator' && styles.tabSwitchTextActive]}>
              {t('📦 Symulator 3D')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Widok Pocket-Proof w sklepie (domyślny wg audytu UX) */}
        {viewMode === 'pocket_proof' ? (
          <PocketProofQuickCheck
            onOpenFullSimulator={(vId, itemId) => {
              if (!access.canCreate) {
                setIsPaywallOpen(true);
                return;
              }
              setSelectedVehicleId(vId);
              setSelectedItemIds([itemId]);
              setViewMode('simulator');
              persistSession(vId, [itemId], passengersCount, packingResult);
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
                  <Text style={styles.quickBtnText}>🏖️ {t('Wakacje (4 walizki)')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => handleSelectQuickPreset('ikea')}
                >
                  <Text style={styles.quickBtnText}>🛋️ {t('Zakupy IKEA')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => handleSelectQuickPreset('przeprowadzka')}
                >
                  <Text style={styles.quickBtnText}>📦 {t('AGD + Kartony')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Wybór Pojazdu */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>🚗 {t('Wybierz Samochód')}</Text>
                <Text style={styles.vdaBadge}>{formatVolume(vehicle.vdaVolumeLiters, unitSystem)} (VDA)</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
                {POPULAR_VEHICLES_PRESETS.map((v) => {
                  const isActive = v.id === vehicle.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      testID={`vehicle-chip-${v.id}`}
                      style={[styles.vehicleChip, isActive && styles.vehicleChipActive]}
                      onPress={() => handleSelectVehicle(v.id)}
                    >
                      <Text style={[styles.vehicleChipMake, isActive && styles.vehicleChipMakeActive]}>
                        {v.make}
                      </Text>
                      <Text style={[styles.vehicleChipModel, isActive && styles.vehicleChipModelActive]}>
                        {v.model}
                      </Text>
                      <Text style={styles.vehicleChipDim}>
                        {formatDimension(v.trunk.lengthFloorMm / 10, unitSystem)} × {formatDimension(v.trunk.widthMinMm / 10, unitSystem)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Liczba Pasażerów */}
              <View style={styles.passengersRow}>
                <Text style={styles.passengersLabel}>
                  👥 {t('Pasażerowie (poza kierowcą):')} <Text style={styles.bold}>{passengersCount}</Text>
                </Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setPassengersCount((c) => {
                        const next = Math.max(0, c - 1);
                        persistSession(selectedVehicleId, selectedItemIds, next, packingResult);
                        return next;
                      });
                    }}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{passengersCount}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      if (!access.canCreate) {
                        setIsPaywallOpen(true);
                        return;
                      }
                      setPassengersCount((c) => {
                        const next = Math.min(4, c + 1);
                        persistSession(selectedVehicleId, selectedItemIds, next, packingResult);
                        return next;
                      });
                    }}
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
                {packingResult.isFullyPacked
                  ? t('✅ WSZYSTKO SIĘ MIEŚCI!')
                  : t('⚠️ CZĘŚĆ PRZEDMIOTÓW NIE WEJDZIE')}
              </Text>
              <Text style={styles.resultSummary}>
                {t('Zapakowano {packed} z {total} przedmiotów do bagażnika {car}', {
                  packed: packingResult.placements.length,
                  total: activeItems.length,
                  car: `${vehicle.make} ${vehicle.model}`,
                })}
              </Text>

              <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{t('Wykorzystanie')}</Text>
                  <Text style={styles.metricValue}>{packingResult.packingEfficiencyPct}%</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{t('Waga ładunku')}</Text>
                  <Text style={styles.metricValue}>{formatWeight(packingResult.totalWeightKg, unitSystem)}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{t('Status DMC')}</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      payloadResult.status === 'SAFE' ? styles.safeText : styles.alertText,
                    ]}
                  >
                    {payloadResult.status === 'SAFE' ? t('Bezpieczny') : t('Przeciążenie!')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Interaktywny Schemat Przestrzenny Bagażnika 2.5D / 2D */}
            {packingResult.placements.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🧊 {t('Schemat Załadunku (Rzut 2.5D / 2D)')}</Text>
                <TrunkVisualizer
                  trunk={vehicle.trunk}
                  items={packingResult.placements.map((p) => {
                    const itm = activeItems.find((i) => i.id === p.itemId);
                    return {
                      itemId: p.itemId,
                      name: itm?.name ?? t('Ładunek'),
                      positionMm: p.positionMm,
                      dimensionsMm: p.orientedDimensionsMm,
                      sequenceOrder: p.sequenceOrder,
                    };
                  })}
                  vehicleName={`${vehicle.make} ${vehicle.model}`}
                />
              </View>
            )}

            {/* Progressive Disclosure: Akordeon Zaawansowanej Fizyki Załadunku */}
            <TouchableOpacity
              testID="toggle-physics-accordion"
              style={styles.accordionHeader}
              onPress={() => setShowPhysicsDetails(!showPhysicsDetails)}
            >
              <Text style={styles.accordionHeaderText}>
                {showPhysicsDetails ? '▼ ' : '▶ '}
                {t('Zaawansowany bilans masy i fizyka załadunku (DMC, CoG)')}
              </Text>
              <Text style={styles.accordionHeaderBadge}>
                {payloadResult.status === 'SAFE' ? t('BEZPIECZNIE') : t('UWAGA')}
              </Text>
            </TouchableOpacity>

            {showPhysicsDetails && (
              <View style={styles.accordionContent}>
                {/* Ostrzeżenia DMC */}
                {payloadResult.warnings.length > 0 && (
                  <View style={styles.dmcWarningBox}>
                    {payloadResult.warnings.map((w, idx) => (
                      <Text key={idx} style={styles.dmcWarningText}>
                        • {w}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Fizyka: Środek Ciężkości i Asymetria */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>⚖️ {t('Balans i Środek Ciężkości (RD-20)')}</Text>
                  <Text style={styles.bodyText}>
                    {t('Symetria poprzeczna:')}{' '}
                    <Text
                      style={{
                        fontWeight: '700',
                        color: cogResult.isLateralSymmetric ? '#34D399' : '#F87171',
                      }}
                    >
                      {cogResult.isLateralSymmetric
                        ? t('Idealna (Równomierny rozkład)')
                        : t('Asymetria ({val} mm)', { val: cogResult.lateralOffsetMm })}
                    </Text>
                  </Text>
                  {cogResult.warnings.map((w: string, i: number) => (
                    <Text key={i} style={styles.warningText}>
                      • {w}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Filtry i Wybór Ładunków */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                📦 {t('Przedmioty do zapakowania ({count} zaznaczonych)', { count: selectedItemIds.length })}
              </Text>

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
                        ? t('Wszystkie')
                        : cat === 'walizka'
                        ? `🧳 ${t('Walizki')}`
                        : cat === 'karton'
                        ? `📦 ${t('Kartony')}`
                        : cat === 'mebel_ikea'
                        ? `🛋️ ${t('Meble IKEA')}`
                        : cat === 'agd'
                        ? `⚡ ${t('AGD/RTV')}`
                        : `🚲 ${t('Sport')}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    testID={`cargo-item-${item.id}`}
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                    onPress={() => toggleItem(item.id)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>
                        {item.name} {item.isFragile && `⚠️ ${t('Kruche')}`}{' '}
                        {item.rotationConstraint === 'Z_ONLY' && `↕️ ${t('Tylko pion')}`}
                      </Text>
                      <Text style={styles.itemDims}>
                        {formatDimensions3D(
                          item.dimensionsMm.lengthMm / 10,
                          item.dimensionsMm.widthMm / 10,
                          item.dimensionsMm.heightMm / 10,
                          unitSystem
                        )}{' '}
                        • {formatWeight(item.weightKg, unitSystem)}
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
                <Text style={styles.cardTitle}>📋 {t('Kolejność Załadunku (Krok po Kroku)')}</Text>
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
                          {t('Wymiary:')}{' '}
                          {formatDimensions3D(
                            p.orientedDimensionsMm.lengthMm / 10,
                            p.orientedDimensionsMm.widthMm / 10,
                            p.orientedDimensionsMm.heightMm / 10,
                            unitSystem
                          )}
                        </Text>
                        <Text style={styles.stepPos}>
                          {t('Pozycja X/Y/Z: {x} / {y} / {z} cm', {
                            x: Math.round(p.positionMm.xMm / 10),
                            y: Math.round(p.positionMm.yMm / 10),
                            z: Math.round(p.positionMm.zMm / 10),
                          })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Zapis i Udostępnienie Planu Załadunku (Z-128, Z-130) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📤 {t('Zapisz i Udostępnij Plan Załadunku (Z-128, Z-130)')}</Text>
              <Text style={styles.bodyText}>
                {t(
                  'Zapisz konfigurację w lokalnej bazie SQLite i wyślij kompletny plan załadunku przez Wiadomości, WhatsApp lub AirDrop.'
                )}
              </Text>
              <TouchableOpacity
                testID="save-plan-btn"
                style={styles.savePlanBtn}
                onPress={handleSavePlanToDatabase}
              >
                <Text style={styles.savePlanBtnText}>💾 {t('Zapisz Plan Załadunku w SQLite')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleSharePlan}>
                <Text style={styles.shareBtnText}>📲 {t('Udostępnij / Kopiuj Manifest Załadunku')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal Apps4Brew Pass ("Cheaper than Espresso") */}
      <Apps4BrewPassModal
        visible={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onPurchaseSuccess={() => access.refresh()}
      />

      {/* Modal Onboardingu Rytuału Apps4Craft (1-ekranowy) */}
      <CraftOnboardingModal
        visible={!onboardingDone}
        onSelectProfile={finishOnboarding}
      />

      {/* Modal Aktywnego Skupienia Warsztatowego (Active Focus) */}
      <ActiveFocusModeModal
        visible={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        steps={focusSteps}
        clearanceMm={45}
        payloadPct={payloadResult.payloadUtilizationPct}
        totalWeightKg={packingResult.totalWeightKg}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
  },
  craftHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  profileIndicator: {
    backgroundColor: sharedCraftTokens.colors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    flex: 1,
  },
  profileIndicatorText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  focusModeLaunchBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  focusModeLaunchBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
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
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  trialUpgradeLink: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
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
    fontWeight: '700',
    fontSize: 13,
  },
  tabSwitchTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  quickPresetsCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
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
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  vdaBadge: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vehicleScroll: {
    marginBottom: 10,
  },
  vehicleChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  vehicleChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  vehicleChipMake: {
    color: '#94A3B8',
    fontSize: 11,
  },
  vehicleChipMakeActive: {
    color: '#E0F2FE',
  },
  vehicleChipModel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  vehicleChipModelActive: {
    color: '#FFFFFF',
  },
  vehicleChipDim: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
  },
  passengersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
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
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  stepperVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },
  resultBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  resultSummary: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  safeText: {
    color: '#10B981',
  },
  alertText: {
    color: '#EF4444',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 8,
  },
  accordionHeaderText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  accordionHeaderBadge: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 11,
    marginLeft: 8,
  },
  accordionContent: {
    marginTop: 4,
  },
  dmcWarningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  dmcWarningText: {
    color: '#FCA5A5',
    fontSize: 11,
    marginVertical: 1,
  },
  filterRow: {
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#0284C7',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  savePlanBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  savePlanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
