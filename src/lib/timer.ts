/**
 * Czy się zmieści? (FitCheck) — Timery Odporne na Uśpienie w Tle (NFR-PERF-004, RD-ENG-06)
 * Oblicza pozostały czas na podstawie różnicy bezwzględnych znaczników czasu zegarowego
 * (endAtMs - Date.now()), dzięki czemu timer działa niezawodnie po zablokowaniu ekranu iOS.
 */

import { AppState, AppStateStatus } from 'react-native';

export interface ResilientTimerState {
  durationSec: number;
  endAtMs: number | null;
  pausedLeftSec: number | null;
  isRunning: boolean;
}

export type TimerCallback = (remainingSec: number) => void;

export class ResilientTimer {
  private durationSec: number;
  private endAtMs: number | null = null;
  private pausedLeftSec: number | null = null;
  private isRunning: boolean = false;
  private listeners: Set<TimerCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: { remove: () => void } | null = null;

  constructor(durationSec: number) {
    this.durationSec = Math.max(0, durationSec);
    this.pausedLeftSec = this.durationSec;
    this.setupAppStateListener();
  }

  private setupAppStateListener(): void {
    if (typeof AppState?.addEventListener === 'function') {
      const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
        if (status === 'active' && this.isRunning) {
          this.tick();
        }
      });
      this.appStateSubscription = sub;
    }
  }

  public start(nowMs: number = Date.now()): void {
    if (this.isRunning) return;

    const remaining = this.pausedLeftSec ?? this.durationSec;
    if (remaining <= 0) return;

    this.endAtMs = nowMs + remaining * 1000;
    this.pausedLeftSec = null;
    this.isRunning = true;

    this.tick(nowMs);

    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.tick();
      }, 1000);
    }
  }

  public pause(nowMs: number = Date.now()): void {
    if (!this.isRunning) return;

    this.pausedLeftSec = this.getRemainingSec(nowMs);
    this.endAtMs = null;
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify(this.pausedLeftSec);
  }

  public reset(newDurationSec?: number): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (newDurationSec !== undefined) {
      this.durationSec = Math.max(0, newDurationSec);
    }
    this.endAtMs = null;
    this.pausedLeftSec = this.durationSec;
    this.isRunning = false;
    this.notify(this.durationSec);
  }

  public getRemainingSec(nowMs: number = Date.now()): number {
    if (!this.isRunning || this.endAtMs === null) {
      return this.pausedLeftSec ?? this.durationSec;
    }
    const diffMs = this.endAtMs - nowMs;
    return Math.max(0, Math.ceil(diffMs / 1000));
  }

  public getState(): ResilientTimerState {
    return {
      durationSec: this.durationSec,
      endAtMs: this.endAtMs,
      pausedLeftSec: this.pausedLeftSec,
      isRunning: this.isRunning,
    };
  }

  public subscribe(cb: TimerCallback): () => void {
    this.listeners.add(cb);
    cb(this.getRemainingSec());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(sec: number): void {
    this.listeners.forEach((fn) => fn(sec));
  }

  public tick(nowMs: number = Date.now()): void {
    const left = this.getRemainingSec(nowMs);
    this.notify(left);
    if (left <= 0 && this.isRunning) {
      this.isRunning = false;
      this.endAtMs = null;
      this.pausedLeftSec = 0;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.listeners.clear();
  }
}
