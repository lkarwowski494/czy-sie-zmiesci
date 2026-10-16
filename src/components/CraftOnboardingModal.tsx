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
import { sharedCraftTokens, CraftFamilyEmblem } from '../core/craft-suite-theme';
import {
  RitualProfileId,
  RITUAL_PROFILES,
} from '../services/ritual-profile';
import { t } from '../lib/i18n';

interface CraftOnboardingModalProps {
  visible: boolean;
  onSelectProfile: (profile: RitualProfileId) => void;
}

export function CraftOnboardingModal({
  visible,
  onSelectProfile,
}: CraftOnboardingModalProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<RitualProfileId>('daily');

  const handleConfirm = () => {
    onSelectProfile(selected);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        testID="craft-onboarding-modal"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ marginBottom: 12 }}>
              <CraftFamilyEmblem size={42} color="#38BDF8" />
            </View>
            <View style={styles.studioPill}>
              <Text style={styles.studioPillText}>APPS4CRAFT STUDIO</Text>
            </View>
            <Text style={styles.brandTitle}>CZY SIĘ ZMIEŚCI?</Text>
            <Text style={styles.brandSubtitle}>
              {t('Wybierz swój profil rzemieślniczy. Dostosujemy układ narzędzi i kalkulatorów.')}
            </Text>
          </View>

          {/* Cards for Profiles */}
          <View style={styles.profilesList}>
            {(Object.keys(RITUAL_PROFILES) as RitualProfileId[]).map((id) => {
              const p = RITUAL_PROFILES[id];
              const isSelected = selected === id;

              return (
                <TouchableOpacity
                  key={id}
                  testID={`onboarding-profile-${id}`}
                  style={[
                    styles.profileCard,
                    isSelected && styles.profileCardSelected,
                  ]}
                  onPress={() => setSelected(id)}
                  activeOpacity={0.8}
                  hitSlop={sharedCraftTokens.hitSlopStandard}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{p.icon}</Text>
                    <View style={styles.cardTitleBox}>
                      <View style={styles.cardBadgeRow}>
                        <Text style={styles.cardTitle}>{t(p.title)}</Text>
                        <View
                          style={[
                            styles.badge,
                            isSelected && styles.badgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              isSelected && styles.badgeTextSelected,
                            ]}
                          >
                            {p.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardSubtitle}>{t(p.subtitle)}</Text>
                    </View>
                  </View>

                  <View style={styles.toolsRow}>
                    {p.primaryTools.map((tool, idx) => (
                      <View key={idx} style={styles.toolPill}>
                        <Text style={styles.toolPillText}>{t(tool)}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            testID="onboarding-confirm-button"
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.85}
            hitSlop={sharedCraftTokens.hitSlopStandard}
          >
            <Text style={styles.confirmButtonText}>
              {t('Rozpocznij Rytuał')} →
            </Text>
          </TouchableOpacity>
          <Text style={styles.disclaimerText}>
            {t('100% offline • Bez konta • Zmienisz to w każdej chwili w Ustawieniach')}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingVertical: 12,
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  studioPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 12,
  },
  studioPillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandTitle: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSubtitle: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  profilesList: {
    gap: 14,
  },
  profileCard: {
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: sharedCraftTokens.colors.border,
    padding: 16,
    minHeight: 88,
  },
  profileCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: sharedCraftTokens.colors.border,
  },
  badgeSelected: {
    backgroundColor: '#38BDF8',
  },
  badgeText: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextSelected: {
    color: '#0F172A',
  },
  cardSubtitle: {
    color: sharedCraftTokens.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  toolPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toolPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  bottomBar: {
    paddingTop: 16,
    alignItems: 'center',
    gap: 10,
  },
  confirmButton: {
    backgroundColor: '#38BDF8',
    width: '100%',
    height: sharedCraftTokens.buttonHeightMin,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disclaimerText: {
    color: sharedCraftTokens.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
