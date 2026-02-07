import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Inscription } from '../../inscription/entities/inscription.entity';
import { Seance } from '../../formation/entities/seance.entity';

@Schema({ timestamps: true })
export class Presence extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Inscription', required: true })
    id_inscription: Inscription;

    @Prop({ type: Types.ObjectId, ref: 'Seance', required: true })
    id_seance: Seance;

    @Prop({ required: true })
    present: boolean;

    @Prop({ default: Date.now })
    date_pointage: Date;

    @Prop({ type: String })
    remarques: string;
}

export const PresenceSchema = SchemaFactory.createForClass(Presence);
