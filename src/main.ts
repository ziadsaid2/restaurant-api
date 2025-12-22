import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // إضافة prefix /api لكل الـ routes (مهم عشان الـ Frontend يعرف ينادي صح)
  app.setGlobalPrefix('api');

  // CORS – مهم جدًا مع الـ Auth (خاصة لو بتستخدم credentials/cookies)
app.enableCors({
  origin: true,  // يقبل من أي origin (كل المواقع)
  credentials: true,
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
