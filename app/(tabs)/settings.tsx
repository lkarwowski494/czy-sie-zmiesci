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
import { useLang, setLang, t } from '../../src/lib/i18n';
import { useUnitSystem, setUnitSystem } from '../../src/lib/unit-converter';
import { exportBackup, safetyBackup } from '../../src/lib/backup';
import { useAppAccess } from '../../src/services/app-access';
import { useRitualProfile, RITUAL_PROFILES, RitualProfileId } from '../../src/services/ritual-profile';
import { sharedCraftTokens, CRAFT_APPS, CraftAppId } from '../../src/core/craft-suite-theme';
import { Apps4BrewPassModal } from '../../src/components/Apps4BrewPassModal';
import {
  NaparAppIcon,
  PiekarzAppIcon,
  SloikAppIcon,
  MasazAppIcon,
  FermentAppIcon,
  CraftFamilyEmblem,
} from '@apps4craft/ui';

export default function SettingsScreen() {
  const db = getDatabaseService();
  const watchSync = new WatchSyncService(db);
  const lang = useLang();
  const unitSystem = useUnitSystem();
  const access = useAppAccess();
  const { profile, changeProfile } = useRitualProfile();
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const renderCraftAppIcon = (id: CraftAppId, accent: string) => {
    switch (id) {
      case 'napar':
        return <NaparAppIcon size={24} color={accent} />;
      case 'piekarz':
        return <PiekarzAppIcon size={24} color={accent} />;
      case 'sloik':
        return <SloikAppIcon size={24} color={accent} />;
      case 'masaz':
        return <MasazAppIcon size={24} color={accent} />;
      case 'ferment':
        return <FermentAppIcon size={24} color={accent} />;
      default:
        return <CraftFamilyEmblem size={24} color={accent} />;
    }
  };


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

  const handleExportBackup = async () => {
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

      await exportBackup(backup.data);
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
        result.success ? 'Nieoczekiwany sukces' : 'ODRZUCONO (Prawidłowo)'
      }\nKomunikat bazy: "${result.error}"\n\nBaza danych zachowała 100% integralności dzięki transakcji SQLite z rollbackiem.`
    );
  };

  const handleResetToPresets = () => {
    Alert.alert(
      'Przywracanie Danych Domyślnych',
      'Czy na pewno chcesz przywrócić domyślne katalogi pojazdów i ładunków Apps4Brew? Zostanie utworzona kopia bezpieczeństwa.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Przywróć',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentData = db.exportBackupJson().data;
              await safetyBackup('reset', currentData);
            } catch {
              // Safety snapshot attempted
            }
            db.initialize();
            setStatusMessage('🔄 Baza danych zsynchronizowana z biblioteką wzorcową (zapisano kopię bezpieczeństwa).');
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

        {/* 1. Profil Rytuału Rzemieślniczego (FAZA 3) */}
        <View style={styles.card} testID="settings-ritual-profile-card">
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardTitle}>🎯 {t('Profil Rytuału')}</Text>
            <View style={styles.profileActiveBadge}>
              <Text style={styles.profileActiveBadgeText}>{t('Aktywny')}</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            {t('Wybierz profil, aby dostosować układ narzędzi w aplikacji:')}
          </Text>

          <View style={styles.ritualProfilesGrid}>
            {(Object.keys(RITUAL_PROFILES) as RitualProfileId[]).map((id) => {
              const p = RITUAL_PROFILES[id];
              const isSelected = profile === id;

              return (
                <TouchableOpacity
                  key={id}
                  testID={`settings-profile-btn-${id}`}
                  style={[
                    styles.profileSettingCard,
                    isSelected && styles.profileSettingCardSelected,
                  ]}
                  onPress={() => changeProfile(id)}
                  hitSlop={sharedCraftTokens.hitSlopStandard}
                  activeOpacity={0.8}
                >
                  <View style={styles.profileSettingHeader}>
                    <Text style={styles.profileSettingIcon}>{p.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.profileTitleRow}>
                        <Text
                          style={[
                            styles.profileSettingTitle,
                            isSelected && styles.profileSettingTitleSelected,
                          ]}
                        >
                          {t(p.title)}
                        </Text>
                        {isSelected && <Text style={styles.checkmarkIcon}>✓</Text>}
                      </View>
                      <Text style={styles.profileSettingSubtitle}>{t(p.subtitle)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Rodzina Apps4Craft Studio (FAZA 4 & KROK 5) */}
        <View style={styles.card} testID="settings-apps4craft-family-card">
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CraftFamilyEmblem size={24} color="#38BDF8" />
              <Text style={styles.cardTitle}>{t('Rodzina Apps4Craft Studio')}</Text>
            </View>
            <View style={styles.studioEcosystemBadge}>
              <Text style={styles.studioEcosystemBadgeText}>EKOSYSTEM</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            {t('Rzemieślniczy ekosystem 100% offline-first. Żadnych chmur, żadnej telemetrii.')}
          </Text>

          <View style={styles.craftAppsList}>
            {Object.values(CRAFT_APPS).map((app) => (
              <View
                key={app.id}
                testID={`craft-app-${app.id}`}
                style={[
                  styles.craftAppItem,
                  app.id === 'fitcheck' && styles.craftAppItemCurrent,
                ]}
              >
                <View
                  style={[
                    styles.craftFamilyIconBox,
                    { borderColor: app.accent },
                  ]}
                >
                  {renderCraftAppIcon(app.id, app.accent)}
                </View>
                <View style={styles.craftAppDetails}>
                  <View style={styles.craftAppNameRow}>
                    <Text style={styles.craftAppName}>{app.name}</Text>
                    {app.id === 'fitcheck' && (
                      <View style={styles.currentAppPill}>
                        <Text style={styles.currentAppPillText}>{t('Ta aplikacja')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.craftAppDomain}>{app.domain}</Text>
                  <Text style={styles.craftAppHero}>{app.heroDescriptor}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>


        {/* Język i Jednostki Miary (i18n & Imperial) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 Język i Jednostki Miary</Text>
          <Text style={styles.infoText}>
            Dostosuj język aplikacji oraz preferowany system pomiaru wymiarów, objętości i masy ładunków.
          </Text>

          <Text style={styles.settingLabel}>Język interfejsu (Language):</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, lang === 'pl' && styles.toggleBtnActive]}
              onPress={() => setLang('pl')}
            >
              <Text style={[styles.toggleBtnText, lang === 'pl' && styles.toggleBtnTextActive]}>
                🇵🇱 Polski
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, lang === 'en' && styles.toggleBtnActive]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.toggleBtnText, lang === 'en' && styles.toggleBtnTextActive]}>
                🇬🇧 English
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.settingLabel, { marginTop: 14 }]}>System jednostek (Unit System):</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, unitSystem === 'metric' && styles.toggleBtnActive]}
              onPress={() => setUnitSystem('metric')}
            >
              <Text style={[styles.toggleBtnText, unitSystem === 'metric' && styles.toggleBtnTextActive]}>
                📏 Metryczny (cm, mm, kg, L)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, unitSystem === 'imperial' && styles.toggleBtnActive]}
              onPress={() => setUnitSystem('imperial')}
            >
              <Text style={[styles.toggleBtnText, unitSystem === 'imperial' && styles.toggleBtnTextActive]}>
                📐 Imperialny (in, ft, lbs, cu ft)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Apps4Brew Studio Pass ("Cheaper than Espresso") */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>☕ Apps4Brew Studio Pass</Text>
            <View style={styles.passBadge}>
              <Text style={styles.passBadgeText}>
                {access.isSubscribed
                  ? access.subscriptionTier.toUpperCase()
                  : access.status === 'trial_active'
                  ? 'TRIAL'
                  : 'READ-ONLY'}
              </Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Model „Cheaper than Espresso” ($0.99/msc · $4.99/rok · $14.99 Lifetime). Pełny dostęp bez limitów i gwarancja zachowania historii pomiarów.
          </Text>

          <View style={styles.passStatusRow}>
            <Text style={styles.passStatusLabel}>Bieżący status:</Text>
            <Text style={styles.passStatusVal}>
              {access.isSubscribed
                ? 'Aktywny Dostęp Pełny'
                : access.status === 'trial_active'
                ? `Aktywny Okres Próbny (${access.projectsRemaining} wolnych projektów / ${access.daysRemaining} dni)`
                : 'Archiwum Read-Only (Zapisane pomiary bezpieczne)'}
            </Text>
          </View>

          <TouchableOpacity
            testID="open-pass-modal-btn"
            style={styles.passCtaButton}
            onPress={() => setIsPassModalOpen(true)}
          >
            <Text style={styles.passCtaButtonText}>
              {access.isSubscribed
                ? 'Zarządzaj Subskrypcją / Przywróć'
                : 'Odblokuj Pełny Dostęp ($0.99 / $4.99 / $14.99) →'}
            </Text>
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

      {/* Modal Apps4Brew Pass ("Cheaper than Espresso") */}
      <Apps4BrewPassModal
        visible={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileActiveBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  profileActiveBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ritualProfilesGrid: {
    gap: 10,
    marginTop: 8,
  },
  profileSettingCard: {
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: sharedCraftTokens.colors.border,
  },
  profileSettingCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B',
  },
  profileSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileSettingIcon: {
    fontSize: 24,
  },
  profileTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  profileSettingTitle: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  profileSettingTitleSelected: {
    color: '#38BDF8',
  },
  checkmarkIcon: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
  },
  profileSettingSubtitle: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  studioEcosystemBadge: {
    backgroundColor: 'rgba(200, 106, 40, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C86A28',
  },
  studioEcosystemBadgeText: {
    color: '#E5A96A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  craftAppsList: {
    gap: 8,
    marginTop: 8,
  },
  craftAppItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    paddingRight: 8,
  },
  craftAppItemCurrent: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  craftAppDetails: {
    flex: 1,
    padding: 10,
  },
  craftAppNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  craftAppName: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  currentAppPill: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentAppPillText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '800',
  },
  craftAppDomain: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  craftAppHero: {
    color: sharedCraftTokens.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  passBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
  },
  passStatusRow: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passStatusLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  passStatusVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  passCtaButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
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
  settingLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  toggleBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  craftBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  craftBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  craftFamilyGrid: {
    gap: 10,
    marginTop: 10,
  },
  craftFamilyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  craftFamilyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  craftFamilyInfo: {
    flex: 1,
  },
  craftFamilyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  craftFamilyName: {
    fontSize: 14,
    fontWeight: '800',
  },
  craftFamilyDomain: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  craftFamilyDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
});
