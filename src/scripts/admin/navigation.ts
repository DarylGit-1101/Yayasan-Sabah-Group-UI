import { adminState } from './store';

export function switchTab(targetName: string) {
  const panelViews = document.querySelectorAll<HTMLElement>('.panel-view');
  const navTabs = document.querySelectorAll<HTMLButtonElement>('[data-nav-target]');
  const pageTitleEl = document.getElementById('page-title');
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  panelViews.forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== `panel-${targetName}`);
  });

  navTabs.forEach((tab) => {
    const isActive = tab.dataset.navTarget === targetName;
    const dot = tab.querySelector('[data-nav-dot]');
    if (isActive) {
      tab.classList.add('bg-white/15', 'text-white');
      tab.classList.remove('text-brand-cream/70');
      dot?.classList.add('bg-brand-gold');
      dot?.classList.remove('bg-white/25');
    } else {
      tab.classList.remove('bg-white/15', 'text-white');
      tab.classList.add('text-brand-cream/70');
      dot?.classList.remove('bg-brand-gold');
      dot?.classList.add('bg-white/25');
    }
  });

  if (pageTitleEl) {
    const titles: Record<string, string> = {
      overview: 'Live Desk',
      highlights: 'Slider Sequence',
      announcements: 'Notices & Circulars',
      news: 'Press & News',
      feedback: 'Public Inbox',
      admins: 'Access & Roles',
    };
    pageTitleEl.textContent = titles[targetName] || 'Live Desk';
  }

  sidebar?.classList.add('-translate-x-full');
  backdrop?.classList.add('hidden');

  adminState.onTabChange?.(targetName);
}

export function initNavigation() {
  const navTabs = document.querySelectorAll<HTMLButtonElement>('[data-nav-target]');
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const openSidebarBtn = document.getElementById('open-sidebar-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.navTarget;
      if (target) switchTab(target);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-jump-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.jumpTarget;
      if (target) switchTab(target);
    });
  });

  openSidebarBtn?.addEventListener('click', () => {
    sidebar?.classList.remove('-translate-x-full');
    backdrop?.classList.remove('hidden');
  });

  closeSidebarBtn?.addEventListener('click', () => {
    sidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
  });

  backdrop?.addEventListener('click', () => {
    sidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
  });
}
