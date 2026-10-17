/**
 * Czy się zmieści? (FitCheck) — Centralny Helper Potwierdzeń (NFR-INT-005, S5)
 * Zapewnia jednoznaczne etykiety przycisków w oknach dialogowych:
 * - Przycisk bezpieczny: zawsze t('Anuluj') ze style: 'cancel'.
 * - Przycisk niszczący/wykonawczy: zawsze czasownik nazywający czynność (np. 'Usuń', 'Wyczyść') ze style: 'destructive'.
 * - Bezwzględny zakaz dwuznacznych etykiet: 'Nie', 'Tak', 'Wróć'.
 */

import { Alert } from 'react-native';
import { t } from './i18n';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// Czarna lista dwuznacznych etykiet przycisków dialogowych (S5 / NFR-INT-005)
export const FORBIDDEN_DIALOG_BUTTONS = ['Nie', 'Tak', 'Wróć', 'No', 'Yes', 'Back', 'Nein', 'Ja', 'Zurück'];

export function validateButtonLabel(label: string): void {
  const trimmed = label.trim().toLowerCase();
  for (const forbidden of FORBIDDEN_DIALOG_BUTTONS) {
    if (trimmed === forbidden.toLowerCase()) {
      throw new Error(`[S5 / NFR-INT-005] Zakazana dwuznaczna etykieta przycisku dialogowego: '${label}'. Użyj 'Anuluj' lub konkretnego czasownika.`);
    }
  }
}

export function confirm(options: ConfirmOptions): void {
  const { title, message, confirmText, destructive = true, onConfirm, onCancel } = options;

  validateButtonLabel(confirmText);

  Alert.alert(
    title,
    message,
    [
      {
        text: t('Anuluj'),
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: () => {
          void onConfirm();
        },
      },
    ],
    { cancelable: true, onDismiss: onCancel }
  );
}
