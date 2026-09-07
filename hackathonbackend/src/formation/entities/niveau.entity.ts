import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Formation } from './formation.entity';

@Schema()
export class Niveau extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Formation', required: true })
  id_formation: Formation;

  @Prop({ required: true, min: 1, max: 4 })
  numero_niveau: number;

  @Prop({ required: true, maxlength: 100 })
  nom_niveau: string;

  @Prop({ default: false })
  statut: boolean;
}

export const NiveauSchema = SchemaFactory.createForClass(Niveau);
