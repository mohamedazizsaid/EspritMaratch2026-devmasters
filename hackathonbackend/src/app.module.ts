import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EleveModule } from './eleve/eleve.module';
import { FormationModule } from './formation/formation.module';
import { InscriptionModule } from './inscription/inscription.module';
import { PresenceModule } from './presence/presence.module';
import { CertificationModule } from './certification/certification.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { LogsModule } from './logs/logs.module';
import { LoggingInterceptor } from './logs/logging.interceptor';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/hackathon',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 seconde
        limit: 20,   // Max 20 requêtes par seconde (protection anti-flood/burst)
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 secondes
        limit: 80,   // Max 80 requêtes par 10 secondes
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minute
        limit: 200,  // Max 200 requêtes par minute par IP
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    EleveModule,
    FormationModule,
    InscriptionModule,
    PresenceModule,
    CertificationModule,
    ChatbotModule,
    AnalyticsModule,
    LogsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
