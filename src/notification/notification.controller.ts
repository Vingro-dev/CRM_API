import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SchedulerService } from './scheduler.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly schedulerService: SchedulerService,
  ) { }

  @Post('schedule')
  async scheduleNotification(@Body() payload: any) {
    console.log('Payload received:', payload);

    const { userId, expoPushToken, title, body, scheduleDateTime } = payload;

    // Validate required fields
    if (!userId || !expoPushToken || !title || !body || !scheduleDateTime) {
      throw new HttpException(
        'Missing required fields: userId, expoPushToken, title, body, or scheduleDateTime',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Create notification object
      const notification = this.notificationService.createNotification({
        userId,
        expoPushToken,
        notificationTitle: title,
        notificationBody: body,
        scheduleDateTime: new Date(scheduleDateTime),
      });

      // Save notification to the database
      const savedNotification = await this.notificationService.saveNotification(notification);

      // Schedule notification (logic in SchedulerService)
      await this.schedulerService.scheduleNotification(savedNotification);

      console.log('successfully reguster');
      return {

       
        message: 'Notification scheduled successfully!',
        notificationId: savedNotification.id,
      };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw new HttpException(
        `Failed to schedule notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
