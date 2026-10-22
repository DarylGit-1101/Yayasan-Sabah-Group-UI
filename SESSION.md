# Session Record — YSG Website Rebuild

> Working notes for continuing this project.
> **Landing page: BUILT (§4).** Research behind it: §5. Navbar: §3.
> **Last reconciled with the code: 20 Oct 2026.**

---

## 1. What this project is

Rebuild of the **Yayasan Sabah Group (YSG)** corporate portal.

- **Old site (live):** `https://www.yayasansabahgroup.org.my/` — ColdFusion on
  Microsoft-IIS/10.0/ASP.NET. `.cfusion` JSESSIONID. jQuery 1.9.1 frozen since 2016.
- **New site:** this repo — Astro, static output, Tailwind v4, EN default + `/bm/` BM locale.

Confirmed: there is only **one** live YSG site. `ysnet.org.my` redirects to it;
`yayasan-sabah.com.my` does not resolve.

### The 28-year design history

> **CORRECTED 13 Oct 2026** — the earlier version of this note was wrong on two points.

| Era | Domain / tech | Verified span |
|---|---|---|
| **A** Static HTML / FrontPage frames | **`ysnet.org.my`**, `.htm`/`.html` | 1998-07-01 → ~2008 |
| **B** Classic ASP | **`ysnet.org.my`**, `.asp?p=..&l=bi` | earliest `.asp` capture **2009-12-07** → 2016-03-18 |
| **C1** ColdFusion launch | `yayasansabahgroup.org.my`, `.cfm` | 2016-04-08 → ~2021 |
| **C2** Current | same | ~2022 → present |
| — Bootstrap 5 reskin | same platform | live ~Feb–Jul 2026 |

**Two corrections:**
1. **The old site was on `ysnet.org.my`, not `yayasansabahgroup.org.my`.** That domain has
   **zero captures before 2016-04-08**. Migration boundary: last ASP 200-OK
   `20160318202630`, first 301 → new domain `20160422102309`.
2. **Classic ASP started ~2009, not ~2005** as previously recorded. Earliest archived
   `.asp` page is 2009-12-07; 2008–09 is a static-HTML grey zone. ASP launch date
   still **UNVERIFIED**.

⚠️ `docs/research/YSG-WEBSITE-ANALYSIS.md` **still carries the old (wrong) dates** —
needs the same correction.

The rebuild's case is **platform risk / performance / maintainability**, not aesthetics.
The 2026 reskin already fixed the look; the platform underneath is unchanged
(no `Cache-Control`, no security headers, `robots.txt` 404, year filters are POST forms,
one slideshow image 8.88 MB, 2.4 MB autoplay hero video).

---

## 2. Repo state

```
Branch:  main
HEAD:    1f68935 "Hero update and stuff"
Parent:  b6f76ec "background blur"
Root:    7420ee5 "Initial commit from Astro"
```

**Uncommitted (20 Oct 2026):**
- `M src/components/home/LatestNews.astro` — section header spacing, divider removed
- `M src/components/home/QuickAccess.astro` — grid 3/4-col → 5-col
- `M src/components/home/QuickAccessCard.astro` — smaller cards, tighter type
- `M src/pages/index.astro`, `M src/pages/bm/index.astro` — mount `GroupLinks`
- `?? src/components/home/GroupLinks.astro` — affiliates marquee
- `?? public/images/partners/` — 11 partner logos

Build: `npm run check` → 0 errors, 0 warnings, 3 hints (unused symbols).
`npm run build` → static, **10 routes**: `/`, `/bm/`, `/contact/`,
`/bm/contact/`, and 3 news articles × EN/BM.

---

## 3. Navbar interaction (earlier session; committed in `d0e3e99`)

**Status:** implemented, type-checks and builds clean. Hover rendering **not**
empirically verified — see the harness caveat below.

### Behaviour
Desktop white navbar only. Clicking a dropdown trigger **pins it open** instead of
navigating.

| Action | Result |
|---|---|
| Hover trigger | text highlights maroon (unchanged) |
| Click trigger | panel opens, trigger reverts to resting colour, underline bar hides |
| Hover pinned trigger | does **not** re-highlight |
| Hover other triggers | still highlight normally |
| Click another trigger | previous auto-unpins, new one pins |
| Click trigger again | toggles off |
| Click outside / `Escape` | unpins |

Exactly **1** dropdown can be pinned at a time (verified programmatically).

### Implementation
Added to `src/components/Header.astro` (nothing else touched):

- Markup: `data-nav-dropdown` on the `<li>`, `data-nav-trigger` + `nav-trigger` on the
  trigger `<a>`, `data-nav-panel` + `nav-panel` on the panel, `nav-underline` on the
  active underline `<span>`.
- Removed `group-focus-within:visible group-focus-within:opacity-100` from the panel —
  the JS now owns that state.
- A vanilla `<script>` + scoped `<style>` block at the bottom of the file.

Key CSS (all rules require `[data-pinned]`, so unpinned items are untouched and
Tailwind's `group-hover:text-brand-maroon` still applies to them):

```css
.nav-dropdown[data-pinned] .nav-panel { visibility: visible; opacity: 1; }
.nav-dropdown[data-pinned].nav-dropdown .nav-trigger,
.nav-dropdown[data-pinned].nav-dropdown .nav-trigger:hover {
  color: color-mix(in oklab, var(--color-brand-ink) 90%, transparent);
}
.nav-dropdown[data-pinned] .nav-underline { display: none; }
```

The doubled `.nav-dropdown` is deliberate — it bumps specificity above Tailwind's
`group-hover` rule so the suppression wins while pinned.

### Verified
- Pin / unpin / toggle / outside-click / `Escape` all work
- Max 1 pinned at a time; pinning another auto-unpins the previous
- No navigation on click (URL unchanged)
- Pinned panel sits at `y:61`, directly below the bar — does **not** overlap the
  neighbouring triggers
- Mobile drawer (`NavDrawer.tsx`) completely untouched — zero `data-nav-*` attributes in it

### ⚠️ Harness caveat — hover could NOT be verified
The OpenCode browser harness reports `:hover` as matching (`element.matches(':hover')`
returns `true`) but **does not apply CSS `:hover` styles**. Caught via a control test:
the Search button's `hover:bg-brand-cream/60` shows no computed change on real hover
either.

So all hover-colour measurements taken during this session were vacuous. The CSS logic is
sound by construction, but **the colour transitions should be eyeballed in a real browser.**

### ⚠️ Open design question — flagged to the user, unanswered
Clicking no longer navigates to the section index (e.g. `/about/`). The mega-menu panels
contain no link to their own parent page, so **those index pages are now unreachable from
the nav.** Options put to the user:
1. First click navigates, a later interaction opens the panel
2. Add an "Overview" link to the top of each panel
3. Leave as-is (click = open panel only)

---

## 4. Landing page (the service hub) — BUILT

**Status: implemented.** Brief received 13 Oct 2026; code reconciled 20 Oct 2026.

Full spec was supplied by the user (duplicated in conversation, ~8 sections). Summary:

> Transform the area **below the existing navbar** into a service hub. **Do not touch,
> rename or duplicate the navbar.** Feel: official Sabah government-linked org —
> professional, trustworthy, accessible. Usability over decoration.

### Sections, in order — implementation map

| # | Brief section | File | State |
|---|---|---|---|
| 1 | Existing navbar — preserve untouched | `src/components/Header.astro` | untouched since §3 |
| 2 | **A. Hero / welcome** | `home/Hero.astro` | done — video hero, 2 CTAs, "since 1966" card |
| 3 | ~~**B. Find a Service**~~ | — | **DROPPED — see below** |
| 4 | **C. Popular Services** | `home/QuickAccess.astro` + `home/QuickAccessCard.astro` | done — Supabase-driven, 5-col grid |
| 5 | **D. Important Announcements** | `home/Announcements.astro` | done — carousel; **no date/deadline yet** |
| 6 | **E. Latest News & Events** | `home/LatestNews.astro` + `pages/media/news/[slug].astro` (EN/BM) | done |
| 7 | **F. Discover YSG** | `home/DiscoverYSG.astro` | done — copy + 4 stat tiles |
| 8 | **G. Help & Contact** | `home/HelpContact.astro` | done — 2 of the 5 channels |
| 9 | Footer | `src/components/Footer.astro` | done — built after the brief |

### Section B — dropped (confirmed 20 Oct 2026)

The landing-page search field was **removed deliberately**; it was not forgotten.
Service discovery is handled by:

- the hero CTA **"Quick Start" → `#services`**,
- the **Quick Access grid** immediately below the hero,
- the header **`SiteSearch`** island for free-text lookup.

**Do not re-add a landing-page search section** without a new decision from the user.

### The design pattern — follow this on every new page

The landing page established a repeatable house style. New sections should reuse it
rather than invent local variants.

**1. Section shell** — full-width, separated by a hairline rule, not a container:

```astro
<section id="…" class="border-t border-brand-border/40 py-16 sm:py-20">
  <div class="w-full px-6 lg:px-8">
```

**2. Section header** — the same three-part lockup in all six sections:

```astro
<p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Eyebrow</p>
<h2 class="mt-1.5 text-2xl font-bold tracking-tight text-brand-maroon sm:text-3xl">Title</h2>
```

The optional "View all →" link is parked bottom-right at `sm:` using
`sm:absolute sm:right-0 sm:bottom-0`.

**3. Card** — white on the cream page; `rounded-xl`, `border-brand-border`,
`shadow-sm` → `hover:-translate-y-1 hover:border-brand-gold hover:shadow-md`;
image `scale-[1.02] → scale-110` behind a white gradient fade; title turns maroon;
circular arrow chip bottom-right. Same DNA in `QuickAccessCard`, `LatestNews`,
`HelpContact`, `GroupLinks`.

**4. Data** — query Supabase in the component frontmatter at build time, always
`try/catch`, cast to the row type, render a dashed empty state:

```ts
const { data, error } = await supabase.from('…').select('*').order(…);
if (data && !error) items = data as XRow[];
```

Row types live in `src/types/*.db.ts`, re-exported by `src/db/supabase.ts`.

**5. i18n** — the "deliberate hybrid" documented in `src/i18n/ui.ts`: the `UI`
dictionary for chrome/actions, `data/nav.ts` inline `{ en, bm }` for taxonomy,
inline ternaries for page copy, `_en`/`_bm` DB columns for content. Every home
component takes `{ locale?: Locale }` defaulting to `'en'`; the two homepage
files are the same composition with the locale flipped.

**6. Scripts** — colocated vanilla `<script>`, an `initX()` function plus an
`astro:after-swap` listener. **No ClientRouter is installed**, so that listener
never fires today. Only `GroupLinks` implements teardown (`_cleanupMarquee`).

### Deviations from the brief (known, not accidental)

- **C** is image-led, not icon-led, and does **not** group the six research
  categories from §5 — it renders the flat `quick_links` set from Supabase.
- **D** does **not** render `published_at`, and never reads `expires_at`
  (the column exists in `AnnouncementRow` but is referenced nowhere). The CTA
  falls back to `'#'` when a row has no attachment/banner.
- **D** is styled with a ~100-line global `<style>` block using ~50 `!important`
  rules and raw hex values — the only section that opts out of Tailwind.
- **F** surfaces derived research figures ("42+ public services", "3 education
  institutions") as facts. The brief forbade invented statistics.
- **G** implements 2 of the 5 requested channels, and its FAQ link points at
  `/media/faq/`, which does not exist yet.
- **News detail** uses `prose prose-lg`, but `@tailwindcss/typography` is not
  installed — those classes are inert.
- **`GroupLinks`** hardcodes production absolute URLs for internal pages.
- **`VantaBackground`** loads Three.js + Vanta from two CDNs on every page.

### Hard constraints
- **Preserve the existing navbar.** Don't redesign, rename, replace or duplicate it.
- Reuse existing components/layout/styles/deps. **No new UI framework.**
- **Avoid unnecessary JS** — use Astro + CSS unless JS is genuinely needed.
- Semantic HTML, alt text, keyboard nav, visible focus states.
- Responsive: desktop / tablet / mobile.
- **Do not invent portal URLs.** Use verified links only (§5).
- **Do not build a fake login** or imply external portals are integrated.
- Structure hardcoded service data so it **can migrate to a CMS later**.
- Don't break existing routes.
- Tailwind is v4 here — **no unsupported CSS directives** (no `@tailwind` utilities,
  use `@theme` + utility classes as in `src/styles/global.css`).

### Deliverable summary the user expects back
What changed · files created/modified · which links were verified ·
what still needs real data · any remaining technical issues.

---

## 5. Services research — what goes in Section C

### The 42 confirmed public services

Derived from a full live-site crawl + a 13-page public-access audit. Test applied to
every service: *could an ordinary person with no YSG affiliation use this themselves?*

| Group | Count |
|---|---|
| Apply for money (scholarships, loans, aid) | 11 |
| Repay a loan | 1 |
| Study with us (KTYS, UCSF, training, library) | 4 |
| Children & families | 4 |
| Community help | 8 |
| Training & skills | 2 |
| Visit, book & shop | 6 |
| Work with us (tenders, jobs, donations) | 5 |
| Contact | 1 |
| **Confirmed public** | **42** |
| + unresolved (gallery, UTC, auditorium) | up to **45** |

**Excluded:** 6 internal (Staff Corner, OSH, socioeconomic research, zone workshops,
PESAWI, board listings) · 11 B2B (ICSB, Tourism ops, MICE, Agro, Oil & Gas, Forestry,
Biotech, Properties, Manufacturing, Corporate Partners, Subsidiaries).

The spec's **six Section C categories** map onto these as:
Education & Scholarships · Loan Repayment · Preschool & Childcare ·
Careers & Opportunities · Sports & Facilities · Forms & Assistance.

### ✅ Verified URLs — safe to use, do not re-check

| Service | URL | Note |
|---|---|---|
| **TPNS** | `https://tpns.site/` | **Applications open 1–31 Oct 2026** (live, closes in days) |
| **PTPS** | `https://ptps.sabah.gov.my/landing/` | homepage card dead-links + says "Closed" |
| **Loan repayment (BPPP)** | `/bppp/eng/index.html` (BM `/bppp/index.html`) | KWSP A/c-2, CTOS, cashless |
| Sports facilities | `/facilities.cfm` | public tariffs + WhatsApp 012-4236930 + GoNet app |
| Tenders / vacancies | `/tender_notice.cfm` | currently *"no tender notices available"* |
| Online forms | `/documents.cfm` | only 2: Library Membership, e-Preschool (Google Forms) |
| FAQ | `/faqs.cfm` | |
| Contact + feedback | `/contact.cfm` | public form, dept directory |
| Staff Corner | `/staff.cfm` | **INTERNAL** — 4 staff login links only |
| Library | `/borneo_research_library.cfm` | **open free to public**, Mon–Fri 8–5, membership form |
| Nature Club | `/snc2/index.html` | note: `/snc2/` returns 403; use `index.html` |
| e-Preschool form | `forms.gle/tZdcy74zXUHmPEJx5` | |
| Library membership | `forms.gle/eqzQj6AntCKpRMbN6` | |

**Images:** repo has `/images/ys-logo.png` + `ys-logo-white.png` only. **No
photography** — hero imagery (Menara Tun Mustapha) must be sourced, not generated.

### ⚠️ Unresolved — could not verify from the live site
- **Tun Mustapha Gallery** — no hours, admission or "open to public" statement.
- **UTC** — page is one line: *"Yayasan Sabah Mini Office, Level 6."* Purpose unknown.
- **Auditorium/theatre booking** — `facilities.cfm` covers **sports only**. Booking
  contact lives in FAQ Q25 (Real Estate Unit, +60 88 326 445) — public access unconfirmed.
- **PTPS consolidation question** — 6 education aid lines exist on the old site but are
  absent from live `education.cfm` (see below). Are they folded into PTPS or cancelled?

### 🔍 Old-site findings that matter

**The old site had a top-level "Services" menu for 7 years (2009–2016) and it was
EMPTY in every archived capture.** Dropped at the 2016 migration, never rebuilt.
*This landing page is the page that menu promised and never delivered.*

**6 public education aid programmes dropped from `education.cfm`:**
Russia Medical Scholarship (KURSK) · UiTM Financial Assistance · IKM Financial Assistance
· Polytechnic Financial Assistance · Pre-University Financial Assistance ·
Egypt hostels (Alexandria & Cairo).
→ **Open question: consolidated into PTPS (launched 2024) or genuinely cancelled?**
Settling this moves the public-service count between **42 and 48**.

**Self-service tooling was subtracted, not added.** The old site had: an online sports
booking form (2007 — pick court/date/time, now phone-only), library databases
(EBSCO, Wiley, Taylor & Francis, Cambridge, Britannica — all gone), Maliau/Danum online
reservations, an online scholarship/loan application portal.
*Only organisational pages have been added since (Annual Report, tenders, CIO, song).*
→ Strong argument for the rebuild: **the platform didn't stall, it quietly subtracted.**

**Dropped commercial sectors** (B2B — irrelevant to Section C, but affects redirects):
Transportation (removed ~2020, 404) · Overseas Companies (removed ~Q2 2021, 404) ·
**Fisheries & Food Industries (removed from nav + sitemap in 2026 — page still returns
HTTP 200 but is orphaned)** · Other Investments → *renamed* **Manufacturing** (content kept).

---

## 6. Key files

| File | Role |
|---|---|
| `src/data/nav.ts` | 64-item EN/BM nav — faithful 1:1 port of the legacy IA |
| `src/i18n/ui.ts` | translation keys, locale routing, hreflang helpers |
| `src/styles/global.css` | Tailwind v4 `@theme` design tokens |
| `src/layouts/Base.astro` | SEO head (canonical, hreflang ×3, OG, skip-link) |
| `src/components/Header.astro` | **site chrome + the pin-open interaction** |
| `src/components/Topbar.astro` | maroon topbar tier |
| `src/islands/NavDrawer.tsx` | mobile drawer (Preact island, `client:media`) |
| `src/pages/index.astro`, `src/pages/bm/index.astro` | landing-page composition (same 7 sections, locale flipped) |
| `src/components/home/*.astro` | the landing-page sections (§4) |
| `src/components/Footer.astro` | 4-column footer — did not exist when the brief was written |
| `src/components/FeedbackForm.astro` | contact form; inserts into Supabase `feedback` |
| `src/db/supabase.ts` | Supabase client + re-exports `src/types/*` |
| `src/types/*.db.ts` | row types: news, announcements, quick links, documents, feedback… |
| `src/pages/media/news/[slug].astro`, `src/pages/bm/media/news/[slug].astro` | DB-driven news detail, EN + BM |
| `astro.config.mjs` | site URL + i18n config (en default, `/bm/`) |
| `docs/research/YSG-WEBSITE-ANALYSIS.md` | full research deliverable (still carries the stale dates — §1) |

### Design tokens
Defined in `src/styles/global.css` via Tailwind v4 `@theme`:

| Token | Value |
|---|---|
| `--color-brand-surface` | `#fcfbf9` — **not** `--color-base`, which no longer exists |
| `--color-brand-maroon` | `#5e2b2a` |
| `--color-brand-maroon-dark` | `#4a1f1e` |
| `--color-brand-maroon-light` | `#733635` |
| `--color-brand-gold` | `#be9267` |
| `--color-brand-gold-hover` | `#a87e55` |
| `--color-brand-cream` | `#f2e9e0` |
| `--color-brand-sand` | `#ded7c5` |
| `--color-brand-ink` / `--color-ink` | `#212529` |
| `--color-brand-muted` | `#6c757d` |
| `--color-brand-border` | `#e5e0d8` |

Reuses the legacy brand colours (maroon `#5e2b2a`, gold `#be9267`, cream `#f2e9e0`,
ink `#212529`). **Deliberately drops the legacy `#e85d04` orange** — this should be
documented as a decision at some point.

---

## 7. What's left to build (~90% of the site)

Chrome, the landing page, `/contact/` and news detail pages exist. Still needed:

- **64 content pages** — About (20), Activities + Directory (32), Media + utility (21)
- **11 utility pages** — including every internal link the landing page emits
- **Dead internal links** — `/about/`, `/media/`, `/media/faq/`, `/media/news/`,
  `/media/tender-notice/`, `/facilities/`, `/borneo-research-library/`,
  `/privacy-policy/`, `/disclaimer/`, `/bppp/…` all 404 on a static build
- **Data layer** — 11 media collections requiring a build-time source:
  press releases (2014→), photo albums (92 in 2026, ~845 images), publications back to
  **1977**, calendar (~117 events/yr), videos, annual reports, corporate ads, tender
  notices, awards, milestones, announcements, contact form.
  News, announcements and quick links are live in Supabase; the rest are not.
  **The Supabase schema is not in the repo**, and `.env` is gitignored — a clean
  clone builds empty sections against `placeholder.supabase.co` with no error.

### Content bugs found in the legacy site (carry over carefully)
- BM homepage duplicates every event 14–16× (PESAWI ×51)
- `board_trustees.cfm` shows "under construction" but the full roster is in HTML comments
- `board_directors.cfm` has a mislabeled heading
- FAQ is "Question 1…26" placeholders
- Song lyric typo "Raykat"
- CIO personal Gmail exposed
- **~15 BM nav label drifts** — e.g. `nav.ts` says "Mercu Tanda", live site says "Pencapaian"

### Migration constraint
Must preserve `.cfm` URLs via redirects. The 2016 migration kept `.asp` and
`ysnet.org.my` redirects alive and they are **still crawled** — do not break them.
A full redirect map is in the analysis doc's appendix.

---

## 8. Useful commands

```bash
npm run dev                      # dev server (port 4321)
npm run check                    # astro check / types
npm run build                    # static build -> dist/
astro dev stop                   # stop a stray dev server
```

Note: if `npm run dev` reports "Another astro dev server is already running", one is
already up on 4321 — just use it.

---

## 9. Next moves (in rough priority)

1. **Commit the uncommitted work** — `GroupLinks.astro` + `public/images/partners/`
   + the card/grid tweaks. It is the only untracked feature in the tree.
2. **Announcements: show date + deadline** (§4) — render `published_at`, highlight
   `expires_at`, and stop falling back to `'#'`. This is the last unmet line of the
   original brief.
3. **Fix or stub the 10 dead internal links** (§7) — the landing page currently
   dead-ends on "All news", "View all announcements" and its FAQ card.
4. **Answer the nav open question** (§3) — does the section index stay reachable?
5. **Settle the PTPS question** (§5) — moves the scholarship count 42 → 48, and decides
   whether C should list 1 or 6 education-aid cards.
6. **Make builds reproducible** — commit the Supabase schema (or a seed/migration),
   and fail loudly instead of falling back to `placeholder.supabase.co` (§7).
7. Correct `docs/research/YSG-WEBSITE-ANALYSIS.md` — `ysnet.org.my` domain + 2009 ASP date.
8. Eyeball the navbar hover states in a real browser (§3 harness caveat)
9. Decide on `VantaBackground` (two CDN scripts on every page) and on the missing
   `@tailwindcss/typography` plugin (§4 deviations)
10. Source hero photography — Menara Tun Mustapha / Sabah visual (§5); the hero
    currently uses the legacy intro video instead
11. Redirect map for `.cfm` URLs; also decide the orphaned Fisheries page (§5)
12. Start on the 64 content pages
