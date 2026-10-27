import { supabase } from '../../db/supabase';
import type { AnnouncementRow } from '../../types';
import { adminState, fetchStats, getStoragePathFromUrl, slugify } from './store';
import { renderOverviewNotices } from './overview';
import { compressAlbumPhoto } from './photosDrawer';

async function uploadAnnouncementMedia(file: File, folder: 'banners' | 'attachments'): Promise<string> {
  const fileToUpload = folder === 'banners' ? await compressAlbumPhoto(file, 1920, 0.85) : file;
  const rawExt = fileToUpload.name.split('.').pop()?.toLowerCase() || (folder === 'banners' ? 'webp' : 'pdf');
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(rawExt) ? rawExt : (folder === 'banners' ? 'webp' : 'pdf');
  const timestamp = Date.now();
  const cleanStem = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^\w-]/g, '_').slice(0, 30);
  const storagePath = `announcements/${folder}/${cleanStem}_${timestamp}.${cleanExt}`;

  const { error } = await supabase.storage
    .from('albums')
    .upload(storagePath, fileToUpload, {
      contentType: fileToUpload.type || (folder === 'banners' ? 'image/webp' : 'application/pdf'),
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('albums')
    .getPublicUrl(storagePath);

  if (!publicUrl) {
    throw new Error('Could not resolve public URL for uploaded file');
  }

  return publicUrl;
}

export function getFilteredAnnouncements(): AnnouncementRow[] {
  const q = adminState.announcementSearchQuery.trim().toLowerCase();
  return adminState.currentLoadedAnnouncements.filter((item) => {
    if (adminState.activeAnnouncementFilter === 'live' && item.status !== 2) return false;
    if (adminState.activeAnnouncementFilter === 'pinned' && !item.is_pinned) return false;
    if (adminState.activeAnnouncementFilter === 'draft' && item.status !== 1) return false;

    if (q) {
      const titleEn = (item.title_en || '').toLowerCase();
      const titleBm = (item.title_bm || '').toLowerCase();
      const contentEn = (item.content_en || '').toLowerCase();
      const contentBm = (item.content_bm || '').toLowerCase();
      return titleEn.includes(q) || titleBm.includes(q) || contentEn.includes(q) || contentBm.includes(q);
    }
    return true;
  });
}

function updateFilterCounts() {
  const elAll = document.getElementById('count-filter-all');
  const elLive = document.getElementById('count-filter-live');
  const elPinned = document.getElementById('count-filter-pinned');
  const elDraft = document.getElementById('count-filter-draft');

  if (elAll) elAll.textContent = `(${adminState.currentLoadedAnnouncements.length})`;
  if (elLive) elLive.textContent = `(${adminState.currentLoadedAnnouncements.filter((a) => a.status === 2).length})`;
  if (elPinned) elPinned.textContent = `(${adminState.currentLoadedAnnouncements.filter((a) => a.is_pinned).length})`;
  if (elDraft) elDraft.textContent = `(${adminState.currentLoadedAnnouncements.filter((a) => a.status === 1).length})`;
}

export function renderInspector(item: AnnouncementRow | null) {
  const announcementsInspectorView = document.getElementById('announcements-inspector-view');
  const inspectorHeaderBadges = document.getElementById('inspector-header-badges');
  const inspectorBannerImg = document.getElementById('inspector-banner-img') as HTMLImageElement | null;
  const inspectorBannerPlaceholder = document.getElementById('inspector-banner-placeholder');
  const tabLangEn = document.getElementById('tab-lang-en');
  const tabLangBm = document.getElementById('tab-lang-bm');
  const inspectorDate = document.getElementById('inspector-date');
  const inspectorTitle = document.getElementById('inspector-title');
  const inspectorContent = document.getElementById('inspector-content');
  const inspectorAttachmentBox = document.getElementById('inspector-attachment-box');
  const inspectorAttachmentLabel = document.getElementById('inspector-attachment-label');
  const inspectorAttachmentLink = document.getElementById('inspector-attachment-link') as HTMLAnchorElement | null;
  const inspectorSlug = document.getElementById('inspector-slug');
  const inspectorExpires = document.getElementById('inspector-expires');
  const inspectorUpdated = document.getElementById('inspector-updated');

  if (!announcementsInspectorView) return;

  if (!item) {
    if (inspectorTitle) inspectorTitle.textContent = 'No announcement selected';
    if (inspectorContent) inspectorContent.textContent = 'Select a notice from the feed to view full details.';
    if (inspectorBannerImg) inspectorBannerImg.classList.add('hidden');
    if (inspectorBannerPlaceholder) inspectorBannerPlaceholder.classList.remove('hidden');
    if (inspectorAttachmentBox) inspectorAttachmentBox.classList.add('hidden');
    return;
  }

  if (inspectorHeaderBadges) {
    const isPinned = item.is_pinned === true;
    const isExpired = item.expires_at ? new Date(item.expires_at) < new Date() : false;
    const statusBadge =
      item.status === 1
        ? `<span class="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-700 border border-amber-500/30"><span class="size-1.5 rounded-full bg-amber-500"></span>DRAFT</span>`
        : item.status === 3
        ? `<span class="inline-flex items-center gap-1.5 rounded-md bg-stone-200 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-stone-700">ARCHIVED</span>`
        : `<span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-700 border border-emerald-500/30"><span class="size-1.5 rounded-full bg-emerald-500"></span>LIVE</span>`;

    const pinBadge = `
      <button
        type="button"
        data-action="toggle-pin-current"
        data-announcement-id="${item.announcement_id}"
        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase border transition cursor-pointer ${
          isPinned
            ? 'bg-brand-maroon text-brand-gold border-brand-maroon'
            : 'bg-white text-brand-muted border-brand-border hover:border-brand-maroon hover:text-brand-maroon'
        }"
      >
        <span>${isPinned ? 'PINNED' : 'PIN TO TOP'}</span>
      </button>
    `;

    const expiredBadge = isExpired
      ? `<span class="rounded-md bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-rose-600 border border-rose-500/30">EXPIRED</span>`
      : '';

    inspectorHeaderBadges.innerHTML = `${statusBadge} ${pinBadge} ${expiredBadge}`;
  }

  if (inspectorBannerImg && inspectorBannerPlaceholder) {
    if (item.banner_url) {
      inspectorBannerImg.src = item.banner_url;
      inspectorBannerImg.classList.remove('hidden');
      inspectorBannerPlaceholder.classList.add('hidden');
    } else {
      inspectorBannerImg.classList.add('hidden');
      inspectorBannerPlaceholder.classList.remove('hidden');
    }
  }

  if (tabLangEn && tabLangBm) {
    if (adminState.inspectorLang === 'en') {
      tabLangEn.className = 'rounded-md px-2.5 py-1 bg-brand-maroon text-white font-semibold transition cursor-pointer';
      tabLangBm.className = 'rounded-md px-2.5 py-1 text-brand-muted hover:text-brand-maroon font-medium transition cursor-pointer';
    } else {
      tabLangBm.className = 'rounded-md px-2.5 py-1 bg-brand-maroon text-white font-semibold transition cursor-pointer';
      tabLangEn.className = 'rounded-md px-2.5 py-1 text-brand-muted hover:text-brand-maroon font-medium transition cursor-pointer';
    }
  }

  if (inspectorDate) {
    inspectorDate.textContent = item.published_at
      ? new Date(item.published_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      : 'DRAFT';
  }

  if (inspectorTitle) {
    inspectorTitle.textContent = adminState.inspectorLang === 'en' ? item.title_en : (item.title_bm || item.title_en);
  }

  if (inspectorContent) {
    const text = adminState.inspectorLang === 'en' ? item.content_en : (item.content_bm || item.content_en);
    inspectorContent.textContent = text || 'No detailed description provided.';
  }

  if (inspectorAttachmentBox && inspectorAttachmentLink) {
    if (item.attachment_url) {
      inspectorAttachmentBox.classList.remove('hidden');
      inspectorAttachmentLink.href = item.attachment_url;

      const isExternal = item.attachment_url.startsWith('http://') || item.attachment_url.startsWith('https://');
      const isPdf = item.attachment_url.toLowerCase().endsWith('.pdf') || item.attachment_url.includes('/attachments/');

      if (inspectorAttachmentLabel) {
        if (isPdf) {
          const rawFileName = item.attachment_url.split('/').pop() || 'document.pdf';
          const cleanName = decodeURIComponent(rawFileName).replace(/_\d+\.pdf$/i, '.pdf');
          inspectorAttachmentLabel.textContent = cleanName;
        } else if (isExternal) {
          try {
            const domain = new URL(item.attachment_url).hostname;
            inspectorAttachmentLabel.textContent = `External Link (${domain})`;
          } catch {
            inspectorAttachmentLabel.textContent = 'External Web Link';
          }
        } else {
          inspectorAttachmentLabel.textContent = 'Attached Document';
        }
      }
    } else {
      inspectorAttachmentBox.classList.add('hidden');
    }
  }

  if (inspectorSlug) inspectorSlug.textContent = item.slug || `notice-${item.announcement_id}`;
  if (inspectorExpires) {
    inspectorExpires.textContent = item.expires_at
      ? new Date(item.expires_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Ongoing';
  }
  if (inspectorUpdated) {
    inspectorUpdated.textContent = item.updated_at
      ? new Date(item.updated_at).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
      : '-';
  }
}

export function renderAnnouncements() {
  const announcementsFeedList = document.getElementById('announcements-feed-list');
  const announcementsSplitContainer = document.getElementById('announcements-split-container');
  const announcementsEmpty = document.getElementById('announcements-empty');
  const announcementsFeedCount = document.getElementById('announcements-feed-count');
  if (!announcementsFeedList || !announcementsSplitContainer || !announcementsEmpty) return;

  updateFilterCounts();
  const filtered = getFilteredAnnouncements();

  if (announcementsFeedCount) {
    announcementsFeedCount.textContent = `INDEX (${filtered.length})`;
  }

  if (filtered.length === 0) {
    announcementsSplitContainer.classList.add('hidden');
    announcementsEmpty.classList.remove('hidden');
    return;
  }

  announcementsEmpty.classList.add('hidden');
  announcementsSplitContainer.classList.remove('hidden');

  if (!adminState.selectedAnnouncementId || !filtered.some((a) => a.announcement_id === adminState.selectedAnnouncementId)) {
    adminState.selectedAnnouncementId = filtered[0].announcement_id;
  }

  announcementsFeedList.innerHTML = '';

  filtered.forEach((item) => {
    const isSelected = item.announcement_id === adminState.selectedAnnouncementId;
    const isPinned = item.is_pinned === true;
    const isExpired = item.expires_at ? new Date(item.expires_at) < new Date() : false;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.announcementId = String(item.announcement_id);
    btn.className = `w-full text-left p-3.5 transition-all flex flex-col gap-1 border-l-2 cursor-pointer ${
      isSelected
        ? 'bg-brand-cream/40 border-brand-maroon'
        : 'hover:bg-brand-cream/20 border-transparent text-brand-ink'
    }`;

    const statusDot =
      item.status === 1
        ? '<span class="size-1.5 rounded-full bg-amber-500 shrink-0" title="Draft"></span>'
        : item.status === 3
        ? '<span class="size-1.5 rounded-full bg-brand-muted shrink-0" title="Archived"></span>'
        : '<span class="size-1.5 rounded-full bg-emerald-500 shrink-0" title="Live"></span>';

    btn.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          ${statusDot}
          ${isPinned ? '<span class="rounded bg-brand-maroon px-1 py-0.2 font-mono text-[9px] font-bold text-brand-gold uppercase shrink-0">PIN</span>' : ''}
          <span class="text-xs font-semibold truncate ${isSelected ? 'text-brand-maroon font-bold' : 'text-brand-ink'}">
            ${item.title_en}
          </span>
        </div>
        <span class="font-mono text-[10px] text-brand-muted shrink-0">
          ${item.published_at ? new Date(item.published_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }) : ''}
        </span>
      </div>

      <p class="text-[11px] text-brand-muted line-clamp-1 pl-3">
        ${item.title_bm || item.title_en}
      </p>

      <div class="flex items-center gap-1.5 pl-3 pt-0.5 font-mono text-[9px] uppercase text-brand-muted">
        ${item.attachment_url ? '<span class="rounded border border-brand-border bg-white px-1.5 py-0.2 text-brand-maroon">DOC</span>' : ''}
        ${item.banner_url ? '<span class="rounded border border-brand-border bg-white px-1.5 py-0.2 text-brand-maroon">IMG</span>' : ''}
        ${isExpired ? '<span class="rounded bg-rose-50 px-1.5 py-0.2 font-bold text-rose-600">EXPIRED</span>' : ''}
      </div>
    `;

    announcementsFeedList.appendChild(btn);
  });

  const activeItem = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId) || null;
  renderInspector(activeItem);
}

export async function fetchAnnouncements(silent = false) {
  const announcementsSplitContainer = document.getElementById('announcements-split-container');
  const announcementsLoading = document.getElementById('announcements-loading');
  const announcementsEmpty = document.getElementById('announcements-empty');
  if (!announcementsSplitContainer || !announcementsLoading || !announcementsEmpty) return;

  if (adminState.currentLoadedAnnouncements.length === 0 && !silent) {
    announcementsLoading.classList.remove('hidden');
    announcementsEmpty.classList.add('hidden');
    announcementsSplitContainer.classList.add('hidden');
  }

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    announcementsLoading.classList.add('hidden');

    if (error || !data || data.length === 0) {
      if (adminState.currentLoadedAnnouncements.length === 0) {
        announcementsEmpty.classList.remove('hidden');
      }
      renderOverviewNotices();
      return;
    }

    adminState.currentLoadedAnnouncements = data as AnnouncementRow[];
    renderAnnouncements();
    renderOverviewNotices();
  } catch {
    announcementsLoading.classList.add('hidden');
    if (adminState.currentLoadedAnnouncements.length === 0) {
      announcementsEmpty.classList.remove('hidden');
    }
  }
}

function updateBannerEditorUI(url: string | null) {
  const bannerUrlInput = document.getElementById('announcement-banner-url') as HTMLInputElement | null;
  const bannerPreviewImg = document.getElementById('banner-preview-img') as HTMLImageElement | null;
  const bannerDropzonePreview = document.getElementById('banner-dropzone-preview');
  const bannerDropzoneEmpty = document.getElementById('banner-dropzone-empty');
  const bannerFileInput = document.getElementById('announcement-banner-file') as HTMLInputElement | null;

  if (!bannerUrlInput) return;
  bannerUrlInput.value = url || '';
  if (url && bannerPreviewImg && bannerDropzonePreview && bannerDropzoneEmpty) {
    bannerPreviewImg.src = url;
    bannerDropzoneEmpty.classList.add('hidden');
    bannerDropzonePreview.classList.remove('hidden');
  } else if (bannerDropzoneEmpty && bannerDropzonePreview) {
    bannerDropzonePreview.classList.add('hidden');
    bannerDropzoneEmpty.classList.remove('hidden');
    if (bannerFileInput) bannerFileInput.value = '';
  }
}

function setAttachmentMode(mode: 'file' | 'link') {
  const tabAttachFile = document.getElementById('tab-attach-file');
  const tabAttachLink = document.getElementById('tab-attach-link');
  const attachModeFile = document.getElementById('attach-mode-file');
  const attachModeLink = document.getElementById('attach-mode-link');

  if (mode === 'file') {
    tabAttachFile?.classList.add('font-bold', 'text-brand-maroon', 'underline', 'underline-offset-2');
    tabAttachFile?.classList.remove('text-brand-muted');
    tabAttachLink?.classList.remove('font-bold', 'text-brand-maroon', 'underline', 'underline-offset-2');
    tabAttachLink?.classList.add('text-brand-muted');
    attachModeFile?.classList.remove('hidden');
    attachModeLink?.classList.add('hidden');
  } else {
    tabAttachLink?.classList.add('font-bold', 'text-brand-maroon', 'underline', 'underline-offset-2');
    tabAttachLink?.classList.remove('text-brand-muted');
    tabAttachFile?.classList.remove('font-bold', 'text-brand-maroon', 'underline', 'underline-offset-2');
    tabAttachFile?.classList.add('text-brand-muted');
    attachModeLink?.classList.remove('hidden');
    attachModeFile?.classList.add('hidden');
  }
}

function updateAttachmentEditorUI(url: string | null) {
  const attachUrlInput = document.getElementById('announcement-attachment-url') as HTMLInputElement | null;
  const announcementExternalLink = document.getElementById('announcement-external-link') as HTMLInputElement | null;
  const attachDropzonePreview = document.getElementById('attach-dropzone-preview');
  const attachDropzoneEmpty = document.getElementById('attach-dropzone-empty');
  const attachPreviewFilename = document.getElementById('attach-preview-filename');
  const attachFileInput = document.getElementById('announcement-attachment-file') as HTMLInputElement | null;

  if (!attachUrlInput) return;
  attachUrlInput.value = url || '';

  const isExternal = Boolean(
    url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/announcements/attachments/')
  );

  if (isExternal) {
    setAttachmentMode('link');
    if (announcementExternalLink) announcementExternalLink.value = url || '';
    if (attachDropzonePreview && attachDropzoneEmpty) {
      attachDropzonePreview.classList.add('hidden');
      attachDropzoneEmpty.classList.remove('hidden');
    }
  } else {
    setAttachmentMode('file');
    if (announcementExternalLink) announcementExternalLink.value = '';
    if (url && attachDropzonePreview && attachDropzoneEmpty && attachPreviewFilename) {
      const rawFileName = url.split('/').pop() || 'document.pdf';
      const cleanName = decodeURIComponent(rawFileName).replace(/_\d+\.pdf$/i, '.pdf');
      attachPreviewFilename.textContent = cleanName;
      attachDropzoneEmpty.classList.add('hidden');
      attachDropzonePreview.classList.remove('hidden');
    } else if (attachDropzoneEmpty && attachDropzonePreview) {
      attachDropzonePreview.classList.add('hidden');
      attachDropzoneEmpty.classList.remove('hidden');
      if (attachFileInput) attachFileInput.value = '';
    }
  }
}

export function openAnnouncementEditor(item?: AnnouncementRow) {
  const announcementsEditorView = document.getElementById('announcements-editor-view');
  const announcementsInspectorView = document.getElementById('announcements-inspector-view');
  const formAnnouncement = document.getElementById('form-announcement') as HTMLFormElement | null;
  const editorTitleText = document.getElementById('editor-title-text');
  if (!announcementsEditorView || !announcementsInspectorView || !formAnnouncement) return;

  formAnnouncement.reset();

  const idInput = document.getElementById('announcement-id') as HTMLInputElement;
  const statusInput = document.getElementById('announcement-status') as HTMLSelectElement;
  const titleEnInput = document.getElementById('announcement-title-en') as HTMLInputElement;
  const titleBmInput = document.getElementById('announcement-title-bm') as HTMLInputElement;
  const contentEnInput = document.getElementById('announcement-content-en') as HTMLTextAreaElement;
  const contentBmInput = document.getElementById('announcement-content-bm') as HTMLTextAreaElement;
  const pinnedInput = document.getElementById('announcement-pinned') as HTMLInputElement;
  const expiresInput = document.getElementById('announcement-expires') as HTMLInputElement;

  if (item) {
    if (editorTitleText) editorTitleText.textContent = 'Edit Notice';
    idInput.value = String(item.announcement_id);
    statusInput.value = String(item.status ?? 2);
    titleEnInput.value = item.title_en || '';
    titleBmInput.value = item.title_bm || '';
    contentEnInput.value = item.content_en || '';
    contentBmInput.value = item.content_bm || '';
    pinnedInput.checked = item.is_pinned === true;
    if (item.expires_at) {
      expiresInput.value = new Date(item.expires_at).toISOString().slice(0, 16);
    }
    updateBannerEditorUI(item.banner_url || '');
    updateAttachmentEditorUI(item.attachment_url || '');
  } else {
    if (editorTitleText) editorTitleText.textContent = 'New Notice';
    idInput.value = '';
    statusInput.value = '2';
    pinnedInput.checked = false;
    updateBannerEditorUI('');
    updateAttachmentEditorUI('');
  }

  announcementsInspectorView.classList.add('hidden');
  announcementsEditorView.classList.remove('hidden');
}

export function closeAnnouncementEditor() {
  const announcementsEditorView = document.getElementById('announcements-editor-view');
  const announcementsInspectorView = document.getElementById('announcements-inspector-view');
  if (!announcementsEditorView || !announcementsInspectorView) return;
  announcementsEditorView.classList.add('hidden');
  announcementsInspectorView.classList.remove('hidden');
  const activeItem = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId) || null;
  renderInspector(activeItem);
}

async function handleAnnouncementSubmit(e: SubmitEvent) {
  e.preventDefault();
  const formAnnouncement = document.getElementById('form-announcement') as HTMLFormElement | null;
  if (!formAnnouncement) return;

  const formData = new FormData(formAnnouncement);
  const announcementId = formData.get('announcement_id') as string;
  const titleEn = (formData.get('title_en') as string).trim();

  const payload: any = {
    title_en: titleEn,
    title_bm: (formData.get('title_bm') as string).trim(),
    content_en: (formData.get('content_en') as string).trim() || null,
    content_bm: (formData.get('content_bm') as string).trim() || null,
    banner_url: (formData.get('banner_url') as string).trim() || null,
    attachment_url: (formData.get('attachment_url') as string).trim() || null,
    status: Number(formData.get('status') || 2),
    is_pinned: formData.get('is_pinned') === 'on',
    expires_at: formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (!announcementId) {
    payload.slug = slugify(titleEn) || `notice-${Date.now()}`;
    payload.published_at = new Date().toISOString();
  }

  try {
    if (announcementId) {
      const { error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('announcement_id', Number(announcementId));
      if (error) throw error;
      adminState.selectedAnnouncementId = Number(announcementId);
    } else {
      const { data, error } = await supabase
        .from('announcements')
        .insert(payload)
        .select('announcement_id')
        .single();
      if (error) throw error;
      if (data?.announcement_id) adminState.selectedAnnouncementId = data.announcement_id;
    }

    closeAnnouncementEditor();
    fetchAnnouncements(true);
    fetchStats();
  } catch (err: any) {
    alert(`Error saving announcement: ${err.message || err}`);
  }
}

async function toggleAnnouncementPinned(item: AnnouncementRow) {
  const nextState = !item.is_pinned;
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ is_pinned: nextState, updated_at: new Date().toISOString() })
      .eq('announcement_id', item.announcement_id);
    if (error) throw error;
    fetchAnnouncements(true);
  } catch (err: any) {
    alert(`Could not toggle pinned status: ${err.message || err}`);
  }
}

async function deleteAnnouncement(item: AnnouncementRow) {
  const confirmed = confirm(`Are you sure you want to delete "${item.title_en}"?`);
  if (!confirmed) return;

  try {
    if (item.banner_url) {
      const albumBucketPath = getStoragePathFromUrl(item.banner_url, 'albums');
      if (albumBucketPath) await supabase.storage.from('albums').remove([albumBucketPath]);
    }
    if (item.attachment_url) {
      const albumBucketPath = getStoragePathFromUrl(item.attachment_url, 'albums');
      if (albumBucketPath) await supabase.storage.from('albums').remove([albumBucketPath]);
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('announcement_id', item.announcement_id);
    if (error) throw error;

    if (adminState.selectedAnnouncementId === item.announcement_id) {
      adminState.selectedAnnouncementId = null;
    }
    fetchAnnouncements(true);
    fetchStats();
  } catch (err: any) {
    alert(`Error deleting announcement: ${err.message || err}`);
  }
}

export function initAnnouncementsListeners() {
  const filterPillButtons = document.querySelectorAll<HTMLButtonElement>('#announcement-filters [data-filter]');
  const announcementExternalLink = document.getElementById('announcement-external-link') as HTMLInputElement | null;
  const attachUrlInput = document.getElementById('announcement-attachment-url') as HTMLInputElement | null;
  const bannerUploadText = document.getElementById('banner-upload-text');
  const attachUploadText = document.getElementById('attach-upload-text');
  const bannerFileInput = document.getElementById('announcement-banner-file') as HTMLInputElement | null;
  const attachFileInput = document.getElementById('announcement-attachment-file') as HTMLInputElement | null;
  const bannerDropzone = document.getElementById('banner-dropzone-empty');
  const attachDropzone = document.getElementById('attach-dropzone-empty');

  document.getElementById('btn-new-announcement')?.addEventListener('click', () => openAnnouncementEditor());
  document.getElementById('btn-cancel-editor')?.addEventListener('click', closeAnnouncementEditor);
  document.getElementById('modal-announcement-cancel')?.addEventListener('click', closeAnnouncementEditor);
  document.getElementById('form-announcement')?.addEventListener('submit', handleAnnouncementSubmit);

  document.getElementById('btn-edit-current-announcement')?.addEventListener('click', () => {
    const item = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId);
    if (item) openAnnouncementEditor(item);
  });

  document.getElementById('btn-delete-current-announcement')?.addEventListener('click', () => {
    const item = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId);
    if (item) deleteAnnouncement(item);
  });

  document.getElementById('tab-lang-en')?.addEventListener('click', () => {
    adminState.inspectorLang = 'en';
    const item = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId) || null;
    renderInspector(item);
  });

  document.getElementById('tab-lang-bm')?.addEventListener('click', () => {
    adminState.inspectorLang = 'bm';
    const item = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId) || null;
    renderInspector(item);
  });

  document.getElementById('inspector-header-badges')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action="toggle-pin-current"]');
    if (!btn) return;
    const item = adminState.currentLoadedAnnouncements.find((a) => a.announcement_id === adminState.selectedAnnouncementId);
    if (item) toggleAnnouncementPinned(item);
  });

  document.getElementById('announcements-feed-list')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-announcement-id]');
    if (!btn) return;
    adminState.selectedAnnouncementId = Number(btn.dataset.announcementId);
    closeAnnouncementEditor();
    renderAnnouncements();
  });

  document.getElementById('announcements-search')?.addEventListener('input', (e) => {
    adminState.announcementSearchQuery = (e.target as HTMLInputElement).value;
    renderAnnouncements();
  });

  filterPillButtons.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPillButtons.forEach((p) => {
        p.className = 'filter-pill rounded-md px-2.5 py-1 transition text-brand-muted hover:text-brand-maroon cursor-pointer';
      });
      pill.className = 'filter-pill active rounded-md px-2.5 py-1 font-semibold transition bg-brand-maroon text-white cursor-pointer';
      adminState.activeAnnouncementFilter = (pill.dataset.filter || 'all') as any;
      renderAnnouncements();
    });
  });

  document.getElementById('btn-remove-banner')?.addEventListener('click', () => updateBannerEditorUI(''));
  document.getElementById('btn-remove-attachment')?.addEventListener('click', () => updateAttachmentEditorUI(''));
  document.getElementById('tab-attach-file')?.addEventListener('click', () => setAttachmentMode('file'));
  document.getElementById('tab-attach-link')?.addEventListener('click', () => setAttachmentMode('link'));

  announcementExternalLink?.addEventListener('input', () => {
    if (attachUrlInput && announcementExternalLink) {
      attachUrlInput.value = announcementExternalLink.value.trim();
    }
  });

  const handleBannerUpload = async (file: File) => {
    if (bannerUploadText) bannerUploadText.textContent = 'Uploading banner…';
    try {
      const url = await uploadAnnouncementMedia(file, 'banners');
      updateBannerEditorUI(url);
    } catch (err: any) {
      alert(`Banner upload failed: ${err?.message || err}`);
    } finally {
      if (bannerUploadText) bannerUploadText.textContent = 'Upload Banner Image';
      if (bannerFileInput) bannerFileInput.value = '';
    }
  };

  const handleAttachmentUpload = async (file: File) => {
    if (attachUploadText) attachUploadText.textContent = 'Uploading document…';
    try {
      const url = await uploadAnnouncementMedia(file, 'attachments');
      updateAttachmentEditorUI(url);
    } catch (err: any) {
      alert(`Document upload failed: ${err?.message || err}`);
    } finally {
      if (attachUploadText) attachUploadText.textContent = 'Upload PDF Circular';
      if (attachFileInput) attachFileInput.value = '';
    }
  };

  bannerFileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleBannerUpload(file);
  });

  attachFileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleAttachmentUpload(file);
  });

  if (bannerDropzone) {
    ['dragenter', 'dragover'].forEach((evt) => {
      bannerDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        bannerDropzone.classList.add('border-brand-gold', 'bg-white');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      bannerDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        bannerDropzone.classList.remove('border-brand-gold', 'bg-white');
      });
    });
    bannerDropzone.addEventListener('drop', (e: DragEvent) => {
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleBannerUpload(file);
      }
    });
  }

  if (attachDropzone) {
    ['dragenter', 'dragover'].forEach((evt) => {
      attachDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        attachDropzone.classList.add('border-brand-gold', 'bg-white');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      attachDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        attachDropzone.classList.remove('border-brand-gold', 'bg-white');
      });
    });
    attachDropzone.addEventListener('drop', (e: DragEvent) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        handleAttachmentUpload(file);
      }
    });
  }
}
