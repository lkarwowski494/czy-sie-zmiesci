// ============================================================================
// Apps4Craft Unified Design System Bridge (@apps4craft/ui)
// Standard rzemieślniczy studia Apps4Craft:
// ☕ Napar (Kawa/Herbata) · 🥖 Piekarz (Chleb/Zakwas) · 🫙 Słoik (Kiszonki/Przetwory)
// 🥩 Masaż (Wędliny/Peklowanie) · 🧀 Ferment (Sery) · 📦 FitCheck / Czy się zmieści (Przestrzeń)
// ============================================================================

import {
  CRAFT_APPS as BASE_CRAFT_APPS,
  getCraftTheme as getBaseCraftTheme,
  sharedCraftTokens,
  CraftAppId as BaseCraftAppId,
  CraftAppTheme as BaseCraftAppTheme,
  // Components
  CraftButton,
  CraftCard,
  CraftHeader,
  CraftModal,
  CraftStatDisplay,
  // Icons
  BrewIcon,
  BeansIcon,
  JournalIcon,
  LabIcon,
  CaffeineIcon,
  SettingsIcon,
  GrinderIcon,
  PlayIcon,
  PauseIcon,
  NextStepIcon,
  PrevStepIcon,
  ResetIcon,
  QrIcon,
  StarIcon,
  NaparAppIcon,
  PiekarzAppIcon,
  SloikAppIcon,
  MasazAppIcon,
  FermentAppIcon,
  CraftFamilyEmblem,
  ChevronBackIcon,
  CloseIcon,
} from '@apps4craft/ui';

export {
  sharedCraftTokens,
  CraftButton,
  CraftCard,
  CraftHeader,
  CraftModal,
  CraftStatDisplay,
  BrewIcon,
  BeansIcon,
  JournalIcon,
  LabIcon,
  CaffeineIcon,
  SettingsIcon,
  GrinderIcon,
  PlayIcon,
  PauseIcon,
  NextStepIcon,
  PrevStepIcon,
  ResetIcon,
  QrIcon,
  StarIcon,
  NaparAppIcon,
  PiekarzAppIcon,
  SloikAppIcon,
  MasazAppIcon,
  FermentAppIcon,
  CraftFamilyEmblem,
  ChevronBackIcon,
  CloseIcon,
};
export type {
  IconProps,
  CraftButtonProps,
  CraftCardProps,
  CraftHeaderProps,
  CraftModalProps,
  CraftStatDisplayProps,
} from '@apps4craft/ui';

export type CraftAppId = BaseCraftAppId | 'fitcheck';

export interface CraftAppTheme {
  id: CraftAppId;
  name: string;
  domain: string;
  accent: string;
  accentLight: string;
  accentMuted: string;
  secondaryAccent: string;
  heroDescriptor: string;
}

export const CRAFT_APPS: Record<CraftAppId, CraftAppTheme> = {
  fitcheck: {
    id: 'fitcheck',
    name: 'Czy się zmieści? (FitCheck)',
    domain: 'Geometria Przestrzeni & Załadunek',
    accent: '#38BDF8', // Anodized Titanium Sky
    accentLight: '#BAE6FD',
    accentMuted: 'rgba(56, 189, 248, 0.15)',
    secondaryAccent: '#0284C7',
    heroDescriptor: 'Geometria przestrzeni, obciążenie osi i fizyka załadunku',
  },
  ...BASE_CRAFT_APPS,
};

export function getCraftTheme(appId: CraftAppId = 'fitcheck'): CraftAppTheme {
  if (appId === 'fitcheck') return CRAFT_APPS.fitcheck;
  return getBaseCraftTheme(appId as BaseCraftAppId);
}
