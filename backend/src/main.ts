import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('OpenWiki API')
    .setDescription(
      'Documentation interactive de tous les endpoints exposés par le backend OpenWiki.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Inscription, connexion et gestion des tokens JWT')
    .addTag('Health', "Vérification de l'état du serveur")
    .addTag('Pages', 'Arborescence, contenu, versions et historique des pages')
    .addTag('Users', 'Profil du compte connecté')
    .addTag(
      'Admin — Users',
      'Gestion des comptes utilisateurs (réservé aux admins)',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
