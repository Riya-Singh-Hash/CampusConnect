class NotificationService {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(notification) {
    this.subscribers.forEach(callback => callback(notification));
  }

  success(message, title = 'Success') {
    this.notify({
      id: Date.now(),
      type: 'success',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  error(message, title = 'Error') {
    this.notify({
      id: Date.now(),
      type: 'error',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  info(message, title = 'Info') {
    this.notify({
      id: Date.now(),
      type: 'info',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  warning(message, title = 'Warning') {
    this.notify({
      id: Date.now(),
      type: 'warning',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  clubNotification(message, clubName) {
    this.notify({
      id: Date.now(),
      type: 'club',
      title: clubName,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  eventNotification(message, eventTitle) {
    this.notify({
      id: Date.now(),
      type: 'event',
      title: eventTitle,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;