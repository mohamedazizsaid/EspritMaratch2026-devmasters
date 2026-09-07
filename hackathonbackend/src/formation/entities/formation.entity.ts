import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/entities/user.entity';

export enum StatutFormation {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Formation extends Document {
  @Prop({ required: true, maxlength: 150 })
  nom_formation: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  id_formateur: User;

  @Prop({ type: String })
  description: string;

  @Prop({ default: Date.now })
  date_creation: Date;

  @Prop({
    type: String,
    enum: StatutFormation,
    default: StatutFormation.ACTIVE,
  })
  statut: StatutFormation;
}

export const FormationSchema = SchemaFactory.createForClass(Formation);
