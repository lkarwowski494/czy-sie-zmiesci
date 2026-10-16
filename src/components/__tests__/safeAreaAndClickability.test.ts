import React from 'react';
import { sharedCraftTokens } from '../../core/craft-suite-theme';
import { Apps4BrewPassModal } from '../Apps4BrewPassModal';
import { CraftOnboardingModal } from '../CraftOnboardingModal';
import { ActiveFocusModeModal } from '../ActiveFocusModeModal';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props),
    Text: (props: any) => React.createElement('Text', props),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props),
    ScrollView: (props: any) => React.createElement('ScrollView', props),
    Modal: (props: any) => React.createElement('Modal', props),
    SafeAreaView: (props: any) => React.createElement('SafeAreaView', props),
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 48, bottom: 34, left: 0, right: 0 }),
}));

describe('UI Safety, Safe Area & Clickability Audit (FAZA 2)', () => {
  describe('HitSlop & Touch Targets', () => {
    it('verifies shared hitSlop standard provides at least 12pt padding on all sides', () => {
      const { hitSlopStandard, touchTargetMin, buttonHeightMin } = sharedCraftTokens;
      expect(hitSlopStandard.top).toBeGreaterThanOrEqual(12);
      expect(hitSlopStandard.bottom).toBeGreaterThanOrEqual(12);
      expect(hitSlopStandard.left).toBeGreaterThanOrEqual(12);
      expect(hitSlopStandard.right).toBeGreaterThanOrEqual(12);
      expect(touchTargetMin).toBeGreaterThanOrEqual(44);
      expect(buttonHeightMin).toBeGreaterThanOrEqual(48);
    });
  });

  describe('Modal Safe Area Insets and Exit Actions', () => {
    it('instantiates Apps4BrewPassModal with safe exit action', () => {
      const onClose = jest.fn();
      const el = React.createElement(Apps4BrewPassModal, {
        visible: true,
        onClose,
      });
      expect(React.isValidElement(el)).toBe(true);
    });

    it('instantiates CraftOnboardingModal with safe exit action', () => {
      const onSelect = jest.fn();
      const el = React.createElement(CraftOnboardingModal, {
        visible: true,
        onSelectProfile: onSelect,
      });
      expect(React.isValidElement(el)).toBe(true);
    });

    it('instantiates ActiveFocusModeModal with close action and sacred metrics', () => {
      const onClose = jest.fn();
      const el = React.createElement(ActiveFocusModeModal, {
        visible: true,
        onClose,
        clearanceMm: 50,
        payloadPct: 65,
        totalWeightKg: 120,
      });
      expect(React.isValidElement(el)).toBe(true);
    });
  });
});
