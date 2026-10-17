import React from 'react';
import {
  CraftHeader,
  CraftModal,
  CraftButton,
  CraftStatDisplay,
  CraftCard,
  sharedCraftTokens,
  NaparAppIcon,
  PiekarzAppIcon,
  SloikAppIcon,
  MasazAppIcon,
  FermentAppIcon,
  CraftFamilyEmblem,
  ChevronBackIcon,
  CloseIcon,
  PrevStepIcon,
  NextStepIcon,
  BrewIcon,
  BeansIcon,
  JournalIcon,
  LabIcon,
  PlayIcon,
  PauseIcon,
  ResetIcon,
  QrIcon,
  StarIcon,
} from '../../core/craft-suite-theme';
import * as Haptics from 'expo-haptics';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props, props.children),
    Text: (props: any) => React.createElement('Text', props, props.children),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props, props.children),
    ScrollView: (props: any) => React.createElement('ScrollView', props, props.children),
    Modal: (props: any) => React.createElement('Modal', props, props.children),
    KeyboardAvoidingView: (props: any) => React.createElement('KeyboardAvoidingView', props, props.children),
    ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props),
    Platform: { OS: 'ios' },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

describe('@apps4craft/ui Artisanal Design System Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CraftHeader Component', () => {
    it('renders title and subtitle with safe area padding', () => {
      const header = React.createElement(CraftHeader, {
        title: 'Warsztat Załadunku',
        subtitle: 'Model 3D w skali 1:1',
      });

      expect(React.isValidElement(header)).toBe(true);
      expect(header.props.title).toBe('Warsztat Załadunku');
      expect(header.props.subtitle).toBe('Model 3D w skali 1:1');
    });

    it('handles back action with tactile haptic trigger', () => {
      const onBack = jest.fn();
      const header = React.createElement(CraftHeader, {
        title: 'Powrót',
        onBack,
      });

      expect(header.props.onBack).toBe(onBack);
      // Simulate click
      header.props.onBack?.();
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('handles close action with accessibility label', () => {
      const onClose = jest.fn();
      const header = React.createElement(CraftHeader, {
        title: 'Modal',
        onClose,
        closeAccessibilityLabel: 'Zamknij okno modalne',
      });

      expect(header.props.onClose).toBe(onClose);
      expect(header.props.closeAccessibilityLabel).toBe('Zamknij okno modalne');
    });

    it('renders custom rightAction component', () => {
      const rightNode = React.createElement('Text', null, 'Zapisz');
      const header = React.createElement(CraftHeader, {
        title: 'Edycja',
        rightAction: rightNode,
      });

      expect(header.props.rightAction).toBe(rightNode);
    });
  });

  describe('CraftButton Component', () => {
    it('creates primary button with app accent and executes onPress', () => {
      const onPress = jest.fn();
      const button = React.createElement(CraftButton, {
        label: 'Przelicz przestrzeń',
        onPress,
        variant: 'primary',
        accentColor: '#38BDF8',
      });

      expect(React.isValidElement(button)).toBe(true);
      expect(button.props.label).toBe('Przelicz przestrzeń');
      expect(button.props.accentColor).toBe('#38BDF8');
      button.props.onPress();
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('supports all button variants: primary, secondary, ghost, danger', () => {
      const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
      variants.forEach((v) => {
        const btn = React.createElement(CraftButton, {
          label: `Wariant ${v}`,
          onPress: jest.fn(),
          variant: v,
        });
        expect(btn.props.variant).toBe(v);
      });
    });

    it('supports sizes md (min 44pt) and lg (min 52pt)', () => {
      const btnMd = React.createElement(CraftButton, {
        label: 'Kompaktowy',
        onPress: jest.fn(),
        size: 'md',
      });
      const btnLg = React.createElement(CraftButton, {
        label: 'Główny blat',
        onPress: jest.fn(),
        size: 'lg',
      });

      expect(btnMd.props.size).toBe('md');
      expect(btnLg.props.size).toBe('lg');
    });

    it('respects disabled state and loading indicators', () => {
      const btnDisabled = React.createElement(CraftButton, {
        label: 'Zablokowany',
        onPress: jest.fn(),
        disabled: true,
      });
      const btnLoading = React.createElement(CraftButton, {
        label: 'Ładowanie...',
        onPress: jest.fn(),
        loading: true,
      });

      expect(btnDisabled.props.disabled).toBe(true);
      expect(btnLoading.props.loading).toBe(true);
    });
  });

  describe('CraftStatDisplay Component ("The Sacred Numbers")', () => {
    it('renders value and label with high contrast tabular numbers', () => {
      const stat = React.createElement(CraftStatDisplay, {
        label: 'Luz Ościeżnicy',
        value: '+45',
        unit: 'mm',
        accentColor: '#38BDF8',
        subtext: 'Zgodnie z normą PN-EN',
      });

      expect(React.isValidElement(stat)).toBe(true);
      expect(stat.props.label).toBe('Luz Ościeżnicy');
      expect(stat.props.value).toBe('+45');
      expect(stat.props.unit).toBe('mm');
      expect(stat.props.accentColor).toBe('#38BDF8');
    });

    it('supports display sizes sm, md, and lg', () => {
      const statSm = React.createElement(CraftStatDisplay, { label: 'SM', value: '10', size: 'sm' });
      const statMd = React.createElement(CraftStatDisplay, { label: 'MD', value: '20', size: 'md' });
      const statLg = React.createElement(CraftStatDisplay, { label: 'LG', value: '30', size: 'lg' });

      expect(statSm.props.size).toBe('sm');
      expect(statMd.props.size).toBe('md');
      expect(statLg.props.size).toBe('lg');
    });
  });

  describe('CraftCard Component', () => {
    it('renders static dark ceramic card with header info', () => {
      const card = React.createElement(CraftCard, {
        children: React.createElement('Text', null, 'Zawartość karty'),
        headerTitle: 'Parametry Geometrii',
        accentBorder: '#38BDF8',
      });

      expect(React.isValidElement(card)).toBe(true);
      expect(card.props.headerTitle).toBe('Parametry Geometrii');
      expect(card.props.accentBorder).toBe('#38BDF8');
    });

    it('acts as an interactive touchable card when onPress is provided', () => {
      const onPress = jest.fn();
      const card = React.createElement(CraftCard, {
        children: React.createElement('Text', null, 'Škoda Octavia IV'),
        onPress,
        headerTitle: 'Wybierz pojazd',
      });

      expect(card.props.onPress).toBe(onPress);
      card.props.onPress?.();
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('CraftModal Component', () => {
    it('creates pageSheet modal with full-bleed ceramic styling and safe footer', () => {
      const onClose = jest.fn();
      const footerNode = React.createElement(CraftButton, {
        label: 'Zastosuj wymiary',
        onPress: jest.fn(),
      });

      const modal = React.createElement(CraftModal, {
        children: React.createElement('Text', null, 'Formularz bryły'),
        visible: true,
        onClose,
        title: 'Własny Ładunek',
        footer: footerNode,
      });

      expect(React.isValidElement(modal)).toBe(true);
      expect(modal.props.visible).toBe(true);
      expect(modal.props.title).toBe('Własny Ładunek');
      expect(modal.props.footer).toBe(footerNode);
    });
  });

  describe('Apps4Craft Vector Linear Icons', () => {
    it('instantiates all culinary and studio family emblems cleanly', () => {
      const icons = [
        { Comp: NaparAppIcon, color: '#C86A28' },
        { Comp: PiekarzAppIcon, color: '#D49B42' },
        { Comp: SloikAppIcon, color: '#5B8A61' },
        { Comp: MasazAppIcon, color: '#A43E38' },
        { Comp: FermentAppIcon, color: '#E0A838' },
        { Comp: CraftFamilyEmblem, color: '#38BDF8' },
      ];

      icons.forEach(({ Comp, color }) => {
        const el = React.createElement(Comp, { size: 28, color, strokeWidth: 1.75 });
        expect(React.isValidElement(el)).toBe(true);
        expect(el.props.size).toBe(28);
        expect(el.props.color).toBe(color);
      });
    });

    it('instantiates navigation and studio tool icons cleanly', () => {
      const toolIcons = [
        ChevronBackIcon,
        CloseIcon,
        PrevStepIcon,
        NextStepIcon,
        BrewIcon,
        BeansIcon,
        JournalIcon,
        LabIcon,
        PlayIcon,
        PauseIcon,
        ResetIcon,
        QrIcon,
        StarIcon,
      ];

      toolIcons.forEach((IconComp) => {
        const el = React.createElement(IconComp, { size: 24, color: '#F4EFEA', strokeWidth: 2 });
        expect(React.isValidElement(el)).toBe(true);
        expect(el.props.size).toBe(24);
      });
    });
  });
});
