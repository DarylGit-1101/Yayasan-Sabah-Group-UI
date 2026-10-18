import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { supabase, type QuickLinkRow } from '../db/supabase';
import { NAV } from '../data/nav';
import { localeHref, type Locale } from '../i18n/ui';

interface Props {
  locale: Locale;
}

export default function SiteSearch({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [quickLinks, setQuickLinks] = useState<QuickLinkRow[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fetch quick links dynamically from Supabase database
  useEffect(() => {
    supabase
      .from('quick_links')
      .select('id, title_en, title_bm, href_en, href_bm, available')
      .eq('available', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setQuickLinks(data as QuickLinkRow[]);
        }
      });
  }, []);

  const items = useMemo(() => {
    const navigation = NAV.flatMap((item) => [
      { title: item.label[locale], href: localeHref(item.href, locale), group: locale === 'bm' ? 'Navigasi' : 'Navigation' },
      ...(item.columns ?? []).flatMap((column) => column.items.map((link) => ({
        title: link.label[locale], href: localeHref(link.href, locale), group: item.label[locale],
      }))),
    ]);
    const services = quickLinks.map((item) => ({
      title: locale === 'bm' ? (item.title_bm || item.title_en) : (item.title_en || item.title_bm),
      href: locale === 'bm' ? (item.href_bm || item.href_en) : (item.href_en || item.href_bm),
      group: locale === 'bm' ? 'Perkhidmatan' : 'Services',
    }));
    return [...navigation, ...services];
  }, [locale, quickLinks]);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return items.slice(0, 7);
    return items.filter((item) => `${item.title} ${item.group}`.toLocaleLowerCase().includes(normalized)).slice(0, 8);
  }, [items, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) ||
          ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape' && open) close();
      if (event.key === 'Tab' && open) {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
        const focusable = dialog?.querySelectorAll<HTMLElement>('input, button, a[href]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={locale === 'bm' ? 'Cari laman web' : 'Search website'}
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-ink transition-colors hover:border-brand-gold/60 hover:text-brand-maroon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-maroon"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-6 sm:pt-24" role="dialog" aria-modal="true" aria-label={locale === 'bm' ? 'Carian Laman' : 'Site Search'}>
          <div class="fixed inset-0 bg-brand-maroon/20 backdrop-blur-sm transition-opacity" onClick={close} />
          <div class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-border bg-white shadow-2xl">
            <div class="flex items-center border-b border-brand-border px-4 py-3">
              <svg class="h-5 w-5 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                placeholder={locale === 'bm' ? 'Cari halaman, perkhidmatan atau dokumen...' : 'Search pages, services, or documents...'}
                class="ml-3 w-full border-0 bg-transparent text-sm text-brand-ink placeholder-brand-muted/70 focus:outline-none"
              />
              <kbd class="hidden rounded border border-brand-border bg-brand-cream/40 px-1.5 py-0.5 text-[10px] font-semibold text-brand-muted sm:inline-block">ESC</kbd>
            </div>

            <div class="max-h-80 overflow-y-auto p-2">
              {results.length > 0 ? (
                <ul class="space-y-1">
                  {results.map((result) => (
                    <li>
                      <a
                        href={result.href}
                        onClick={close}
                        class="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-brand-ink transition-colors hover:bg-brand-cream/60 hover:text-brand-maroon focus:bg-brand-cream/60 focus:text-brand-maroon focus:outline-none"
                      >
                        <span class="font-medium">{result.title}</span>
                        <span class="text-xs text-brand-muted">{result.group}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div class="py-8 text-center text-sm text-brand-muted">
                  {locale === 'bm' ? 'Tiada hasil carian ditemui' : 'No results found'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
