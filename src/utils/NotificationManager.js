import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY_PREFIX = '@notifications_';

export const NotificationManager = {
  /**
   * Get all notifications for a specific user
   */
  getNotifications: async (userId) => {
    try {
      const key = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      console.error('Failed to get notifications', e);
      return [];
    }
  },

  /**
   * Add a new notification for a specific user
   */
  addNotification: async (userId, title, message) => {
    try {
      const key = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const currentNotifications = await NotificationManager.getNotifications(userId);
      
      const newNotification = {
        id: Date.now().toString(),
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const updatedNotifications = [newNotification, ...currentNotifications];
      await AsyncStorage.setItem(key, JSON.stringify(updatedNotifications));
      return newNotification;
    } catch (e) {
      console.error('Failed to add notification', e);
      return null;
    }
  },

  /**
   * Mark all notifications as read for a specific user
   */
  markAllAsRead: async (userId) => {
    try {
      const key = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const currentNotifications = await NotificationManager.getNotifications(userId);
      
      const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(key, JSON.stringify(updatedNotifications));
      return updatedNotifications;
    } catch (e) {
      console.error('Failed to mark notifications as read', e);
      return [];
    }
  }
};
