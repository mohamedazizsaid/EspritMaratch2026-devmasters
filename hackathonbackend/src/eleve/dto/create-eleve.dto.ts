import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StatutEleve } from '../entities/eleve.entity';

export class CreateEleveDto {

    @ApiProperty({ description: 'Nom de l\'élève' })
    @IsString()
    @IsNotEmpty()
    nom: string;

    @ApiProperty({ description: 'Prénom de l\'élève' })
    @IsString()
    @IsNotEmpty()
    prenom: string;

    @ApiProperty({ description: 'URL de l\'avatar', required: false })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty({ description: 'Date de naissance', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    date_naissance?: Date;

    @ApiProperty({ description: 'Numéro de téléphone', required: false })
    @IsString()
    @IsOptional()
    telephone?: string;

    @ApiProperty({ description: 'Adresse email', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ description: 'Adresse physique', required: false })
    @IsString()
    @IsOptional()
    adresse?: string;

    @ApiProperty({ description: 'Date d\'inscription', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    date_inscription?: Date;

    @ApiProperty({ enum: StatutEleve, default: StatutEleve.ACTIF, required: false })
    @IsEnum(StatutEleve)
    @IsOptional()
    statut?: StatutEleve;
}
