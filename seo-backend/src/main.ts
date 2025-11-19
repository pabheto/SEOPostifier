import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
      validationError: {
        target: false, // Don't expose the target object in error messages
        value: true, // Include the value that failed validation
      },
    }),
  );

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
