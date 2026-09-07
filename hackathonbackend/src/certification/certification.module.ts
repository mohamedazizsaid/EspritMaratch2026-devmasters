import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificationService } from './certification.service';
import { CertificationController } from './certification.controller';
import {
  Certification,
  CertificationSchema,
} from './entities/certification.entity';
import {
  Inscription,
  InscriptionSchema,
} from '../inscription/entities/inscription.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certification.name, schema: CertificationSchema },
      { name: Inscription.name, schema: InscriptionSchema },
    ]),
  ],
  controllers: [CertificationController],
  providers: [CertificationService],
})
export class CertificationModule {}
