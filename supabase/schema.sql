-- ==============================================================================
-- YAYASAN SABAH GROUP - MASTER SUPABASE / POSTGRESQL SCHEMA
-- Compatible with Supabase and standard PostgreSQL 15+
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 2. ADMIN AUTHENTICATION TABLE & FUNCTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admins (
  admin_id SERIAL PRIMARY KEY,
  admin_username TEXT NOT NULL UNIQUE,
  admin_password TEXT NOT NULL, -- Encrypted using crypt(p_password, gen_salt('bf', 10))
  admin_status INT NOT NULL DEFAULT 1, -- 1: Active, 0: Disabled
  role TEXT NOT NULL DEFAULT 'admin', -- 'superadmin', 'admin', 'editor'
  last_login TIMESTAMPTZ,
  last_logout TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Block public direct access to admins table (access is strictly via SECURITY DEFINER RPC)
CREATE POLICY "Admins restricted table"
  ON public.admins
  FOR ALL
  TO public
  USING (false);

-- RPC: Verify Admin Login
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  admin_id INT,
  admin_username TEXT,
  admin_status INT,
  role TEXT,
  last_login TIMESTAMPTZ,
  last_logout TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin public.admins%ROWTYPE;
BEGIN
  SELECT *
  INTO v_admin
  FROM public.admins
  WHERE admins.admin_username = LOWER(TRIM(p_username))
    AND admins.admin_status = 1
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_admin.admin_password = crypt(p_password, v_admin.admin_password) THEN
    UPDATE public.admins
    SET last_login = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE admins.admin_id = v_admin.admin_id;

    RETURN QUERY
    SELECT
      v_admin.admin_id,
      v_admin.admin_username,
      v_admin.admin_status,
      v_admin.role,
      timezone('utc'::text, now()) AS last_login,
      v_admin.last_logout;
  END IF;

  RETURN;
END;
$$;

-- RPC: Record Admin Logout
CREATE OR REPLACE FUNCTION public.record_admin_logout(
  p_admin_id INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admins
  SET last_logout = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE admins.admin_id = p_admin_id;
END;
$$;

-- Starter admin seed (only inserts if table is empty)
-- Default username: admin | Default password: admin123
INSERT INTO public.admins (admin_username, admin_password, admin_status, role)
SELECT
  'admin',
  crypt('admin123', gen_salt('bf', 10)),
  1,
  'superadmin'
WHERE NOT EXISTS (SELECT 1 FROM public.admins WHERE admin_username = 'admin');

-- ==============================================================================
-- 3. ALBUMS & PHOTOS (HOME SLIDER)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.albums (
  album_id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  type TEXT NOT NULL DEFAULT 'poster' CHECK (type IN ('poster', 'event')),
  title_en TEXT NOT NULL,
  title_bm TEXT NOT NULL,
  description_en TEXT,
  description_bm TEXT,
  event_date DATE,
  event_end_date DATE,
  venue TEXT,
  cta_label_en TEXT,
  cta_label_bm TEXT,
  cta_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  status INT NOT NULL DEFAULT 2, -- 1: Draft, 2: Published, 3: Archived
  created_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  updated_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.album_photos (
  photo_id SERIAL PRIMARY KEY,
  album_id INT NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption_en TEXT,
  caption_bm TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_albums_featured ON public.albums(is_featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_album_photos_sort ON public.album_photos(album_id, sort_order);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published albums"
  ON public.albums FOR SELECT TO public
  USING (status = 2);

CREATE POLICY "Public read album photos"
  ON public.album_photos FOR SELECT TO public
  USING (true);

-- ==============================================================================
-- 4. ANNOUNCEMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  announcement_id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  title_en TEXT NOT NULL,
  title_bm TEXT NOT NULL,
  content_en TEXT,
  content_bm TEXT,
  banner_url TEXT,
  attachment_url TEXT,
  status INT NOT NULL DEFAULT 2, -- 1: Draft, 2: Published, 3: Archived
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ,
  created_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  updated_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published announcements"
  ON public.announcements FOR SELECT TO public
  USING (status = 2);

-- ==============================================================================
-- 5. NEWS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.news (
  news_id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_bm TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_bm TEXT,
  content_en TEXT NOT NULL,
  content_bm TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT DEFAULT 'Corporate',
  status INT NOT NULL DEFAULT 2, -- 1: Draft, 2: Published, 3: Archived
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  updated_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published news"
  ON public.news FOR SELECT TO public
  USING (status = 2);

-- ==============================================================================
-- 6. QUICK LINKS / QUICK ACCESS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.quick_links (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_bm TEXT NOT NULL,
  href_en TEXT NOT NULL,
  href_bm TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  external BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  updated_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read quick links"
  ON public.quick_links FOR SELECT TO public
  USING (true);

-- ==============================================================================
-- 7. FEEDBACK / CONTACT SUBMISSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  feedback_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status INT NOT NULL DEFAULT 1, -- 1: New, 2: In Review, 3: Resolved
  resolved_by INT REFERENCES public.admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit feedback"
  ON public.feedback FOR INSERT TO public
  WITH CHECK (true);

-- ==============================================================================
-- 8. IMAGE PATH CLEANUP & FIX SCRIPT
-- Updates legacy .jpg/.png references to clean paths matching src/assets/
-- ==============================================================================

-- Announcements image path cleanup
UPDATE public.announcements
SET banner_url = '/images/announcements/taska-ria-2027.webp'
WHERE banner_url ILIKE '%taska-ria-2027%';

UPDATE public.announcements
SET banner_url = '/images/announcements/pesta-buku-2026.webp'
WHERE banner_url ILIKE '%pesta-buku-2026%';

UPDATE public.announcements
SET banner_url = '/images/announcements/bppp-portal.webp'
WHERE banner_url ILIKE '%bppp-portal%';

-- News image path cleanup
UPDATE public.news
SET cover_image_url = '/images/news/national-day-champion.webp'
WHERE cover_image_url ILIKE '%national-day-champion%';

UPDATE public.news
SET cover_image_url = '/images/news/pesawi-2026.webp'
WHERE cover_image_url ILIKE '%pesawi-2026%';

UPDATE public.news
SET cover_image_url = '/images/news/scholarships-presentation.webp'
WHERE cover_image_url ILIKE '%scholarships-presentation%';
