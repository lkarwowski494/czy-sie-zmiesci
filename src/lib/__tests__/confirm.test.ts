import { confirm, validateButtonLabel, FORBIDDEN_DIALOG_BUTTONS } from '../confirm';
import { Alert } from 'react-native';

describe('lib/confirm — Strażnik Potwierdzeń (NFR-INT-005, S5)', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('blokuje dwuznaczne etykiety przycisków: Nie, Tak, Wróć', () => {
    for (const forbidden of FORBIDDEN_DIALOG_BUTTONS) {
      expect(() => validateButtonLabel(forbidden)).toThrow(/Zakazana dwuznaczna etykieta/);
      expect(() => validateButtonLabel(forbidden.toLowerCase())).toThrow(/Zakazana dwuznaczna etykieta/);
    }
  });

  it('akceptuje jednoznaczne czasowniki akcji', () => {
    expect(() => validateButtonLabel('Usuń')).not.toThrow();
    expect(() => validateButtonLabel('Wyczyść wszystko')).not.toThrow();
    expect(() => validateButtonLabel('Porzuć zmiany')).not.toThrow();
    expect(() => validateButtonLabel('Resetuj')).not.toThrow();
  });

  it('wywołuje Alert.alert z przyciskiem Anuluj (cancel) oraz przyciskiem akcji (destructive)', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    confirm({
      title: 'Czy usunąć ten ładunek?',
      message: 'Ta operacja jest nieodwracalna.',
      confirmText: 'Usuń',
      destructive: true,
      onConfirm,
      onCancel,
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = alertSpy.mock.calls[0];

    expect(title).toBe('Czy usunąć ten ładunek?');
    expect(message).toBe('Ta operacja jest nieodwracalna.');
    expect(buttons).toHaveLength(2);

    expect(buttons[0].text).toBe('Anuluj');
    expect(buttons[0].style).toBe('cancel');

    expect(buttons[1].text).toBe('Usuń');
    expect(buttons[1].style).toBe('destructive');

    // Test wywołania akcji
    buttons[1].onPress();
    expect(onConfirm).toHaveBeenCalled();
  });
});
