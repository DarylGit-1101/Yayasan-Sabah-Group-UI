import { supabase } from '../../db/supabase';
import type { AlbumRow, AlbumPhotoRow, AnnouncementRow } from '../../types';

export const STORAGE_KEY = 'ysg_admin_session';
export const STATS_CACHE_KEY = 'ysg_admin_stats_cache';

export interface AdminSession {
  admin_id: number;
  admin_username: string;
  role: string;
  admin_status: number;
  last_login?: string;
}

export interface FullAlbum extends AlbumRow {
  album_photos?: AlbumPhotoRow[];
}

export const adminState = {
  currentLoadedAlbums: [] as FullAlbum[],
  currentLoadedAnnouncements: [] as AnnouncementRow[],
  selectedAnnouncementId: null as number | null,
  activeAnnouncementFilter: 'all' as 'all' | 'live' | 'pinned' | 'draft',
  announcementSearchQuery: '',
  inspectorLang: 'en' as 'en' | 'bm',
  activeAlbumForPhotos: null as FullAlbum | null,
  onTabChange: null as ((targetName: string) => void) | null,
};

export function getStoredSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed || !parsed.admin_id || !parsed.admin_username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStoragePathFromUrl(url: string, bucket = 'albums'): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return decodeURIComponent(url.slice(idx + marker.length));
  }
  return null;
}

export async function fetchStats() {
  const statAlbums = document.getElementById('stat-albums-count');
  const statAnnouncements = document.getElementById('stat-announcements-count');
  const statNews = document.getElementById('stat-news-count');
  const statFeedback = document.getElementById('stat-feedback-count');

  try {
    const cached = sessionStorage.getItem(STATS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (statAlbums) statAlbums.textContent = String(parsed.albums ?? 0);
      if (statAnnouncements) statAnnouncements.textContent = String(parsed.announcements ?? 0);
      if (statNews) statNews.textContent = String(parsed.news ?? 0);
      if (statFeedback) statFeedback.textContent = String(parsed.feedback ?? 0);
    }
  } catch {
    // Ignore cache read failures
  }

  try {
    const [albumsRes, announceRes, newsRes, feedbackRes] = await Promise.all([
      supabase.from('albums').select('album_id', { count: 'exact', head: true }),
      supabase.from('announcements').select('announcement_id', { count: 'exact', head: true }),
      supabase.from('news').select('news_id', { count: 'exact', head: true }),
      supabase.from('feedback').select('feedback_id', { count: 'exact', head: true }),
    ]);

    const freshStats = {
      albums: albumsRes.count ?? 0,
      announcements: announceRes.count ?? 0,
      news: newsRes.count ?? 0,
      feedback: feedbackRes.count ?? 0,
    };

    if (statAlbums) statAlbums.textContent = String(freshStats.albums);
    if (statAnnouncements) statAnnouncements.textContent = String(freshStats.announcements);
    if (statNews) statNews.textContent = String(freshStats.news);
    if (statFeedback) statFeedback.textContent = String(freshStats.feedback);

    sessionStorage.setItem(STATS_CACHE_KEY, JSON.stringify(freshStats));
  } catch {
    // Offline fallback
  }
}
