import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Niveau } from './niveau.entity';

@Schema()
export class Seance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Niveau', required: true })
  id_niveau: Niveau;

  @Prop({ required: true, min: 1, max: 6 })
  numero_seance: number;

  @Prop({ required: true, maxlength: 150 })
  titre: string;

  @Prop({ type: Date })
  date_prevue: Date;

  @Prop()
  heure_debut: string;

  @Prop()
  heure_fin: string;

  @Prop()
  statut: boolean;
}

export const SeanceSchema = SchemaFactory.createForClass(Seance);
