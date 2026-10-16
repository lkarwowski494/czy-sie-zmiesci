import React from 'react';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props),
    Text: (props: any) => React.createElement('Text', props),
    TextInput: (props: any) => React.createElement('TextInput', props),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props),
    ScrollView: (props: any) => React.createElement('ScrollView', props),
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

import {
  PocketProofQuickCheck,
  calculateQuickVerdict,
} from '../PocketProofQuickCheck';
import { TrunkGeometry } from '../../domain/geometry/types';

describe('PocketProofQuickCheck (Store-to-Trunk Instant Verdict)', () => {
  const sampleTrunk: TrunkGeometry = {
    lengthFloorMm: 1000,
    lengthRoofMm: 800,
    widthMinMm: 1000,
    widthMaxMm: 1200,
    heightRoofMm: 800,
    heightShelfMm: 500,
    apertureWidthMm: 950,
    apertureHeightMm: 750,
    thresholdHeightMm: 100,
  };

  describe('calculateQuickVerdict', () => {
    it('returns FITS_TRUNK when item easily fits standard trunk', () => {
      const item = {
        dimensionsMm: {
          lengthMm: 600,
          widthMm: 500,
          heightMm: 400,
        },
      };

      const verdict = calculateQuickVerdict(sampleTrunk, item);
      expect(verdict.status).toBe('FITS_TRUNK');
      expect(verdict.lengthMarginCm).toBeGreaterThanOrEqual(0);
      expect(verdict.title).toContain('ZAPAKUJESZ');
    });

    it('returns FITS_FOLDED_SEATS when item exceeds trunk floor length but fits with seats down', () => {
      // standard floor is 1000mm, folded is 1750mm. item length is 1400mm.
      // 1400mm is too long for standard floor (1000mm), roof height (800mm), and widthMax (1200mm).
      // But 1400mm fits easily into folded length (1750mm).
      const item = {
        dimensionsMm: {
          lengthMm: 1400,
          widthMm: 600,
          heightMm: 400,
        },
      };

      const verdict = calculateQuickVerdict(sampleTrunk, item);
      expect(verdict.status).toBe('FITS_FOLDED_SEATS');
      expect(verdict.title).toContain('ZŁÓŻ');
      expect(verdict.lengthMarginCm).toBeGreaterThan(0);
    });

    it('returns DOES_NOT_FIT when item is too long even with seats folded', () => {
      // folded is 1750mm, item is 2200mm
      const item = {
        dimensionsMm: {
          lengthMm: 2200,
          widthMm: 600,
          heightMm: 400,
        },
      };

      const verdict = calculateQuickVerdict(sampleTrunk, item);
      expect(verdict.status).toBe('DOES_NOT_FIT');
      expect(verdict.title).toContain('NIE ZMIEŚCI');
      expect(verdict.message).toContain('wystaje o');
    });

    it('returns DOES_NOT_FIT when item exceeds dimensions in all orientations', () => {
      const item = {
        dimensionsMm: {
          lengthMm: 2200,
          widthMm: 1300,
          heightMm: 850,
        },
      };

      const verdict = calculateQuickVerdict(sampleTrunk, item);
      expect(verdict.status).toBe('DOES_NOT_FIT');
      expect(verdict.title).toContain('NIE ZMIEŚCI');
    });

    it('returns DOES_NOT_FIT when item is taller than roof height with upright constraint', () => {
      const item = {
        dimensionsMm: {
          lengthMm: 600,
          widthMm: 600,
          heightMm: 950,
        },
        rotationConstraint: 'Z_ONLY' as const,
      };

      const verdict = calculateQuickVerdict(sampleTrunk, item);
      expect(verdict.status).toBe('DOES_NOT_FIT');
      expect(verdict.title).toContain('NIE ZMIEŚCI');
    });
  });

  describe('Component instantiation', () => {
    it('creates a valid React element', () => {
      const element = React.createElement(PocketProofQuickCheck, {
        onOpenFullSimulator: jest.fn(),
        onRequestPaywall: jest.fn(),
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.type).toBe(PocketProofQuickCheck);
    });
  });
});
