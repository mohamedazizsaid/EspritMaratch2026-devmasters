import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeminiService } from './gemini.service';
import { ChatbotController } from './chatbot.controller';
import { ChatHistory, ChatHistorySchema } from './entities/chatbot.entity';
import {
  Formation,
  FormationSchema,
} from '../formation/entities/formation.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Eleve, EleveSchema } from '../eleve/entities/eleve.entity';
import {
  Inscription,
  InscriptionSchema,
} from '../inscription/entities/inscription.entity';
import { Presence, PresenceSchema } from '../presence/entities/presence.entity';
import { Seance, SeanceSchema } from '../formation/entities/seance.entity';
import { Niveau, NiveauSchema } from '../formation/entities/niveau.entity';
import {
  Certification,
  CertificationSchema,
} from '../certification/entities/certification.entity';
import { CloudinaryService } from '../eleve/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: Formation.name, schema: FormationSchema },
      { name: User.name, schema: UserSchema },
      { name: Eleve.name, schema: EleveSchema },
      { name: Inscription.name, schema: InscriptionSchema },
      { name: Presence.name, schema: PresenceSchema },
      { name: Seance.name, schema: SeanceSchema },
      { name: Niveau.name, schema: NiveauSchema },
      { name: Certification.name, schema: CertificationSchema },
    ]),
  ],
  providers: [GeminiService, CloudinaryService],
  controllers: [ChatbotController],
  exports: [GeminiService],
})
export class ChatbotModule {}
