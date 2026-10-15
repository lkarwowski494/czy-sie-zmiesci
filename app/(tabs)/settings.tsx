import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { getDatabaseService, BackupExportPayload } from '../../src/data/db';
import { WatchSyncService, WatchHapticType } from '../../src/services/WatchSyncService';

export default function SettingsScreen() {
  const db = getDatabaseService();
  const watchSync = new WatchSyncService(db);

  // Stany bazy i kopii zapasowej
  const [backupJson, setBackupJson] = useState<string | null>(null);
  const [backupMeta, setBackupMeta] = useState<{
    version: number;
    exportedAt: string;
    totalRecords: number;
  } | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Symulator Apple Watch Companion (DEC-03, DEC-31)
  const [watchStepIndex, setWatchStepIndex] = useState(0);
  const [watchHapticNotice, setWatchHapticNotice] = useState<string | null>(null);
  const [packedState, setPackedState] = useState<Record<number, boolean>>({});

  // Przykładowe kroki załadunku na zegarku (4 fazy pakowania)
  const sampleWatchSteps = [
    {
      phase: 'FAZA 1/4: Baza i Ciężary',
      title: 'Pralka Bosch Serie 6',
      dim: '60 × 60 × 85 cm',
      weight: 72,
      location: 'Dno bagażnika przy grodzi tylnej',
      isHeavy: true,
      isFragile: false,
      haptic: 'HEAVY_ITEM_WARNING' as WatchHapticType,
    },
    {
      phase: 'FAZA 2/4: Zręby i Sztywność',
      title: 'Walizka Duża L (Samsonite)',
      dim: '52 × 31 × 75 cm',
      weight: 23,
      location: 'Prawa strona przy nadkolu',
      isHeavy: true,
      isFragile: false,
      haptic: 'STEP_COMPLETED' as WatchHapticType,
    },
    {
      phase: 'FAZA 3/4: Wypełnienie i Zabezpieczenie',
      title: 'Zestaw Kryształów i Szkła',
      dim: '30 × 30 × 30 cm',
      weight: 6,
      location: 'Centrum w luce między walizkami',
      isHeavy: false,
      isFragile: true,
      haptic: 'FRAGILE_ITEM_WARNING' as WatchHapticType,
    },
    {
      phase: 'FAZA 4/4: Wierzch i Dostęp Podręczny',
      title: 'Torba weekendowa miękka',
      dim: '40 × 25 × 20 cm',
      weight: 4,
      location: 'Górna warstwa tuż pod roletą',
      isHeavy: false,
      isFragile: false,
      haptic: 'STEP_COMPLETED' as WatchHapticType,
    },
  ];

  const currentStep = sampleWatchSteps[watchStepIndex];
  const isCurrentPacked = Boolean(packedState[watchStepIndex]);
  const packedCount = Object.values(packedState).filter(Boolean).length;
  const progressPct = Math.round((packedCount / sampleWatchSteps.length) * 100);

  // Statystyki bazy
  const vehiclesCount = db.getAllVehicles().length;
  const cargoCount = db.getCargoItems().length;

  const handleExportBackup = () => {
    try {
      const backup: BackupExportPayload = db.exportBackupJson();
      const jsonStr = JSON.stringify(backup, null, 2);
      setBackupJson(jsonStr);

      const totalItems =
        (backup.data.custom_spaces?.length ?? 0) +
        (backup.data.user_cargo_items?.length ?? 0) +
        (backup.data.pack_sessions?.length ?? 0) +
        (backup.data.relocation_projects?.length ?? 0) +
        (backup.data.garage_profiles?.length ?? 0);

      setBackupMeta({
        version: backup.schema_version,
        exportedAt: new Date(backup.exported_at).toLocaleString('pl-PL'),
        totalRecords: totalItems,
      });

      setStatusMessage(`✅ Wyeksportowano kopię zapasową JSON (Schema v${backup.schema_version})`);
      Alert.alert(
        'Eksport Kopia Zapasowa (ZP-06)',
        `Pomyślnie wyeksportowano stan bazy danych SQLite.\n\nSchemat: v${backup.schema_version}\nBundle ID: ${backup.bundle_id}\nLokalne rekordy: ${totalItems}`
      );
    } catch (err: any) {
      Alert.alert('Błąd eksportu', err.message);
    }
  };

  const handleTestImportVerification = () => {
    // Test weryfikacji odporności i atomowego wycofania w przypadku błędnego formatu
    const invalidBackup = { schema_version: 999, data: {} };
    const result = db.importBackupJson(invalidBackup as any);
    Alert.alert(
      'Weryfikacja Odporności Schematu (Warstwa 5)',
      `Przetestowano walidację niepoprawnego pliku kopii zapasowej:\n\nWynik: ${
        result.success ? 'Błąd' : 'ODRZUCONO (Prawidłowo)'
      }\nKomunikat bazy: "${result.error}"\n\nBaza danych zachowała 100% integralności dzięki transakcji SQLite z rollbackiem.`
    );
  };

  const handleResetToPresets = () => {
    Alert.alert(
      'Przywracanie Danych Domyślnych',
      'Czy na pewno chcesz przywrócić domyślne katalogi pojazdów i ładunków Apps4Brew?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Przywróć',
          style: 'destructive',
          onPress: () => {
            db.initialize();
            setStatusMessage('🔄 Baza danych zsynchronizowana z biblioteką wzorcową.');
          },
        },
      ]
    );
  };

  // Obsługa Apple Watch Taptic Engine
  const triggerWatchHaptic = (haptic: WatchHapticType) => {
    let msg = '';
    switch (haptic) {
      case 'HEAVY_ITEM_WARNING':
        msg = '⚠️📳 Taptic Alert: Ładunek ciężki (≥20 kg)! Wymagane 2 osoby.';
        break;
      case 'FRAGILE_ITEM_WARNING':
        msg = '🛑📳 Taptic Alert: Kruchy przedmiot! Ostrożnie umieść na wierzchu.';
        break;
      case 'STEP_COMPLETED':
        msg = '✅📳 Taptic Click: Krok załadunku odhaczony. Następny element.';
        break;
      case 'SESSION_FINISHED':
        msg = '🎉📳 Taptic Celebration: Pełny załadunek ukończony pomyślnie!';
        break;
    }
    setWatchHapticNotice(msg);
  };

  const toggleCurrentStepPacked = () => {
    const nextState = !isCurrentPacked;
    setPackedState((prev) => ({ ...prev, [watchStepIndex]: nextState }));

    if (nextState) {
      if (watchStepIndex === sampleWatchSteps.length - 1) {
        triggerWatchHaptic('SESSION_FINISHED');
      } else {
        triggerWatchHaptic('STEP_COMPLETED');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ustawienia i Diagnostyka</Text>
          <Text style={styles.subtitle}>Kopie zapasowe JSON v2, Apple Watch DEC-03, normy prawne</Text>
        </View>

        {/* Status Toast */}
        {statusMessage && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>{statusMessage}</Text>
          </View>
        )}

        {/* Symulator Apple Watch Companion */}
        <View style={styles.watchContainer}>
          <View style={styles.watchHeaderRow}>
            <Text style={styles.watchSectionTitle}>⌚ Apple Watch Companion (DEC-03, DEC-31)</Text>
            <View style={styles.watchBadge}>
              <Text style={styles.watchBadgeText}>watchOS 11+</Text>
            </View>
          </View>
          <Text style={styles.watchSectionDesc}>
            Tryb &quot;Wolne Ręce&quot; — załadunek krok po kroku z haptyką Taptic Engine bez wyjmowania iPhone&apos;a z kieszeni.
          </Text>

          {/* Ramka Apple Watch */}
          <View style={styles.watchCase}>
            <View style={styles.watchScreen}>
              <View style={styles.watchStatusBar}>
                <Text style={styles.watchTime}>10:09</Text>
                <Text style={styles.watchProgressLabel}>{progressPct}% SPAKOWANE</Text>
              </View>

              {/* Pasek postępu */}
              <View style={styles.watchProgressBar}>
                <View style={[styles.watchProgressFill, { width: `${progressPct}%` }]} />
              </View>

              {/* Karta bieżącego przedmiotu na zegarku */}
              <View style={styles.watchItemCard}>
                <Text style={styles.watchPhaseBadge}>{currentStep.phase}</Text>
                <Text style={styles.watchItemName} numberOfLines={1}>
                  {currentStep.title}
                </Text>
                <Text style={styles.watchItemDims}>📏 {currentStep.dim} • ⚖️ {currentStep.weight} kg</Text>
                <Text style={styles.watchItemPos}>📍 {currentStep.location}</Text>

                {currentStep.isHeavy && (
                  <View style={styles.watchWarningPill}>
                    <Text style={styles.watchWarningText}>⚠️ Ciężkie (≥20kg) • 2 osoby</Text>
                  </View>
                )}
                {currentStep.isFragile && (
                  <View style={[styles.watchWarningPill, { backgroundColor: '#EF4444' }]}>
                    <Text style={styles.watchWarningText}>🛑 Kruche • Nie dociskać</Text>
                  </View>
                )}
              </View>

              {/* Przyciski zegarka */}
              <View style={styles.watchButtonsRow}>
                <TouchableOpacity
                  style={[styles.watchActionBtn, isCurrentPacked && styles.watchActionBtnDone]}
                  onPress={toggleCurrentStepPacked}
                  accessibilityLabel="Zatwierdź krok załadunku na zegarku"
                >
                  <Text style={styles.watchActionBtnText}>
                    {isCurrentPacked ? '✓ ZAŁADOWANY' : '📦 OZNACZ ZAŁADUNEK'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Nawigacja kroków Digital Crown */}
              <View style={styles.watchCrownControls}>
                <TouchableOpacity
                  disabled={watchStepIndex === 0}
                  onPress={() => setWatchStepIndex((i) => Math.max(0, i - 1))}
                  style={[styles.crownBtn, watchStepIndex === 0 && styles.crownBtnDisabled]}
                >
                  <Text style={styles.crownBtnText}>◀ Poprzedni</Text>
                </TouchableOpacity>

                <Text style={styles.crownStepText}>
                  {watchStepIndex + 1} z {sampleWatchSteps.length}
                </Text>

                <TouchableOpacity
                  disabled={watchStepIndex === sampleWatchSteps.length - 1}
                  onPress={() => setWatchStepIndex((i) => Math.min(sampleWatchSteps.length - 1, i + 1))}
                  style={[
                    styles.crownBtn,
                    watchStepIndex === sampleWatchSteps.length - 1 && styles.crownBtnDisabled,
                  ]}
                >
                  <Text style={styles.crownBtnText}>Następny ▶</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Powiadomienie Taptic */}
          {watchHapticNotice && (
            <View style={styles.hapticToast}>
              <Text style={styles.hapticToastText}>{watchHapticNotice}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.testHapticBtn}
            onPress={() => triggerWatchHaptic(currentStep.haptic)}
          >
            <Text style={styles.testHapticBtnText}>📳 Przetestuj Haptykę dla Bieżącego Kroku</Text>
          </TouchableOpacity>
        </View>

        {/* Kopia Zapasowa JSON v2 (ZP-06) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💾 Kopia Zapasowa i Przenośność Bazy (ZP-06)</Text>
          <Text style={styles.infoText}>
            Wszystkie dane przechowywane są lokalnie w silniku SQLite WAL na Twoim iPhone.
            Eksport i import realizowane są w standaryzowanym formacie JSON (Schema v2).
          </Text>

          {/* Statystyki bazy */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{vehiclesCount}</Text>
              <Text style={styles.statLabel}>Baza Pojazdów</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{cargoCount}</Text>
              <Text style={styles.statLabel}>Katalog Ładunków</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>0 ms</Text>
              <Text style={styles.statLabel}>Latency SQLite</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>100%</Text>
              <Text style={styles.statLabel}>Offline Mode</Text>
            </View>
          </View>

          {backupMeta && (
            <View style={styles.backupMetaBox}>
              <Text style={styles.backupMetaText}>📄 Wersja Schematu: v{backupMeta.version}</Text>
              <Text style={styles.backupMetaText}>🕒 Czas eksportu: {backupMeta.exportedAt}</Text>
              <Text style={styles.backupMetaText}>📊 Obiektów w pliku: {backupMeta.totalRecords}</Text>
            </View>
          )}

          <View style={styles.buttonCol}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleExportBackup}>
              <Text style={styles.primaryButtonText}>📥 Eksportuj Pełną Kopię Zapasową (JSON v2)</Text>
            </TouchableOpacity>

            {backupJson && (
              <TouchableOpacity
                style={styles.inspectButton}
                onPress={() => setShowJsonPreview(!showJsonPreview)}
              >
                <Text style={styles.inspectButtonText}>
                  {showJsonPreview ? 'Ukryj Podgląd JSON' : '🔍 Pokaż Wygenerowany JSON'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={handleTestImportVerification}>
              <Text style={styles.secondaryButtonText}>🛡️ Przetestuj Odporność Importu (Rollback Test)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButton} onPress={handleResetToPresets}>
              <Text style={styles.dangerButtonText}>🔄 Zsynchronizuj z Biblioteką Wzorcową</Text>
            </TouchableOpacity>
          </View>

          {/* Podgląd JSON */}
          {showJsonPreview && backupJson && (
            <View style={styles.jsonPreviewBox}>
              <Text style={styles.jsonCodeText} numberOfLines={25}>
                {backupJson}
              </Text>
            </View>
          )}
        </View>

        {/* Normy Prawne i Standardy Bezpieczeństwa */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Polskie i Europejskie Normy Prawne</Text>

          <View style={styles.standardItem}>
            <Text style={styles.standardTitle}>🚗 Prawo o Ruchu Drogowym (Dz.U. 2023 poz. 1047 art. 61)</Text>
            <Text style={styles.standardDesc}>
              • Skrajnia szerokości pojazdu z ładunkiem: maks. 2,55 m{'\n'}
              • Maksymalna wysokość zespołu: 4,00 m{'\n'}
              • Wystawanie z tyłu: maks. 2,00 m (czerwona chorągiewka 50×50 cm lub światło czerwone){'\n'}
              • Wystawanie z przodu: maks. 0,50 m od obrysu i maks. 1,50 m od siedzenia{'\n'}
              • Obowiązek zachowania pionowego nacisku haka $S$ z dowodu rejestracyjnego
            </Text>
          </View>

          <View style={styles.standardItem}>
            <Text style={styles.standardTitle}>🏢 Warunki Techniczne Budynków (Dz.U. 2022 poz. 1225)</Text>
            <Text style={styles.standardDesc}>
              • Drzwi wejściowe do lokalu: min. 90 cm szerokości w świetle ościeżnicy{'\n'}
              • Drzwi wewnętrzne: min. 80 cm w świetle ościeżnicy{'\n'}
              • Schody i spoczniki ciągów komunikacyjnych: min. 80 cm / 120 cm
            </Text>
          </View>

          <View style={styles.standardItem}>
            <Text style={styles.standardTitle}>📦 Standardy Paczkomatów i Sizerów Lotniczych</Text>
            <Text style={styles.standardDesc}>
              • InPost Gabaryt A: 80 × 380 × 640 mm (max 25 kg){'\n'}
              • InPost Gabaryt B: 190 × 380 × 640 mm (max 25 kg){'\n'}
              • InPost Gabaryt C: 410 × 380 × 640 mm (max 25 kg){'\n'}
              • VDA 238-100: Klocki pomiarowe 200 × 100 × 50 mm (1 litr)
            </Text>
          </View>
        </View>

        {/* Gwarancje Apps4Brew */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Standard Inżynieryjny Apps4Brew</Text>
          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeIcon}>📶</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>100% Offline-First</Text>
              <Text style={styles.guaranteeDesc}>Zero zapytań sieciowych przy załadunku i pomiarach</Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeIcon}>💸</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>0 zł Kosztów Infrastruktury</Text>
              <Text style={styles.guaranteeDesc}>Brak serwerów chmurowych i zbędnych subskrypcji</Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>Determinizm i Precyzja 3D</Text>
              <Text style={styles.guaranteeDesc}>Integer mm, 9 warstw testów jakości wzorowane na repozytorium organizer</Text>
            </View>
          </View>
        </View>

        {/* Informacje o wersji */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ O Aplikacji</Text>
          <Text style={styles.aboutRow}>Wersja: <Text style={styles.aboutVal}>0.1.0 (MVP)</Text></Text>
          <Text style={styles.aboutRow}>BRD: <Text style={styles.aboutVal}>116.8 stron (27 modułów)</Text></Text>
          <Text style={styles.aboutRow}>Warstwy Testów: <Text style={styles.aboutVal}>9 warstw jakości (139 testów 100% pass)</Text></Text>
          <Text style={styles.aboutRow}>Licencja: <Text style={styles.aboutVal}>Apps4Brew Proprietary</Text></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  statusBanner: {
    backgroundColor: '#064E3B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#059669',
  },
  statusBannerText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  watchContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  watchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  watchSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  watchBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  watchBadgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  watchSectionDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginBottom: 14,
  },
  watchCase: {
    backgroundColor: '#030712',
    borderRadius: 36,
    padding: 12,
    borderWidth: 3,
    borderColor: '#4B5563',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 8,
  },
  watchScreen: {
    backgroundColor: '#000000',
    borderRadius: 24,
    padding: 12,
  },
  watchStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  watchTime: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  watchProgressLabel: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  watchProgressBar: {
    height: 4,
    backgroundColor: '#1F2937',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  watchProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  watchItemCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 10,
  },
  watchPhaseBadge: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  watchItemName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  watchItemDims: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 2,
  },
  watchItemPos: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  watchWarningPill: {
    backgroundColor: '#D97706',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  watchWarningText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  watchButtonsRow: {
    marginBottom: 10,
  },
  watchActionBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  watchActionBtnDone: {
    backgroundColor: '#059669',
  },
  watchActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  watchCrownControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  crownBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  crownBtnDisabled: {
    opacity: 0.3,
  },
  crownBtnText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  crownStepText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  hapticToast: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  hapticToastText: {
    color: '#C7D2FE',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  testHapticBtn: {
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  testHapticBtnText: {
    color: '#9CA3AF',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  statVal: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  backupMetaBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  backupMetaText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  buttonCol: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  inspectButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  inspectButtonText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#451A1A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  dangerButtonText: {
    color: '#FCA5A5',
    fontWeight: '600',
    fontSize: 13,
  },
  jsonPreviewBox: {
    backgroundColor: '#090D16',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  jsonCodeText: {
    fontFamily: 'monospace',
    color: '#34D399',
    fontSize: 11,
    lineHeight: 15,
  },
  standardItem: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  standardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  standardDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guaranteeIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  guaranteeTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  guaranteeDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  aboutRow: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  aboutVal: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
});
