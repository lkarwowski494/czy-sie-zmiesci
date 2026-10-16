// ============================================================================
// Czy się zmieści? (FitCheck) — App Access & Monetization Engine ("Cheaper than Espresso")
// Zero feature-gating during trial (100% features available).
// After trial expiration: Creation blocked + Read-Only History guaranteed.
// Apps4Brew Studio — 100% Offline-First, Zero Telemetry.
// ============================================================================

import { useState } from 'react';
import { getAppSetting, setAppSetting } from '../data/db';

export const TRIAL_MAX_PROJECTS = 3;
export const TRIAL_DURATION_DAYS = 7;

export const PRICING = {
  monthly: {
    usd: 0.99,
    pln: 4.49,
    label: '$0.99 / msc',
    desc: '~4,49 zł · Mikro-subskrypcja impulsowa',
  },
  annual: {
    usd: 4.99,
    pln: 22.99,
    label: '$4.99 / rok',
    desc: '~22,99 zł · Mniej niż 2 zł na miesiąc',
    badge: 'NAJLEPSZY WYBÓR',
  },
  lifetime: {
    usd: 14.99,
    pln: 69.99,
    label: '$14.99',
    desc: '~69,99 zł · Dostęp na zawsze bez abonamentu',
  },
} as const;

export type AppAccessStatus = 'trial_active' | 'trial_expired' | 'subscribed';
export type SubscriptionTier = 'none' | 'monthly' | 'annual' | 'lifetime';

export interface AppAccessState {
  status: AppAccessStatus;
  projectsCount: number;
  projectsRemaining: number;
  daysRemaining: number;
  isSubscribed: boolean;
  canCreate: boolean;
  isHistoryReadOnly: boolean;
  subscriptionTier: SubscriptionTier;
}

export function getAppAccessState(): AppAccessState {
  const isPro = getAppSetting('is_pro_active', 'false') === 'true';
  const tier = (getAppSetting('subscription_tier', isPro ? 'lifetime' : 'none') as SubscriptionTier) || 'none';

  if (isPro) {
    return {
      status: 'subscribed',
      projectsCount: 0,
      projectsRemaining: Infinity,
      daysRemaining: Infinity,
      isSubscribed: true,
      canCreate: true,
      isHistoryReadOnly: false,
      subscriptionTier: tier === 'none' ? 'lifetime' : tier,
    };
  }

  // Sprawdź datę pierwszej instalacji
  let trialStartedAt = getAppSetting('trial_started_at', '');
  if (!trialStartedAt) {
    trialStartedAt = new Date().toISOString();
    setAppSetting('trial_started_at', trialStartedAt);
  }

  const startDate = new Date(trialStartedAt);
  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, TRIAL_DURATION_DAYS - elapsedDays);

  const projectsCount = parseInt(getAppSetting('trial_projects_count', '0'), 10) || 0;
  const projectsRemaining = Math.max(0, TRIAL_MAX_PROJECTS - projectsCount);

  const isExpired = projectsCount >= TRIAL_MAX_PROJECTS || elapsedDays >= TRIAL_DURATION_DAYS;

  if (isExpired) {
    return {
      status: 'trial_expired',
      projectsCount,
      projectsRemaining: 0,
      daysRemaining,
      isSubscribed: false,
      canCreate: false,
      isHistoryReadOnly: true,
      subscriptionTier: 'none',
    };
  }

  return {
    status: 'trial_active',
    projectsCount,
    projectsRemaining,
    daysRemaining,
    isSubscribed: false,
    canCreate: true,
    isHistoryReadOnly: false,
    subscriptionTier: 'none',
  };
}

export function recordProjectCreated(): AppAccessState {
  const current = getAppAccessState();
  if (current.isSubscribed) {
    return current;
  }
  const newCount = current.projectsCount + 1;
  setAppSetting('trial_projects_count', String(newCount));
  return getAppAccessState();
}

export function activateSubscription(tier: 'monthly' | 'annual' | 'lifetime'): AppAccessState {
  setAppSetting('is_pro_active', 'true');
  setAppSetting('subscription_tier', tier);
  return getAppAccessState();
}

export function restorePurchases(): AppAccessState {
  setAppSetting('is_pro_active', 'true');
  setAppSetting('subscription_tier', 'lifetime');
  return getAppAccessState();
}

export function resetTrialForTesting(): void {
  setAppSetting('is_pro_active', 'false');
  setAppSetting('subscription_tier', 'none');
  setAppSetting('trial_projects_count', '0');
  setAppSetting('trial_started_at', new Date().toISOString());
}

export function setTrialExpiredForTesting(): void {
  setAppSetting('is_pro_active', 'false');
  setAppSetting('subscription_tier', 'none');
  setAppSetting('trial_projects_count', String(TRIAL_MAX_PROJECTS));
}

export function useAppAccess() {
  const [access, setAccess] = useState<AppAccessState>(() => getAppAccessState());

  const refresh = () => {
    setAccess(getAppAccessState());
  };

  const subscribe = (tier: 'monthly' | 'annual' | 'lifetime') => {
    const updated = activateSubscription(tier);
    setAccess(updated);
  };

  const restore = () => {
    const updated = restorePurchases();
    setAccess(updated);
  };

  const recordProject = () => {
    const updated = recordProjectCreated();
    setAccess(updated);
  };

  return {
    ...access,
    refresh,
    subscribe,
    restore,
    recordProject,
  };
}
