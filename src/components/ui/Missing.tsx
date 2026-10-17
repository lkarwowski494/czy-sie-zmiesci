import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '../../core/craft-suite-theme';

export interface MissingProps {
  title?: string;
  message?: string;
  returnLabel?: string;
  onReturn?: () => void;
  style?: object;
  testID?: string;
}

/**
 * Missing (S12 / NFR-INT-012):
 * Standaryzowany komponent brakującego rekordu na trasie z parametrem [id].
 * Zapewnia bezpieczny powrót (router.back() z fallbackiem do '/') bez rzucania błędu.
 */
export const Missing: React.FC<MissingProps> = ({
  title,
  message,
  returnLabel,
  onReturn,
  style,
  testID,
}) => {
  const router = useRouter();

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else {
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      } catch {
        router.replace('/');
      }
    }
  };

  const resolvedTitle = title || t('Nie znaleziono rekordu');
  const resolvedMessage = message || t('Ten element mógł zostać wcześniej usunięty.');
  const resolvedReturn = returnLabel || t('Wróć do ekranu głównego');

  return (
    <View style={[styles.container, style]} testID={testID} accessible={true}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.title} accessibilityRole="header">
        {resolvedTitle}
      </Text>
      <Text style={styles.message}>{resolvedMessage}</Text>
      <TouchableOpacity
        style={styles.returnBtn}
        onPress={handleReturn}
        accessibilityRole="button"
        accessibilityLabel={resolvedReturn}
      >
        <Text style={styles.returnText}>{resolvedReturn}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sharedCraftTokens.colors.bgBasalt,
    flex: 1,
  },
  icon: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: sharedCraftTokens.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: sharedCraftTokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  returnBtn: {
    minHeight: 44, // RD-ENG-03
    minWidth: 160,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
});
