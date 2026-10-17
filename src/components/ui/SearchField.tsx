import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '../../core/craft-suite-theme';

import { normSearch } from '../../lib/search';
export { normSearch };

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  style?: object;
  testID?: string;
}

/**
 * SearchField (S15 / NFR-INT-015):
 * Standaryzowany komponent wyszukiwania z przyciskiem szybkiego czyszczenia '×'
 * oraz gwarantowanym polem dotyku >= 44 pt.
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  style,
  testID,
}) => {
  const resolvedPlaceholder = placeholder || t('Szukaj...');

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={sharedCraftTokens.colors.textMuted}
        accessibilityLabel={accessibilityLabel || resolvedPlaceholder}
        testID={testID}
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => onChangeText('')}
          accessibilityLabel={t('Wyczyść wyszukiwanie')}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44, // RD-ENG-03 (pole dotyku >= 44 pt)
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: sharedCraftTokens.colors.textPrimary,
    fontSize: 15,
  },
  clearBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 16,
    color: sharedCraftTokens.colors.textMuted,
  },
});
