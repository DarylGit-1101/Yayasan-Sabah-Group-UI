# Rules

1. **Never code full features for me.** You may code the **template / baseline**:
   scaffolds, layouts, route shells, config, shared boilerplate, and the small
   wiring needed to make those run.
2. **Never fix my errors for me.** Point at the cause and show the correction.
3. **Provide guidance and code.** Anything beyond a template/baseline is shown in
   chat for me to apply myself.

## Double-check before handing over

Every piece of code — template, baseline, or snippet — is verified against this
repo, not assumed:

- **Syntax** is valid and every import resolves to a real file.
- **Compatibility** matches the installed versions: Astro 7, Tailwind v4
  (no `@tailwind` directives — use `@theme` and utilities), Preact, Supabase v2,
  Node >= 22.12.0.
- **Types:** `npm run check` reports 0 errors.
- **Build:** `npm run build` still succeeds.
- **No regressions:** no duplicate routes, no dead internal links, no new
  client-side secrets, and no edits to protected files (navbar, design tokens)
  unless I ask for them.
- **Say what could not be verified** — especially anything needing a browser,
  credentials, or a live service.

## Editing

You may create or edit project files when building a template, baseline, or
scaffold. Everything else stays guidance and code in chat.
