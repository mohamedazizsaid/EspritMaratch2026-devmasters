import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EleveService } from './eleve.service';
import { EleveController } from './eleve.controller';
import { Eleve, EleveSchema } from './entities/eleve.entity';
import { CloudinaryService } from './cloudinary.service';
import {
  Inscription,
  InscriptionSchema,
} from 'src/inscription/entities/inscription.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Eleve.name, schema: EleveSchema },
      { name: Inscription.name, schema: InscriptionSchema },
    ]),
  ],
  controllers: [EleveController],
  providers: [EleveService, CloudinaryService],
  exports: [EleveService],
})
export class EleveModule {}
