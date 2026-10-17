import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { sharedCraftTokens } from '../../core/craft-suite-theme';

export interface EmptyProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
  testID?: string;
}

/**
 * Empty (S11 / NFR-INT-011):
 * Standaryzowany komponent pustego stanu z tytułem, opisem i opcjonalnym przyciskiem CTA.
 */
export const Empty: React.FC<EmptyProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID} accessible={true}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sharedCraftTokens.colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: sharedCraftTokens.colors.border,
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: sharedCraftTokens.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: sharedCraftTokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    minHeight: 44, // RD-ENG-03
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
});
