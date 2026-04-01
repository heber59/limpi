import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todos los endpoints
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan campos extra
      transform: true, // convierte tipos automáticamente
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Limpi API')
    .setDescription('API del marketplace de servicios de aseo')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de Firebase',
      },
      'firebase-token',
    )
    .addTag('auth', 'Autenticación')
    .addTag('users', 'Usuarios')
    .addTag('jobs', 'Trabajos')
    .addTag('applications', 'Postulaciones')
    .addTag('reviews', 'Calificaciones')
    .addTag('chat', 'Mensajes')
    .addTag('notifications', 'Notificaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // guarda el token entre recargas
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Swagger docs on http://localhost:${process.env.PORT ?? 3000}/docs`,
  );
}

bootstrap();
