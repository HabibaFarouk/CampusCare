import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import notificationApi from '../api/notificationApi';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const initializedRef = useRef(false);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  }, []);

  const showError = useCallback((message, duration = 3000) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showSuccess = useCallback((message, duration = 3000) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration = 3000) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const checkForNewNotifications = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const data = await notificationApi.getNotifications({ unreadOnly: true });
      if (!Array.isArray(data)) return;

      const newest = data[0];
      const count = data.length;
      if (newest) {
        if (!initializedRef.current) {
          const message =
            count === 1
              ? `You have 1 unread notification: ${newest.message}`
              : `You have ${count} unread notifications. Latest: ${newest.message}`;
          showNotification(message, 'info', 5000);
        } else if (newest.id !== lastNotificationId) {
          showNotification(newest.message, 'info', 5000);
        }
        setLastNotificationId(newest.id);
      } else {
        setLastNotificationId(null);
      }

      initializedRef.current = true;
    } catch (err) {
      // Ignore network failures in polling
    }
  }, [user, lastNotificationId, showNotification]);

  useEffect(() => {
    if (!user) {
      initializedRef.current = false;
      setLastNotificationId(null);
      return;
    }

    checkForNewNotifications();
    const interval = setInterval(checkForNewNotifications, 20000);
    return () => clearInterval(interval);
  }, [user, checkForNewNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        showError,
        showSuccess,
        showWarning,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
