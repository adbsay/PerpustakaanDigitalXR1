'use client';

import { useState, useEffect } from 'react';

export type Language = 'id' | 'en';
export type TimeZone = 'WIB' | 'WITA' | 'WIT' | 'UTC';
export type DateFormatType = 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'D MMMM YYYY';

export interface PublisherPreferences {
  language: Language;
  timeZone: TimeZone;
  dateFormat: DateFormatType;
}

const DEFAULT_PREFS: PublisherPreferences = {
  language: 'id',
  timeZone: 'WIB',
  dateFormat: 'DD/MM/YYYY',
};

export const dictionaries = {
  id: {
    // Global & Navbar
    nav: {
      dashboard: 'Dashboard',
      myEbooks: 'Katalog Ebook',
      analytics: 'Analitik',
      upload: 'Upload Ebook',
      notifTitle: 'Notifikasi Penerbit',
      noNotif: 'Tidak ada notifikasi baru',
      profile: 'Profil Penerbit',
      settings: 'Pengaturan Akun',
      help: 'Pusat Bantuan',
      logout: 'Keluar',
      bannedTitle: 'Akun Dinonaktifkan',
      bannedDesc: 'Akses akun Publisher Anda telah dinonaktifkan oleh Administrator sistem.',
      bannedLogout: 'Keluar dari Sistem',
    },
    // Dashboard
    dashboard: {
      title: 'Ruang Kerja Penerbit',
      subtitle: 'Pantau performa publikasi, analitik pembaca, dan aktivitas kurasi karya Anda.',
      welcome: 'Selamat datang kembali',
      stats: {
        totalBooks: 'Total Ebook Terbit',
        pendingBooks: 'Menunggu Kurasi',
        totalViews: 'Total Pembaca',
        avgRating: 'Rating Rata-rata',
        comparedToLast30Days: 'dari 30 hari terakhir',
        noComparison: 'Belum ada data pembanding',
      },
      chart: {
        title: 'Tren Pembaca & Tayangan',
        subtitle: 'Statistik kunjungan pembaca berdasarkan rentang waktu.',
        days7: '7 Hari',
        days30: '30 Hari',
        months6: '6 Bulan',
        year1: '1 Tahun',
        viewsLabel: 'Pembaca',
      },
      topBooks: {
        title: 'Katalog Terpopuler',
        subtitle: 'Ebook dengan performa tayangan dan rating tertinggi.',
        viewAll: 'Lihat Semua',
        reads: 'pembaca',
      },
      activity: {
        title: 'Aktivitas Kurasi Terbaru',
        subtitle: 'Pembaruan status review karya Anda oleh tim kurator.',
        empty: 'Belum ada aktivitas kurasi terbaru.',
      },
      announcement: {
        title: 'Pengumuman Resmi',
        subtitle: 'Pemberitahuan resmi dari tim administrasi perpustakaan.',
        empty: 'Tidak ada pengumuman baru.',
      }
    },
    // My Ebooks
    myEbooks: {
      title: 'Manajemen Katalog Ebook',
      subtitle: 'Kelola seluruh berkas digital, pantau status kurasi, dan edit metadata karya Anda.',
      addNew: 'Unggah Ebook Baru',
      searchPlaceholder: 'Cari judul ebook atau nama penulis...',
      tabs: {
        all: 'Semua Ebook',
        published: 'Terbit (Published)',
        pending: 'Menunggu Review',
        draft: 'Draf',
        banned: 'Ditangguhkan',
      },
      table: {
        book: 'Karya / Judul',
        category: 'Kategori',
        views: 'Pembaca',
        rating: 'Rating',
        status: 'Status Kurasi',
        date: 'Tanggal Unggah',
        actions: 'Tindakan',
      },
      status: {
        published: 'Terbit',
        pending: 'Meninjau',
        banned: 'Ditolak',
        draft: 'Draf',
      },
      actions: {
        edit: 'Edit Metadata',
        view: 'Lihat di Perpustakaan',
        delete: 'Hapus Karya',
        confirmDeleteTitle: 'Konfirmasi Hapus Ebook',
        confirmDeleteDesc: 'Apakah Anda yakin ingin menghapus ebook ini secara permanen dari sistem?',
        cancel: 'Batalkan',
        confirm: 'Ya, Hapus Ebook',
        deleting: 'Menghapus...',
      },
      empty: 'Belum ada ebook yang ditemukan.',
    },
    // Analytics
    analytics: {
      title: 'Laporan Analitik & Pembaca',
      subtitle: 'Analisis mendalam mengenai demografi pembaca, waktu baca, dan popularitas karya.',
      period7d: '7 Hari Terakhir',
      period30d: '30 Hari Terakhir',
      period6m: '6 Bulan Terakhir',
      period1y: '1 Tahun Terakhir',
      metrics: {
        totalViews: 'Akumulasi Pembaca',
        uniqueReaders: 'Pembaca Unik',
        avgDuration: 'Rata-rata Waktu Baca',
        completionRate: 'Tingkat Penyelesaian',
      },
      chartTitle: 'Performa Tayangan Ebook',
      demographicsTitle: 'Sebaran Pembaca & Kategori',
      topBooksTitle: 'Peringkat Pembaca Terbanyak',
    },
    // Upload Ebook
    upload: {
      title: 'Unggah Ebook Digital Baru',
      subtitle: 'Isi metadata karya dan lampirkan berkas PDF serta sampul buku berkualitas tinggi.',
      dropPdf: 'Seret berkas PDF di sini atau klik untuk memilih',
      dropCover: 'Unggah Gambar Sampul (JPG/PNG)',
      fields: {
        title: 'Judul Ebook',
        author: 'Nama Penulis / Pengarang',
        category: 'Kategori / Genre',
        description: 'Sinopsis & Deskripsi Singkat',
        isbn: 'ISBN / Nomor Publikasi Resmi (Opsional)',
      },
      submit: 'Ajukan ke Kurasi',
      submitting: 'Mengunggah...',
    },
    // Profile
    profile: {
      title: 'Profil Institusi Penerbit',
      subtitle: 'Kelola informasi publik dan branding penerbit Anda.',
      banner: 'Foto Sampul Banner',
      avatar: 'Logo / Foto Profil',
      save: 'Simpan Profil',
    }
  },
  en: {
    // Global & Navbar
    nav: {
      dashboard: 'Dashboard',
      myEbooks: 'My Ebooks',
      analytics: 'Analytics',
      upload: 'Upload Ebook',
      notifTitle: 'Publisher Notifications',
      noNotif: 'No new notifications',
      profile: 'Publisher Profile',
      settings: 'Account Settings',
      help: 'Help Center',
      logout: 'Log out',
      bannedTitle: 'Account Deactivated',
      bannedDesc: 'Your publisher account access has been suspended by the system administrator.',
      bannedLogout: 'Log out from System',
    },
    // Dashboard
    dashboard: {
      title: 'Publisher Workspace',
      subtitle: 'Monitor publication performance, readership analytics, and curator reviews.',
      welcome: 'Welcome back',
      stats: {
        totalBooks: 'Published Ebooks',
        pendingBooks: 'Pending Review',
        totalViews: 'Total Readers',
        avgRating: 'Average Rating',
        comparedToLast30Days: 'from last 30 days',
        noComparison: 'No comparative data yet',
      },
      chart: {
        title: 'Reader & Views Trends',
        subtitle: 'Readership visitor statistics over selected time range.',
        days7: '7 Days',
        days30: '30 Days',
        months6: '6 Months',
        year1: '1 Year',
        viewsLabel: 'Readers',
      },
      topBooks: {
        title: 'Top Performing Ebooks',
        subtitle: 'Ebooks with the highest view counts and reader ratings.',
        viewAll: 'View All',
        reads: 'readers',
      },
      activity: {
        title: 'Recent Curation Activity',
        subtitle: 'Status updates on your publications by our curator team.',
        empty: 'No recent curation activity.',
      },
      announcement: {
        title: 'Official Announcements',
        subtitle: 'Important notices from the library administration team.',
        empty: 'No new announcements.',
      }
    },
    // My Ebooks
    myEbooks: {
      title: 'Ebook Catalog Management',
      subtitle: 'Manage digital publications, track curation status, and edit metadata.',
      addNew: 'Upload New Ebook',
      searchPlaceholder: 'Search ebook title or author name...',
      tabs: {
        all: 'All Ebooks',
        published: 'Published',
        pending: 'Pending Review',
        draft: 'Draft',
        banned: 'Suspended',
      },
      table: {
        book: 'Publication / Title',
        category: 'Category',
        views: 'Readers',
        rating: 'Rating',
        status: 'Curation Status',
        date: 'Date Added',
        actions: 'Actions',
      },
      status: {
        published: 'Published',
        pending: 'Reviewing',
        banned: 'Rejected',
        draft: 'Draft',
      },
      actions: {
        edit: 'Edit Metadata',
        view: 'View in Library',
        delete: 'Delete Publication',
        confirmDeleteTitle: 'Confirm Ebook Deletion',
        confirmDeleteDesc: 'Are you sure you want to permanently delete this ebook from the system?',
        cancel: 'Cancel',
        confirm: 'Yes, Delete Ebook',
        deleting: 'Deleting...',
      },
      empty: 'No ebooks found.',
    },
    // Analytics
    analytics: {
      title: 'Analytics & Readership Report',
      subtitle: 'In-depth analysis on reader demographics, reading time, and catalog popularity.',
      period7d: 'Last 7 Days',
      period30d: 'Last 30 Days',
      period6m: 'Last 6 Months',
      period1y: 'Last 1 Year',
      metrics: {
        totalViews: 'Accumulated Readers',
        uniqueReaders: 'Unique Readers',
        avgDuration: 'Avg. Reading Time',
        completionRate: 'Completion Rate',
      },
      chartTitle: 'Ebook Readership Performance',
      demographicsTitle: 'Reader Demographics & Categories',
      topBooksTitle: 'Most Read Publications',
    },
    // Upload Ebook
    upload: {
      title: 'Upload New Digital Ebook',
      subtitle: 'Fill in metadata and attach high-quality PDF files and book cover images.',
      dropPdf: 'Drag PDF file here or click to browse',
      dropCover: 'Upload Cover Image (JPG/PNG)',
      fields: {
        title: 'Ebook Title',
        author: 'Author Name',
        category: 'Category / Genre',
        description: 'Synopsis & Brief Description',
        isbn: 'ISBN / Official Publication Number (Optional)',
      },
      submit: 'Submit for Curation',
      submitting: 'Uploading...',
    },
    // Profile
    profile: {
      title: 'Publisher Institution Profile',
      subtitle: 'Manage public information and branding for your publisher page.',
      banner: 'Cover Banner Image',
      avatar: 'Logo / Profile Picture',
      save: 'Save Profile',
    }
  }
};

export function getPublisherPreferences(): PublisherPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem('publisher_preferences');
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      language: parsed.language === 'en' ? 'en' : 'id',
      timeZone: parsed.timeZone || 'WIB',
      dateFormat: parsed.dateFormat || 'DD/MM/YYYY',
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function formatPublisherDate(dateInput: string | Date | number, prefs?: PublisherPreferences): string {
  const p = prefs || getPublisherPreferences();
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  if (p.dateFormat === 'YYYY-MM-DD') {
    return date.toISOString().split('T')[0];
  }

  if (p.dateFormat === 'D MMMM YYYY') {
    return date.toLocaleDateString(p.language === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Default: DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function usePublisherI18n() {
  const [prefs, setPrefs] = useState<PublisherPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    const load = () => {
      setPrefs(getPublisherPreferences());
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const t = dictionaries[prefs.language] || dictionaries.id;

  return {
    prefs,
    lang: prefs.language,
    timeZone: prefs.timeZone,
    dateFormat: prefs.dateFormat,
    t,
    formatDate: (d: string | Date | number) => formatPublisherDate(d, prefs),
  };
}
