import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../lib/i18n';
import { wasStateCorrupt, resetCorruptFlag } from '../../lib/backup';
import { sharedCraftTokens } from '../../core/craft-suite-theme';

export interface RecoveryBannerProps {
  onRestorePress?: () => void;
  style?: object;
}

/**
 * RecoveryBanner (BR-TEST-023 / S8):
 * Nieinwazyjny baner odzyskiwania danych na ekranie głównym.
 * Wyświetla się wyłącznie gdy odczytany stan uległ uszkodzeniu,
 * eliminując wyskakujące okna Alert.alert przy starcie aplikacji.
 */
export const RecoveryBanner: React.FC<RecoveryBannerProps> = ({ onRestorePress, style }) => {
  const router = useRouter();
  const isCorrupt = wasStateCorrupt();

  if (!isCorrupt) return null;

  const handleAction = () => {
    if (onRestorePress) {
      onRestorePress();
    } else {
      router.push('/(tabs)/settings');
    }
  };

  return (
    <View style={[styles.container, style]} accessible={true}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('Wykryto uszkodzony stan danych')}</Text>
        <Text style={styles.description}>
          {t('Oryginalne dane zostały zabezpieczone. Możesz przywrócić ostatnią kopię ratunkową.')}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleAction}
          accessibilityRole="button"
          accessibilityLabel={t('Przywróć kopię')}
        >
          <Text style={styles.restoreText}>{t('Przywróć')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={resetCorruptFlag}
          accessibilityRole="button"
          accessibilityLabel={t('Zamknij powiadomienie')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    color: '#FEE2E2',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  description: {
    color: '#FCA5A5',
    fontSize: 11,
    lineHeight: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restoreBtn: {
    minHeight: 44, // RD-ENG-03
    minWidth: 70,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  dismissBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: '600',
  },
});
