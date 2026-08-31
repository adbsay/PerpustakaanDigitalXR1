'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NotificationPreferences {
  ebookCuration: boolean;
  weeklyAnalytics: boolean;
  adminBroadcasts: boolean;
  securityAlerts: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  ebookCuration: true,
  weeklyAnalytics: true,
  adminBroadcasts: true,
  securityAlerts: true,
};

interface NotificationContextType {
  prefs: NotificationPreferences;
  updateNotificationPrefs: (newPrefs: NotificationPreferences) => void;
  ebookCuration: boolean;
  weeklyAnalytics: boolean;
  adminBroadcasts: boolean;
  securityAlerts: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  prefs: DEFAULT_PREFS,
  updateNotificationPrefs: () => {},
  ebookCuration: true,
  weeklyAnalytics: true,
  adminBroadcasts: true,
  securityAlerts: true,
});

export const NOTIF_STORAGE_KEY = 'publisher_notif_prefs';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPrefs({
          ebookCuration: parsed.ebookCuration !== undefined ? Boolean(parsed.ebookCuration) : (parsed.emailBookApproval !== undefined ? Boolean(parsed.emailBookApproval) : true),
          weeklyAnalytics: parsed.weeklyAnalytics !== undefined ? Boolean(parsed.weeklyAnalytics) : (parsed.emailWeeklyAnalytics !== undefined ? Boolean(parsed.emailWeeklyAnalytics) : true),
          adminBroadcasts: parsed.adminBroadcasts !== undefined ? Boolean(parsed.adminBroadcasts) : (parsed.emailAdminBroadcast !== undefined ? Boolean(parsed.emailAdminBroadcast) : true),
          securityAlerts: parsed.securityAlerts !== undefined ? Boolean(parsed.securityAlerts) : (parsed.emailSecurityAlert !== undefined ? Boolean(parsed.emailSecurityAlert) : true),
        });
      }
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    } finally {
      setIsLoaded(true);
    }

    const handleStorageChange = () => {
      try {
        const updated = localStorage.getItem(NOTIF_STORAGE_KEY);
        if (updated) {
          setPrefs(JSON.parse(updated));
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateNotificationPrefs = (newPrefs: NotificationPreferences) => {
    setPrefs(newPrefs);
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(newPrefs));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to persist notification preferences:', e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        prefs,
        updateNotificationPrefs,
        ebookCuration: prefs.ebookCuration,
        weeklyAnalytics: prefs.weeklyAnalytics,
        adminBroadcasts: prefs.adminBroadcasts,
        securityAlerts: prefs.securityAlerts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
