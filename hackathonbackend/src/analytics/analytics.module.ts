import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Formation, FormationSchema } from '../formation/entities/formation.entity';
import { Niveau, NiveauSchema } from '../formation/entities/niveau.entity';
import { Seance, SeanceSchema } from '../formation/entities/seance.entity';
import { Inscription, InscriptionSchema } from '../inscription/entities/inscription.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Eleve, EleveSchema } from '../eleve/entities/eleve.entity';
import { Presence, PresenceSchema } from '../presence/entities/presence.entity';
import { Certification, CertificationSchema } from '../certification/entities/certification.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Formation.name, schema: FormationSchema },
            { name: Niveau.name, schema: NiveauSchema },
            { name: Seance.name, schema: SeanceSchema },
            { name: Inscription.name, schema: InscriptionSchema },
            { name: User.name, schema: UserSchema },
            { name: Eleve.name, schema: EleveSchema },
            { name: Presence.name, schema: PresenceSchema },
            { name: Certification.name, schema: CertificationSchema },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}
