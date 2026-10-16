import React from 'react';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props),
    Text: (props: any) => React.createElement('Text', props),
    TextInput: (props: any) => React.createElement('TextInput', props),
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

import { Apps4BrewPassModal } from '../Apps4BrewPassModal';
import {
  PRICING,
  resetTrialForTesting,
  setTrialExpiredForTesting,
  getAppAccessState,
  activateSubscription,
} from '../../services/app-access';

describe('Apps4BrewPassModal (Cheaper than Espresso Paywall)', () => {
  beforeEach(() => {
    resetTrialForTesting();
  });

  describe('Component instantiation', () => {
    it('creates a valid React element', () => {
      const onClose = jest.fn();
      const element = React.createElement(Apps4BrewPassModal, {
        visible: true,
        onClose,
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.type).toBe(Apps4BrewPassModal);
    });
  });

  describe('Pricing Tiers Compliance (Cheaper than Espresso model)', () => {
    it('enforces exact impulse price tiers ($0.99/mo, $4.99/yr, $14.99 lifetime)', () => {
      expect(PRICING.monthly.usd).toBe(0.99);
      expect(PRICING.annual.usd).toBe(4.99);
      expect(PRICING.lifetime.usd).toBe(14.99);
    });

    it('confirms read-only access behavior upon trial expiration', () => {
      // 1. Trial active
      let state = getAppAccessState();
      expect(state.status).toBe('trial_active');
      expect(state.canCreate).toBe(true);
      expect(state.isHistoryReadOnly).toBe(false);

      // 2. Trial expired
      setTrialExpiredForTesting();
      state = getAppAccessState();
      expect(state.status).toBe('trial_expired');
      expect(state.canCreate).toBe(false);
      expect(state.isHistoryReadOnly).toBe(true); // Guarantees history stays readable

      // 3. Purchase unlocks
      activateSubscription('annual');
      state = getAppAccessState();
      expect(state.status).toBe('subscribed');
      expect(state.canCreate).toBe(true);
      expect(state.isHistoryReadOnly).toBe(false);
    });
  });
});
