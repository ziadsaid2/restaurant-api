import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my_jwt_secret', 
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => UsersModule), 
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], 
})
export class AuthModule {}
