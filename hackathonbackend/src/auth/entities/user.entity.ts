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

    @Prop({ required: false })
    password: string;

    @Prop({ default: null })
    googlePicture: string;

    @Prop({ type: String, enum: UserRole, required: true })
    role: UserRole;

    @Prop({ default: Date.now })
    date_creation: Date;

    @Prop({ default: false })
    onBoarding: boolean;

    @Prop({ default: null })
    accessibility: string;

    @Prop({ default: true })
    actif: boolean;

    @Prop({ default: null })
    resetCode: string;

    @Prop({ default: null })
    resetCodeExpiry: Date;

    // 2FA (TOTP)
    @Prop({ default: false })
    twoFactorEnabled: boolean;

    @Prop({ default: null })
    twoFactorSecret: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
