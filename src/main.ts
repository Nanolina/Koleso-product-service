import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);

  // Cors
  app.use(
    cors({
      origin: configService.get<string>('SELLER_INTERFACE_URL'),
      credentials: true,
    }),
  );

  await app.listen(3002);
}
bootstrap();
