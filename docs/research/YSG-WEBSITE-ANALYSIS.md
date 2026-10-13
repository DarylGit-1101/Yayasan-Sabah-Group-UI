# Yayasan Sabah Group — Website Research & Analysis

> Comparative audit of the **legacy site** (live, ColdFusion) and the **new rebuild** (Astro),
> with a 28-year design history recovered from the Internet Archive.
> Compiled 12 October 2026. Sizes and counts are measured against live HTTP requests to
> `www.yayasansabahgroup.org.my`; history claims are evidenced by Wayback Machine captures.

---

## 1. Executive Summary

| | Legacy (old) | New (Astro rebuild) |
|---|---|---|
| **Stack** | ColdFusion `.cfm` on IIS 10 / ASP.NET | Astro 7 static + Tailwind v4 + Preact |
| **Design age** | **Reskinned in 2026** — looks current | New build |
| **Pages** | ~75 EN + ~75 BM | 2 (placeholder homepages) |
| **Homepage HTML** | **149,753 bytes** | **38,817 bytes** (3.9× smaller) |
| **Images on homepage** | 124 `<img>` (94 slideshow, all eager) | 2 |
| **Stylesheets / scripts** | 15 CSS + 20 JS | 1 CSS (21.7 KB) + JS island (mobile only) |
| **Design system** | 2 hand-written CSS files, 6 font families + 3 TTFs | Tailwind `@theme` tokens, deliberate palette |
| **i18n** | Manual `/bm/<page>.cfm` twins | Route-based `/bm/`, `hreflang` + `lang` |
| **CMS** | Database-backed (year filters via POST) | None yet |
| **Health** | No HTTPS redirect, no cache headers, no robots.txt, no security headers | Clean build, 0 type errors |

**The single most important finding: the site you are replacing was itself redesigned in 2026.**
The Bootstrap 5 front end you see today went live between late January and July 2026 — but it
is a *reskin*, not a migration. The URLs are still `.cfm`, the backend is still ColdFusion, and
jQuery 1.9.1 (frozen since 2016) still ships underneath. So this rebuild is not "modernise an
old-looking site" — it is **"move a freshly-designed site off a dying platform."** That changes
the pitch: the design work is largely already validated by the 2026 reskin, and the real value
you add is architecture, performance, content modelling and maintainability.

**What must be fixed:** performance (an 8.9 MB image on the homepage, zero caching anywhere),
SEO (no `robots.txt`, no redirects, POST-based archive filters), and content quality (a board page
whose content hides in HTML comments, placeholder FAQ labels, a search box that does nothing).

**The Astro rebuild has the right skeleton and is already better engineered than the site it
replaces** — but it is ~5% complete: chrome and data model exist, content and homepage do not.

---

## 2. The Old Website — 28 Years of History

The organisation has run **three separate websites across two domains** since 1998. There has been
exactly **one true visual redesign on the current domain**.

| # | Era | Domain | Tech | Span |
|---|-----|--------|------|------|
| 0 | Frameset | `ysnet.org.my` | `<frameset>`, no CSS | 1998 – ~2004 |
| 1 | Classic ASP | `ysnet.org.my` | `default.asp`, table layout, Flash | ~2005 – Mar 2016 |
| 2 | Kickstart + ColdFusion | `yayasansabahgroup.org.my` | `.cfm` + Kickstart CSS + jQuery 1.9.1 | **Apr 2016 – ~mid 2026** |
| 3 | **Bootstrap 5 (current)** | `yayasansabahgroup.org.my` | Bootstrap 5, **still `.cfm` URLs** | **~Feb–Jul 2026 – present** |

Archive evidence: `ysnet.org.my` has captures from **1 July 1998**; the current domain's earliest
capture is **8 April 2016** — it did not exist before. From April 2016 every `ysnet.org.my`
capture is a `301` (still redirecting today). `yayasan-sabah.com.my` has **zero captures** — it
never existed. Total archived for the current domain: **~7,091 unique URLs**, of which **241 are
unique `.cfm` pages** including the full `/bm/` mirror.

### 2.1 Era 0/1 — `ysnet.org.my` (1998 – March 2016)
- **1998:** a 1.2 KB `<frameset>` page, no CSS, titled *"Sabah Foundation (Yayasan Sabah), Sabah, Malaysia"*.
- **~2005–2016:** Classic **ASP** — `default.asp?p=h&l=bi`, `corporate.asp`, `social.asp`,
  `commercial.asp`, `directory.asp`. **Table-based layout** (10–15 `<table>` per page), one
  stylesheet, **no viewport meta, not responsive**, Flash embedded via `AC_RunActiveContent.js`.
- Nav: Home / Corporate / Social / Commercial / Directory / Services / Links, with a bilingual
  toggle **`?l=bi` (English) / `?l=bm` (Malay)** — the direct ancestor of today's EN/BM switch.
- Quaint artefact: the public menu exposed an internal **`Intranet → http://10.0.0.103/intranet/`**
  link for over ten years.

### 2.2 Era 2 — Kickstart + ColdFusion (April 2016 – ~mid 2026)
The ten-year design. Verified **identical stack** across captures in 2016, 2017, 2018, 2020,
2021, 2022, 2023, 2024, 2025 and January 2026:
- **Kickstart CSS** (12-column grid: `grid`, `col_12`, `col_6`, `col_3`) + `style.css` (12.9 KB)
- **jQuery 1.9.1 — frozen since 2016 and never updated**, plus jQuery UI and Fancybox
- **Amazing Slider** hero, **Jssor** logo carousel, Dynamic Drive "Cross browser Marquee II"
- Signature **browns** (`#774f38`, `brown1/2/3-bg`) plus a **theme-colour switcher**
  (`color.cfm?C=…` brown/red/green/blue), a jQuery **font-size adjuster**, live date,
  `#toTop` and a hit counter — the full suite of Malaysian government-site conventions of that era
- **Universal Analytics `UA-61858120-19`**; Google CSE via `partner-pub-6100592550752509`
- **Served plain HTTP until ~Feb–Mar 2024** (first HTTPS capture `20240301230220`)
- Nav was **Home / About / Activities / Directory / Media** — *Contact Us was not in the main
  menu*, it sat in a brown utility bar with Staff Corner, Awards and Site Map
- One-off campaign pages came and went (`ramadhan_2017.cfm`, `gerak_iks_sdc_2016.cfm`,
  `makluman_ransomware.cfm`, an `/events/LC2017/` microsite, a static `/snc2/` HTML microsite,
  `gallery_golden_jubilee.cfm` for the 2016 50th Anniversary)

### 2.3 Era 3 — Bootstrap 5 reskin (2026, current)
Last old-design capture **25 Jan 2026**; first new `assets/` resources **31 Jul 2026**; first
new-design homepage **21 Sep 2026**. **The redesign went live between late January and end of
July 2026.** (No HTML captures exist in that window — a crawl gap, not a site outage.)

What changed: Bootstrap 5, mega-menu, CubePortfolio / WOW / AOS / Slick / Owl / Fancybox /
Masonry / parallaxie / timeline, Line Awesome + LineIcons (Font Awesome dropped), the custom
**Neue Aachen Pro** webfont, hexagon branding, GA4 `G-GPWTVBNZY5`, and the modern CSE id.

**What did *not* change:** ColdFusion, the `.cfm` URLs, the `/bm/` mirror. This is deliberately a
**front-end reskin, not a platform migration** — the same trick the org pulled in 2016, when the
ASP site was swapped for ColdFusion and the old `.asp` URLs were kept alive as server-side
redirects (still observable today: `commercial.asp`, `corporate.asp`, `directory.asp`,
`library.asp` all 301 into their `.cfm` equivalents).

Nav changed too: **Contact Us was promoted into the main menu**, while Staff Corner, Awards,
Site Map, Online Forms, Partners, Annual Report, Tender Notice, Facilities, FAQ and Feedback all
moved to the footer. Dropped from the 2016 menu: *"Other Investments"*, *"Overseas Companies"*,
*"Fisheries & Food Industries"*. Added: the **60th-anniversary logo** (YSG turned 60 in 2026),
the *"Developing People Towards Progress"* slogan, the "Get in Touch" block, and the
**`/bppp/` Education Loan Repayment Portal** (a static microsite first captured March 2024).

### 2.4 What history tells this rebuild
1. **Nav IA has been stable for a decade** — Home / About / Activities / Directory / Media is
   unchanged since 2016. Your `nav.ts` mirrors it exactly. That is strong validation; do not
   "improve" the IA without a content reason.
2. **Every previous migration preserved URLs.** 2016 kept `.asp` → `.cfm` redirects. You must do
   the same: `.cfm` → your clean paths, or lose a decade of indexed links.
3. **The backend was never modernised in 28 years** — three front ends, one platform. Breaking
   that pattern is the actual point of this project.
4. **Two domains still resolve** — `ysnet.org.my` (301) and the dead `.asp` paths. Both need
   redirect hygiene in the final cutover.
5. Visible dead tech to *not* carry forward: Universal Analytics ids, the supercounters widget,
   `aspxerrorpath` URL leakage, jQuery 1.9.1.

---

## 3. The Old Website — Technical Profile (current live site)

### 3.1 Stack
```
server:  Microsoft-IIS/10.0
x-powered-by: ASP.NET
cookie:  JSESSIONID=…cfusion  →  ColdFusion
```
- **Frontend:** Bootstrap 5 (self-hosted), jQuery
- **Plugins:** CubePortfolio, Fancybox, Slick, Owl Carousel, WOW.js, AOS, Masonry,
  parallaxie, timeline.js, scrollUp, mediaelement-and-player
  *(note: `jquery.cubeportfolio.min.js` is loaded **twice** on every page)*
- **Icons:** three full libraries shipped together — Font Awesome, Line Awesome, LineIcons
- **Third-party:** GA4 (`G-GPWTVBNZY5`), Google Custom Search (`cx=1163e0e7baf1f49a2`),
  supercounters hit counter, Google Maps embed (hard-coded API key, twice), YouTube embeds

### 3.2 Measured performance
| Asset | Size |
|---|---|
| Homepage HTML (uncompressed) | 149,753 B |
| Single slideshow poster (`…RIA SESI 2027.jpg`) | **8,882,002 B (8.9 MB)** |
| `CTOS Holiday 2.png` | 1,834,774 B |
| Background intro video (`YSG-intro-720p.mp4`) | 2.4 MB |
| Anniversary logo (`logo60eng.png`) | 594 KB |
| Custom font `NeueAachenPro*.TTF` × 3 | ~190 KB each |
| `photo_gallery.cfm` HTML (2026 only) | 578 KB |
| `awards.cfm` HTML | 244 KB |

Worse than the numbers: **`Cache-Control`, `ETag` and `Last-Modified` are absent on every asset
tested** (images, CSS, fonts). Nothing caches, so every visit re-downloads everything. The hero
is an autoplaying 2.4 MB MP4 behind a `#f2e9e0` preloader that blocks first paint.

### 3.3 Security & canonicalisation
All absent: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

All four URL variants return `200` with no redirect — four duplicate copies for search engines:
```
http://yayasansabahgroup.org.my/         → 200
https://yayasansabahgroup.org.my/        → 200
http://www.yayasansabahgroup.org.my/     → 200
https://www.yayasansabahgroup.org.my/    → 200
```

### 3.4 SEO
- **`robots.txt` → 404.** No crawl guidance, no sitemap reference.
- **No `hreflang`** alternates between EN and BM.
- **No `og:title` / `og:description`** — only `og:image`, pointing at the favicon PNG.
- **No JSON-LD** structured data anywhere.
- Year filters are **`POST` form submits** to handler templates (`pressReleaseYear.cfm`,
  `photoGalleryYear.cfm`, `milestoneYear.cfm`, …) so archive content is neither linkable nor crawlable.
- **`search.cfm` is a dead 55-byte file:** `<script> self.location="index.cfm"; </script>` —
  the visible search box does nothing but bounce to the homepage.

---

## 4. The Old Website — Information Architecture

Five primary sections, **64 navigable pages**, every one duplicated under `/bm/`:

| Section | Items | Notes |
|---|---|---|
| **About** | 20 | Prose, people grids, org chart image, timeline |
| **Activities** | 20 | Social (10), Commercial (9), CSR (1) |
| **Directory** | 12 | Phone/address listings, floor-keyed |
| **Media** | 10 | CMS-backed archives |
| **Contact** | 1 | Form + Google Maps + departmental directory |

Plus utility pages reachable only from the homepage quick-links: `staff`, `documents`,
`awards`, `corporate_partners`, `facilities`, `faqs`, `disclaimer`, `privacy_policy`,
`terms_conditions`, `sitemap`, `search`.

### 4.1 Homepage anatomy (DOM order)
1. Header: utility bar (date, EN|BM, font-size controls, FB/IG/YT) → logo → mega-menu → hamburger drawer (full duplicate nav)
2. `#header-main-img` — full-width autoplay **background video** + 60th-anniversary logo overlay
3. `#homeslider` — split hero: rotating promo CTAs (left) / photo slides captioned `event · date · venue` (right), ~94 images
4. `#announce` — `h1 "Announcement"` box: outage notice, integrity PDF, publications, dated events
5. `#services` — core-values strip + **13 quick-link tiles**
6. `#video` — Tun Mustapha 1965 speech quote + YouTube gallery
7. `#related` — **11 partner/affiliate logos** (not hyperlinked)
8. `#map` — Google Maps iframe
9. `#footer-contact` — "Get in Touch": 2 HQ addresses + 8 departmental contact groups (**re-rendered on every page**)
10. `#footer` — government logos, legal links, hit counter, "Last updated on …"

### 4.2 Content types to model in the rebuild
| Type | Pages | Shape |
|---|---|---|
| Prose article | foreword, introduction, menara-tun-mustapha, corporate-logo | body, hero, optional gallery |
| Statement hero | role (1 sentence), function (1 sentence) | too thin to stand alone — merge candidates |
| People grid | former-chairmen-bot (11), former-directors (8), former-deputy-directors (6), board-directors (6), former-chairmen-icsb (4), management-team (24), cio (1) | `{name, honorifics, title, role, tenureStart, tenureEnd, photo, group}` |
| List | objectives (3), core-values (7) | index + text (+ optional image) |
| Org chart | corporate-structure | **single PNG** — not machine-readable |
| Timeline | milestones | `{date, text, images[]}` per event, year-ranged |
| Lyrics + video | corporate-song | YouTube embed `lXmJSI2xlNY` |
| Directory | 12 pages | `{group → entries[{name, floors, address, phones[], extensions[]}]}` — **no tables, no emails, no hours** |
| Media archive | press-release, photo-gallery, calendar, video-gallery, publication, annual-report, corporate-adv, tender-notice | database-backed, year-filtered |
| Static utility | staff, documents, awards, partners, facilities, faqs, legal ×3 | templates |

### 4.3 CMS requirements (evidenced by the live site)
| Collection | Scale observed |
|---|---|
| Press releases | 2014 → present, ~22 in 2026, EN/BM titles, PDFs under `/docs/press/<year>/<yymmdd>/` |
| Photo albums | **92 albums in 2026 alone**, ~845 image references, folder convention `/img/slideshow/<YYYY>/<YYMMDD>/<album>/n.jpg` |
| Calendar events | ~117 in 2026 (`date + title + venue`) |
| Videos | 23 in 2026 (`title + date + venue + youtube id`) |
| Publications | **back to 1977**, 5-year ranges, "View Online" + "Download" |
| Annual reports | 2021–2025 |
| Corporate ads | 2020–2026, one JPG per year |
| Tender notices | publish/unpublish, currently empty state |
| Awards | year → entity → description, + ~53 certificate photos |
| Milestones | 13 year-ranges, 1965 → present |
| Announcements | homepage box + news page |
| Contact form | `user_name, user_email, user_contact, user_country, message` |

---

## 5. The Old Website — Design System

### 5.1 Palette (frequency counted across both CSS files)
| Hex | Role | Uses |
|---|---|---|
| `#f2e9e0` | cream / light surface | 88 |
| `#be9267` | tan-gold, links, accents | 52 |
| `#5e2b2a` | **maroon — primary brand** | 23 |
| `#e85d04` | orange, hover / filter chips | utility classes |
| `#987452` | mid brown | utility classes |
| `#111520` | near-black blue | dark surfaces |
| `#202020` | nav text | — |
| `#FAD59A` | pale gold text | — |
| `#f0d274` / `#ee964d` | legacy yellows/oranges | hovers |

Named utilities: `.text-ysg` (orange), `.text-ysg2` (maroon), `.text-ysg3` (gold),
`.text-ysg4` (cream), `.text-ysg5` (pale gold), with `.bg-ysg`…`.bg-ysg5`.

### 5.2 Typography — six web families, three self-hosted TTFs
`Roboto` (body, 15px/1.7) · `Open Sans` (sub-headings) · `Lato` (nav, weight 900)
· `Roboto Slab` (display headings) · `Epilogue` (pull-quote marks) · `Neue Aachen`
Regular/Medium/Bold (custom TTF, 190 KB each). All five Google families load via a blocking
`@import` at the top of the stylesheet.

### 5.3 Signature patterns
- Hexagon texture `bg-ysg-hexa.png` (71 KB) with `background-attachment: fixed`
- Ken Burns zoom on sub-page heroes (`60vh`, `transform: scale(1 → 1.1)`)
- Pill-shaped translucent navbar: `border-radius: 50px`, `rgba(255,255,255,0.9)`
- Display headings with a cream double-offset text-shadow
- White full-screen **preloader spinner** before first paint
- Full-screen **side drawer** menu over a photo + brown overlay
- Fixed **quickbar** button (bottom-right) opening a 30%-wide slide-in panel
- Overlay **search** with a `min-width: 700px` input — **breaks on phones**

---

## 6. Content Quality Issues Found (fix, don't port)

1. **BM homepage duplication** — every news event is repeated **14–16× in the HTML**;
   "PESAWI" appears 51 times. Looks like a ColdFusion join returning a cartesian product.
2. **`board_trustees.cfm`** renders only *"This section is currently under construction."*
   — the **complete roster with photos is present in HTML comments**, visible in source.
3. **`board_directors.cfm`** shows an "under construction" notice **and** a mislabeled heading
   *"Yayasan Sabah Board of Trustees"* on the ICSB directors page (CMS label bug).
4. **`former_director_ys.cfm`** — Benedict Stephens' tenure appears copy-pasted from another entry.
5. **Corporate song** titled *"Yayasan Sabah Berjiwa Raykat"* — typo for *Rakyat*.
6. **CIO page** publishes a personal Gmail address (`jesselkamijan@gmail.com`).
7. **FAQ** has 26 items literally labelled `Question 1` … `Question 26` — no real questions.
8. **Placeholder imagery** — stock `assets/img/temp/pexels-*.jpg` still in production use.
9. Messy asset filenames with spaces (`docs/COPORATE ADV (BI) 2026.jpg` — also a typo).
10. `tender_notice.cfm` is an empty state; `news.cfm` is not a news feed but 4 static cards.

---

## 7. The New Website — Current State

### 7.1 What exists
```
astro.config.mjs        site + i18n (en default, /bm/, no prefix on default)
src/i18n/ui.ts          translation keys, locale routing helpers, hreflang helpers
src/data/nav.ts         64 items — faithful 1:1 port of the legacy IA, EN+BM labels
src/layouts/Base.astro  SEO head: canonical, hreflang ×3, OG, twitter, skip-link
src/components/Topbar.astro   maroon bar: locale date, EN|BM switch, socials
src/components/Header.astro   sticky header, CSS-hover mega-menu (3/2/1 col adaptive)
src/islands/NavDrawer.tsx     Preact mobile drawer: focus trap, ESC, scroll-lock, aria
src/styles/global.css         Tailwind v4 @theme tokens
src/pages/index.astro         placeholder ("Official Portal Rebuild" card)
src/pages/bm/index.astro      BM placeholder
```
- `npm run check` → **0 errors, 0 warnings**
- `npm run build` → static, **2 pages, 177 KB total** (`index.html` 38,817 B)

### 7.2 Design tokens — a disciplined refinement of the legacy palette
```css
--color-base:             #fcfbf9;  /* warm off-white (new) */
--color-brand-maroon:     #5e2b2a;  /* ← identical to legacy primary */
--color-brand-maroon-dark:  #4a1f1e;/* new shade */
--color-brand-maroon-light: #733635;/* new shade */
--color-brand-gold:       #be9267;  /* ← identical to legacy accent */
--color-brand-gold-hover: #a87e55;  /* new */
--color-brand-cream:      #f2e9e0;  /* ← identical to legacy surface */
--color-brand-sand:       #ded7c5;  /* new */
--color-brand-ink:        #212529;  /* ← identical to legacy body text */
--color-brand-muted:      #6c757d;
--color-brand-border:     #e5e0d8;
```
The rebuild keeps the three colours that *are* the brand and **drops the legacy `#e85d04`
orange** for a calmer maroon-and-gold duotone. Defensible — but make it a documented decision,
because orange still drives live hover states and filter chips on the old site.

### 7.3 Where the new site already beats the old
- 3.9× smaller homepage HTML; one stylesheet instead of fifteen
- Real `hreflang` + correct `lang="ms"` for BM (legacy has neither)
- Canonical URLs; OG title/description (legacy ships neither)
- Mega-menu is CSS-only (no jQuery); drawer has a **focus trap, ESC handling, scroll lock**
- Skip-link; `sr-only` brand text; `rel="noopener noreferrer"` on external links
- Locale-aware date formatting (`en-MY` / `ms-MY`)

### 7.4 Gaps to close
**Features the old site has that this one lacks:**
- The entire homepage (video hero, split slider, announcements, quick-links, video gallery,
  partner logos, map, contact block)
- All content pages (64) and all utility pages (11)
- Footer (government logos, legal links, hit counter, "last updated")
- Font-size controls (an accessibility feature worth keeping)
- Search (currently a non-functional icon button)
- Quickbar panel

**Infrastructure:**
- Fonts — none loaded; system stack only
- Data/CMS layer for the 11 media collections
- `robots.txt`, `sitemap.xml`, a 404 page
- Redirect map from the ~75 legacy `.cfm` URLs — **and from the older `.asp` and `ysnet.org.my` paths, which the 2016 migration proved are still crawled**
- Analytics
- Real `og:image` (currently defaults to `favicon.svg`)

**i18n label drift** — `nav.ts` BM labels differ from the live BM site in ~15 places.
Reconcile before launch (these are the live BM strings):
| nav.ts (proposed) | Live BM (actual) |
|---|---|
| Tentang Kami | **Mengenai** |
| Prakata | **Perutusan** |
| Bekas Pengerusi… | **Mantan-Mantan Pengerusi…** |
| Pasukan Pengurusan | **Barisan Pengurusan** |
| Mercu Tanda *(milestones)* | **Pencapaian** |
| Pembuatan | **Perkilangan** |
| Agro Perladangan | **Agroperladangan** |
| Pusat Transformasi Bandar (UTC) | **UTC** |
| Cawangan YS Kuala Lumpur | **Pejabat Cawangan Yayasan Sabah Kuala Lumpur** |
| Anak-Anak Syarikat | **Anak Syarikat** |
| Pemuliharaan & Pengurusan Alam Sekitar | **Konservasi dan Pengurusan Alam Sekitar** |

---

## 8. Recommendations

### Do not carry over
1. **The multi-megabyte images.** AVIF/WebP with responsive `srcset`; the 8.9 MB poster alone is
   ~60× the size of the entire new homepage HTML.
2. **Zero caching.** Long-lived immutable caching for hashed assets.
3. **POST-based year filters** → GET query params or pre-generated static archive routes.
4. **The six-font loading strategy.** Two families, `woff2`, `font-display: swap`.
5. **The preloader.** It hides a slow page behind a spinner; fix the weight instead.
6. **`background-attachment: fixed`** — janky on mobile; use a static or `transform`-based effect.
7. **The dead search box** — implement real search or remove the affordance.
8. **Hard-coded Google Maps API key** — environment variable or keyless embed.

### Fix in the rebuild (content & SEO)
9. Publish a proper **redirect map** before launch: `.cfm` → new paths, *and* keep the
   2016-era `.asp` and `ysnet.org.my` redirects working — they are still indexed.
10. Reconcile **BM nav labels** with the live site (§7.4).
11. Resolve the **board of trustees** content — it exists, it is hidden in comments.
12. Write **real FAQ questions**; the current 26 are placeholders.
13. Add **`robots.txt` + `sitemap.xml`** (both locales) and a 404 page.
14. Model the **12 directory pages as structured data** — they are phone listings, not prose,
    and the MTM page alone has ~50 floor-keyed entries with extensions.

### Architecturally
15. Content collections (`src/content/`) for prose, people, timeline, directory, FAQ.
16. The 11 media collections need a **build-time data source** — headless CMS, markdown, or a
    one-time migration export from the ColdFusion database.
17. Keep the **"Get in Touch" block as one reusable component** — the legacy site re-renders
    the same 8 departmental contact groups on every page.
18. **Position the project correctly internally.** The 2026 reskin proves the org already
    invested in appearance; this rebuild's case rests on platform risk, performance and
    editorial maintainability — not on aesthetics.

---

## Appendix A — Legacy URL → new route map

| Legacy | New |
|---|---|
| `index.cfm` | `/` |
| `bm/index.cfm` | `/bm/` |
| `foreword_ys_director.cfm` | `/about/foreword/` |
| `introduction.cfm` | `/about/introduction/` |
| `corporate_structure.cfm` | `/about/corporate-structure/` |
| `board_trustees.cfm` | `/about/board-of-trustees/` |
| `menara_tun_mustapha_uniqueness.cfm` | `/about/menara-tun-mustapha/` |
| `milestone.cfm` | `/about/milestones/` |
| `zone_activities.cfm` | `/activities/zone-activities/` |
| `conservation_management.cfm` | `/activities/conservation-management/` |
| `directory_tun_mustapha.cfm` | `/directory/menara-tun-mustapha/` |
| `directory_zone.cfm` | `/directory/zone-offices/` |
| `press_release.cfm` | `/media/press-release/` |
| `contact.cfm` | `/contact/` |

*(all 64 nav entries follow `snake_case.cfm` → `/section/kebab-case/`; the BM twin is the same
path under `/bm/`)*

**Also redirect (pre-2016, still crawled):**
`ysnet.org.my` → site root · `default.asp`, `corporate.asp`, `social.asp`, `commercial.asp`,
`directory.asp`, `service.asp`, `link.asp`, `library.asp`, `palm.asp` → their modern equivalents.

## Appendix B — Key brand facts (verified from live content)

- **Vision:** "A Dynamic, People Oriented, Committed and Caring Organisation."
- **Mission:** "To uplift the quality of life of Malaysians in Sabah."
- **Tagline:** "Developing People Towards Progress" · Values strip: *Dynamic · People Oriented · Caring · Committed*
- **7 Core Values:** Honest, Committed, Caring, Dynamic, Firm, Resilient, Result-Oriented
  *(BM: Jujur, Komited, Prihatin, Dinamik, Tegas, Cekal, Berorientasikan Hasil)*
- **3 Objectives:** advancement of education · relief of poverty · benevolent/charitable activities
- **Established:** 10 May 1966 — Enactment No. 8, Sabah State Legislative Assembly, 1966
- **Founder:** Tun Datu Haji Mustapha bin Datu Harun (proposed 9 Nov 1965, Mesapol, Sipitang)
- **HQ:** Menara Tun Mustapha — 30 storeys, 72-sided polygon, 2,160 glass panels,
  96 high-tensile rods, "hanging" building (4th in world when built), renamed 31 Jul 2001
- **"Yayasan Sabah Group"** name approved by Board of Trustees **16 June 2004**
- **5 conservation areas:** Danum Valley, Maliau Basin, Imbak Canyon, Silam Coast, Taliwas River
- **Anniversary:** YSG turned **60 in 2026** (60th-anniversary logo on the live homepage)
- **General enquiries:** +(60) 88 326300 · fax +(60) 88 213227 · ysinfo@ysnet.org.my
