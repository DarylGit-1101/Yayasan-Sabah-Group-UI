import Sortable from 'sortablejs';
import * as FilePond from 'filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { supabase } from '../../db/supabase';
import type { AlbumPhotoRow } from '../../types';
import { adminState, getStoragePathFromUrl, type FullAlbum } from './store';
import { fetchAlbums, updateAlbumCardInGrid } from './albums';

FilePond.registerPlugin(FilePondPluginImagePreview);

let sortableInstance: Sortable | null = null;
let filepondInstance: FilePond.FilePond | null = null;
let pendingUploadCount = 0;

function generateStandardizedPath(albumId: number, originalName: string, orderIndex: number): string {
  const rawExt = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(rawExt) ? rawExt : 'jpg';
  const timestamp = Date.now();
  return `${albumId}/photo_${orderIndex}_${timestamp}.${cleanExt}`;
}

export async function compressAlbumPhoto(file: File, maxWidth = 2000, quality = 0.86): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/webp' && file.size < 450 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

function updateDrawerUploadStatus() {
  const doneBtn = document.getElementById('drawer-photos-done') as HTMLButtonElement | null;
  if (!doneBtn) return;
  if (pendingUploadCount > 0) {
    doneBtn.textContent = `Uploading ${pendingUploadCount} frame${pendingUploadCount === 1 ? '' : 's'}…`;
    doneBtn.classList.add('opacity-75');
  } else {
    doneBtn.textContent = 'Done';
    doneBtn.classList.remove('opacity-75');
  }
}

export async function processAndUploadFile(file: File, assignedSort: number, targetAlbum?: FullAlbum | null): Promise<string> {
  const album = targetAlbum || adminState.activeAlbumForPhotos;
  if (!album) throw new Error('No active album selected for upload');

  const optimizedFile = await compressAlbumPhoto(file);
  const standardizedPath = generateStandardizedPath(album.album_id, optimizedFile.name, assignedSort);

  const { error } = await supabase.storage
    .from('albums')
    .upload(standardizedPath, optimizedFile, {
      contentType: optimizedFile.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('albums')
    .getPublicUrl(standardizedPath);

  if (!publicUrl) {
    throw new Error('Could not resolve public URL for uploaded photo');
  }

  return publicUrl;
}

export async function savePhotoRecord(imageUrl: string, sortOrder: number, targetAlbum?: FullAlbum | null) {
  const album = targetAlbum || adminState.activeAlbumForPhotos;
  if (!album) return;

  try {
    const { data, error } = await supabase
      .from('album_photos')
      .insert({
        album_id: album.album_id,
        image_url: imageUrl,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw error;

    if (!album.album_photos) {
      album.album_photos = [];
    }
    album.album_photos.push(data as AlbumPhotoRow);

    if (adminState.activeAlbumForPhotos?.album_id === album.album_id) {
      renderDrawerPhotos();
    }
    updateAlbumCardInGrid(album);
  } catch (err: any) {
    alert(`Could not save photo record: ${err.message || err}`);
  }
}

export async function uploadAndAttachPhotoToAlbum(album: FullAlbum, file: File, sortOrder: number) {
  const publicUrl = await processAndUploadFile(file, sortOrder, album);
  await savePhotoRecord(publicUrl, sortOrder, album);
}

export function openPhotosDrawer(album: FullAlbum) {
  adminState.activeAlbumForPhotos = album;
  const drawerAlbumTitle = document.getElementById('drawer-album-title');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerPhotos = document.getElementById('drawer-photos');

  if (drawerAlbumTitle) drawerAlbumTitle.textContent = album.title_en;

  renderDrawerPhotos();
  setupSortableGrid();
  setupFilePondInstance();

  drawerBackdrop?.classList.remove('hidden');
  drawerPhotos?.classList.remove('translate-x-full');
}

export function closePhotosDrawer() {
  if (adminState.activeAlbumForPhotos) {
    updateAlbumCardInGrid(adminState.activeAlbumForPhotos);
  }
  adminState.activeAlbumForPhotos = null;
  document.getElementById('drawer-backdrop')?.classList.add('hidden');
  document.getElementById('drawer-photos')?.classList.add('translate-x-full');
  fetchAlbums(true);
}

export function renderDrawerPhotos() {
  const drawerPhotosGrid = document.getElementById('drawer-photos-grid');
  const drawerPhotoCount = document.getElementById('drawer-photo-count');
  if (!drawerPhotosGrid || !adminState.activeAlbumForPhotos) return;
  drawerPhotosGrid.innerHTML = '';

  const photos = adminState.activeAlbumForPhotos.album_photos || [];
  if (drawerPhotoCount) drawerPhotoCount.textContent = String(photos.length);

  if (photos.length === 0) {
    drawerPhotosGrid.innerHTML = `
      <div class="col-span-full rounded-xl border border-dashed border-brand-border bg-brand-surface p-8 text-center font-mono text-xs text-brand-muted">
        NO FRAMES IN SEQUENCE · DROP IMAGES ABOVE
      </div>
    `;
    return;
  }

  photos.forEach((photo, idx) => {
    const isFirst = idx === 0;
    const seq = String(idx + 1).padStart(2, '0');
    const card = document.createElement('div');
    card.className = 'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand-border bg-white shadow-2xs transition hover:border-brand-gold';
    card.dataset.photoId = String(photo.photo_id);
    card.dataset.index = String(idx);

    card.innerHTML = `
      <div class="relative aspect-16/10 w-full overflow-hidden bg-brand-maroon-dark">
        <img src="${photo.image_url}" alt="" class="size-full object-cover" />
        
        <div class="absolute top-2 left-2 flex items-center gap-1.5">
          ${
            isFirst
              ? `<span class="rounded bg-brand-maroon px-2 py-0.5 font-mono text-[10px] font-bold text-brand-gold border border-white/15">01 · COVER</span>`
              : `<span class="rounded bg-brand-maroon-dark/80 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-cream border border-white/15">${seq}</span>`
          }
        </div>

        <div class="drag-handle absolute top-2 right-2 flex size-7 cursor-grab active:cursor-grabbing items-center justify-center rounded-md bg-brand-maroon-dark/80 text-brand-cream border border-white/15 opacity-80 hover:opacity-100 transition" title="Drag to reorder">
          <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9h8M8 15h8" />
          </svg>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-brand-border bg-brand-surface px-3 py-2 text-xs">
        <div class="flex items-center gap-1">
          <button
            type="button"
            data-nudge="left"
            data-index="${idx}"
            class="flex size-6 items-center justify-center rounded border border-brand-border bg-white text-brand-maroon transition hover:border-brand-maroon disabled:opacity-25 cursor-pointer"
            ${idx === 0 ? 'disabled' : ''}
            title="Move earlier"
          >
            ←
          </button>
          <button
            type="button"
            data-nudge="right"
            data-index="${idx}"
            class="flex size-6 items-center justify-center rounded border border-brand-border bg-white text-brand-maroon transition hover:border-brand-maroon disabled:opacity-25 cursor-pointer"
            ${idx === photos.length - 1 ? 'disabled' : ''}
            title="Move later"
          >
            →
          </button>
        </div>

        <button
          type="button"
          data-delete-photo="${photo.photo_id}"
          class="text-rose-600 hover:text-rose-800 px-1 font-semibold cursor-pointer"
          title="Delete frame"
        >
          Remove
        </button>
      </div>
    `;

    drawerPhotosGrid.appendChild(card);
  });

  drawerPhotosGrid.querySelectorAll<HTMLButtonElement>('[data-nudge]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.nudge;
      const idx = Number(btn.dataset.index);
      if (dir === 'left' && idx > 0) swapPhotos(idx, idx - 1);
      if (dir === 'right' && idx < photos.length - 1) swapPhotos(idx, idx + 1);
    });
  });

  drawerPhotosGrid.querySelectorAll<HTMLButtonElement>('[data-delete-photo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const photoId = Number(btn.dataset.deletePhoto);
      deletePhoto(photoId);
    });
  });
}

function setupSortableGrid() {
  const drawerPhotosGrid = document.getElementById('drawer-photos-grid');
  if (!drawerPhotosGrid) return;
  if (sortableInstance) sortableInstance.destroy();

  sortableInstance = new Sortable(drawerPhotosGrid, {
    animation: 180,
    handle: '.drag-handle',
    ghostClass: 'opacity-40',
    chosenClass: 'scale-[1.02]',
    onEnd: async (evt) => {
      if (!adminState.activeAlbumForPhotos?.album_photos) return;
      const oldIdx = evt.oldIndex;
      const newIdx = evt.newIndex;
      if (oldIdx === undefined || newIdx === undefined || oldIdx === newIdx) return;

      const photos = adminState.activeAlbumForPhotos.album_photos;
      const [movedItem] = photos.splice(oldIdx, 1);
      photos.splice(newIdx, 0, movedItem);

      photos.forEach((p, i) => {
        p.sort_order = i + 1;
      });
      renderDrawerPhotos();

      try {
        await Promise.all(
          photos.map((p) => supabase.from('album_photos').update({ sort_order: p.sort_order }).eq('photo_id', p.photo_id))
        );
      } catch (err: any) {
        console.error('Failed to save reordered photos:', err);
      }
    },
  });
}

function setupFilePondInstance() {
  if (filepondInstance) {
    filepondInstance.removeFiles();
    return;
  }

  const filepondInput = document.getElementById('filepond-input') as HTMLInputElement | null;
  if (!filepondInput) return;

  filepondInstance = FilePond.create(filepondInput, {
    allowMultiple: true,
    instantUpload: true,
    labelIdle: 'Drag & drop photos or <span class="filepond--label-action">Browse</span>',
    imagePreviewHeight: 140,
    credits: false,
    server: {
      process: (_fieldName, file, _metadata, load, error) => {
        const targetAlbum = adminState.activeAlbumForPhotos;
        if (!targetAlbum) {
          error('No active album selected');
          return;
        }

        pendingUploadCount++;
        updateDrawerUploadStatus();
        const assignedSort = (targetAlbum.album_photos?.length || 0) + pendingUploadCount;

        (async () => {
          try {
            const url = await processAndUploadFile(file as File, assignedSort, targetAlbum);
            await savePhotoRecord(url, assignedSort, targetAlbum);
            load(url);
          } catch (err: any) {
            console.error('Photo upload error:', err);
            error(err?.message || 'Upload failed');
            alert(`Photo upload failed: ${err?.message || err}`);
          } finally {
            pendingUploadCount = Math.max(0, pendingUploadCount - 1);
            updateDrawerUploadStatus();
            setTimeout(() => {
              if (filepondInstance) {
                const items = filepondInstance.getFiles();
                const completed = items.find((item) => item.serverId);
                if (completed) filepondInstance.removeFile(completed.id);
              }
            }, 900);
          }
        })();

        return {
          abort: () => {
            pendingUploadCount = Math.max(0, pendingUploadCount - 1);
            updateDrawerUploadStatus();
          },
        };
      },
    },
  });
}

async function deletePhoto(photoId: number) {
  if (!adminState.activeAlbumForPhotos) return;

  const targetPhoto = adminState.activeAlbumForPhotos.album_photos?.find((p) => p.photo_id === photoId);

  try {
    if (targetPhoto?.image_url) {
      const storagePath = getStoragePathFromUrl(targetPhoto.image_url);
      if (storagePath) {
        await supabase.storage.from('albums').remove([storagePath]);
      }
    }

    const { error } = await supabase
      .from('album_photos')
      .delete()
      .eq('photo_id', photoId);

    if (error) throw error;

    adminState.activeAlbumForPhotos.album_photos = (adminState.activeAlbumForPhotos.album_photos || []).filter(
      (p) => p.photo_id !== photoId
    );
    renderDrawerPhotos();
  } catch (err: any) {
    alert(`Could not delete photo: ${err.message || err}`);
  }
}

async function swapPhotos(idx1: number, idx2: number) {
  if (!adminState.activeAlbumForPhotos || !adminState.activeAlbumForPhotos.album_photos) return;
  const photos = adminState.activeAlbumForPhotos.album_photos;
  const photo1 = photos[idx1];
  const photo2 = photos[idx2];
  if (!photo1 || !photo2) return;

  const tempSort = photo1.sort_order;
  photo1.sort_order = photo2.sort_order;
  photo2.sort_order = tempSort;

  photos[idx1] = photo2;
  photos[idx2] = photo1;
  renderDrawerPhotos();

  try {
    await Promise.all([
      supabase.from('album_photos').update({ sort_order: photo1.sort_order }).eq('photo_id', photo1.photo_id),
      supabase.from('album_photos').update({ sort_order: photo2.sort_order }).eq('photo_id', photo2.photo_id),
    ]);
  } catch (err: any) {
    alert(`Failed to save new photo order: ${err.message || err}`);
  }
}

export function initPhotosDrawerListeners() {
  document.getElementById('drawer-photos-close')?.addEventListener('click', closePhotosDrawer);
  document.getElementById('drawer-photos-done')?.addEventListener('click', closePhotosDrawer);
  document.getElementById('drawer-backdrop')?.addEventListener('click', closePhotosDrawer);

  document.getElementById('form-manual-photo')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('manual-photo-url') as HTMLInputElement;
    if (!input?.value.trim()) return;
    const nextSort = (adminState.activeAlbumForPhotos?.album_photos?.length || 0) + 1;
    await savePhotoRecord(input.value.trim(), nextSort);
    input.value = '';
  });
}
