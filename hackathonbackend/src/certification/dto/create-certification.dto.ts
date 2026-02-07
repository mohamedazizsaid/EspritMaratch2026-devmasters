import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificationDto {
    @ApiProperty({ description: 'ID de l\'inscription associée' })
    @IsString()
    @IsNotEmpty()
    id_inscription: string;

    @ApiProperty({ description: 'Nom de la personne déléguée pour délivrer le certificat' })
    @IsString()
    @IsNotEmpty()
    delivre_par: string;
}
