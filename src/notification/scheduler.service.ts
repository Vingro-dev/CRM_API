import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Injectable()
export class SchedulerService {
    constructor(private readonly notificationService: NotificationService) { }

    async scheduleNotification(notification) {
        console.log('Scheduling notification:', notification);

        // Simulating scheduling logic. Replace with actual cron jobs or queueing if necessary.
        await this.notificationService.sendPushNotification(
            notification.expoPushToken,
            notification.notificationTitle,
            notification.notificationBody,
        );
    }
}
