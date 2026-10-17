import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { QUICK_ACCESS_ITEMS } from '../data/quick-access';
import { NAV } from '../data/nav';
import { localeHref, type Locale } from '../i18n/ui';

interface Props {
  locale: Locale;
}

export default function SiteSearch({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const items = useMemo(() => {
    const navigation = NAV.flatMap((item) => [
      { title: item.label[locale], href: localeHref(item.href, locale), group: locale === 'bm' ? 'Navigasi' : 'Navigation' },
      ...(item.columns ?? []).flatMap((column) => column.items.map((link) => ({
        title: link.label[locale], href: localeHref(link.href, locale), group: item.label[locale],
      }))),
    ]);
    const services = QUICK_ACCESS_ITEMS.map((item) => ({
      title: item.title[locale], href: item.href[locale], group: locale === 'bm' ? 'Perkhidmatan' : 'Services',
    }));
    return [...navigation, ...services];
  }, [locale]);

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
    if (!open) return;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={locale === 'bm' ? 'Cari laman ini' : 'Search this site'}
        onClick={() => setOpen(true)}
        class="inline-flex h-10 items-center gap-2 rounded-full border border-brand-border bg-white px-3 text-brand-ink transition hover:border-brand-gold hover:text-brand-maroon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-maroon lg:ml-2"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
        </svg>
        <span class="hidden text-sm font-medium xl:inline">{locale === 'bm' ? 'Cari' : 'Search'}</span>
      </button>

      {open && (
        <div class="fixed inset-0 z-[70] flex items-start justify-center bg-stone-950/55 px-4 pt-[10vh] backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && close()}>
          <section role="dialog" aria-modal="true" aria-labelledby="search-title" class="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl">
            <h2 id="search-title" class="sr-only">{locale === 'bm' ? 'Cari laman ini' : 'Search this site'}</h2>
            <div class="flex items-center gap-3 border-b border-brand-border px-5">
              <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-brand-gold" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input ref={inputRef} value={query} onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)} placeholder={locale === 'bm' ? 'Cari perkhidmatan, berita, dan maklumat…' : 'Search services, news, and information…'} class="h-16 min-w-0 flex-1 bg-transparent text-base text-brand-ink outline-none placeholder:text-brand-muted" />
              <button type="button" onClick={close} class="rounded-md border border-brand-border px-2 py-1 text-xs text-brand-muted hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-brand-maroon">Esc</button>
            </div>
            <div class="max-h-[60vh] overflow-y-auto p-3">
              <p class="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-muted">{query ? (locale === 'bm' ? 'Hasil carian' : 'Search results') : (locale === 'bm' ? 'Pautan popular' : 'Popular links')}</p>
              {results.length ? (
                <ul class="space-y-1">
                  {results.map((item) => <li key={`${item.group}-${item.href}-${item.title}`}><a href={item.href} onClick={close} class="group flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition hover:bg-brand-cream/70 focus-visible:outline-2 focus-visible:outline-brand-maroon"><span><span class="block font-semibold text-brand-ink group-hover:text-brand-maroon">{item.title}</span><span class="mt-0.5 block text-xs text-brand-muted">{item.group}</span></span><span aria-hidden="true" class="text-brand-gold transition-transform group-hover:translate-x-1">→</span></a></li>)}
                </ul>
              ) : (
                <p class="px-3 py-8 text-center text-sm text-brand-muted">{locale === 'bm' ? 'Tiada hasil. Cuba kata kunci lain.' : 'No results found. Try another search term.'}</p>
              )}
            </div>
            <div class="flex items-center justify-between border-t border-brand-border bg-stone-50 px-5 py-3 text-[11px] text-brand-muted"><span>{locale === 'bm' ? 'Cari seluruh laman Yayasan Sabah' : 'Search across Yayasan Sabah Group'}</span><span><kbd class="rounded border border-brand-border bg-white px-1.5 py-0.5">Ctrl</kbd> + <kbd class="rounded border border-brand-border bg-white px-1.5 py-0.5">K</kbd></span></div>
          </section>
        </div>
      )}
    </>
  );
}
