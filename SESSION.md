# Session Record — YSG Website Rebuild

> Working notes for continuing this project.
> **Current brief: the landing page (§4).** Research behind it: §5. Navbar: §3.

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
HEAD:    d0e3e99 "navbar"      (site chrome + i18n + nav)
Parent:  f219347 "update"      (deleted AGENTS.md, CLAUDE.md; added .gitignore)
Root:    7420ee5 "Initial commit from Astro"
```

**Uncommitted:**
- `M src/components/Header.astro` — the navbar pin-open interaction (§3)
- `?? docs/` — `docs/research/YSG-WEBSITE-ANALYSIS.md`, the research deliverable
- `?? SESSION.md` — this file

Build: `npm run check` → 0 errors. `npm run build` → static, 2 pages
(`/index.html`, `/bm/index.html`).

---

## 3. Navbar interaction (this session's work)

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

## 4. ACTIVE BRIEF — Landing page (the service hub)

**Status: NOT STARTED. Brief received 13 Oct 2026, no code written yet.**

Full spec was supplied by the user (duplicated in conversation, ~8 sections). Summary:

> Transform the area **below the existing navbar** into a service hub. **Do not touch,
> rename or duplicate the navbar.** Feel: official Sabah government-linked org —
> professional, trustworthy, accessible. Usability over decoration.

### Required sections, in order
1. Existing navbar — **preserve untouched**
2. **A. Hero / welcome** — Sabah visual (Menara Tun Mustapha etc.), short heading, one
   primary CTA to services. *No invented slogans, claims or statistics.*
3. **B. Find a Service** — search field, placeholder *"What are you looking for?"*.
   UI first; can wire real search later. (Good island candidate if it needs to filter.)
4. **C. Popular Services** — **most important section.** Card grid: icon, title,
   short description, visible action, verified link. Six categories (§5 below).
   Must sit **high on the page** — no scrolling past corporate news to reach services.
5. **D. Important Announcements** — title + **publication date** + description,
   deadline highlighted, link. *Must be structured/CMS-ready.* No fabricated deadlines.
6. **E. Latest News & Events** — ~3 items, thumbnail + title + date + excerpt + link.
   Visually engaging but **secondary** to services.
7. **F. Discover YSG** — mission/objectives + business areas from official content only.
8. **G. Help & Contact** — FAQ, contact, directory, feedback, support channels.
9. Existing footer (none exists yet — see §7).

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
| `src/pages/index.astro`, `src/pages/bm/index.astro` | placeholder pages only |
| `astro.config.mjs` | site URL + i18n config (en default, `/bm/`) |
| `docs/research/YSG-WEBSITE-ANALYSIS.md` | full research deliverable |

### Design tokens
Defined in `src/styles/global.css` via Tailwind v4 `@theme`:

| Token | Value |
|---|---|
| `--color-base` | `#fcfbf9` |
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

## 7. What's left to build (~95% of the site)

Only the chrome exists. Still needed:

- **Homepage** (currently a placeholder)
- **64 content pages** — About (20), Activities + Directory (32), Media + utility (21)
- **11 utility pages**
- **Footer**
- **Data layer** — 11 media collections requiring a build-time source:
  press releases (2014→), photo albums (92 in 2026, ~845 images), publications back to
  **1977**, calendar (~117 events/yr), videos, annual reports, corporate ads, tender
  notices, awards, milestones, announcements, contact form.

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

1. **Build the landing page (§4)** — the active brief. Sections A–G, navbar untouched.
   Design decision to settle first: is Section B search an island or a plain `<script>`?
2. **Answer the nav open question** (§3) — does the section index stay reachable?
3. **Settle the PTPS question** (§5) — moves the scholarship count 42 → 48, and decides
   whether Section C lists 1 or 6 education-aid cards.
4. Correct `docs/research/YSG-WEBSITE-ANALYSIS.md` — `ysnet.org.my` domain + 2009 ASP date.
5. Eyeball the navbar hover states in a real browser (§3 harness caveat)
6. Commit the uncommitted work (`Header.astro` + `docs/` + `SESSION.md`)
7. Footer (spec §4.9 assumes one exists — it doesn't yet)
8. Source hero imagery — Menara Tun Mustapha / Sabah visual (§5)
9. Content collections for the 11 media collections + announcements (spec §D must be CMS-ready)
10. Redirect map for `.cfm` URLs; also decide the orphaned Fisheries page (§5)
11. Start on the 64 content pages
