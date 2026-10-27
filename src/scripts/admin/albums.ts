import { supabase } from '../../db/supabase';
import { adminState, fetchStats, getStoragePathFromUrl, slugify, type FullAlbum } from './store';
import { renderOverviewAlbums } from './overview';
import { openPhotosDrawer, uploadAndAttachPhotoToAlbum } from './photosDrawer';

let stagedModalFiles: File[] = [];

function renderStagedModalFiles() {
  const listEl = document.getElementById('album-modal-staged-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (stagedModalFiles.length === 0) {
    listEl.classList.add('hidden');
    listEl.classList.remove('grid');
    return;
  }

  listEl.classList.remove('hidden');
  listEl.classList.add('grid');

  stagedModalFiles.forEach((file, idx) => {
    const thumbUrl = URL.createObjectURL(file);
    const item = document.createElement('div');
    item.className = 'relative aspect-16/10 overflow-hidden rounded-lg border border-brand-border bg-brand-maroon-dark';
    item.innerHTML = `
      <img src="${thumbUrl}" alt="" class="size-full object-cover" />
      <span class="absolute bottom-1 left-1 rounded bg-brand-maroon-dark/85 px-1.5 py-0.5 font-mono text-[9px] font-bold text-brand-gold">
        #${idx + 1}
      </span>
      <button
        type="button"
        data-remove-staged="${idx}"
        class="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
        title="Remove queued frame"
      >&times;</button>
    `;
    listEl.appendChild(item);
  });

  listEl.querySelectorAll<HTMLButtonElement>('[data-remove-staged]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.removeStaged);
      stagedModalFiles.splice(idx, 1);
      renderStagedModalFiles();
    });
  });
}

export async function fetchAlbums(silent = false) {
  const albumsGrid = document.getElementById('albums-grid');
  const albumsLoading = document.getElementById('albums-loading');
  const albumsEmpty = document.getElementById('albums-empty');
  if (!albumsGrid || !albumsLoading || !albumsEmpty) return;

  if (adminState.currentLoadedAlbums.length === 0 && !silent) {
    albumsLoading.classList.remove('hidden');
    albumsEmpty.classList.add('hidden');
    albumsGrid.classList.add('hidden');
  }

  try {
    const { data, error } = await supabase
      .from('albums')
      .select('*, album_photos(*)')
      .order('sort_order', { ascending: true })
      .order('event_date', { ascending: false });

    albumsLoading.classList.add('hidden');

    if (error || !data || data.length === 0) {
      if (adminState.currentLoadedAlbums.length === 0) {
        albumsEmpty.classList.remove('hidden');
      }
      renderOverviewAlbums();
      return;
    }

    const freshAlbums = (data as FullAlbum[]).map((a) => ({
      ...a,
      album_photos: (a.album_photos || []).sort(
        (p1, p2) => (p1.sort_order ?? 0) - (p2.sort_order ?? 0) || p1.photo_id - p2.photo_id
      ),
    }));

    const hasChanged = JSON.stringify(freshAlbums) !== JSON.stringify(adminState.currentLoadedAlbums);
    if (hasChanged || albumsGrid.children.length === 0) {
      adminState.currentLoadedAlbums = freshAlbums;
      renderAlbums(adminState.currentLoadedAlbums);
      renderOverviewAlbums();
    }

    albumsEmpty.classList.add('hidden');
    albumsGrid.classList.remove('hidden');
  } catch {
    albumsLoading.classList.add('hidden');
    if (adminState.currentLoadedAlbums.length === 0) {
      albumsEmpty.classList.remove('hidden');
    }
  }
}

export function renderAlbums(albums: FullAlbum[]) {
  const albumsGrid = document.getElementById('albums-grid');
  if (!albumsGrid) return;
  albumsGrid.innerHTML = '';

  albums.forEach((album, idx) => {
    const photos = album.album_photos || [];
    const firstPhoto = photos[0];
    const seqNum = String(idx + 1).padStart(2, '0');
    const card = document.createElement('div');
    card.id = `album-card-${album.album_id}`;
    card.className = 'flex flex-col justify-between overflow-hidden rounded-xl border border-brand-border bg-white shadow-2xs transition hover:border-brand-gold';

    const miniStrip = photos.slice(0, 5).map((p) => `
      <img src="${p.image_url}" alt="" class="h-7 w-10 rounded-xs object-cover border border-white/25 bg-brand-maroon-dark" />
    `).join('');

    card.innerHTML = `
      <div>
        <!-- Stage Preview & Contact Sheet Strip -->
        <div
          data-action="manage-photos"
          data-album-id="${album.album_id}"
          class="group/thumb relative aspect-video w-full cursor-pointer overflow-hidden bg-brand-maroon-dark"
          title="Open filmstrip sequencer"
        >
          <div data-album-img-wrap class="size-full">
            ${
              firstPhoto
                ? `<img src="${firstPhoto.image_url}" alt="${album.title_en}" class="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-[1.03]" />`
                : `<div class="flex h-full items-center justify-center font-mono text-xs text-brand-cream/60">EMPTY STAGE · CLICK TO ADD FRAMES</div>`
            }
          </div>

          <!-- Top Bar Overlay -->
          <div class="absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-brand-maroon-dark/85 via-brand-maroon-dark/35 to-transparent p-3" onclick="event.stopPropagation()">
            <div class="flex items-center gap-1.5">
              <span class="rounded bg-brand-maroon-dark/85 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-gold border border-white/15">
                #${seqNum}
              </span>
              <span class="rounded bg-brand-maroon-dark/85 px-2 py-0.5 font-mono text-[10px] uppercase text-brand-cream border border-white/15">
                ${album.type === 'poster' ? 'POSTER' : 'EVENT'}
              </span>
              ${
                album.status === 1
                  ? `<span class="rounded bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">DRAFT</span>`
                  : album.status === 3
                  ? `<span class="rounded bg-brand-maroon px-2 py-0.5 font-mono text-[10px] uppercase text-brand-cream/70">ARCHIVED</span>`
                  : ''
              }
            </div>

            <button
              type="button"
              data-action="toggle-featured"
              data-album-id="${album.album_id}"
              data-featured="${album.is_featured}"
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition cursor-pointer ${
                album.is_featured
                  ? 'bg-brand-gold text-white hover:bg-brand-gold-hover'
                  : 'bg-brand-maroon-dark/80 text-brand-cream/80 border border-white/15 hover:bg-brand-maroon-dark'
              }"
            >
              <span class="size-1.5 rounded-full ${album.is_featured ? 'bg-white' : 'bg-brand-cream/40'}"></span>
              <span>${album.is_featured ? 'ON-AIR' : 'STANDBY'}</span>
            </button>
          </div>

          <!-- Bottom Filmstrip Contact Sheet Overlay -->
          <div class="absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-brand-maroon-dark/90 via-brand-maroon-dark/45 to-transparent p-3">
            <div class="flex items-center gap-1 overflow-hidden">
              ${miniStrip}
            </div>
            <span data-album-count class="shrink-0 rounded bg-brand-maroon-dark/85 px-2 py-0.5 font-mono text-[10px] text-brand-cream border border-white/15">
              ${photos.length} frame${photos.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <!-- Metadata Body -->
        <div class="p-4">
          <div class="flex items-center justify-between gap-2 font-mono text-[10px] text-brand-muted">
            <span>${album.event_date || 'NO DATE'}</span>
            <span>SORT: ${album.sort_order}</span>
          </div>
          <h3 class="mt-1 text-sm font-bold text-brand-ink">${album.title_en}</h3>
          <p class="text-xs text-brand-muted">${album.title_bm}</p>
        </div>
      </div>

      <!-- Utilitarian Action Bar -->
      <div class="flex items-center justify-between border-t border-brand-border bg-brand-surface px-4 py-2.5 text-xs">
        <button type="button" data-action="manage-photos" data-album-id="${album.album_id}" data-album-btn-photos class="font-semibold text-brand-maroon hover:text-brand-maroon-dark cursor-pointer">
          Sequence Frames (${photos.length}) →
        </button>
        <div class="flex items-center gap-3">
          <button type="button" data-action="edit-album" data-album-id="${album.album_id}" class="font-medium text-brand-muted hover:text-brand-maroon cursor-pointer">
            Metadata
          </button>
          <button type="button" data-action="delete-album" data-album-id="${album.album_id}" class="font-medium text-rose-600 hover:text-rose-800 cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    `;

    albumsGrid.appendChild(card);
  });
}

export function updateAlbumCardInGrid(album: FullAlbum) {
  const card = document.getElementById(`album-card-${album.album_id}`);
  if (!card) return;
  const photos = album.album_photos || [];
  const firstPhoto = photos[0];

  const imgContainer = card.querySelector('[data-album-img-wrap]');
  if (imgContainer) {
    imgContainer.innerHTML = firstPhoto
      ? `<img src="${firstPhoto.image_url}" alt="${album.title_en}" class="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-[1.03]" />`
      : `<div class="flex h-full items-center justify-center font-mono text-xs text-brand-cream/60">EMPTY STAGE · CLICK TO ADD FRAMES</div>`;
  }

  const countBadge = card.querySelector('[data-album-count]');
  if (countBadge) {
    countBadge.textContent = `${photos.length} frame${photos.length === 1 ? '' : 's'}`;
  }

  const btnPhotos = card.querySelector('[data-album-btn-photos]');
  if (btnPhotos) {
    btnPhotos.textContent = `Sequence Frames (${photos.length}) →`;
  }
}

export function openAlbumModal(album?: FullAlbum) {
  const modalAlbum = document.getElementById('modal-album');
  const formAlbum = document.getElementById('form-album') as HTMLFormElement | null;
  const modalAlbumTitle = document.getElementById('modal-album-title');
  if (!modalAlbum || !formAlbum) return;

  formAlbum.reset();
  stagedModalFiles = [];
  renderStagedModalFiles();

  const idInput = document.getElementById('album-id') as HTMLInputElement;
  const typeInput = document.getElementById('album-type') as HTMLSelectElement;
  const statusInput = document.getElementById('album-status') as HTMLSelectElement;
  const sortInput = document.getElementById('album-sort') as HTMLInputElement;
  const titleEnInput = document.getElementById('album-title-en') as HTMLInputElement;
  const titleBmInput = document.getElementById('album-title-bm') as HTMLInputElement;
  const descEnInput = document.getElementById('album-desc-en') as HTMLTextAreaElement;
  const descBmInput = document.getElementById('album-desc-bm') as HTMLTextAreaElement;
  const dateInput = document.getElementById('album-date') as HTMLInputElement;
  const endDateInput = document.getElementById('album-end-date') as HTMLInputElement;
  const venueInput = document.getElementById('album-venue') as HTMLInputElement;
  const ctaEnInput = document.getElementById('album-cta-en') as HTMLInputElement;
  const ctaBmInput = document.getElementById('album-cta-bm') as HTMLInputElement;
  const ctaUrlInput = document.getElementById('album-cta-url') as HTMLInputElement;
  const featuredInput = document.getElementById('album-featured') as HTMLInputElement;

  if (album) {
    if (modalAlbumTitle) modalAlbumTitle.textContent = 'Edit Album';
    idInput.value = String(album.album_id);
    typeInput.value = album.type;
    statusInput.value = String(album.status ?? 2);
    sortInput.value = String(album.sort_order ?? 0);
    titleEnInput.value = album.title_en || '';
    titleBmInput.value = album.title_bm || '';
    descEnInput.value = album.description_en || '';
    descBmInput.value = album.description_bm || '';
    dateInput.value = album.event_date || '';
    endDateInput.value = album.event_end_date || '';
    venueInput.value = album.venue || '';
    ctaEnInput.value = album.cta_label_en || '';
    ctaBmInput.value = album.cta_label_bm || '';
    ctaUrlInput.value = album.cta_url || '';
    featuredInput.checked = album.is_featured === true;
  } else {
    if (modalAlbumTitle) modalAlbumTitle.textContent = 'Create New Album';
    formAlbum?.reset();
    idInput.value = '';
    statusInput.value = '2';
    sortInput.value = String(adminState.currentLoadedAlbums.length + 1);
    featuredInput.checked = true;
  }

  modalAlbum.classList.remove('hidden');
  modalAlbum.classList.add('flex');
}

export function closeAlbumModal() {
  const modalAlbum = document.getElementById('modal-album');
  const formAlbum = document.getElementById('form-album') as HTMLFormElement | null;
  modalAlbum?.classList.add('hidden');
  modalAlbum?.classList.remove('flex');
  formAlbum?.reset();
  stagedModalFiles = [];
  renderStagedModalFiles();
}

async function handleAlbumSubmit(e: SubmitEvent) {
  e.preventDefault();
  const formAlbum = document.getElementById('form-album') as HTMLFormElement | null;
  const submitBtn = document.getElementById('modal-album-submit') as HTMLButtonElement | null;
  const submitLabel = document.getElementById('modal-album-label');
  if (!formAlbum) return;

  const formData = new FormData(formAlbum);
  const albumId = formData.get('album_id') as string;
  const titleEn = (formData.get('title_en') as string).trim();

  const payload: any = {
    type: formData.get('type') as 'poster' | 'event',
    title_en: titleEn,
    title_bm: (formData.get('title_bm') as string).trim(),
    description_en: (formData.get('description_en') as string).trim() || null,
    description_bm: (formData.get('description_bm') as string).trim() || null,
    event_date: (formData.get('event_date') as string) || null,
    event_end_date: (formData.get('event_end_date') as string) || null,
    venue: (formData.get('venue') as string).trim() || null,
    cta_label_en: (formData.get('cta_label_en') as string).trim() || null,
    cta_label_bm: (formData.get('cta_label_bm') as string).trim() || null,
    cta_url: (formData.get('cta_url') as string).trim() || null,
    is_featured: formData.get('is_featured') === 'on',
    sort_order: Number(formData.get('sort_order') || 0),
    status: Number(formData.get('status') || 2),
  };

  if (!albumId) {
    payload.slug = slugify(titleEn) || `album-${Date.now()}`;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (submitLabel) submitLabel.textContent = 'Saving Album…';

  try {
    let targetAlbum: FullAlbum | null = null;

    if (albumId) {
      const { data, error } = await supabase
        .from('albums')
        .update(payload)
        .eq('album_id', Number(albumId))
        .select('*, album_photos(*)')
        .single();
      if (error) throw error;
      targetAlbum = data as FullAlbum;
    } else {
      const { data, error } = await supabase
        .from('albums')
        .insert(payload)
        .select('*, album_photos(*)')
        .single();
      if (error) throw error;
      targetAlbum = data as FullAlbum;
    }

    if (targetAlbum && stagedModalFiles.length > 0) {
      const existingCount = targetAlbum.album_photos?.length || 0;
      for (let i = 0; i < stagedModalFiles.length; i++) {
        if (submitLabel) {
          submitLabel.textContent = `Uploading photo ${i + 1} of ${stagedModalFiles.length}…`;
        }
        await uploadAndAttachPhotoToAlbum(targetAlbum, stagedModalFiles[i], existingCount + i + 1);
      }
    }

    closeAlbumModal();
    await fetchAlbums();
    fetchStats();
  } catch (err: any) {
    alert(`Error saving album: ${err.message || err}`);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (submitLabel) submitLabel.textContent = 'Save Album';
  }
}

async function toggleAlbumFeatured(album: FullAlbum) {
  const nextState = !album.is_featured;
  try {
    const { error } = await supabase
      .from('albums')
      .update({ is_featured: nextState })
      .eq('album_id', album.album_id);
    if (error) throw error;
    album.is_featured = nextState;
    renderAlbums(adminState.currentLoadedAlbums);
    renderOverviewAlbums();
  } catch (err: any) {
    alert(`Could not toggle featured state: ${err.message || err}`);
  }
}

async function deleteAlbum(album: FullAlbum) {
  const confirmed = confirm(`Are you sure you want to delete "${album.title_en}" and all its photos? This action cannot be undone.`);
  if (!confirmed) return;

  try {
    const storagePaths = (album.album_photos || [])
      .map((p) => getStoragePathFromUrl(p.image_url))
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      await supabase.storage.from('albums').remove(storagePaths);
    }

    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('album_id', album.album_id);
    if (error) throw error;

    fetchAlbums();
    fetchStats();
  } catch (err: any) {
    alert(`Error deleting album: ${err.message || err}`);
  }
}

export function initAlbumsListeners() {
  document.getElementById('btn-new-album')?.addEventListener('click', () => openAlbumModal());
  document.getElementById('modal-album-close')?.addEventListener('click', closeAlbumModal);
  document.getElementById('modal-album-cancel')?.addEventListener('click', closeAlbumModal);
  document.getElementById('form-album')?.addEventListener('submit', handleAlbumSubmit);

  const modalFileInput = document.getElementById('album-modal-files') as HTMLInputElement | null;
  const modalDropzone = document.getElementById('album-modal-dropzone');

  modalFileInput?.addEventListener('change', () => {
    if (modalFileInput.files && modalFileInput.files.length > 0) {
      stagedModalFiles.push(...Array.from(modalFileInput.files));
      modalFileInput.value = '';
      renderStagedModalFiles();
    }
  });

  if (modalDropzone) {
    ['dragenter', 'dragover'].forEach((evt) => {
      modalDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalDropzone.classList.add('border-brand-gold', 'bg-white');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      modalDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalDropzone.classList.remove('border-brand-gold', 'bg-white');
      });
    });
    modalDropzone.addEventListener('drop', (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length > 0) {
        stagedModalFiles.push(...files);
        renderStagedModalFiles();
      }
    });
  }

  document.getElementById('albums-grid')?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const albumId = Number(target.dataset.albumId);
    const album = adminState.currentLoadedAlbums.find((a) => a.album_id === albumId);
    if (!album) return;

    if (action === 'manage-photos') {
      openPhotosDrawer(album);
    } else if (action === 'edit-album') {
      openAlbumModal(album);
    } else if (action === 'toggle-featured') {
      toggleAlbumFeatured(album);
    } else if (action === 'delete-album') {
      deleteAlbum(album);
    }
  });
}
