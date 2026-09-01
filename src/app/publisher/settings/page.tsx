'use client';

import { useState, useEffect } from 'react';
import {
  User, Shield, Sliders, Lock, Bell, Key, Copy, Check, Eye, EyeOff,
  AlertTriangle, CheckCircle2, Smartphone, Monitor, Trash2, ArrowRight,
  Sparkles, Globe, Clock, Calendar, Mail, LogOut, RefreshCw
} from 'lucide-react';
import { useNotificationContext } from '@/context/NotificationContext';

type TabType = 'profil' | 'akun' | 'tampilan' | 'keamanan' | 'notifikasi' | 'apikeys';

interface PublisherProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio?: string | null;
  website?: string | null;
  status: string;
  totalBooks?: number;
  createdAt: string;
}

// Full Localization Dictionary (ID & EN)
const i18n = {
  id: {
    systemSettings: 'Pengaturan Sistem',
    systemSettingsDesc: 'Kelola profil institusi, kredensial login, tampilan antarmuka, notifikasi, dan integrasi API penerbit Anda.',
    loading: 'Memuat pengaturan sistem...',
    tabs: {
      profil: 'Profil',
      akun: 'Akun',
      tampilan: 'Tampilan',
      keamanan: 'Keamanan',
      notifikasi: 'Notifikasi',
      apikeys: 'API Keys',
    },
    profil: {
      title: 'Informasi Profil Institusi',
      subtitle: 'Kelola data publik penerbit yang dapat dilihat oleh pengunjung perpustakaan.',
      nameLabel: 'Nama Institusi / Publisher',
      bioLabel: 'Bio Singkat / Deskripsi',
      bioPlaceholder: "'Tulis deskripsi institusi penerbit anda secara ringkas...",
      websiteLabel: 'Situs Web Resmi',
      phoneLabel: 'Nomor Telepon Kontak Official',
      saveButton: 'Simpan Perubahan',
      saving: 'Menyimpan...',
    },
    akun: {
      title: 'Identitas & Akses Akun',
      subtitle: 'Kredensial permanen yang terkait dengan status kemitraan penerbit Anda.',
      emailLabel: 'Email Utama (ID Login)',
      verified: 'Terverifikasi Resmi',
      idLabel: 'ID Penerbit Sistem (Unique UUID)',
      copy: 'Salin',
      copied: 'Tersalin',
      dangerTitle: 'Zona Bahaya (Danger Zone)',
      closeAccount: 'Tutup Akun Penerbit',
      dangerDesc: 'Menghapus akun akan memusnahkan semua data secara permanen dan menurunkan seluruh katalog ebook digital Anda dari perpustakaan.',
      deleteButton: 'Hapus Akun Permanen',
    },
    tampilan: {
      title: 'Preferensi Tampilan & Format Regional',
      subtitle: 'Sesuaikan preferensi bahasa dan konfigurasi lokal sistem analitik Anda.',
      langLabel: 'Bahasa Antarmuka',
      timeZoneLabel: 'Zona Waktu Analitik',
      dateFormatLabel: 'Format Penanggalan',
      autoSavedNotice: 'Pengaturan otomatis disimpan & diterapkan ke seluruh antarmuka saat opsi diubah.',
    },
    keamanan: {
      title: 'Kredensial Login',
      subtitle: 'Perbarui kata sandi secara berkala untuk melindungi akses ruang kontrol Anda.',
      currentPasswordLabel: 'Kata Sandi Saat Ini',
      currentPasswordPlaceholder: 'Masukkan kata sandi lama',
      newPasswordLabel: 'Kata Sandi Baru',
      newPasswordPlaceholder: 'Minimal 8 karakter kombinasi',
      confirmPasswordLabel: 'Konfirmasi Kata Sandi Baru',
      confirmPasswordPlaceholder: 'Ulangi kata sandi baru',
      strengthLabel: 'Kekuatan Sandi',
      updateButton: 'Perbarui Kata Sandi',
      updating: 'Menyimpan...',
      sessionTitle: 'Riwayat Sesi Masuk',
      sessionDesc: 'Daftar perangkat yang saat ini terautentikasi.',
      sessionActive: 'Aktif',
      logoutSession: 'Keluar Sesi',
    },
    notifikasi: {
      title: 'Saluran & Preferensi Notifikasi',
      subtitle: 'Konfigurasi jenis aktivitas apa saja yang dikirimkan melalui surel dan sistem pemberitahuan.',
      curationStatus: 'Status Kurasi Ebook',
      curationDesc: 'Pemberitahuan saat buku disetujui atau butuh revisi.',
      analyticsReport: 'Laporan Analitik Mingguan',
      analyticsDesc: 'Ringkasan tayangan dan performa setiap hari Senin.',
      adminBroadcast: 'Siaran & Kebijakan Admin',
      adminDesc: 'Pemberitahuan pembaruan panduan perpustakaan.',
      securityAlert: 'Peringatan Keamanan Akun',
      securityDesc: 'Pemberitahuan login dari perangkat tidak dikenal.',
      saveButton: 'Simpan Notifikasi',
      saving: 'Menyimpan...',
    },
    apikeys: {
      title: 'Kunci Integrasi API (Publisher Key)',
      subtitle: 'Gunakan token autentikasi ini untuk integrasi eksternal.',
      newKeyButton: 'Buat Kunci Baru',
      copyKey: 'Salin Kunci',
      copiedKey: 'Tersalin',
      webhookTitle: 'Webhook URL',
      webhookSubtitle: 'Payload pembaruan status buku dikirim ke endpoint ini.',
      saveWebhook: 'Simpan Webhook',
    },
    modal: {
      confirmTitle: 'Konfirmasi Penutupan Akun',
      confirmDesc: 'Tindakan ini bersifat permanen. Seluruh metadata karya, berkas digital, dan hak akses penerbit Anda akan dinonaktifkan dari sistem.',
      typeConfirm: 'Ketik HAPUS AKUN untuk mengonfirmasi:',
      cancel: 'Batalkan',
      confirmDelete: 'Tutup Akun Permanen',
      processing: 'Memproses...',
    }
  },
  en: {
    systemSettings: 'System Settings',
    systemSettingsDesc: 'Manage institutional profile, login credentials, interface display, notifications, and your publisher API integration.',
    loading: 'Loading system settings...',
    tabs: {
      profil: 'Profile',
      akun: 'Account',
      tampilan: 'Appearance',
      keamanan: 'Security',
      notifikasi: 'Notifications',
      apikeys: 'API Keys',
    },
    profil: {
      title: 'Institutional Profile Information',
      subtitle: 'Manage publisher public data visible to library visitors.',
      nameLabel: 'Institution / Publisher Name',
      bioLabel: 'Short Bio / Description',
      bioPlaceholder: "'Write a brief description of your publisher institution...",
      websiteLabel: 'Official Website',
      phoneLabel: 'Official Contact Phone Number',
      saveButton: 'Save Changes',
      saving: 'Saving...',
    },
    akun: {
      title: 'Identity & Account Access',
      subtitle: 'Permanent credentials associated with your publisher partnership status.',
      emailLabel: 'Primary Email (Login ID)',
      verified: 'Officially Verified',
      idLabel: 'System Publisher ID (Unique UUID)',
      copy: 'Copy',
      copied: 'Copied',
      dangerTitle: 'Danger Zone',
      closeAccount: 'Close Publisher Account',
      dangerDesc: 'Deleting your account will permanently erase all data and delist all your digital ebooks from the library.',
      deleteButton: 'Delete Account Permanently',
    },
    tampilan: {
      title: 'Appearance & Regional Format Preferences',
      subtitle: 'Customize language preferences and local configuration for your analytics system.',
      langLabel: 'Interface Language',
      timeZoneLabel: 'Analytics Time Zone',
      dateFormatLabel: 'Date Format',
      autoSavedNotice: 'Settings are automatically saved and applied across the entire website when options are changed.',
    },
    keamanan: {
      title: 'Login Credentials',
      subtitle: 'Update password regularly to protect access to your control panel.',
      currentPasswordLabel: 'Current Password',
      currentPasswordPlaceholder: 'Enter current password',
      newPasswordLabel: 'New Password',
      newPasswordPlaceholder: 'Minimum 8 characters combination',
      confirmPasswordLabel: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Repeat new password',
      strengthLabel: 'Password Strength',
      updateButton: 'Update Password',
      updating: 'Saving...',
      sessionTitle: 'Active Login Sessions',
      sessionDesc: 'List of devices currently authenticated.',
      sessionActive: 'Active',
      logoutSession: 'Log Out Session',
    },
    notifikasi: {
      title: 'Notification Channels & Preferences',
      subtitle: 'Configure which types of activity are delivered via email and the notification system.',
      curationStatus: 'Ebook Curation Status',
      curationDesc: 'Notification when books are approved or require revision.',
      analyticsReport: 'Weekly Analytics Report',
      analyticsDesc: 'Summary of views and performance every Monday.',
      adminBroadcast: 'Admin Broadcasts & Policies',
      adminDesc: 'Updates on library guidelines and policies.',
      securityAlert: 'Account Security Alerts',
      securityDesc: 'Notification of login from unrecognized devices.',
      saveButton: 'Save Notifications',
      saving: 'Saving...',
    },
    apikeys: {
      title: 'API Integration Keys (Publisher Key)',
      subtitle: 'Use this authentication token for external integration.',
      newKeyButton: 'Generate New Key',
      copyKey: 'Copy Key',
      copiedKey: 'Copied',
      webhookTitle: 'Webhook URL',
      webhookSubtitle: 'Book status update payloads will be sent to this endpoint.',
      saveWebhook: 'Save Webhook',
    },
    modal: {
      confirmTitle: 'Confirm Account Closure',
      confirmDesc: 'This action is permanent. All publication metadata, digital files, and publisher access rights will be deactivated from the system.',
      typeConfirm: 'Type HAPUS AKUN to confirm:',
      cancel: 'Cancel',
      confirmDelete: 'Delete Account Permanently',
      processing: 'Processing...',
    }
  }
};

export default function PublisherSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profil');
  const [publisher, setPublisher] = useState<PublisherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Profil Form States
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Akun States
  const [copiedId, setCopiedId] = useState(false);

  // Tampilan Form States
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [timeZone, setTimeZone] = useState('WIB');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Keamanan Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { prefs: globalNotifPrefs, updateNotificationPrefs } = useNotificationContext();
  
  // Draft State for Notifications
  const [draftNotifs, setDraftNotifs] = useState({
    ebookCuration: globalNotifPrefs.ebookCuration,
    weeklyAnalytics: globalNotifPrefs.weeklyAnalytics,
    adminBroadcasts: globalNotifPrefs.adminBroadcasts,
    securityAlerts: globalNotifPrefs.securityAlerts,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  useEffect(() => {
    setDraftNotifs({
      ebookCuration: globalNotifPrefs.ebookCuration,
      weeklyAnalytics: globalNotifPrefs.weeklyAnalytics,
      adminBroadcasts: globalNotifPrefs.adminBroadcasts,
      securityAlerts: globalNotifPrefs.securityAlerts,
    });
  }, [globalNotifPrefs]);

  // API Keys States
  const [apiKey, setApiKey] = useState('pub_live_9f83a7c4e2b10d58872e418c');
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://katalog.penerbit-anda.com/api/v1/webhook');
  const [savingWebhook, setSavingWebhook] = useState(false);

  // Danger Zone Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Device & Session Info
  const [sessionInfo, setSessionInfo] = useState({
    ip: '180.252.164.12',
    location: 'Jakarta, Indonesia',
    browser: 'Chrome',
    os: 'Windows 11',
    isMobile: false,
  });

  const t = i18n[language] || i18n.id;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('publisher_settings_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as TabType;
      const storedTab = sessionStorage.getItem('publisher_settings_tab') as TabType;
      const validTabs: TabType[] = ['profil', 'akun', 'tampilan', 'keamanan', 'notifikasi', 'apikeys'];
      
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (storedTab && validTabs.includes(storedTab)) {
        setActiveTab(storedTab);
      }
    }
    
    const fetchProfile = async () => {
      const token = localStorage.getItem('publisher_token');
      if (!token) return;
      try {
        const res = await fetch('/api/publisher/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const j = await res.json();
        if (j.success && j.data) {
          setPublisher(j.data);
          setName(j.data.name || '');
          setBio(j.data.bio || '');
          setWebsite(j.data.website ? j.data.website.replace(/^https?:\/\//, '') : '');
          setPhone(j.data.phone || '');
        }
      } catch (err) {
        console.error('Error fetching publisher profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    try {
      const savedPrefs = localStorage.getItem('publisher_preferences');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.language === 'en' || parsed.language === 'id') {
          setLanguage(parsed.language);
        }
        if (parsed.timeZone) setTimeZone(parsed.timeZone);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      let browser = 'Chrome';
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
      else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
      else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

      let os = 'Windows';
      if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          setSessionInfo({
            ip: data.ip || '180.252.164.12',
            location: `${data.city || 'Jakarta'}, ${data.country_name || 'Indonesia'}`,
            browser,
            os,
            isMobile
          });
        })
        .catch(() => {
          setSessionInfo({
            ip: '180.252.164.12',
            location: 'Jakarta, Indonesia',
            browser,
            os,
            isMobile
          });
        });
    }
  }, []);

  const handleCopyId = () => {
    if (publisher?.id) {
      navigator.clipboard.writeText(publisher.id);
      setCopiedId(true);
      showToast(language === 'en' ? 'Publisher ID copied to clipboard!' : 'ID Penerbit berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    showToast(language === 'en' ? 'API Key copied to clipboard!' : 'API Key berhasil disalin!', 'success');
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const handleRegenerateApiKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = `pub_live_${randomHex}`;
    setApiKey(newKey);
    showToast(language === 'en' ? 'New API key generated!' : 'Kunci API baru berhasil dibuat!', 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const token = localStorage.getItem('publisher_token');

    try {
      const fullWebsite = website.trim() ? (website.startsWith('http') ? website : `https://${website.trim()}`) : '';
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('website', fullWebsite);
      formData.append('phone', phone);

      const res = await fetch('/api/publisher/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const j = await res.json();
      if (j.success) {
        setPublisher(j.data);
        localStorage.setItem('publisher_user', JSON.stringify(j.data));
        window.dispatchEvent(new Event('storage'));
        showToast(language === 'en' ? 'Publisher profile successfully updated!' : 'Profil penerbit berhasil diperbarui!', 'success');
      } else {
        showToast(j.error || (language === 'en' ? 'Failed to save profile' : 'Gagal menyimpan profil'), 'error');
      }
    } catch {
      showToast(language === 'en' ? 'Network error occurred' : 'Terjadi kesalahan jaringan', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLanguageChange = (newLang: 'id' | 'en') => {
    setLanguage(newLang);
    const updated = { language: newLang, timeZone, dateFormat };
    localStorage.setItem('publisher_preferences', JSON.stringify(updated));
    localStorage.setItem('publisher_language', newLang);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('publisher_settings_tab', 'tampilan');
      window.dispatchEvent(new Event('storage'));
    }
    showToast(newLang === 'en' ? 'Switching language to English...' : 'Mengubah bahasa ke Bahasa Indonesia...', 'info');
    setTimeout(() => {
      window.location.href = '/publisher/settings?tab=tampilan';
    }, 300);
  };

  const handleTimeZoneChange = (newZone: string) => {
    setTimeZone(newZone);
    const updated = { language, timeZone: newZone, dateFormat };
    localStorage.setItem('publisher_preferences', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('publisher_settings_tab', 'tampilan');
      window.dispatchEvent(new Event('storage'));
    }
    showToast(language === 'en' ? `Time zone set to ${newZone}. Reloading...` : `Zona waktu diatur ke ${newZone}. Memuat ulang...`, 'info');
    setTimeout(() => {
      window.location.href = '/publisher/settings?tab=tampilan';
    }, 300);
  };

  const handleDateFormatChange = (newFormat: string) => {
    setDateFormat(newFormat);
    const updated = { language, timeZone, dateFormat: newFormat };
    localStorage.setItem('publisher_preferences', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('publisher_settings_tab', 'tampilan');
      window.dispatchEvent(new Event('storage'));
    }
    showToast(language === 'en' ? `Date format updated to ${newFormat}. Reloading...` : `Format penanggalan diubah ke ${newFormat}. Memuat ulang...`, 'info');
    setTimeout(() => {
      window.location.href = '/publisher/settings?tab=tampilan';
    }, 300);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: language === 'en' ? 'Password confirmation does not match.' : 'Konfirmasi kata sandi baru tidak cocok.'
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: language === 'en' ? 'New password must be at least 8 characters.' : 'Kata sandi baru minimal harus 8 karakter.'
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('publisher_token');
      const res = await fetch('/api/publisher/settings/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (data.success) {
        setPasswordStatus({
          type: 'success',
          message: language === 'en' ? 'Your login credentials have been updated.' : 'Kredensial login Anda berhasil diperbarui.'
        });
        showToast(language === 'en' ? 'Password updated successfully!' : 'Kata sandi berhasil diubah!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({
          type: 'error',
          message: data.error || (language === 'en' ? 'Failed to update password. Check your old password.' : 'Gagal memperbarui kata sandi. Periksa kata sandi lama Anda.')
        });
      }
    } catch {
      setPasswordStatus({
        type: 'error',
        message: language === 'en' ? 'System error occurred.' : 'Terjadi kesalahan sistem.'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveNotifs = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifs(true);
    setTimeout(() => {
      updateNotificationPrefs(draftNotifs);
      setSavingNotifs(false);
      showToast(language === 'en' ? 'Settings saved successfully' : 'Pengaturan notifikasi berhasil disimpan', 'success');
    }, 800);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    setTimeout(() => {
      setSavingWebhook(false);
      showToast(language === 'en' ? 'Webhook URL configured!' : 'Konfigurasi Webhook berhasil disimpan!', 'success');
    }, 400);
  };

  const handleLogout = async () => {
    await fetch('/api/publisher/auth/me', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('publisher_token');
    localStorage.removeItem('publisher_user');
    window.location.href = '/publisher/auth/login';
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim() !== 'HAPUS AKUN') {
      showToast(language === 'en' ? 'Type "HAPUS AKUN" in capital letters to confirm.' : 'Ketik "HAPUS AKUN" dengan huruf kapital untuk konfirmasi.', 'error');
      return;
    }
    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
      showToast(language === 'en' ? 'Account deletion request submitted to Administrator.' : 'Permintaan penghapusan akun telah diajukan ke Administrator.', 'info');
      setDeleteConfirmText('');
    }, 1200);
  };

  const menuItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'profil', label: t.tabs.profil, icon: User },
    { id: 'akun', label: t.tabs.akun, icon: Shield },
    { id: 'tampilan', label: t.tabs.tampilan, icon: Sliders },
    { id: 'keamanan', label: t.tabs.keamanan, icon: Lock },
    { id: 'notifikasi', label: t.tabs.notifikasi, icon: Bell },
    { id: 'apikeys', label: t.tabs.apikeys, icon: Key },
  ];

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>{t.loading}</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '0 0 64px' }}>
      
      {/* 
        =======================================================
        CSS KHUSUS MOBILE UNTUK LAYOUT VERTIKAL & HEMAT RUANG 
        =======================================================
      */}
      <style>{`
        @media (max-width: 768px) {
          /* Bagian Header Page */
          .settings-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .settings-header-badge { align-self: flex-start !important; }
          
          /* Container Utama menjadi Susun Bawah (Vertikal) */
          .settings-layout { flex-direction: column !important; gap: 16px !important; }
          
          /* Sidebar menjadi Menu Horizontal yang bisa di-Swipe/Scroll (Sangat hemat ruang) */
          .settings-sidebar { 
            width: 100% !important; 
            flex-direction: row !important; 
            overflow-x: auto !important; 
            position: static !important; 
            padding: 8px !important; 
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch;
          }
          /* Sembunyikan scrollbar agar terlihat modern */
          .settings-sidebar::-webkit-scrollbar { display: none; }
          .settings-sidebar { -ms-overflow-style: none; scrollbar-width: none; }
          .settings-sidebar-btn { flex-shrink: 0 !important; padding: 8px 16px !important; font-size: 0.813rem !important; }
          
          /* Area Konten Form menjadi 100% Lebar Layar */
          .settings-main { width: 100% !important; }
          
          /* Semua Input Form yang 2 Kolom (Grid) menjadi 1 Kolom Vertikal */
          .form-grid-2 { grid-template-columns: 1fr !important; gap: 16px !important; }
          .form-grid-auto { grid-template-columns: 1fr !important; gap: 16px !important; }
          
          /* Area Zona Bahaya (Akun) */
          .danger-zone-body { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .danger-zone-body button { width: 100% !important; justify-content: center !important; }
          
          /* Sesi Masuk (Keamanan) */
          .session-info { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .session-info button { width: 100% !important; justify-content: center !important; }
          
          /* API Keys */
          .apikeys-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .apikeys-header button { width: 100% !important; justify-content: center !important; }
          .apikeys-input-group { flex-direction: column !important; align-items: stretch !important; }
          
          /* Modal Hapus Akun */
          .delete-modal { width: 90% !important; max-width: 90% !important; padding: 20px !important; }
          .delete-modal-actions { flex-direction: column-reverse !important; }
          .delete-modal-actions button { width: 100% !important; }
        }
      `}</style>

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '28px',
          right: '28px',
          zIndex: 99999,
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#FFFFFF',
          background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#2563EB',
          border: toast.type === 'success' ? '1px solid #10B981' : toast.type === 'error' ? '1px solid #EF4444' : '1px solid #3B82F6',
          animation: 'subtleFadeIn 0.2s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#A7F3D0" /> : toast.type === 'error' ? <AlertTriangle size={18} color="#FCA5A5" /> : <Sparkles size={18} color="#93C5FD" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. PROFESSIONAL HEADER SECTION */}
      <div className="settings-header" style={{
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '6px',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            color: '#2563EB',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            <Sliders size={12} strokeWidth={2.5} />
            <span>{language === 'en' ? 'Publisher Control Panel' : 'Panel Kontrol Penerbit'}</span>
          </div>

          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: '0 0 6px',
            lineHeight: 1.2
          }}>
            {t.systemSettings}
          </h1>

          <p style={{
            fontSize: '0.875rem',
            color: '#64748B',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: '640px'
          }}>
            {t.systemSettingsDesc}
          </p>
        </div>

        <div className="settings-header-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          fontSize: '0.75rem',
          color: '#475569',
          fontWeight: 600,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 0 3px rgba(16,185,129,0.2)'
          }} />
          <span>{language === 'en' ? 'System Online & Synced' : 'Sistem Aktif & Terhubung'}</span>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT (SIDEBAR & CONTENT) */}
      <div className="settings-layout" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', width: '100%' }}>
        
        {/* SIDEBAR */}
        <aside className="settings-sidebar" style={{
          width: '230px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0,
          position: 'sticky',
          top: '84px',
          zIndex: 10
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className="settings-sidebar-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 14px',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#E2EDFA' : 'transparent',
                  color: isActive ? '#1D4ED8' : '#4B5563',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#4B5563';
                  }
                }}
              >
                <Icon size={16} color={isActive ? '#2563EB' : '#6B7280'} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* AREA KONTEN KANAN */}
        <main className="settings-main" style={{ flex: 1, minWidth: 0 }}>
          
          {/* ======================================================== */}
          {/* TAB 1: PROFIL */}
          {/* ======================================================== */}
          {activeTab === 'profil' && (
            <form onSubmit={handleSaveProfile} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Header Kartu */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                  {t.profil.title}
                </h2>
                <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>
                  {t.profil.subtitle}
                </p>
              </div>

              {/* Body Kartu */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Nama Institusi / Publisher */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                    {t.profil.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="adib ilyas"
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Bio Singkat / Deskripsi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                    {t.profil.bioLabel}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 160) {
                        setBio(e.target.value);
                      }
                    }}
                    rows={3}
                    placeholder={t.profil.bioPlaceholder}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: '#111827',
                      outline: 'none',
                      resize: 'none',
                      lineHeight: 1.5,
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right', marginTop: '-2px' }}>
                    {bio.length} / 160
                  </div>
                </div>

                {/* 2 Kolom: Situs Web & Telepon (Akan jadi 1 Kolom di Mobile) */}
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Situs Web Resmi */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.profil.websiteLabel}
                    </label>
                    <div style={{
                      display: 'flex',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      overflow: 'hidden',
                      background: '#FFFFFF'
                    }}>
                      <span style={{
                        background: '#E5E7EB',
                        padding: '9px 12px',
                        fontSize: '0.813rem',
                        color: '#4B5563',
                        borderRight: '1px solid #D1D5DB',
                        fontWeight: 600,
                        userSelect: 'none',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        https://
                      </span>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="penerbitanda.com"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          border: 'none',
                          padding: '9px 12px',
                          fontSize: '0.875rem',
                          color: '#111827',
                          outline: 'none',
                          background: 'transparent',
                          width: '100%'
                        }}
                      />
                    </div>
                  </div>

                  {/* Nomor Telepon */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.profil.phoneLabel}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="085805205830"
                      style={{
                        width: '100%',
                        padding: '9px 14px',
                        background: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                </div>

              </div>

              {/* Footer Kartu */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #F3F4F6',
                background: '#FAFAFA',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1E40AF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1D4ED8'}
                >
                  {savingProfile ? (
                    <>
                      <div style={{ width: '12px', height: '12px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      <span>{t.profil.saving}</span>
                    </>
                  ) : (
                    <span>{t.profil.saveButton}</span>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: AKUN */}
          {/* ======================================================== */}
          {activeTab === 'akun' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                  <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{t.akun.title}</h2>
                  <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>{t.akun.subtitle}</p>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.akun.emailLabel}
                    </label>
                    <div className="apikeys-input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="email"
                        value={publisher?.email || ''}
                        disabled
                        style={{
                          width: '320px',
                          maxWidth: '100%',
                          padding: '9px 14px',
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#6B7280',
                          fontWeight: 500,
                          cursor: 'not-allowed'
                        }}
                      />
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        background: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        <CheckCircle2 size={13} /> {t.akun.verified}
                      </span>
                    </div>
                  </div>

                  {/* ID */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.akun.idLabel}
                    </label>
                    <div className="apikeys-input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '480px' }}>
                      <input
                        type="text"
                        value={publisher?.id || ''}
                        disabled
                        style={{
                          flex: 1,
                          width: '100%',
                          padding: '9px 14px',
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          color: '#4B5563',
                          cursor: 'not-allowed'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleCopyId}
                        style={{
                          padding: '8px 14px',
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.813rem',
                          fontWeight: 700,
                          color: '#374151',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {copiedId ? <Check size={14} color="#059669" /> : <Copy size={14} color="#6B7280" />}
                        <span>{copiedId ? t.akun.copied : t.akun.copy}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Zona Bahaya */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #FECACA',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #FEE2E2', background: '#FEF2F2' }}>
                  <h2 style={{ fontSize: '0.938rem', fontWeight: 800, color: '#DC2626', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} color="#DC2626" /> {t.akun.dangerTitle}
                  </h2>
                </div>

                <div className="danger-zone-body" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ maxWidth: '480px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>{t.akun.closeAccount}</h3>
                    <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                      {t.akun.dangerDesc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    style={{
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.813rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {t.akun.deleteButton}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: TAMPILAN */}
          {/* ======================================================== */}
          {activeTab === 'tampilan' && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{t.tampilan.title}</h2>
                <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>{t.tampilan.subtitle}</p>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  
                  {/* Bahasa Antarmuka */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.tampilan.langLabel}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as 'id' | 'en')}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#111827',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="id">Bahasa Indonesia (ID)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>

                  {/* Zona Waktu */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.tampilan.timeZoneLabel}
                    </label>
                    <select
                      value={timeZone}
                      onChange={(e) => handleTimeZoneChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#111827',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="WIB">WIB (UTC+7 - Jakarta)</option>
                      <option value="WITA">WITA (UTC+8 - Denpasar)</option>
                      <option value="WIT">WIT (UTC+9 - Jayapura)</option>
                      <option value="UTC">UTC (Universal Time)</option>
                    </select>
                  </div>

                  {/* Format Tanggal */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.tampilan.dateFormatLabel}
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => handleDateFormatChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#111827',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/08/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (Standar ISO)</option>
                      <option value="D MMMM YYYY">D MMMM YYYY ({language === 'en' ? 'August 31, 2026' : '31 Agustus 2026'})</option>
                    </select>
                  </div>

                </div>

                <div style={{
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.813rem',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
                  <span>{t.tampilan.autoSavedNotice}</span>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: KEAMANAN */}
          {/* ======================================================== */}
          {activeTab === 'keamanan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <form onSubmit={handlePasswordUpdate} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                  <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{t.keamanan.title}</h2>
                  <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>{t.keamanan.subtitle}</p>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
                  
                  {passwordStatus && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: passwordStatus.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${passwordStatus.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                      color: passwordStatus.type === 'success' ? '#065F46' : '#991B1B'
                    }}>
                      {passwordStatus.type === 'success' ? <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} /> : <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0 }} />}
                      <span>{passwordStatus.message}</span>
                    </div>
                  )}

                  {/* Kata Sandi Lama */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.keamanan.currentPasswordLabel}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder={t.keamanan.currentPasswordPlaceholder}
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 14px',
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#111827',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.keamanan.newPasswordLabel}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder={t.keamanan.newPasswordPlaceholder}
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 14px',
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#111827',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1F2937' }}>
                      {t.keamanan.confirmPasswordLabel}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder={t.keamanan.confirmPasswordPlaceholder}
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 14px',
                          background: '#FFFFFF',
                          border: `1px solid ${confirmPassword.length > 0 && newPassword === confirmPassword ? '#10B981' : '#D1D5DB'}`,
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#111827',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                </div>

                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #F3F4F6',
                  background: '#FAFAFA',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    style={{
                      background: '#1D4ED8',
                      color: '#FFFFFF',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {isUpdatingPassword ? t.keamanan.updating : t.keamanan.updateButton}
                  </button>
                </div>
              </form>

              {/* Sesi Masuk */}
              <div className="session-info" style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sessionInfo.isMobile ? <Smartphone size={18} /> : <Monitor size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#111827' }}>
                      {sessionInfo.browser} {language === 'en' ? 'on' : 'di'} {sessionInfo.os} <span style={{ fontSize: '0.625rem', padding: '1px 6px', background: '#ECFDF5', color: '#059669', borderRadius: '4px', border: '1px solid #A7F3D0', textTransform: 'uppercase', fontWeight: 800, marginLeft: '4px' }}>{t.keamanan.sessionActive}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{sessionInfo.location} • IP: {sessionInfo.ip}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#DC2626',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {t.keamanan.logoutSession}
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: NOTIFIKASI */}
          {/* ======================================================== */}
          {activeTab === 'notifikasi' && (
            <form onSubmit={handleSaveNotifs} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{t.notifikasi.title}</h2>
                <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>{t.notifikasi.subtitle}</p>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Item 1: Status Kurasi Ebook */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{t.notifikasi.curationStatus}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{t.notifikasi.curationDesc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftNotifs.ebookCuration}
                      onChange={(e) => setDraftNotifs({ ...draftNotifs, ebookCuration: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {/* Item 2: Laporan Ringkasan Mingguan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{t.notifikasi.analyticsReport}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{t.notifikasi.analyticsDesc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftNotifs.weeklyAnalytics}
                      onChange={(e) => setDraftNotifs({ ...draftNotifs, weeklyAnalytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {/* Item 3: Pengumuman & Siaran Admin */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{t.notifikasi.adminBroadcast}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{t.notifikasi.adminDesc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftNotifs.adminBroadcasts}
                      onChange={(e) => setDraftNotifs({ ...draftNotifs, adminBroadcasts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {/* Item 4: Peringatan Keamanan & Login */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{t.notifikasi.securityAlert}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{t.notifikasi.securityDesc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftNotifs.securityAlerts}
                      onChange={(e) => setDraftNotifs({ ...draftNotifs, securityAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #F3F4F6',
                background: '#FAFAFA',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="submit"
                  disabled={savingNotifs}
                  style={{
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: savingNotifs ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(29,78,216,0.2)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {savingNotifs ? (
                    <>
                      <div style={{ width: '13px', height: '13px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      <span>{language === 'en' ? 'Saving...' : 'Menyimpan...'}</span>
                    </>
                  ) : (
                    <span>{t.notifikasi.saveButton}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 6: API KEYS */}
          {/* ======================================================== */}
          {activeTab === 'apikeys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                padding: '24px'
              }}>
                <div className="apikeys-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>{t.apikeys.title}</h2>
                    <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>{t.apikeys.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateApiKey}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#374151',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={13} /> {t.apikeys.newKeyButton}
                  </button>
                </div>

                <div className="apikeys-input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    style={{
                      flex: 1,
                      width: '100%',
                      padding: '9px 14px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyApiKey}
                    style={{
                      padding: '9px 16px',
                      background: '#1D4ED8',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {copiedApiKey ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedApiKey ? t.apikeys.copiedKey : t.apikeys.copyKey}</span>
                  </button>
                </div>
              </div>

              {/* Webhook */}
              <form onSubmit={handleSaveWebhook} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                  <h2 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>{t.apikeys.webhookTitle}</h2>
                  <p style={{ fontSize: '0.813rem', color: '#6B7280', margin: 0 }}>{t.apikeys.webhookSubtitle}</p>
                </div>

                <div style={{ padding: '24px' }}>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://domain-anda.com/api/webhook"
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #F3F4F6',
                  background: '#FAFAFA',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="submit"
                    disabled={savingWebhook}
                    style={{
                      background: '#1D4ED8',
                      color: '#FFFFFF',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {savingWebhook ? 'Saving...' : t.apikeys.saveWebhook}
                  </button>
                </div>
              </form>

            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI PENUTUPAN AKUN */}
      {/* ======================================================== */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="delete-modal" style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #FEE2E2',
            animation: 'subtleFadeIn 0.2s ease-out'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <AlertTriangle size={22} />
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              {t.modal.confirmTitle}
            </h3>
            <p style={{ fontSize: '0.813rem', color: '#6B7280', lineHeight: 1.5, margin: '0 0 16px' }}>
              {t.modal.confirmDesc}
            </p>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
                {t.modal.typeConfirm}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS AKUN"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #F87171',
                  background: '#FFFFFF',
                  color: '#111827',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="delete-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontSize: '0.813rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {t.modal.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim() !== 'HAPUS AKUN' || isDeletingAccount}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: deleteConfirmText.trim() === 'HAPUS AKUN' ? '#DC2626' : '#FCA5A5',
                  color: '#FFFFFF',
                  fontSize: '0.813rem',
                  fontWeight: 700,
                  cursor: deleteConfirmText.trim() === 'HAPUS AKUN' ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {isDeletingAccount ? t.modal.processing : t.modal.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}