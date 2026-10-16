import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sharedCraftTokens,
  CloseIcon,
  PrevStepIcon,
  NextStepIcon,
  CraftStatDisplay,
} from '../core/craft-suite-theme';
import { t } from '../lib/i18n';

export interface FocusStep {
  readonly id: string;
  readonly sequence: number;
  readonly title: string;
  readonly dimensions: string;
  readonly weightKg: number;
  readonly targetLocation: string;
  readonly isHeavy: boolean;
  readonly isFragile: boolean;
  readonly advice: string;
}

interface ActiveFocusModeModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  steps?: readonly FocusStep[];
  clearanceMm?: number;
  payloadPct?: number;
  totalWeightKg?: number;
}

const DEFAULT_STEPS: readonly FocusStep[] = [
  {
    id: 'f-step-1',
    sequence: 1,
    title: 'Najcięższy ładunek (Pralka / AGD)',
    dimensions: '60 × 60 × 85 cm',
    weightKg: 68,
    targetLocation: 'Dno bagażnika, bezpośrednio za oparciem kanapy',
    isHeavy: true,
    isFragile: true,
    advice: 'Umieść centralnie na macie antypoślizgowej. Zabezpiecz pasem transportowym (PN-EN 12195-1).',
  },
  {
    id: 'f-step-2',
    sequence: 2,
    title: 'Ciężkie walizki i pudła bazowe',
    dimensions: '75 × 50 × 30 cm',
    weightKg: 22,
    targetLocation: 'Po bokach najcięższego ładunku, dosunięte do ścianek',
    isHeavy: true,
    isFragile: false,
    advice: 'Zapewnij zwarcie bryły, aby ładunek nie przemieszczał się przy hamowaniu.',
  },
  {
    id: 'f-step-3',
    sequence: 3,
    title: 'Lekkie torby i miękkie pakiety',
    dimensions: '55 × 40 × 20 cm',
    weightKg: 8,
    targetLocation: 'Górna warstwa, poniżej linii zagłówków',
    isHeavy: false,
    isFragile: false,
    advice: 'Wypełnij puste wnęki. Nie zasłaniaj widoczności w lusterku wstecznym.',
  },
];

export function ActiveFocusModeModal({
  visible,
  onClose,
  title = 'Rytuał Załadunku: Tryb Skupienia',
  steps = DEFAULT_STEPS,
  clearanceMm = 45,
  payloadPct = 68,
  totalWeightKg = 98,
}: ActiveFocusModeModalProps) {
  const insets = useSafeAreaInsets();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [packedSteps, setPackedSteps] = useState<Record<number, boolean>>({});

  const activeStepList = steps.length > 0 ? steps : DEFAULT_STEPS;
  const currentStep = activeStepList[Math.min(currentStepIdx, activeStepList.length - 1)];
  const isCurrentPacked = !!packedSteps[currentStep.sequence];
  const packedCount = Object.values(packedSteps).filter(Boolean).length;
  const totalCount = activeStepList.length;

  const handleTogglePacked = () => {
    setPackedSteps((prev) => ({
      ...prev,
      [currentStep.sequence]: !prev[currentStep.sequence],
    }));
  };

  const handleNext = () => {
    if (currentStepIdx < activeStepList.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
        testID="active-focus-mode-modal"
      >
        {/* Top Header & Close */}
        <View style={styles.topBar}>
          <View style={styles.topInfo}>
            <Text style={styles.badgeLabel}>ACTIVE FOCUS • APPS4CRAFT</Text>
            <Text style={styles.modalTitle}>{t(title)}</Text>
          </View>
          <TouchableOpacity
            testID="focus-mode-close-button"
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={sharedCraftTokens.hitSlopStandard}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('Zamknij tryb skupienia')}
          >
            <CloseIcon size={18} color="#F4EFEA" />
          </TouchableOpacity>
        </View>

        {/* Sacred Numbers Panel (Always visible at top) */}
        <View style={styles.sacredPanel} testID="sacred-numbers-panel">
          <View style={styles.sacredItem}>
            <CraftStatDisplay
              testID="sacred-stat-clearance"
              label={t('LUZ BEZPIECZEŃSTWA')}
              value={`+${clearanceMm}`}
              unit="mm"
              accentColor="#38BDF8"
              subtext={t('Bez kolizji')}
              size="sm"
            />
          </View>
          <View style={styles.sacredDivider} />
          <View style={styles.sacredItem}>
            <CraftStatDisplay
              testID="sacred-stat-payload"
              label={t('OBCIĄŻENIE ŁADOWNOŚCI')}
              value={`${payloadPct}`}
              unit="%"
              accentColor={payloadPct > 90 ? '#D9534F' : '#4E9F3D'}
              subtext={`${totalWeightKg} kg / DMC`}
              size="sm"
            />
          </View>
          <View style={styles.sacredDivider} />
          <View style={styles.sacredItem}>
            <CraftStatDisplay
              testID="sacred-stat-progress"
              label={t('POSTĘP')}
              value={`${packedCount}/${totalCount}`}
              subtext={t('Kroków')}
              size="sm"
            />
          </View>
        </View>

        {/* Giant Step Focus View */}
        <ScrollView
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>
                  {currentStep.sequence} / {totalCount}
                </Text>
              </View>
              {isCurrentPacked && (
                <View style={styles.packedBadge}>
                  <Text style={styles.packedBadgeText}>✓ {t('SPAKOWANE')}</Text>
                </View>
              )}
            </View>

            {/* Giant Title */}
            <Text style={styles.stepTitle}>{currentStep.title}</Text>

            {/* Giant Numbers & Specs (readable from 2 meters) */}
            <View style={styles.giantMetricsBox}>
              <Text style={styles.giantDimsText}>{currentStep.dimensions}</Text>
              <Text style={styles.giantWeightText}>⚖️ {currentStep.weightKg} kg</Text>
            </View>

            {/* Location & Instructions */}
            <View style={styles.locationSection}>
              <Text style={styles.locationHeader}>📍 {t('POZYCJA W PRZESTRZENI')}:</Text>
              <Text style={styles.locationText}>{currentStep.targetLocation}</Text>
            </View>

            <View style={styles.adviceSection}>
              <Text style={styles.adviceHeader}>💡 {t('WSKAZÓWKA RZEMIEŚLNICZA')}:</Text>
              <Text style={styles.adviceText}>{currentStep.advice}</Text>
            </View>

            {(currentStep.isHeavy || currentStep.isFragile) && (
              <View style={styles.tagsRow}>
                {currentStep.isHeavy && (
                  <View style={styles.tagWarning}>
                    <Text style={styles.tagWarningText}>⚠️ {t('Ciężki ładunek (≥20kg) • 2 osoby')}</Text>
                  </View>
                )}
                {currentStep.isFragile && (
                  <View style={styles.tagFragile}>
                    <Text style={styles.tagFragileText}>🛡️ {t('Wymaga unieruchomienia')}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Big Touch Target Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            testID="focus-toggle-packed-button"
            style={[
              styles.togglePackedBtn,
              isCurrentPacked && styles.togglePackedBtnDone,
            ]}
            onPress={handleTogglePacked}
            activeOpacity={0.8}
            hitSlop={sharedCraftTokens.hitSlopStandard}
          >
            <Text
              style={[
                styles.togglePackedBtnText,
                isCurrentPacked && styles.togglePackedBtnTextDone,
              ]}
            >
              {isCurrentPacked ? `✓ ${t('Oznacz jako niespakowane')}` : `📦 ${t('Odznacz: Ładunek w aucie')}`}
            </Text>
          </TouchableOpacity>

          <View style={styles.navRow}>
            <TouchableOpacity
              testID="focus-prev-step-button"
              style={[styles.navBtn, currentStepIdx === 0 && styles.navBtnDisabled]}
              onPress={handlePrev}
              disabled={currentStepIdx === 0}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('Poprzedni krok')}
            >
              <PrevStepIcon size={18} color={currentStepIdx === 0 ? '#686561' : '#F4EFEA'} />
              <Text style={[styles.navBtnText, { marginLeft: 6 }]}>{t('Poprzedni')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="focus-next-step-button"
              style={[
                styles.navBtn,
                styles.navBtnPrimary,
                currentStepIdx === activeStepList.length - 1 && styles.navBtnDisabled,
              ]}
              onPress={handleNext}
              disabled={currentStepIdx === activeStepList.length - 1}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('Następny krok')}
            >
              <Text style={[styles.navBtnPrimaryText, { marginRight: 6 }]}>{t('Następny krok')}</Text>
              <NextStepIcon
                size={18}
                color={currentStepIdx === activeStepList.length - 1 ? '#686561' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: sharedCraftTokens.colors.border,
  },
  topInfo: {
    flex: 1,
  },
  badgeLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modalTitle: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  sacredPanel: {
    flexDirection: 'row',
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: sharedCraftTokens.colors.border,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sacredItem: {
    alignItems: 'center',
    flex: 1,
  },
  sacredDivider: {
    width: 1,
    height: '70%',
    backgroundColor: sharedCraftTokens.colors.border,
  },
  sacredLabel: {
    color: sharedCraftTokens.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  sacredValue: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sacredValueSuccess: {
    color: '#10B981',
  },
  sacredValueDanger: {
    color: '#EF4444',
  },
  sacredSub: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  stepContent: {
    paddingVertical: 16,
  },
  stepCard: {
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: sharedCraftTokens.colors.border,
    padding: 20,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  stepNumberText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  packedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  packedBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 30,
    marginBottom: 16,
  },
  giantMetricsBox: {
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    marginBottom: 18,
    alignItems: 'center',
    gap: 6,
  },
  giantDimsText: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  giantWeightText: {
    color: '#F59E0B',
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  locationSection: {
    marginBottom: 14,
  },
  locationHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  locationText: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  adviceSection: {
    marginBottom: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  adviceHeader: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  adviceText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  tagWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagWarningText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
  },
  tagFragile: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagFragileText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomControls: {
    paddingTop: 12,
    gap: 10,
  },
  togglePackedBtn: {
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglePackedBtnDone: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  togglePackedBtnText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
  togglePackedBtnTextDone: {
    color: '#A7F3D0',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPrimary: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  navBtnPrimaryText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
