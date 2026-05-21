import { create } from 'zustand';
import { en, type Translations } from './en';
import { zhTW } from './zhTW';

export type Locale = 'en' | 'zh-TW';

const locales: Record<Locale, Translations> = {
  en,
  'zh-TW': zhTW,
};

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-TW': '繁體中文',
};

function getSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem('lyricdeck-locale');
    if (saved && (saved === 'en' || saved === 'zh-TW')) {
      return saved;
    }
  } catch {}
  return 'en';
}

const initialLocale = getSavedLocale();

interface I18nStore {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

export const useI18n = create<I18nStore>((set) => ({
  locale: initialLocale,
  t: locales[initialLocale],
  setLocale: (locale) => {
    localStorage.setItem('lyricdeck-locale', locale);
    set({ locale, t: locales[locale] });
  },
}));
