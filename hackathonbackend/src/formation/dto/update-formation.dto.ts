import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutFormation } from '../entities/formation.entity';

export class UpdateFormationDto {
  @ApiProperty({ description: 'Nom de la formation', required: false })
  @IsString()
  @IsOptional()
  nom_formation?: string;

  @ApiProperty({ description: 'Description de la formation', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: StatutFormation, required: false })
  @IsEnum(StatutFormation)
  @IsOptional()
  statut?: StatutFormation;

  @ApiProperty({ description: 'ID du formateur', required: false })
  @IsString()
  @IsOptional()
  id_formateur?: string;
}
