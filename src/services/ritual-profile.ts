import { useState, useEffect } from 'react';
import { getDatabaseService } from '../data/db';

export type RitualProfileId = 'daily' | 'architect' | 'expedition';

export interface RitualProfileInfo {
  id: RitualProfileId;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  primaryTools: string[];
}

export const RITUAL_PROFILES: Record<RitualProfileId, RitualProfileInfo> = {
  daily: {
    id: 'daily',
    title: 'Codzienny Transport & Zakupy',
    subtitle: 'Paczkomaty InPost, sizer lotniczy, bagażnik i zakupy gabarytowe',
    badge: 'Standard',
    icon: '📦',
    primaryTools: ['Paczkomat', 'Bagażnik', 'Bagaż Podręczny'],
  },
  architect: {
    id: 'architect',
    title: 'Wnętrza & Przeprowadzki',
    subtitle: 'Problem ruchomej sofy (Moving Sofa), ościeżnice, wnęki i skosy poddasza',
    badge: 'Precyzja',
    icon: '📐',
    primaryTools: ['Ościeżnice & Korytarz', 'Skosy Poddasza', 'Wnęki Meblowe'],
  },
  expedition: {
    id: 'expedition',
    title: 'Wyprawy & Przyczepa',
    subtitle: 'Nacisk na hak (S), box dachowy, bagażnik rowerowy i rozkład masy DMC',
    badge: 'Ekspedycja',
    icon: '🚙',
    primaryTools: ['Nacisk na Hak S', 'Box Dachowy', 'Środek Ciężkości CoG'],
  },
};

const DB_KEY_RITUAL_PROFILE = 'craft_ritual_profile';
const DB_KEY_ONBOARDING_DONE = 'craft_onboarding_completed';

export function getStoredRitualProfile(): RitualProfileId {
  try {
    const val = getDatabaseService().getAppSetting(DB_KEY_RITUAL_PROFILE, 'daily');
    if (val === 'architect' || val === 'expedition' || val === 'daily') {
      return val;
    }
    return 'daily';
  } catch {
    return 'daily';
  }
}

export function setStoredRitualProfile(profile: RitualProfileId): void {
  try {
    getDatabaseService().setAppSetting(DB_KEY_RITUAL_PROFILE, profile);
  } catch {
    // Fallback
  }
}

export function hasCompletedOnboarding(): boolean {
  try {
    const val = getDatabaseService().getAppSetting(DB_KEY_ONBOARDING_DONE, 'false');
    return val === 'true';
  } catch {
    return false;
  }
}

export function completeOnboarding(profile: RitualProfileId): void {
  setStoredRitualProfile(profile);
  try {
    getDatabaseService().setAppSetting(DB_KEY_ONBOARDING_DONE, 'true');
  } catch {
    // Fallback
  }
}

export function resetOnboarding(): void {
  try {
    getDatabaseService().setAppSetting(DB_KEY_ONBOARDING_DONE, 'false');
  } catch {
    // Fallback
  }
}

export function useRitualProfile() {
  const [profile, setProfile] = useState<RitualProfileId>(getStoredRitualProfile());
  const [onboardingDone, setOnboardingDone] = useState<boolean>(hasCompletedOnboarding());

  useEffect(() => {
    setProfile(getStoredRitualProfile());
    setOnboardingDone(hasCompletedOnboarding());
  }, []);

  const changeProfile = (newProfile: RitualProfileId) => {
    setStoredRitualProfile(newProfile);
    setProfile(newProfile);
  };

  const finishOnboarding = (selectedProfile: RitualProfileId) => {
    completeOnboarding(selectedProfile);
    setProfile(selectedProfile);
    setOnboardingDone(true);
  };

  return {
    profile,
    profileInfo: RITUAL_PROFILES[profile],
    onboardingDone,
    changeProfile,
    finishOnboarding,
  };
}
