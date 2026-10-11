export interface SubMenuItem {
  label: { en: string; bm: string };
  href: string;
}

export interface MenuGroup {
  title?: { en: string; bm: string };
  items: SubMenuItem[];
}

export interface NavItem {
  id: string;
  label: { en: string; bm: string };
  href: string;
  columns?: MenuGroup[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: { en: 'Home', bm: 'Utama' },
    href: '/',
  },
  {
    id: 'about',
    label: { en: 'About', bm: 'Tentang Kami' },
    href: '/about/',
    columns: [
      {
        items: [
          { label: { en: 'Foreword', bm: 'Prakata' }, href: '/about/foreword/' },
          { label: { en: 'Introduction', bm: 'Pengenalan' }, href: '/about/introduction/' },
          { label: { en: 'Corporate Structure', bm: 'Struktur Korporat' }, href: '/about/corporate-structure/' },
          { label: { en: 'Board of Trustees Yayasan Sabah', bm: 'Lembaga Pemegang Amanah Yayasan Sabah' }, href: '/about/board-of-trustees/' },
          { label: { en: 'Former Chairmen Yayasan Sabah Board of Trustees', bm: 'Bekas Pengerusi Lembaga Pemegang Amanah' }, href: '/about/former-chairmen-bot/' },
          { label: { en: 'Former Directors of Yayasan Sabah', bm: 'Bekas Pengarah Yayasan Sabah' }, href: '/about/former-directors/' },
          { label: { en: 'Former Deputy Directors of Yayasan Sabah', bm: 'Bekas Timbalan Pengarah Yayasan Sabah' }, href: '/about/former-deputy-directors/' },
          { label: { en: 'Board of Directors Innoprise Corporation Sdn. Bhd.', bm: 'Lembaga Pengarah Innoprise Corporation Sdn. Bhd.' }, href: '/about/board-directors-icsb/' },
          { label: { en: 'Former Chairmen Innoprise Corporation Sdn. Bhd.', bm: 'Bekas Pengerusi Innoprise Corporation Sdn. Bhd.' }, href: '/about/former-chairmen-bod/' },
          { label: { en: 'Management Team', bm: 'Pasukan Pengurusan' }, href: '/about/management-team/' },
          { label: { en: 'Chief Information Officer (CIO)', bm: 'Ketua Pegawai Maklumat (CIO)' }, href: '/about/cio/' },
        ],
      },
      {
        items: [
          { label: { en: 'Corporate Logo', bm: 'Logo Korporat' }, href: '/about/corporate-logo/' },
          { label: { en: 'Corporate Song', bm: 'Lagu Korporat' }, href: '/about/corporate-song/' },
          { label: { en: 'Menara Tun Mustapha', bm: 'Menara Tun Mustapha' }, href: '/about/menara-tun-mustapha/' },
          { label: { en: 'Vision / Mission', bm: 'Visi / Misi' }, href: '/about/vision-mission/' },
          { label: { en: 'Objectives', bm: 'Objektif' }, href: '/about/objectives/' },
          { label: { en: 'Role', bm: 'Peranan' }, href: '/about/roles/' },
          { label: { en: 'Function', bm: 'Fungsi' }, href: '/about/functions/' },
          { label: { en: 'Core Values', bm: 'Nilai-Nilai Teras' }, href: '/about/core-values/' },
          { label: { en: 'Milestones', bm: 'Mercu Tanda' }, href: '/about/milestones/' },
        ],
      },
    ],
  },
  {
    id: 'activities',
    label: { en: 'Activities', bm: 'Aktiviti' },
    href: '/activities/',
    columns: [
      {
        title: { en: 'Social', bm: 'Sosial' },
        items: [
          { label: { en: 'Zone Activities', bm: 'Aktiviti Zon' }, href: '/activities/zone-activities/' },
          { label: { en: 'Capacity Development', bm: 'Pembangunan Kapasiti' }, href: '/activities/capacity-development/' },
          { label: { en: 'Education', bm: 'Pendidikan' }, href: '/activities/education/' },
          { label: { en: 'Child Development', bm: 'Perkembangan Kanak-Kanak' }, href: '/activities/child-development/' },
          { label: { en: 'Kolej Teknologi Yayasan Sabah', bm: 'Kolej Teknologi Yayasan Sabah' }, href: '/activities/ktys/' },
          { label: { en: 'University College Sabah Foundation', bm: 'University College Sabah Foundation' }, href: '/activities/ucsf/' },
          { label: { en: 'Tun Haji Mohd. Fuad Stephens Borneo Research Library', bm: 'Perpustakaan Penyelidikan Borneo Tun Haji Mohd. Fuad Stephens' }, href: '/activities/borneo-research-library/' },
          { label: { en: 'Tun Mustapha Gallery', bm: 'Galeri Tun Mustapha' }, href: '/activities/tun-mustapha-gallery/' },
          { label: { en: 'Research on Socioeconomic Programmes', bm: 'Penyelidikan Program Sosioekonomi' }, href: '/activities/research-socioeconomic/' },
          { label: { en: 'Occupational Safety & Health', bm: 'Keselamatan & Kesihatan Pekerjaan' }, href: '/activities/osh/' },
        ],
      },
      {
        title: { en: 'Commercial', bm: 'Komersial' },
        items: [
          { label: { en: 'Innoprise Corporation Sdn. Bhd.', bm: 'Innoprise Corporation Sdn. Bhd.' }, href: '/activities/icsb/' },
          { label: { en: 'Tourism', bm: 'Pelancongan' }, href: '/activities/tourism/' },
          { label: { en: 'MICE', bm: 'MICE' }, href: '/activities/mice/' },
          { label: { en: 'Agro Plantation', bm: 'Agro Perladangan' }, href: '/activities/agro-plantation/' },
          { label: { en: 'Oil, Gas & Energy', bm: 'Minyak, Gas & Tenaga' }, href: '/activities/oil-gas/' },
          { label: { en: 'Forestry', bm: 'Perhutanan' }, href: '/activities/forestry/' },
          { label: { en: 'Biotechnology & Horticulture', bm: 'Bioteknologi & Hortikultur' }, href: '/activities/biotechnology-horticulture/' },
          { label: { en: 'Properties Development', bm: 'Pembangunan Hartanah' }, href: '/activities/properties-development/' },
          { label: { en: 'Manufacturing', bm: 'Pembuatan' }, href: '/activities/manufacturing/' },
        ],
      },
      {
        title: { en: 'Corporate Social Responsibility', bm: 'Tanggungjawab Sosial Korporat' },
        items: [
          { label: { en: 'Conservation & Environmental Management', bm: 'Pemuliharaan & Pengurusan Alam Sekitar' }, href: '/activities/conservation-management/' },
        ],
      },
    ],
  },
  {
    id: 'directory',
    label: { en: 'Directory', bm: 'Direktori' },
    href: '/directory/',
    columns: [
      {
        items: [
          { label: { en: 'Menara Tun Mustapha', bm: 'Menara Tun Mustapha' }, href: '/directory/menara-tun-mustapha/' },
          { label: { en: 'Wisma Innoprise', bm: 'Wisma Innoprise' }, href: '/directory/wisma-innoprise/' },
          { label: { en: 'Tun Adnan Sports Complex', bm: 'Kompleks Sukan Tun Adnan' }, href: '/directory/tun-adnan-sports-complex/' },
          { label: { en: 'Child Development', bm: 'Perkembangan Kanak-Kanak' }, href: '/directory/child-development/' },
          { label: { en: 'Pusat Kraftangan Sabah', bm: 'Pusat Kraftangan Sabah' }, href: '/directory/pusat-kraftangan-sabah/' },
          { label: { en: 'YSG Bioscape Sdn. Bhd.', bm: 'YSG Bioscape Sdn. Bhd.' }, href: '/directory/ysg-bioscape/' },
        ],
      },
      {
        items: [
          { label: { en: 'Kolej Teknologi Yayasan Sabah', bm: 'Kolej Teknologi Yayasan Sabah' }, href: '/directory/ktys/' },
          { label: { en: 'University College Sabah Foundation', bm: 'University College Sabah Foundation' }, href: '/directory/ucsf/' },
          { label: { en: 'Zone Offices / Hostels', bm: 'Pejabat Zon / Asrama' }, href: '/directory/zone-offices/' },
          { label: { en: 'Urban Transformation Centre (UTC)', bm: 'Pusat Transformasi Bandar (UTC)' }, href: '/directory/utc/' },
          { label: { en: 'YS Kuala Lumpur Branch', bm: 'Cawangan YS Kuala Lumpur' }, href: '/directory/kl-branch/' },
          { label: { en: 'Subsidiaries', bm: 'Anak-Anak Syarikat' }, href: '/directory/subsidiaries/' },
        ],
      },
    ],
  },
  {
    id: 'media',
    label: { en: 'Media', bm: 'Media' },
    href: '/media/',
    columns: [
      {
        items: [
          { label: { en: 'Press Release', bm: 'Kenyataan Media' }, href: '/media/press-release/' },
          { label: { en: 'Current News', bm: 'Berita Semasa' }, href: '/media/news/' },
          { label: { en: 'Calendar of Events', bm: 'Kalendar Acara' }, href: '/media/calendar/' },
          { label: { en: 'Photo Gallery', bm: 'Galeri Foto' }, href: '/media/photo-gallery/' },
          { label: { en: 'Video Gallery', bm: 'Galeri Video' }, href: '/media/video-gallery/' },
        ],
      },
      {
        items: [
          { label: { en: 'Publication', bm: 'Penerbitan' }, href: '/media/publication/' },
          { label: { en: 'Annual Report', bm: 'Laporan Tahunan' }, href: '/media/annual-report/' },
          { label: { en: 'Corporate Advertisement', bm: 'Iklan Korporat' }, href: '/media/corporate-advertisement/' },
          { label: { en: 'Tender Notice / Job Vacancy', bm: 'Notis Tender / Jawatan Kosong' }, href: '/media/tender-notice/' },
          { label: { en: 'Frequently Asked Questions', bm: 'Soalan Lazim' }, href: '/media/faq/' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    label: { en: 'Contact Us', bm: 'Hubungi Kami' },
    href: '/contact/',
  },
];

export const NAV = NAV_ITEMS;