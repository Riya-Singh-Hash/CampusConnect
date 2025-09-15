import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/notifications';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Load notifications from localStorage on mount
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    return unsubscribe;
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50))); // Keep only last 50
    }
  }, [notifications]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Helper methods for different notification types
  const showSuccess = (message, title = 'Success') => {
    addNotification({
      type: 'success',
      title,
      message
    });
  };

  const showError = (message, title = 'Error') => {
    addNotification({
      type: 'error',
      title,
      message
    });
  };

  const showInfo = (message, title = 'Info') => {
    addNotification({
      type: 'info',
      title,
      message
    });
  };

  const showWarning = (message, title = 'Warning') => {
    addNotification({
      type: 'warning',
      title,
      message
    });
  };

  const showClubNotification = (message, clubName) => {
    addNotification({
      type: 'club',
      title: clubName,
      message
    });
  };

  const showEventNotification = (message, eventTitle) => {
    addNotification({
      type: 'event',
      title: eventTitle,
      message
    });
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showClubNotification,
    showEventNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};