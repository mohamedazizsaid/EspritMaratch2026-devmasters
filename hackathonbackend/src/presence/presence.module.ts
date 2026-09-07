import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';
import { Presence, PresenceSchema } from './entities/presence.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Presence.name, schema: PresenceSchema },
    ]),
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}
