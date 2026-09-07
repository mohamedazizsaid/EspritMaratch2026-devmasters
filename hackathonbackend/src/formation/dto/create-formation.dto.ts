import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutFormation } from '../entities/formation.entity';

export class CreateFormationDto {
  @ApiProperty({ description: 'Nom de la formation' })
  @IsString()
  @IsNotEmpty()
  nom_formation: string;

  @ApiProperty({ description: 'Description de la formation', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID du formateur', required: false })
  @IsString()
  @IsOptional()
  id_formateur?: string;

  @ApiProperty({
    enum: StatutFormation,
    default: StatutFormation.ACTIVE,
    required: false,
  })
  @IsEnum(StatutFormation)
  @IsOptional()
  statut?: StatutFormation;
}
