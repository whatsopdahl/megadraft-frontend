import React, { createContext, useState, useCallback, ReactNode } from 'react';

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  message: string;
  severity: NotificationSeverity;
}

export interface NotificationContextType {
  notification: Notification | null;
  notify: (message: string, severity?: NotificationSeverity) => void;
  clearNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback((message: string, severity: NotificationSeverity = 'info') => {
    setNotification({ message, severity });
  }, []);

  const clearNotification = useCallback(() => setNotification(null), []);

  return (
    <NotificationContext.Provider value={{ notification, notify, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
