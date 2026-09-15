import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription } from './push-subscription.entity';
import { Notification } from './notification.entity';

@Injectable()
export class FirebaseService {
  private enabled: boolean;

  constructor(
    @InjectRepository(PushSubscription)
    private pushRepository: Repository<PushSubscription>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {
    this.enabled = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY);
  }

  async sendToUser(userId: number, title: string, body: string, topic: string): Promise<void> {
    if (!this.enabled) {
      console.log(`[Firebase] ${title}: ${body}`);
      return;
    }

    const subscriptions = await this.pushRepository.find({
      where: { userId, active: true },
    });

    if (subscriptions.length === 0) return;

    for (const sub of subscriptions) {
      console.log(`[Firebase] Sending to ${sub.fcmToken}`);
    }

    const notification = this.notificationRepository.create({
      userId,
      title,
      body,
      topic,
      isRead: false,
    });
    await this.notificationRepository.save(notification);
  }

  async sendToTopic(topic: string, title: string, body: string): Promise<void> {
    if (!this.enabled) {
      console.log(`[Firebase] Topic ${topic}: ${title}`);
      return;
    }

    console.log(`[Firebase] Sending to topic ${topic}`);
  }

  async subscribeToTopic(userId: number, fcmToken: string, topic: string): Promise<void> {
    let sub = await this.pushRepository.findOne({
      where: { userId, fcmToken },
    });

    if (!sub) {
      sub = this.pushRepository.create({
        userId,
        fcmToken,
        topics: [topic],
      });
    } else if (!sub.topics.includes(topic)) {
      sub.topics = [...sub.topics, topic];
    }

    await this.pushRepository.save(sub);
    console.log(`[Firebase] Subscribed ${fcmToken} to ${topic}`);
  }

  async unsubscribeFromTopic(fcmToken: string, topic: string): Promise<void> {
    console.log(`[Firebase] Unsubscribed ${fcmToken} from ${topic}`);
  }
}
