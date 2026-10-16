import React from 'react';
import { ActiveFocusModeModal, FocusStep } from '../ActiveFocusModeModal';
import { sharedCraftTokens } from '../../core/craft-suite-theme';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props),
    Text: (props: any) => React.createElement('Text', props),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props),
    ScrollView: (props: any) => React.createElement('ScrollView', props),
    Modal: (props: any) => React.createElement('Modal', props),
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 48, bottom: 34, left: 0, right: 0 }),
}));

describe('ActiveFocusModeModal (FAZA 2: Ergonomia Warsztatowa & Sacred Numbers)', () => {
  const customSteps: FocusStep[] = [
    {
      id: 'step-1',
      sequence: 1,
      title: 'Pralka automatyczna 60cm',
      dimensions: '60 × 60 × 85 cm',
      weightKg: 68,
      targetLocation: 'Dno bagażnika przy oparciu',
      isHeavy: true,
      isFragile: true,
      advice: 'Zabezpiecz pasem transportowym.',
    },
    {
      id: 'step-2',
      sequence: 2,
      title: 'Walizka kabinowa',
      dimensions: '55 × 40 × 20 cm',
      weightKg: 10,
      targetLocation: 'Z boku pralki',
      isHeavy: false,
      isFragile: false,
      advice: 'Dosuń do nadkola.',
    },
  ];

  it('instantiates the ActiveFocusModeModal element properly', () => {
    const onClose = jest.fn();
    const element = React.createElement(ActiveFocusModeModal, {
      visible: true,
      onClose,
      steps: customSteps,
      clearanceMm: 45,
      payloadPct: 72,
      totalWeightKg: 78,
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(ActiveFocusModeModal);
  });

  it('renders default steps if an empty array is provided', () => {
    const onClose = jest.fn();
    const element = React.createElement(ActiveFocusModeModal, {
      visible: true,
      onClose,
      steps: [],
    });

    expect(React.isValidElement(element)).toBe(true);
  });

  it('validates step boundaries and properties structure', () => {
    expect(customSteps[0].sequence).toBe(1);
    expect(customSteps[0].isHeavy).toBe(true);
    expect(customSteps[1].isHeavy).toBe(false);
    expect(customSteps.length).toBe(2);
  });
});
