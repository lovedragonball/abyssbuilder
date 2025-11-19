// Notification Manager for Crafting Items
export interface CraftingNotification {
  id: string;
  itemName: string;
  category: string;
  startTime: number;
  endTime: number;
  quantity: number;
  notified: boolean;
}

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Map<string, CraftingNotification> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadNotifications();
    this.startChecking();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  addNotification(notification: CraftingNotification): void {
    this.notifications.set(notification.id, notification);
    this.saveNotifications();
    this.notifyListeners();
  }

  removeNotification(id: string): void {
    this.notifications.delete(id);
    this.saveNotifications();
    this.notifyListeners();
  }

  getNotification(id: string): CraftingNotification | undefined {
    return this.notifications.get(id);
  }

  getAllNotifications(): CraftingNotification[] {
    return Array.from(this.notifications.values());
  }

  getActiveNotifications(): CraftingNotification[] {
    const now = Date.now();
    return this.getAllNotifications().filter(n => n.endTime > now);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  private loadNotifications(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('craftingNotifications');
      if (stored) {
        const data = JSON.parse(stored) as CraftingNotification[];
        this.notifications = new Map(data.map(n => [n.id, n]));
        
        // Clean up expired notifications
        const now = Date.now();
        let cleaned = false;
        this.notifications.forEach((notification, id) => {
          if (notification.endTime < now - 60000) { // Keep for 1 minute after expiry
            this.notifications.delete(id);
            cleaned = true;
          }
        });
        
        if (cleaned) {
          this.saveNotifications();
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private saveNotifications(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Array.from(this.notifications.values());
      localStorage.setItem('craftingNotifications', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private startChecking(): void {
    if (this.checkInterval) return;
    
    this.checkInterval = setInterval(() => {
      this.checkNotifications();
    }, 1000); // Check every second
  }

  private checkNotifications(): void {
    const now = Date.now();
    let hasChanges = false;

    this.notifications.forEach((notification) => {
      if (!notification.notified && notification.endTime <= now) {
        this.sendNotification(notification);
        notification.notified = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  private sendNotification(notification: CraftingNotification): void {
    if (Notification.permission !== 'granted') return;

    const title = '🔔 Crafting Complete!';
    const body = `${notification.itemName} (x${notification.quantity}) is ready!`;
    
    try {
      const browserNotification = new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners.clear();
  }
}

export const notificationManager = NotificationManager.getInstance();
