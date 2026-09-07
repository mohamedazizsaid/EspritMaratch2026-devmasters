import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Presence } from './entities/presence.entity';
import { MarkPresenceDto } from './dto/mark-presence.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';

@Injectable()
export class PresenceService {
  constructor(
    @InjectModel(Presence.name) private presenceModel: Model<Presence>,
  ) {}

  async markPresence(markPresenceDto: MarkPresenceDto): Promise<Presence> {
    // Check if already marked?
    const existing = await this.presenceModel
      .findOne({
        id_inscription: markPresenceDto.id_inscription,
        id_seance: markPresenceDto.id_seance,
      })
      .exec();

    if (existing) {
      // Option 1: Update existing
      // Option 2: Throw error. "cocher presence" implies marking it. Let's update if exists or throw.
      // User asked "cocher presence", usually means toggling or setting.
      // Let's allow overwriting or throw conflict. I'll throw conflict to be safe, client should use update.
      throw new ConflictException(
        'Presence already marked for this student and session',
      );
    }

    const presence = new this.presenceModel(markPresenceDto);
    return presence.save();
  }

  async findBySeance(seanceId: string): Promise<Presence[]> {
    return this.presenceModel
      .find({ id_seance: seanceId })
      .populate({
        path: 'id_inscription',
        populate: { path: 'id_eleve' }, // Deep populate to show student details
      })
      .exec();
  }

  async update(
    id: string,
    updatePresenceDto: UpdatePresenceDto,
  ): Promise<Presence> {
    const updated = await this.presenceModel
      .findByIdAndUpdate(id, updatePresenceDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Presence record with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<Presence> {
    const deleted = await this.presenceModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Presence record with ID ${id} not found`);
    }
    return deleted;
  }
}
