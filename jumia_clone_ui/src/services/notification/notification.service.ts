import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | undefined>(
    undefined
  );
  notification$ = this.notificationSubject.asObservable();

  success(message: string, duration: number = 3000): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration: number = 5000): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration: number = 3000): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration: number = 4000): void {
    this.show({ message, type: 'warning', duration });
  }

  private show(notification: Notification): void {
    this.notificationSubject.next(notification);

    if (notification.duration) {
      setTimeout(() => {
        this.notificationSubject.next(undefined);
      }, notification.duration);
    }
  }

  clear(): void {
    this.notificationSubject.next(undefined);
  }
}
