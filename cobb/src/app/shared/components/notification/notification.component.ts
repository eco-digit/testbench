import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Notification } from '@models/misc';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [MatIcon],
})
export class NotificationComponent {
  @Input() showNotifications = false;

  //TODO Mock Data will be replaced
  notifications: Notification[] = [
    {
      measurement: 'TeaStore',
      message: ' was created successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaMeasurement',
      message: ' was validated successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'Report Coffeeshop',
      message: ' is available.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaStore',
      message: ' was created successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaMeasurement',
      message: ' was validated successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'Report Coffeeshop',
      message: ' is available.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaStore',
      message: ' was created successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaStore',
      message: ' was created successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaStore',
      message: ' was created successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaMeasurement',
      message: ' was validated successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'Report Coffeeshop',
      message: ' is available.',
      timestamp: '27.05.2024 at 17:00',
    },
    {
      measurement: 'TeaStore',
      message: ' was created successfully.',
      timestamp: '27.05.2024 at 17:00',
    },
  ];

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
  }

  // Remove a specific notification
  removeNotification(notification: Notification): void {
    this.notifications = this.notifications.filter((n) => n !== notification);
  }
}
