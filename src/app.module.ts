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

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URL || 
      process.env.MONGODB_URI || 
      'mongodb+srv://zezosaied2_db_user:UJKXKT3ddqkdOlr6@resturantdb.kgjj57v.mongodb.net/restaurantdb?retryWrites=true&w=majority'
    ), 
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
