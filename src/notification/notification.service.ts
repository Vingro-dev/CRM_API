import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as Expo from 'expo-server-sdk'; // Ensure you import Expo correctly

@Injectable()
export class NotificationService {
  private expo: Expo.Expo;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    // Initialize the Expo object when the service is created
    this.expo = new Expo.Expo();
  }

  createNotification(notificationData: Partial<Notification>) {
    return this.notificationRepository.create(notificationData);
  }

  async saveNotification(notification: Notification) {
    return this.notificationRepository.save(notification);
  }

  async findNotificationById(id: number) {
    return this.notificationRepository.findOne({ where: { id } });
  }

  // Method to send push notification
  async sendPushNotification(expoPushToken: string, title: string, body: string) {
    const message = {
      to: expoPushToken,
      sound: 'default' as const,
      title,
      body,
    };

    try {
      const response = await this.expo.sendPushNotificationsAsync([message]);
      console.log('Push notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new Error('Failed to send push notification');
    }
  }
}
