import { adminState } from './store';
import { switchTab } from './navigation';
import { openAlbumModal, closeAlbumModal } from './albums';
import { openPhotosDrawer, closePhotosDrawer } from './photosDrawer';
import { getFilteredAnnouncements, openAnnouncementEditor, renderAnnouncements } from './announcements';

export function openCmdPalette() {
  const cmdModal = document.getElementById('cmd-palette-modal');
  const cmdInput = document.getElementById('cmd-palette-input') as HTMLInputElement | null;
  if (!cmdModal) return;
  cmdModal.classList.remove('hidden');
  cmdModal.classList.add('flex');
  if (cmdInput) {
    cmdInput.value = '';
    renderCmdList('');
    setTimeout(() => cmdInput.focus(), 20);
  }
}

export function closeCmdPalette() {
  const cmdModal = document.getElementById('cmd-palette-modal');
  cmdModal?.classList.add('hidden');
  cmdModal?.classList.remove('flex');
}

export function renderCmdList(query: string) {
  const cmdList = document.getElementById('cmd-palette-list');
  if (!cmdList) return;
  const q = query.trim().toLowerCase();

  interface CmdItem {
    label: string;
    meta: string;
    action: () => void;
  }

  const baseCommands: CmdItem[] = [
    { label: 'New Notice / Circular', meta: 'ACTION', action: () => { switchTab('announcements'); openAnnouncementEditor(); } },
    { label: 'New Slider Album', meta: 'ACTION', action: () => { switchTab('highlights'); openAlbumModal(); } },
    { label: 'Go to Live Desk', meta: 'KEY 1', action: () => switchTab('overview') },
    { label: 'Go to Slider Sequence', meta: 'KEY 2', action: () => switchTab('highlights') },
    { label: 'Go to Notices & Circulars', meta: 'KEY 3', action: () => switchTab('announcements') },
    { label: 'Go to Press & News', meta: 'KEY 4', action: () => switchTab('news') },
    { label: 'Go to Public Inbox', meta: 'KEY 5', action: () => switchTab('feedback') },
    { label: 'Open Live Public Portal', meta: 'EXTERNAL ↗', action: () => window.open('/', '_blank') },
  ];

  const albumMatches: CmdItem[] = adminState.currentLoadedAlbums.map((a) => ({
    label: `Album: ${a.title_en}`,
    meta: `${(a.album_photos || []).length} FRAMES`,
    action: () => {
      switchTab('highlights');
      openPhotosDrawer(a);
    },
  }));

  const noticeMatches: CmdItem[] = adminState.currentLoadedAnnouncements.map((n) => ({
    label: `Notice: ${n.title_en}`,
    meta: n.is_pinned ? 'PINNED' : 'NOTICE',
    action: () => {
      adminState.selectedAnnouncementId = n.announcement_id;
      switchTab('announcements');
      renderAnnouncements();
    },
  }));

  const all = [...baseCommands, ...albumMatches, ...noticeMatches].filter((item) =>
    !q || item.label.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q)
  );

  if (all.length === 0) {
    cmdList.innerHTML = `<div class="p-6 text-center font-mono text-xs text-brand-cream/50">No matching commands or records.</div>`;
    return;
  }

  cmdList.innerHTML = '';
  all.slice(0, 10).forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-brand-cream transition hover:bg-white/10 cursor-pointer';
    btn.innerHTML = `
      <span class="truncate font-medium">${item.label}</span>
      <span class="ml-3 shrink-0 font-mono text-[10px] text-brand-gold">${item.meta}</span>
    `;
    btn.addEventListener('click', () => {
      closeCmdPalette();
      item.action();
    });
    cmdList.appendChild(btn);
  });
}

export function initCommandPaletteAndShortcuts() {
  const cmdModal = document.getElementById('cmd-palette-modal');
  const cmdInput = document.getElementById('cmd-palette-input') as HTMLInputElement | null;
  const announcementsSearch = document.getElementById('announcements-search') as HTMLInputElement | null;

  document.getElementById('btn-open-cmd')?.addEventListener('click', openCmdPalette);
  cmdModal?.addEventListener('click', (e) => {
    if (e.target === cmdModal) closeCmdPalette();
  });
  cmdInput?.addEventListener('input', () => renderCmdList(cmdInput.value));

  document.querySelectorAll<HTMLButtonElement>('[data-quick-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.quickAction;
      if (act === 'new-album') {
        switchTab('highlights');
        openAlbumModal();
      } else if (act === 'new-notice') {
        switchTab('announcements');
        openAnnouncementEditor();
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal?.classList.contains('hidden')) {
        openCmdPalette();
      } else {
        closeCmdPalette();
      }
      return;
    }

    if (e.key === 'Escape') {
      closeCmdPalette();
      closeAlbumModal();
      if (adminState.activeAlbumForPhotos) closePhotosDrawer();
      return;
    }

    const target = e.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
    if (isTyping) return;

    const keyMap: Record<string, string> = {
      '1': 'overview',
      '2': 'highlights',
      '3': 'announcements',
      '4': 'news',
      '5': 'feedback',
      '6': 'admins',
    };
    if (!e.metaKey && !e.ctrlKey && !e.altKey && keyMap[e.key]) {
      e.preventDefault();
      switchTab(keyMap[e.key]);
      return;
    }

    const panelAnnouncements = document.getElementById('panel-announcements');
    if (!panelAnnouncements || panelAnnouncements.classList.contains('hidden')) return;

    if (e.key === '/') {
      e.preventDefault();
      announcementsSearch?.focus();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const filtered = getFilteredAnnouncements();
      if (filtered.length <= 1) return;
      const currentIdx = filtered.findIndex((a) => a.announcement_id === adminState.selectedAnnouncementId);
      if (currentIdx === -1) return;

      e.preventDefault();
      let nextIdx = e.key === 'ArrowDown' ? currentIdx + 1 : currentIdx - 1;
      if (nextIdx < 0) nextIdx = filtered.length - 1;
      if (nextIdx >= filtered.length) nextIdx = 0;

      adminState.selectedAnnouncementId = filtered[nextIdx].announcement_id;
      renderAnnouncements();
    }
  });
}
