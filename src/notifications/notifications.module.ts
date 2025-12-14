import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    AuthModule, // عشان نستخدم JWT Guards
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService], // نصدّره عشان نستخدمه في Orders و Bookings
})
export class NotificationsModule {}
