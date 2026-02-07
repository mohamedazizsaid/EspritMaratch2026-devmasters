import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum StatutEleve {
    ACTIF = 'actif',
    INACTIF = 'inactif',
    ARCHIVE = 'archive',
}

@Schema({ timestamps: true })
export class Eleve extends Document {
    @Prop({ required: true })
    nom: string;

    @Prop({ required: true })
    prenom: string;

    @Prop({ type: String })
    avatar: string;

    @Prop({ type: Date })
    date_naissance: Date;

    @Prop()
    telephone: string;

    @Prop()
    email: string;

    @Prop()
    adresse: string;

    @Prop({ default: Date.now })
    date_inscription: Date;

    @Prop({ type: String, enum: StatutEleve, default: StatutEleve.ACTIF })
    statut: StatutEleve;
}

export const EleveSchema = SchemaFactory.createForClass(Eleve);
