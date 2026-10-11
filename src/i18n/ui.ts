export const LOCALES = ['en', 'bm'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const UI = {
  en: {
    'site.name': 'Yayasan Sabah Group',
    'site.tagline': 'Dynamic - People Oriented - Caring - Committed',
    'nav.primary': 'Main navigation',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.activities': 'Activities',
    'nav.directory': 'Directory',
    'nav.media': 'Media',
    'nav.contact': 'Contact Us',
    'nav.search': 'Search',
    'lang.toggle': 'Bahasa Malaysia',
    'lang.current': 'English',
    'a11y.skipToContent': 'Skip to main content',
    'topbar.language': 'Language',
  },
  bm: {
    'site.name': 'Kumpulan Yayasan Sabah',
    'site.tagline': 'Dinamik - Berteraskan Rakyat - Prihatin - Berkomitmen',
    'nav.primary': 'Navigasi utama',
    'nav.home': 'Utama',
    'nav.about': 'Tentang Kami',
    'nav.activities': 'Aktiviti',
    'nav.directory': 'Direktori',
    'nav.media': 'Media',
    'nav.contact': 'Hubungi Kami',
    'nav.search': 'Carian',
    'lang.toggle': 'English',
    'lang.current': 'Bahasa Malaysia',
    'a11y.skipToContent': 'Langkau ke kandungan utama',
    'topbar.language': 'Bahasa',
  },
} as const;

export type TranslationKey = keyof (typeof UI)['en'];

export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return UI[locale][key] ?? UI[DEFAULT_LOCALE][key];
  };
}

/** Compute the href for the same page in the other locale. */
export function alternateLocaleUrl(currentPathname: string, locale: Locale): string {
  const segments = currentPathname.split('/').filter(Boolean);
  const isCurrentBm = segments[0] === 'bm';
  const rest = isCurrentBm ? segments.slice(1) : segments;
  const target = locale === 'bm' ? ['bm', ...rest] : rest;
  return '/' + target.join('/') + (target.length ? '/' : '');
}

/** Compute localized href for a given path and locale. */
export function localeHref(path: string, locale: Locale): string {
  const clean = path.replace(/^\/bm(\/|$)/, '/');
  if (locale === 'bm') {
    return clean === '/' ? '/bm/' : `/bm${clean}`;
  }
  return clean;
}

export function localeFromPathname(pathname: string): Locale {
  return pathname.split('/').filter(Boolean)[0] === 'bm' ? 'bm' : 'en';
}
