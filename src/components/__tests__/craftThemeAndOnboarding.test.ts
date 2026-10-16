import React from 'react';
import { sharedCraftTokens, CRAFT_APPS, getCraftTheme } from '../../core/craft-suite-theme';
import {
  RITUAL_PROFILES,
  getStoredRitualProfile,
  setStoredRitualProfile,
  hasCompletedOnboarding,
  completeOnboarding,
  resetOnboarding,
  RitualProfileId,
} from '../../services/ritual-profile';
import { getDatabaseService } from '../../data/db';

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
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

import { CraftOnboardingModal } from '../CraftOnboardingModal';

describe('Apps4Craft Unified Design System & Onboarding (FAZA 3 & 4)', () => {
  describe('Craft Suite Theme Tokens', () => {
    it('enforces dark basalt ceramic palette (#121214, #1C1C1F)', () => {
      expect(sharedCraftTokens.colors.bgBasalt).toBe('#121214');
      expect(sharedCraftTokens.colors.bgCard).toBe('#1C1C1F');
      expect(sharedCraftTokens.colors.border).toBe('#2E2E34');
      expect(sharedCraftTokens.colors.textPrimary).toBe('#F4EFEA');
    });

    it('enforces touch targets and hitSlop standard (min 44pt)', () => {
      expect(sharedCraftTokens.touchTargetMin).toBe(44);
      expect(sharedCraftTokens.buttonHeightMin).toBe(52);
      expect(sharedCraftTokens.hitSlopStandard).toEqual({
        top: 12,
        bottom: 12,
        left: 12,
        right: 12,
      });
    });

    it('registers the 6 artisanal craft apps including FitCheck', () => {
      expect(CRAFT_APPS.fitcheck).toBeDefined();
      expect(CRAFT_APPS.napar).toBeDefined();
      expect(CRAFT_APPS.piekarz).toBeDefined();
      expect(CRAFT_APPS.sloik).toBeDefined();
      expect(CRAFT_APPS.masaz).toBeDefined();
      expect(CRAFT_APPS.ferment).toBeDefined();

      const theme = getCraftTheme('fitcheck');
      expect(theme.accent).toBe('#38BDF8');
    });
  });

  describe('Ritual Profile SQLite Persistence', () => {
    beforeEach(() => {
      resetOnboarding();
      setStoredRitualProfile('daily');
    });

    it('defaults to daily transport profile and uncompleted onboarding', () => {
      expect(getStoredRitualProfile()).toBe('daily');
      expect(hasCompletedOnboarding()).toBe(false);
    });

    it('persists ritual profile switch to SQLite and reads it back', () => {
      setStoredRitualProfile('architect');
      expect(getStoredRitualProfile()).toBe('architect');

      setStoredRitualProfile('expedition');
      expect(getStoredRitualProfile()).toBe('expedition');

      setStoredRitualProfile('daily');
      expect(getStoredRitualProfile()).toBe('daily');
    });

    it('marks onboarding completed in SQLite upon completing ritual selection', () => {
      expect(hasCompletedOnboarding()).toBe(false);
      completeOnboarding('architect');
      expect(hasCompletedOnboarding()).toBe(true);
      expect(getStoredRitualProfile()).toBe('architect');
    });

    it('has all 3 well-defined craft profiles with badges and tools', () => {
      const keys: RitualProfileId[] = ['daily', 'architect', 'expedition'];
      keys.forEach((k) => {
        const p = RITUAL_PROFILES[k];
        expect(p.id).toBe(k);
        expect(p.title.length).toBeGreaterThan(0);
        expect(p.primaryTools.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('CraftOnboardingModal Component', () => {
    it('creates a valid React element', () => {
      const onSelect = jest.fn();
      const el = React.createElement(CraftOnboardingModal, {
        visible: true,
        onSelectProfile: onSelect,
      });
      expect(React.isValidElement(el)).toBe(true);
      expect(el.type).toBe(CraftOnboardingModal);
    });
  });
});
