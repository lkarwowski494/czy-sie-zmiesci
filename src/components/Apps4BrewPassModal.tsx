// ============================================================================
// Czy się zmieści? (FitCheck) — Apps4Brew Pass Paywall Modal ("Cheaper than Espresso")
// Pricing: $0.99/mo, $4.99/yr, $14.99 Lifetime.
// Zero feature gating during trial, 100% read-only history guaranteed.
// Apps4Brew Studio — 100% Offline-First, Zero Telemetry.
// ============================================================================

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAppAccess, PRICING, SubscriptionTier } from '../services/app-access';
import { sharedCraftTokens, CloseIcon } from '../core/craft-suite-theme';
import { t } from '../lib/i18n';


export interface Apps4BrewPassModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onPurchaseSuccess?: () => void;
  readonly onSubscribed?: () => void;
}

export function Apps4BrewPassModal({
  visible,
  onClose,
  onPurchaseSuccess,
  onSubscribed,
}: Apps4BrewPassModalProps) {
  const {
    subscribe,
    restore,
    status,
    projectsRemaining,
    daysRemaining,
    isSubscribed,
  } = useAppAccess();

  const handleSelectPlan = (tier: 'monthly' | 'annual' | 'lifetime') => {
    subscribe(tier);
    const planName =
      tier === 'annual'
        ? t('Roczny')
        : tier === 'lifetime'
        ? t('Dostęp na Zawsze')
        : t('Miesięczny');

    Alert.alert(
      t('Zakup zrealizowany!'),
      t('Dziękujemy! Plan {plan} został aktywowany. Pełny dostęp bez limitów jest odblokowany.', {
        plan: planName,
      })
    );

    if (onPurchaseSuccess) onPurchaseSuccess();
    if (onSubscribed) onSubscribed();
    onClose();
  };

  const handleRestore = () => {
    const updated = restore();
    if (updated.isSubscribed) {
      Alert.alert(
        t('Przywrócono zakupy'),
        t('Twój dostęp do Apps4Brew Studio Pass został pomyślnie zweryfikowany.')
      );
      if (onPurchaseSuccess) onPurchaseSuccess();
      if (onSubscribed) onSubscribed();
      onClose();
    } else {
      Alert.alert(
        t('Brak aktywnych zakupów'),
        t('Nie znaleziono wcześniejszych zakupów przypisanych do tego urządzenia.')
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="close-paywall-btn"
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('Zamknij')}
            hitSlop={sharedCraftTokens.hitSlopStandard}
            activeOpacity={0.7}
          >
            <CloseIcon size={20} color="#F4EFEA" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t('Apps4Brew Studio Pass')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Badge i Tytuł */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>APPS4BREW STUDIO PASS</Text>
            </View>
          </View>

          <Text style={styles.title}>{t('Taniej niż espresso')}</Text>
          <Text style={styles.subtitle}>
            {t('Bezpieczeństwo ładunku, precyzja 3D i zero zgadywania w sklepie')}
          </Text>
          <Text style={styles.tagline}>
            {t('Mniej niż koszt jednej kawy, by zaoszczędzić setki złotych na pomyłkach w transporcie i meblach.')}
          </Text>

          {/* Status Trialu */}
          {status === 'trial_active' && (
            <View style={styles.statusBoxActive}>
              <Text style={styles.statusBoxTitle}>{t('Aktywny okres próbny')}</Text>
              <Text style={styles.statusBoxText}>
                {t('Pozostało {count} wolnych projektów ({days} dni do końca)', {
                  count: projectsRemaining,
                  days: daysRemaining,
                })}
              </Text>
            </View>
          )}

          {status === 'trial_expired' && (
            <View style={styles.statusBoxExpired}>
              <Text style={styles.statusBoxTitleExpired}>{t('Okres próbny zakończony')}</Text>
              <Text style={styles.statusBoxText}>
                {t('Wybierz plan, aby tworzyć nowe projekty. Twoja dotychczasowa historia pozostaje ZAWSZE bezpłatna!')}
              </Text>
            </View>
          )}

          {isSubscribed && (
            <View style={styles.statusBoxSubscribed}>
              <Text style={styles.statusBoxTitleSubscribed}>{t('Pełny dostęp aktywny')}</Text>
              <Text style={styles.statusBoxText}>
                {t('Dziękujemy za wsparcie niezależnego studia Apps4Brew! Wszystkie funkcje bez limitów.')}
              </Text>
            </View>
          )}

          {/* Korzyści 100% wartości */}
          <View style={styles.perksCard}>
            <Text style={styles.perksHeading}>{t('Co zyskujesz w pełnej wersji?')}</Text>
            <Text style={styles.perkItem}>
              {t('✓ Nielimitowane symulacje 3D bagażnika i wnoszenia mebli')}
            </Text>
            <Text style={styles.perkItem}>
              {t('✓ Baza ponad 350 modeli samochodów i katalog wymiarów IKEA')}
            </Text>
            <Text style={styles.perkItem}>
              {t('✓ Szybka weryfikacja w sklepie Store-to-Trunk (Pocket-Proof)')}
            </Text>
            <Text style={styles.perkItem}>
              {t('✓ Kontrola DMC, nacisku kuli haka (S) i ochrona skrajni garażowych')}
            </Text>
          </View>

          {/* Gwarancja historii Read-Only */}
          <View style={styles.guaranteeBox}>
            <Text style={styles.guaranteeIcon}>🛡️</Text>
            <Text style={styles.guaranteeText}>
              {t('Twoje zapisane samochody, meble i historia sesji pozostają ZAWSZE dostępne (Read-Only). Nigdy nie stracisz dostępu do swoich pomiarów.')}
            </Text>
          </View>

          {/* KARTY CENNIKOWE */}
          <View style={styles.pricingSection}>
            {/* Opcja 1: Roczny (Polecana) */}
            <TouchableOpacity
              testID="plan-annual-btn"
              style={[styles.planCard, styles.planCardFeatured]}
              onPress={() => handleSelectPlan('annual')}
              activeOpacity={0.85}
            >
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>{t('NAJLEPSZY WYBÓR')}</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{t('Roczny (Polecany)')}</Text>
                <Text style={styles.planPrice}>{PRICING.annual.label}</Text>
              </View>
              <Text style={styles.planDesc}>{PRICING.annual.desc}</Text>
            </TouchableOpacity>

            {/* Opcja 2: Miesięczny */}
            <TouchableOpacity
              testID="plan-monthly-btn"
              style={styles.planCard}
              onPress={() => handleSelectPlan('monthly')}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{t('Miesięczny')}</Text>
                <Text style={styles.planPrice}>{PRICING.monthly.label}</Text>
              </View>
              <Text style={styles.planDesc}>{PRICING.monthly.desc}</Text>
            </TouchableOpacity>

            {/* Opcja 3: Lifetime */}
            <TouchableOpacity
              testID="plan-lifetime-btn"
              style={styles.planCard}
              onPress={() => handleSelectPlan('lifetime')}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{t('Dostęp na Zawsze')}</Text>
                <Text style={styles.planPrice}>{PRICING.lifetime.label}</Text>
              </View>
              <Text style={styles.planDesc}>{PRICING.lifetime.desc}</Text>
            </TouchableOpacity>
          </View>

          {/* Przywracanie zakupów */}
          <TouchableOpacity
            testID="restore-purchases-btn"
            style={styles.restoreBtn}
            onPress={handleRestore}
            accessibilityRole="button"
          >
            <Text style={styles.restoreBtnText}>{t('Przywróć Zakupy')}</Text>
          </TouchableOpacity>

          {/* Stopka Offline-First */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('100% Offline-First · Zero Analityki i Śledzenia · Apps4Brew Studio')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#1E293B',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  badgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  statusBoxActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusBoxTitle: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  statusBoxExpired: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusBoxTitleExpired: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  statusBoxSubscribed: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusBoxTitleSubscribed: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  statusBoxText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  perksCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  perksHeading: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  perkItem: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 22,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  guaranteeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  guaranteeText: {
    flex: 1,
    color: '#FCD34D',
    fontSize: 12,
    lineHeight: 16,
  },
  pricingSection: {
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  planCardFeatured: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A8A22',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  planPrice: {
    color: '#60A5FA',
    fontSize: 18,
    fontWeight: '800',
  },
  planDesc: {
    color: '#94A3B8',
    fontSize: 12,
  },
  restoreBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
});
