import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Inscription } from '../../inscription/entities/inscription.entity';

@Schema({ timestamps: true })
export class Certification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Inscription', required: true })
  id_inscription: Inscription;

  @Prop({ required: true, unique: true })
  numero_certificat: string;

  @Prop({ default: Date.now })
  date_delivrance: Date;

  @Prop()
  fichier_pdf: string;

  @Prop()
  delivre_par: string;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);
