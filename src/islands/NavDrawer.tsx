import { useEffect, useRef, useState } from 'preact/hooks';
import { NAV, type NavItem } from '../data/nav';
import {
  alternateLocaleUrl,
  localeHref,
  useTranslations,
  type Locale,
} from '../i18n/ui';

interface Props {
  locale: Locale;
  pathname: string;
}

export default function NavDrawer({ locale, pathname }: Props) {
  const t = useTranslations(locale);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        ref={btnRef}
        type="button"
        class="inline-flex items-center justify-center rounded-md p-2 text-brand-ink hover:bg-stone-100 lg:hidden"
        aria-expanded={open}
        aria-controls="site-drawer"
        aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')}
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </>
          )}
        </svg>
      </button>

      {/* Drawer Overlay & Panel */}
      {open && (
        <div
          id="site-drawer"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.primary')}
          class="fixed inset-0 z-50 flex flex-col bg-brand-maroon text-white lg:hidden"
        >
          {/* Drawer Header */}
          <div class="flex items-center justify-between border-b border-white/15 px-5 py-4">
            <a href={localeHref('/', locale)} onClick={close} class="flex items-center gap-3">
              <img
                src="/images/ys-logo-white.png"
                alt="Yayasan Sabah Group"
                class="h-9 w-auto max-w-50 object-contain"
              />
            </a>
            <button
              type="button"
              class="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={close}
              aria-label={t('a11y.closeMenu')}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Navigation Accordion */}
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <nav aria-label={t('nav.primary')}>
              <ul class="flex flex-col divide-y divide-white/10">
                {NAV.map((item: NavItem) => {
                  const hasSub = item.columns && item.columns.length > 0;
                  const isExpanded = !!expanded[item.id];
                  const itemLabel = item.label[locale];

                  if (!hasSub) {
                    return (
                      <li key={item.id}>
                        <a
                          href={localeHref(item.href, locale)}
                          onClick={close}
                          class="block py-3.5 text-base font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold"
                        >
                          {itemLabel}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id} class="py-2">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpand(item.id)}
                        class="flex w-full items-center justify-between py-2 text-left text-base font-semibold tracking-wide uppercase transition-colors hover:text-brand-gold"
                      >
                        <span>{itemLabel}</span>
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class={`transform transition-transform ${isExpanded ? 'rotate-180 text-brand-gold' : 'text-white/60'}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div class="mt-2 mb-3 ml-2 space-y-4 border-l-2 border-brand-gold/40 pl-3">
                          {item.columns!.map((col, cIdx) => (
                            <div key={cIdx} class="space-y-1">
                              {col.title && (
                                <p class="text-xs font-bold uppercase tracking-wider text-brand-gold">
                                  {col.title[locale]}
                                </p>
                              )}
                              <ul class="space-y-1">
                                {col.items.map((sub, sIdx) => (
                                  <li key={sIdx}>
                                    <a
                                      href={localeHref(sub.href, locale)}
                                      onClick={close}
                                      class="block py-1.5 text-sm text-white/85 transition-colors hover:text-brand-gold"
                                    >
                                      <span class="mr-1.5 text-brand-gold" aria-hidden="true">›</span>
                                      {sub.label[locale]}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Drawer Footer: Language & Socials */}
          <div class="border-t border-white/15 bg-brand-maroon-dark px-5 py-4">
            <div class="flex items-center justify-between text-xs">
              {/* Language Switch */}
              <div class="flex items-center gap-1.5">
                <span class="text-white/70">{locale === 'bm' ? 'Bahasa:' : 'Language:'}</span>
                {locale === 'en' ? (
                  <span class="font-bold text-brand-gold">EN</span>
                ) : (
                  <a href={alternateLocaleUrl(pathname, 'en')} class="text-white hover:text-brand-gold">EN</a>
                )}
                <span class="text-white/30">|</span>
                {locale === 'bm' ? (
                  <span class="font-bold text-brand-gold">BM</span>
                ) : (
                  <a href={alternateLocaleUrl(pathname, 'bm')} class="text-white hover:text-brand-gold">BM</a>
                )}
              </div>
            </div>

            {/* Social Media Links */}
            <div class="mt-3 flex items-center justify-center gap-6 border-t border-white/10 pt-3">
              <a
                href="https://www.facebook.com/kysrasmi"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white/80 hover:text-brand-gold"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/kumpulanyayasansabah/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white/80 hover:text-brand-gold"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCEKB4sp7UvCjcw_w95tUIBw"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white/80 hover:text-brand-gold"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}