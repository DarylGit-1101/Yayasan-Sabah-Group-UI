import { adminState } from './store';
import { switchTab } from './navigation';
import { openAlbumModal } from './albums';
import { openPhotosDrawer } from './photosDrawer';
import { renderAnnouncements } from './announcements';

export function renderOverviewAlbums() {
  const container = document.getElementById('overview-live-albums');
  if (!container) return;

  const featured = adminState.currentLoadedAlbums.filter((a) => a.is_featured && a.status === 2);
  if (featured.length === 0) {
    container.innerHTML = `<div class="p-8 text-center font-mono text-xs text-brand-muted">No albums currently marked On-Air.</div>`;
    return;
  }

  container.innerHTML = featured
    .slice(0, 5)
    .map((album, idx) => {
      const photos = album.album_photos || [];
      const cover = photos[0]?.image_url;
      const seq = String(idx + 1).padStart(2, '0');
      return `
        <div class="group flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-brand-cream/25">
          <div class="flex items-center gap-3.5 min-w-0">
            <span class="font-mono text-xs font-semibold text-brand-gold tabular-nums">${seq}</span>
            <div class="relative h-11 w-18 shrink-0 overflow-hidden rounded-md border border-brand-border bg-brand-maroon-dark">
              ${
                cover
                  ? `<img src="${cover}" alt="" class="size-full object-cover" />`
                  : `<div class="flex size-full items-center justify-center font-mono text-[9px] text-brand-cream/50">EMPTY</div>`
              }
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate text-xs font-bold text-brand-ink">${album.title_en}</p>
                <span class="rounded border border-brand-border bg-brand-surface px-1.5 py-0.2 font-mono text-[9px] uppercase text-brand-maroon">${album.type}</span>
              </div>
              <p class="mt-0.5 truncate text-[11px] text-brand-muted">${photos.length} frame${photos.length === 1 ? '' : 's'} · ${album.event_date || 'Ongoing'}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-overview-album-photos="${album.album_id}"
              class="rounded-md border border-brand-border bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-brand-maroon transition hover:border-brand-maroon hover:bg-brand-cream/30 cursor-pointer"
            >
              Frames (${photos.length})
            </button>
            <button
              type="button"
              data-overview-album-edit="${album.album_id}"
              class="rounded-md border border-brand-border bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-brand-maroon transition hover:border-brand-maroon hover:bg-brand-cream/30 cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

export function renderOverviewNotices() {
  const container = document.getElementById('overview-live-notices');
  if (!container) return;

  const active = adminState.currentLoadedAnnouncements.filter((a) => a.status === 2);
  if (active.length === 0) {
    container.innerHTML = `<div class="p-8 text-center font-mono text-xs text-brand-muted">No active public notices.</div>`;
    return;
  }

  container.innerHTML = active
    .slice(0, 6)
    .map((item) => {
      const dateStr = item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })
        : '';
      return `
        <button
          type="button"
          data-overview-notice-id="${item.announcement_id}"
          class="group flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-brand-cream/25 cursor-pointer"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              ${
                item.is_pinned
                  ? `<span class="rounded bg-brand-maroon px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-brand-gold">PIN</span>`
                  : `<span class="size-1.5 rounded-full bg-emerald-500"></span>`
              }
              <p class="truncate text-xs font-semibold text-brand-ink group-hover:text-brand-maroon">${item.title_en}</p>
            </div>
            <p class="mt-0.5 truncate text-[11px] text-brand-muted">${item.title_bm || item.title_en}</p>
          </div>
          <span class="shrink-0 font-mono text-[10px] text-brand-muted">${dateStr}</span>
        </button>
      `;
    })
    .join('');
}

export function initOverviewListeners() {
  document.getElementById('overview-live-albums')?.addEventListener('click', (e) => {
    const photosBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-overview-album-photos]');
    if (photosBtn) {
      const id = Number(photosBtn.dataset.overviewAlbumPhotos);
      const album = adminState.currentLoadedAlbums.find((a) => a.album_id === id);
      if (album) openPhotosDrawer(album);
      return;
    }
    const editBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-overview-album-edit]');
    if (editBtn) {
      const id = Number(editBtn.dataset.overviewAlbumEdit);
      const album = adminState.currentLoadedAlbums.find((a) => a.album_id === id);
      if (album) openAlbumModal(album);
    }
  });

  document.getElementById('overview-live-notices')?.addEventListener('click', (e) => {
    const noticeBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-overview-notice-id]');
    if (!noticeBtn) return;
    adminState.selectedAnnouncementId = Number(noticeBtn.dataset.overviewNoticeId);
    switchTab('announcements');
    renderAnnouncements();
  });
}
