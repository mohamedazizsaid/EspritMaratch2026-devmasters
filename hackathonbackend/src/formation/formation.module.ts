import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormationService } from './formation.service';
import { FormationController } from './formation.controller';
import { Formation, FormationSchema } from './entities/formation.entity';
import { Niveau, NiveauSchema } from './entities/niveau.entity';
import { Seance, SeanceSchema } from './entities/seance.entity';
import { Inscription, InscriptionSchema } from 'src/inscription/entities/inscription.entity';
import { Presence, PresenceSchema } from '../presence/entities/presence.entity';
import { Certification, CertificationSchema } from '../certification/entities/certification.entity';
import { AuthModule } from '../auth/auth.module';
import { FormationScheduler } from './formation.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Formation.name, schema: FormationSchema },
      { name: Niveau.name, schema: NiveauSchema },
      { name: Seance.name, schema: SeanceSchema },
      { name: Inscription.name, schema: InscriptionSchema },
      { name: Presence.name, schema: PresenceSchema },
      { name: Certification.name, schema: CertificationSchema },
    ]),
    AuthModule,
  ],
  controllers: [FormationController],
  providers: [FormationService, FormationScheduler],
  exports: [FormationService],
})
export class FormationModule { }
