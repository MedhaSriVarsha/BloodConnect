export type NotificationType = 'emergency' | 'referral' | 'system' | 'reminder';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  emergencyUrgency?: 'critical' | 'high' | 'normal';
}
