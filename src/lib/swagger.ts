import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BaseEntity } from 'typeorm';

export const addSwagger = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle('Elegant')
    .setDescription('Elegant  task API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [BaseEntity],
  });
  SwaggerModule.setup('api', app, document);
};
