import type { Locale } from '../i18n/ui';

export interface QuickAccessItem {
  id: string;
  title: Record<Locale, string>;
  href: Record<Locale, string>;
  available: boolean;
  external?: boolean;
}

export const QUICK_ACCESS_ITEMS = [
  {
    id: 'staff-corner',
    title: { en: 'Staff Corner', bm: 'Sudut Kakitangan' },
    href: { en: '/staff.cfm', bm: '/bm/staff.cfm' },
    available: true,
  },
  {
    id: 'online-forms',
    title: { en: 'Online Forms', bm: 'Borang Dalam Talian' },
    href: { en: '/documents.cfm', bm: '/bm/documents.cfm' },
    available: true,
  },
  {
    id: 'our-awards',
    title: { en: 'Our Awards', bm: 'Anugerah Kami' },
    href: { en: '/awards.cfm', bm: '/bm/awards.cfm' },
    available: true,
  },
  {
    id: 'our-partners',
    title: { en: 'Our Partners', bm: 'Rakan Kongsi Kami' },
    href: { en: '/directory/', bm: '/bm/directory/' },
    available: true,
  },
  {
    id: 'ptps',
    title: { en: 'Portal Tajaan Pendidikan Sabah', bm: 'Portal Tajaan Pendidikan Sabah' },
    href: {
      en: 'https://ptps.sabah.gov.my/landing/',
      bm: 'https://ptps.sabah.gov.my/landing/',
    },
    external: true,
    available: false,
  },
  {
    id: 'tpns',
    title: {
      en: 'Portal Tabung Pendidikan Negeri Sabah',
      bm: 'Portal Tabung Pendidikan Negeri Sabah',
    },
    href: { en: 'https://tpns.site/', bm: 'https://tpns.site/' },
    external: true,
    available: true,
  },
  {
    id: 'education-loan-repayment',
    title: {
      en: 'Education Loan Repayment Portal',
      bm: 'Portal Bayaran Balik Pinjaman Pendidikan',
    },
    href: { en: '/bppp/eng/index.html', bm: '/bppp/index.html' },
    available: true,
  },
  {
    id: 'tender-notice-job-vacancy',
    title: {
      en: 'Tender Notice / Job Vacancy',
      bm: 'Notis Tender / Jawatan Kosong',
    },
    href: { en: '/media/tender-notice/', bm: '/bm/media/tender-notice/' },
    available: true,
  },
  {
    id: 'e-preschool-admission',
    title: {
      en: 'E-Preschool Admission Form',
      bm: 'Borang Kemasukan E-Prasekolah',
    },
    href: {
      en: 'https://forms.gle/tZdcy74zXUHmPEJx5',
      bm: 'https://forms.gle/tZdcy74zXUHmPEJx5',
    },
    external: true,
    available: true,
  },
  {
    id: 'sports-facilities',
    title: { en: 'Sports Facilities', bm: 'Kemudahan Sukan' },
    href: { en: '/facilities.cfm', bm: '/bm/facilities.cfm' },
    available: true,
  },
  {
    id: 'frequently-asked-questions',
    title: { en: 'Frequently Asked Questions', bm: 'Soalan Lazim' },
    href: { en: '/media/faq/', bm: '/bm/media/faq/' },
    available: true,
  },
  {
    id: 'annual-report',
    title: { en: 'Annual Report', bm: 'Laporan Tahunan' },
    href: { en: '/media/annual-report/', bm: '/bm/media/annual-report/' },
    available: true,
  },
  {
    id: 'send-feedback',
    title: { en: 'Send Us Feedback', bm: 'Hantar Maklum Balas' },
    href: { en: '/contact/', bm: '/bm/contact/' },
    available: true,
  },
] satisfies QuickAccessItem[];
