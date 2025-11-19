import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for WordPress plugin
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('SEO Postifier API')
    .setDescription(
      'Backend API for WordPress SEO Postifier plugin - AI-powered content generation with SEO optimization',
    )
    .setVersion('1.0.0')
    .addTag('health', 'Health check and connection test endpoints')
    .addTag('posts', 'Post generation and management endpoints')
    .addTag('seo', 'SEO analysis and optimization endpoints')
    .addTag('users', 'User authentication and license management')
    .addBearerAuth()
    .addServer('http://localhost:4000', 'Development server')
    .addServer('http://localhost:3000', 'Alternative development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'SEO Postifier API Docs',
    customfavIcon: 'https://nestjs.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 SEO Backend is running on: http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api`,
  );
}
bootstrap();
