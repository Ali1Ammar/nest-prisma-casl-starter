import { RolesGuard } from './auth/auth-utils/roles.decorator';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaService } from 'nestjs-prisma';

import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import swaggerTsoa from '../swagger.json';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { JwtAuthGuard } from './auth/auth-utils/jwt-auth.guard';
import { PrismaErrorInterceptor } from './utils/exception/prisma-error.interceptor';
import { AllExceptionsFilter } from './utils/exception/all-exceptions.filter';
import { Env } from './utils/env';
import { NestExpressApplication } from '@nestjs/platform-express';
import { tsoaResponseToNestDocument } from './utils/tsoaResponseToNestDocument';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const env = app.get<Env>(Env);
  // log
  if (env.isDebug) {
    app.use(morgan('dev'));
  }

  // cors
  app.enableCors({
    origin: env.frontendUrl,
    credentials: true,
  });
  // enable version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // enable shutdown hook
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // map prisma error
  app.useGlobalInterceptors(new PrismaErrorInterceptor());

  // cookie
  app.use(cookieParser(env.cookieSignKey));

  app.useGlobalPipes(new ZodValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalGuards(new RolesGuard(reflector));

  //start: Swagger
  const config = new DocumentBuilder()
    .addBearerAuth(undefined, 'note:httpOnly Cookie will be used automatically')
    .addSecurityRequirements('note:httpOnly Cookie will be used automatically')
    .setTitle('nest example')
    .setDescription('My nest API description')
    .setVersion('1.0')
    .build();

  let document = SwaggerModule.createDocument(app, config);
  // fs.writeFileSync('./nest-swagger.json', JSON.stringify(document));
  document = tsoaResponseToNestDocument(swaggerTsoa, document, '/v1');

  SwaggerModule.setup('api', app, document);
  //end: Swagger

  await app.listen(env.port);
}

bootstrap();
