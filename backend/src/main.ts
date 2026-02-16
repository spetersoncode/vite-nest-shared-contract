import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({ origin: "http://localhost:5173" });
  await app.listen(3000);

  const logger = app.get(Logger);
  logger.log("🥊 Emoji Battle API running on http://localhost:3000");
}

bootstrap();
