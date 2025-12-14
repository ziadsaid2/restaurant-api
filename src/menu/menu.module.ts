import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './entities/menu.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]), 
    AuthModule, 
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
