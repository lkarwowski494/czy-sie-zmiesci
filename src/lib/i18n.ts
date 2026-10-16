import { useState, useEffect } from 'react';
import { EN } from './i18n.en';
import { getAppSetting, setAppSetting } from '../data/db';

export const LANGS = ['pl', 'en'] as const;
export type Lang = typeof LANGS[number];

let currentLang: Lang | null = null;
type LangListener = (l: Lang) => void;
const listeners = new Set<LangListener>();

function getCurrentLang(): Lang {
  if (!currentLang) {
    try {
      const saved = getAppSetting('app_lang', 'pl') as Lang;
      currentLang = saved === 'en' ? 'en' : 'pl';
    } catch {
      currentLang = 'pl';
    }
  }
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  try {
    setAppSetting('app_lang', lang);
  } catch {
    // Graceful fallback
  }
  listeners.forEach((fn) => fn(lang));
}

export function lang(): Lang {
  return getCurrentLang();
}

export function useLang(): Lang {
  const [l, setL] = useState<Lang>(getCurrentLang());
  useEffect(() => {
    listeners.add(setL);
    return () => {
      listeners.delete(setL);
    };
  }, []);
  return l;
}

const own = (dict: Record<string, string>, key: string): string | undefined => {
  return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;
};

/**
 * Tłumaczenie tekstu z opcjonalną interpolacją parametrów {klucz}.
 * Zgodne ze standardem Apps4Brew Core i18n (T-040).
 */
export function t(pl: string, params?: Record<string, string | number>): string {
  const activeLang = getCurrentLang();
  let text = activeLang === 'pl' ? pl : own(EN, pl) ?? pl;
  if (params) {
    for (const k of Object.keys(params)) {
      text = text.split(`{${k}}`).join(String(params[k]));
    }
  }
  return text;
}

