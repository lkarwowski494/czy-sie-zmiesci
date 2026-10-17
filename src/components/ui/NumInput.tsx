import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { wInKeep, UnitType } from '../../lib/unit-converter';
import { sharedCraftTokens } from '../../core/craft-suite-theme';

export interface NumInputProps {
  value: number | string;
  stored?: number;
  unit?: UnitType;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  label?: string;
  accessibilityLabel?: string;
  testID?: string;
  onChangeValue?: (val: number) => void;
  onChangeText?: (text: string) => void;
  style?: object;
}

/**
 * NumInput (S3 / NFR-INT-003):
 * Standaryzowany komponent wprowadzania liczb w standardzie Apps4Craft / FitCheck.
 * - Akceptuje kropkę (.) oraz przecinek (,) na polskiej klawiaturze iOS.
 * - Umożliwia stany pośrednie w trakcie edycji (np. "12,", "0.").
 * - Chroni przed dryfem zaokrągleń przez mechanizm wInKeep (BR-TEST-005, RD-ENG-01).
 * - Gwarantuje pole dotyku >= 44 pt (Apple HIG / RD-ENG-03).
 */
export const NumInput: React.FC<NumInputProps> = ({
  value,
  stored,
  unit = 'cm',
  min = 0,
  max = 100000,
  placeholder,
  label,
  accessibilityLabel,
  testID,
  onChangeValue,
  onChangeText,
  style,
}) => {
  const [text, setText] = useState<string>(() => {
    if (value === 0 || value === '0') return '0';
    return value ? String(value) : '';
  });

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setText((prev) => {
        const parsedPrev = parseFloat(prev.replace(',', '.'));
        const parsedNew = typeof value === 'number' ? value : parseFloat(value.replace(',', '.'));
        if (parsedPrev === parsedNew) return prev;
        return String(value);
      });
    }
  }, [value]);

  const handleChangeText = (rawText: string) => {
    setText(rawText);
    onChangeText?.(rawText);

    // Przelicz wartość na bieżąco jeśli to poprawna liczba
    const normalized = rawText.replace(',', '.').trim();
    if (normalized !== '' && !isNaN(Number(normalized))) {
      const numeric = parseFloat(normalized);
      if (numeric >= min && numeric <= max) {
        onChangeValue?.(numeric);
      }
    }
  };

  const handleBlur = () => {
    const finalVal = wInKeep(text, unit, stored);
    const clamped = Math.min(Math.max(finalVal, min), max);
    setText(String(clamped));
    onChangeValue?.(clamped);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={text}
        placeholder={placeholder}
        placeholderTextColor={sharedCraftTokens.colors.textMuted}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        accessibilityLabel={accessibilityLabel || label || placeholder || 'Wprowadź liczbę'}
        accessibilityRole="none"
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44, // RD-ENG-03 (pole dotyku >= 44 pt)
    justifyContent: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: sharedCraftTokens.colors.textMuted,
    marginBottom: 4,
  },
  input: {
    minHeight: 44, // RD-ENG-03
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    color: sharedCraftTokens.colors.textPrimary,
    paddingHorizontal: 12,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});
