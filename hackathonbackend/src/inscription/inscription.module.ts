import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InscriptionService } from './inscription.service';
import { InscriptionController } from './inscription.controller';
import { Inscription, InscriptionSchema } from './entities/inscription.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inscription.name, schema: InscriptionSchema },
    ]),
  ],
  controllers: [InscriptionController],
  providers: [InscriptionService],
  exports: [InscriptionService],
})
export class InscriptionModule {}
