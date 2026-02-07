import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
    AuthModule,
    EleveModule,
    FormationModule,
    InscriptionModule,
    PresenceModule,
    CertificationModule,
    ChatbotModule,
    AnalyticsModule,
    LogsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
