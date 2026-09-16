import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  app.enableShutdownHooks()
  app.setGlobalPrefix('v1')
  app.useGlobalPipes(new ZodValidationPipe())

  const origins = process.env.CORS_ORIGINS
  app.enableCors({
    origin: !origins || origins === '*' ? true : origins.split(','),
    credentials: false
  })

  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Word Path API')
      .setDescription('Ranks cue ladders over a pseudonymised life graph. Receives no words.')
      .setVersion('1.0')
      .build()
    SwaggerModule.setup('v1/docs', app, SwaggerModule.createDocument(app, config))
    logger.log('Swagger docs at /v1/docs')
  }

  const port = Number(process.env.PORT ?? 3333)
  await app.listen(port, '0.0.0.0')
  logger.log(`Listening on ${port}`)
}

void bootstrap()
