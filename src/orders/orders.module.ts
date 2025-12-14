import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.entity';
import { Cart, CartSchema } from './entities/cart.entity';
import { Menu, MenuSchema } from '../menu/entities/menu.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema }, 
      { name: Menu.name, schema: MenuSchema }, 
    ]),
    AuthModule, 
    NotificationsModule, 
    UsersModule, 
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
