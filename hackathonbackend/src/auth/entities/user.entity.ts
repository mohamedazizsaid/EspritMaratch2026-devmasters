import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
    FORMATEUR = 'Formateurs',
    ADMIN = 'Admin',
    RESPONSABLE_FORMATION = 'responsableformation',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, maxlength: 100 })
    nom: string;

    @Prop({ required: true, maxlength: 100 })
    prenom: string;

    @Prop({ required: true, unique: true, maxlength: 150 })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: UserRole, required: true })
    role: UserRole;

    @Prop({ default: Date.now })
    date_creation: Date;

    @Prop({ default: true })
    actif: boolean;

    @Prop({ default: null })
    resetCode: string;

    @Prop({ default: null })
    resetCodeExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
