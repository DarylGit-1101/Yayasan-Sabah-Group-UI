# Session Record — YSG Website Rebuild

> Working notes for continuing this project.
> **Landing page: BUILT (§4).** Research behind it: §5. Navbar: §3.
> **Last reconciled with the code: 23 Oct 2026.**

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
Build:   npm run check -> 0 errors, 0 warnings, 0 hints across 43 files.
Routes:  npm run build -> static, 13 routes:
         - /
         - /bm/
         - /contact/
         - /bm/contact/
         - /admin/
         - /admin/login/
         - /admin/dashboard/
         - 3 news articles × EN/BM (/media/news/[slug]/ and /bm/media/news/[slug]/)
Images:  37 build-time optimized WebP images compiled into dist/_astro/
```

**Key Master Files:**
- `supabase/schema.sql` — Canonical master PostgreSQL / Supabase migration script (tables, RPC auth, indexes, RLS).
- `src/assets/` — Categorized local asset library (`albums`, `announcements`, `news`, `partners`, `quick-links`).

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

**Status: implemented & verified.**

### Sections, in order — implementation map

| # | Brief section | File | State |
|---|---|---|---|
| 1 | Existing navbar — preserve untouched | `src/components/Header.astro` | untouched since §3 |
| 2 | **Hero / welcome** | `home/Hero.astro` | done — video hero, 2 CTAs, "since 1966" card |
| 3 | **Highlights / Split Slider** | `home/HomeSlider.astro` | **done — edge-to-edge split slider, story progress bar, auto photo/album progression (4.5s), Astro `<Image />` pipeline** |
| 4 | ~~**Find a Service**~~ | — | **DROPPED — search is in header `SiteSearch`** |
| 5 | **Popular Services** | `home/QuickAccess.astro` + `home/QuickAccessCard.astro` | **done — flex-wrap horizontally centered layout, Supabase-driven** |
| 6 | **Important Announcements** | `home/Announcements.astro` | **done — carousel with Astro `<Image />` optimization** |
| 7 | **Latest News & Events** | `home/LatestNews.astro` + `pages/media/news/[slug].astro` (EN/BM) | **done — DB-driven with Astro `<Image />` optimization** |
| 8 | **Discover YSG** | `home/DiscoverYSG.astro` | done — copy + 4 stat tiles |
| 9 | **Help & Contact** | `home/HelpContact.astro` | done — 2 of the 5 channels |
| 10 | **Affiliates & Partners** | `home/GroupLinks.astro` | **done — infinite marquee loop with Astro `<Image />` logos** |
| 11 | Footer | `src/components/Footer.astro` | done — 4-column footer |

---

## 5. Highlights Split Slider (`HomeSlider.astro`) — Finalized

Direct replacement for the legacy ColdFusion 120-image slider. Sits directly below the hero video.

- **Layout:** Edge-to-edge full bleed (`bg-neutral-800`), split into 40% info panel on the left and 60% stage on the right.
- **Top Story Bar:** Thin 2px white indicator bar that smoothly expands to 6px on hover, tracking elapsed time per photo.
- **Left Panel:** Watermark YSG logo, golden date range, title, description, dynamic CTA button, and borderless chevrons `<` and `>`.
- **Right Stage:** Standardized 1280×720 aspect ratio with gradient mask blending the left panel smoothly into the photo.
- **Photo Switching:** Hover side chevrons for intra-album navigation; auto-advances photos every 4.5s via `requestAnimationFrame` and loops across albums.
- **Data Source:** Driven by `public.albums` and `public.album_photos` in Supabase (`sort_order ASC`, `event_date DESC`).

---

## 6. Admin Authentication System — Finalized

- **Custom Credential Store:** Uses custom `public.admins` table instead of public Supabase Auth sign-ups (public registration is blocked; accounts must be provisioned internally).
- **Password Security:** Passwords hashed with standard PostgreSQL `pgcrypto` (`crypt(password, gen_salt('bf', 10))`).
- **RPC Login:** `verify_admin_login(p_username, p_password)` is a `SECURITY DEFINER` function that validates username/password, verifies active status (`admin_status = 1`), updates `last_login`, and returns session details without exposing the password hash.
- **RPC Logout:** `record_admin_logout(p_admin_id)` logs departure timestamp.
- **Frontend Guard:** `/admin/login` accepts username/password and stores user data in browser `sessionStorage['ysg_admin_session']`. `/admin/dashboard` automatically checks session presence and redirects to `/admin/login` if absent.

---

## 7. Asset Optimization & Image Pipeline — Finalized

- **Directory Structure:** All local media moved into `src/assets/{albums, announcements, news, partners, quick-links}`.
- **Astro Image Pipeline:** Integrated `astro:assets` `<Image />` with `import.meta.glob` across `HomeSlider`, `Announcements`, `GroupLinks`, `LatestNews`, and news detail pages.
- **Massive Payload Reduction:**
  - `taska-ria-2027.jpg` (8.88 MB uncompressed) was replaced with modern WebP, compiling down to ~20 KB in the build output.
  - Total initial media weight dropped by >90%.
- **Build Output:** Astro builds 37 optimized WebP images into `dist/_astro/` automatically with zero layout shift.

---

## 8. Key Files

| File | Role |
|---|---|
| `supabase/schema.sql` | Master PostgreSQL schema, tables, indexes, RLS, and RPC auth functions |
| `src/data/nav.ts` | 64-item EN/BM nav — faithful 1:1 port of the legacy IA |
| `src/i18n/ui.ts` | Translation keys, locale routing, hreflang helpers |
| `src/styles/global.css` | Tailwind v4 `@theme` design tokens |
| `src/layouts/Base.astro` | SEO head (canonical, hreflang ×3, OG, skip-link) |
| `src/components/Header.astro` | Site chrome + the pin-open dropdown interaction |
| `src/components/home/HomeSlider.astro` | Edge-to-edge highlights slider below hero |
| `src/components/home/QuickAccess.astro` | Centered flex-wrap service cards |
| `src/components/home/GroupLinks.astro` | Infinite marquee partner links |
| `src/pages/admin/login.astro` | Custom username/password admin login |
| `src/pages/admin/dashboard.astro` | Admin dashboard layout & auth guard |
| `src/db/supabase.ts` | Supabase client + re-exports `src/types/*` |
| `src/types/*.db.ts` | Row types: admin, album, news, announcement, quick links, etc. |

---

## 9. What's Left to Build

- **Admin Content Panels:** UI forms inside `/admin/dashboard` for managing albums/photos, announcements, and news.
- **64 Content Pages:** About (20), Activities + Directory (32), Media + utility (21).
- **11 Utility Pages:** Privacy policy, disclaimer, FAQ page, etc.
- **Dead Internal Links:** Connecting remaining landing-page CTAs to real pages.
- **Vanta Background Evaluation:** Deciding whether to keep the external Three.js wave canvas or switch to a lightweight CSS gradient mesh.
