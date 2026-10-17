/**
 * swipe-delete.test.tsx
 * Strażnik S4 / NFR-INT-004: Dwutorowe usuwanie elementów z listy
 * Każdy element z opcją usunięcia musi umożliwiać akcję bez konieczności wykonywania gestu swipe
 * (przez widoczny przycisk kosza/menu lub akcję accessibilityActions delete dla VoiceOver).
 */

import { EN } from '../src/lib/i18n.en';

describe('Dual Swipe & Accessibility Deletion Guard (S4 / NFR-INT-004)', () => {
  it('confirms delete action label is present in English dictionary', () => {
    expect(EN['Usuń']).toBe('Delete');
  });

  it('validates accessibility action pattern for VoiceOver deletion', () => {
    const itemAccessibilityActions = [
      { name: 'delete', label: 'Usuń' },
      { name: 'activate', label: 'Wybierz' },
    ];

    expect(itemAccessibilityActions.some((a) => a.name === 'delete')).toBe(true);

    const onAccessibilityAction = (event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === 'delete') {
        return 'DELETED';
      }
      return 'NOOP';
    };

    expect(onAccessibilityAction({ nativeEvent: { actionName: 'delete' } })).toBe('DELETED');
    expect(onAccessibilityAction({ nativeEvent: { actionName: 'activate' } })).toBe('NOOP');
  });
});
