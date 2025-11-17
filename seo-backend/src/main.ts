import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for WordPress plugin
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 SEO Backend is running on: http://localhost:${port}`);
}
bootstrap();
