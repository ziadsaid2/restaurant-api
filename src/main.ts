import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // إضافة prefix /api لكل الـ routes (مهم عشان الـ Frontend يعرف ينادي صح)
  app.setGlobalPrefix('api');

  // CORS – مهم جدًا مع الـ Auth (خاصة لو بتستخدم credentials/cookies)
  app.enableCors({
    origin: [
      'http://localhost:3000',  // للتطوير محليًا (Next.js)
      'http://localhost:5173',  // لو فيه port تاني
      'https://restaurant-react.vercel.app',
      'https://restaurant-react-git-main-ziads-projects-024dd1bb.vercel.app',
      'https://ziadsaid2-restaurant-react-ic2fwyb6s-ziads-projects-024dd1bb.vercel.app',
      'https://ziadsaid2-restaurant-react.vercel.app',
    ],
    credentials: true,  // لازم true لو بتستخدم JWT في cookies أو withCredentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🌐 API base URL: /api`);
}

bootstrap();
