import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './entities/booking.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    AuthModule, // عشان نستخدم JWT Guards
    NotificationsModule, // عشان نستخدم NotificationsService
    UsersModule, // عشان نجيب الأدمن
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
