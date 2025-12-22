import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { BookingsModule } from './bookings/bookings.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

// الحصول على سلسلة اتصال MongoDB من متغيرات البيئة
const getMongoConnectionString = (): string => {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
  
  if (!mongoUrl) {
    throw new Error(
      '❌ خطأ: لم يتم العثور على متغير البيئة MONGO_URL أو MONGODB_URI. ' +
      'يرجى إضافة متغير البيئة في Railway أو في ملف .env'
    );
  }
  
  return mongoUrl;
};

@Module({
  imports: [
    MongooseModule.forRoot(getMongoConnectionString(), {
      // خيارات إضافية لتحسين الاتصال
      retryWrites: true,
      w: 'majority',
      // إعدادات إعادة المحاولة
      serverSelectionTimeoutMS: 5000, // انتظار 5 ثواني قبل إلغاء المحاولة
      socketTimeoutMS: 45000, // إغلاق الاتصال بعد 45 ثانية من عدم النشاط
      // معالجة الأخطاء
      retryReads: true,
    }), 
    UsersModule, 
    MenuModule, 
    BookingsModule, 
    OrdersModule, 
    AuthModule, 
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
