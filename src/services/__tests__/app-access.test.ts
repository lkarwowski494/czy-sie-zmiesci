// ============================================================================
// Czy się zmieści? (FitCheck) — Unit Tests: App Access & Monetization (Cheaper than Espresso)
// ============================================================================

import {
  getAppAccessState,
  recordProjectCreated,
  activateSubscription,
  restorePurchases,
  resetTrialForTesting,
  setTrialExpiredForTesting,
  TRIAL_MAX_PROJECTS,
  TRIAL_DURATION_DAYS,
  PRICING,
} from '../app-access';
import { setAppSetting, getAppSetting } from '../../data/db';

describe('App Access & Monetization Engine (Cheaper than Espresso)', () => {
  beforeEach(() => {
    resetTrialForTesting();
  });

  test('Cennik monetizacji impulsowej jest zgodny ze standardem studia Apps4Brew ($0.99 / $4.99 / $14.99)', () => {
    expect(PRICING.monthly.usd).toBe(0.99);
    expect(PRICING.annual.usd).toBe(4.99);
    expect(PRICING.lifetime.usd).toBe(14.99);
    expect(PRICING.annual.badge).toBe('NAJLEPSZY WYBÓR');
  });

  test('Początkowy stan aplikacji: aktywny trial z pełnym dostępem (100% funkcji)', () => {
    const state = getAppAccessState();
    expect(state.status).toBe('trial_active');
    expect(state.projectsCount).toBe(0);
    expect(state.projectsRemaining).toBe(TRIAL_MAX_PROJECTS);
    expect(state.daysRemaining).toBeLessThanOrEqual(TRIAL_DURATION_DAYS);
    expect(state.canCreate).toBe(true);
    expect(state.isHistoryReadOnly).toBe(false);
    expect(state.isSubscribed).toBe(false);
  });

  test('Utworzenie projektu/załadunku inkrementuje licznik sesji trialowych', () => {
    recordProjectCreated();
    let state = getAppAccessState();
    expect(state.projectsCount).toBe(1);
    expect(state.projectsRemaining).toBe(TRIAL_MAX_PROJECTS - 1);
    expect(state.canCreate).toBe(true);

    recordProjectCreated();
    state = getAppAccessState();
    expect(state.projectsCount).toBe(2);
    expect(state.projectsRemaining).toBe(1);
    expect(state.status).toBe('trial_active');
  });

  test('Osiągnięcie limitu 3 projektów wygasza trial i blokuje tworzenie, zachowując historię read-only', () => {
    recordProjectCreated(); // 1
    recordProjectCreated(); // 2
    recordProjectCreated(); // 3

    const state = getAppAccessState();
    expect(state.status).toBe('trial_expired');
    expect(state.projectsCount).toBe(3);
    expect(state.projectsRemaining).toBe(0);
    expect(state.canCreate).toBe(false);
    expect(state.isHistoryReadOnly).toBe(true);
  });

  test('Upływ 7 dni wygasza trial nawet przy mniejszej liczbie projektów', () => {
    // Ustaw datę rozpoczęcia trialu na 8 dni temu
    const pastDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    setAppSetting('trial_started_at', pastDate);

    const state = getAppAccessState();
    expect(state.status).toBe('trial_expired');
    expect(state.canCreate).toBe(false);
    expect(state.isHistoryReadOnly).toBe(true);
    expect(state.daysRemaining).toBe(0);
  });

  test('Aktywacja subskrypcji odblokowuje pełny dostęp bez limitów dla każdego planu', () => {
    setTrialExpiredForTesting();

    // 1. Plan miesięczny ($0.99)
    let state = activateSubscription('monthly');
    expect(state.status).toBe('subscribed');
    expect(state.isSubscribed).toBe(true);
    expect(state.canCreate).toBe(true);
    expect(state.isHistoryReadOnly).toBe(false);
    expect(state.subscriptionTier).toBe('monthly');

    // 2. Plan roczny ($4.99)
    state = activateSubscription('annual');
    expect(state.status).toBe('subscribed');
    expect(state.subscriptionTier).toBe('annual');

    // 3. Plan Lifetime ($14.99)
    state = activateSubscription('lifetime');
    expect(state.status).toBe('subscribed');
    expect(state.subscriptionTier).toBe('lifetime');
  });

  test('Przywrócenie zakupów (Restore Purchases) aktywuje pełny dostęp', () => {
    setTrialExpiredForTesting();
    expect(getAppAccessState().canCreate).toBe(false);

    const state = restorePurchases();
    expect(state.status).toBe('subscribed');
    expect(state.isSubscribed).toBe(true);
    expect(state.canCreate).toBe(true);
    expect(state.isHistoryReadOnly).toBe(false);
    expect(state.subscriptionTier).toBe('lifetime');
  });

  test('Po wykupieniu subskrypcji kolejne projekty nie zmieniają statusu', () => {
    activateSubscription('annual');
    const stateBefore = getAppAccessState();
    expect(stateBefore.canCreate).toBe(true);

    recordProjectCreated();
    const stateAfter = getAppAccessState();
    expect(stateAfter.canCreate).toBe(true);
    expect(stateAfter.isSubscribed).toBe(true);
  });
});
