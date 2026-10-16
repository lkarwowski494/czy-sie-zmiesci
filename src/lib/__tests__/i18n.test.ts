import { t, lang, setLang, LANGS } from '../i18n';

describe('i18n module (Apps4Brew Core T-040)', () => {
  afterEach(() => {
    setLang('pl');
  });

  it('exposes supported languages', () => {
    expect(LANGS).toEqual(['pl', 'en']);
    expect(lang()).toBe('pl');
  });

  it('returns Polish source key by default', () => {
    setLang('pl');
    expect(t('Symulator 3D')).toBe('Symulator 3D');
    expect(t('Katalog')).toBe('Katalog');
  });

  it('translates known keys to English when setLang("en") is called', () => {
    setLang('en');
    expect(t('Symulator 3D')).toBe('3D Simulator');
    expect(t('Wnętrza')).toBe('Interiors');
    expect(t('Garaż')).toBe('Garage');
    expect(t('Ustawienia')).toBe('Settings');
  });

  it('interpolates parameters correctly in both languages', () => {
    setLang('pl');
    expect(t('Asymetria ({offset} mm)', { offset: 45 })).toBe('Asymetria (45 mm)');

    setLang('en');
    expect(t('Asymetria ({offset} mm)', { offset: 45 })).toBe('Asymmetry (45 mm)');
  });

  it('falls back to source Polish key when English translation is missing', () => {
    setLang('en');
    expect(t('Nietłumaczone unikalne zdanie XYZ')).toBe('Nietłumaczone unikalne zdanie XYZ');
  });

  it('persists selected language to SQLite app_settings', () => {
    const { getAppSetting } = require('../../data/db');
    setLang('en');
    expect(getAppSetting('app_lang')).toBe('en');
    setLang('pl');
    expect(getAppSetting('app_lang')).toBe('pl');
  });
});
