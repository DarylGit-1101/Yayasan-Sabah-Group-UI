# Admin components

Reserved for the authority area (`/admin/`). Not routed — pages import these.

Conventions follow the public site: Tailwind tokens from `src/styles/global.css`,
white cards on `bg-brand-surface`, gold eyebrow + maroon heading.

Planned panels:

- `FeedbackInbox` — read-only list of `feedback` rows (admin-only via RLS)
- `NewsTable` — list + edit form for `news`
- `AnnouncementForm` — create/edit, including `expires_at`

Keep these client-side only; data access is authorised by Supabase RLS, not by
which component is rendered.
