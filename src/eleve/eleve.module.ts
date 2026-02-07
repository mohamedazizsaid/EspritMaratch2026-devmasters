import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EleveService } from './eleve.service';
import { EleveController } from './eleve.controller';
import { Eleve, EleveSchema } from './entities/eleve.entity';
import { CloudinaryService } from './cloudinary.service';
import { Inscription, InscriptionSchema } from 'src/inscription/entities/inscription.entity';
import { Presence, PresenceSchema } from 'src/presence/entities/presence.entity';
import { Seance, SeanceSchema } from 'src/formation/entities/seance.entity';
import { Niveau, NiveauSchema } from 'src/formation/entities/niveau.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Eleve.name, schema: EleveSchema },
      { name: Inscription.name, schema: InscriptionSchema },
      { name: Presence.name, schema: PresenceSchema },
      { name: Seance.name, schema: SeanceSchema },
      { name: Niveau.name, schema: NiveauSchema },
    ]),
  ],
  controllers: [EleveController],
  providers: [EleveService, CloudinaryService],
  exports: [EleveService],
})
export class EleveModule { }
