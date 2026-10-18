export const LOCALES = ['en', 'bm'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * UI Translation Dictionary (Option 3: Deliberate Hybrid Architecture)
 * 
 * - Dictionary (`ui.ts`): Reusable global chrome, site identity, meta,
 *   and accessibility labels.
 * - Nav Taxonomy (`src/data/nav.ts`): Multi-tier navigation tree with inline `{ en, bm }`.
 * - Inline Ternaries: Page-specific rich prose, headlines with JSX styling, and one-off copy.
 * - Dynamic Data: Supabase database collections (`news`, `announcements`, `quick_access`).
 */
export const UI = {
  en: {
    // Identity & Meta
    'site.name': 'Yayasan Sabah Group',
    'site.tagline': 'Dynamic - People Oriented - Caring - Committed',
    'site.rights': 'All rights reserved.',
    
    // Global Chrome & Navigation
    'nav.primary': 'Main navigation',
    'topbar.languageLabel': 'Language:',
    
    // Accessibility
    'a11y.skipToContent': 'Skip to main content',
    'a11y.openMenu': 'Open navigation menu',
    'a11y.closeMenu': 'Close menu',

    // Shared Reusable Actions
    'action.readMore': 'Read More',
    'action.viewAll': 'View All',
    'action.back': 'Back',
    'action.search': 'Search',
    'action.previous': 'Previous',
    'action.next': 'Next',
  },
  bm: {
    // Identity & Meta
    'site.name': 'Kumpulan Yayasan Sabah',
    'site.tagline': 'Dinamik - Berteraskan Rakyat - Prihatin - Berkomitmen',
    'site.rights': 'Hak Cipta Terpelihara.',
    
    // Global Chrome & Navigation
    'nav.primary': 'Navigasi utama',
    'topbar.languageLabel': 'Bahasa:',
    
    // Accessibility
    'a11y.skipToContent': 'Langkau ke kandungan utama',
    'a11y.openMenu': 'Buka menu navigasi',
    'a11y.closeMenu': 'Tutup menu',

    // Shared Reusable Actions
    'action.readMore': 'Baca Selanjutnya',
    'action.viewAll': 'Lihat Semua',
    'action.back': 'Kembali',
    'action.search': 'Carian',
    'action.previous': 'Sebelumnya',
    'action.next': 'Seterusnya',
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
