import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Eleve } from '../../eleve/entities/eleve.entity';
import { Formation } from '../../formation/entities/formation.entity';

export enum StatutInscription {
  EN_COURS = 'en_cours',
  COMPLETEE = 'completee',
  ABANDONNEE = 'abandonnee',
}

@Schema({ timestamps: true })
export class Inscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Eleve', required: true })
  id_eleve: Eleve;

  @Prop({ type: Types.ObjectId, ref: 'Formation', required: true })
  id_formation: Formation;

  @Prop({ default: Date.now })
  date_inscription: Date;

  @Prop({ default: 1 })
  niveau_actuel: number;

  @Prop({
    type: String,
    enum: StatutInscription,
    default: StatutInscription.EN_COURS,
  })
  statut_formation: StatutInscription;

  @Prop({ type: Date })
  date_completion: Date;
}

export const InscriptionSchema = SchemaFactory.createForClass(Inscription);
