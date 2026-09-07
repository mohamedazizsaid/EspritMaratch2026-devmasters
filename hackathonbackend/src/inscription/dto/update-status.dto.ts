import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutInscription } from '../entities/inscription.entity';

export class UpdateStatusDto {
  @ApiProperty({
    enum: StatutInscription,
    required: false,
    description: "Statut de l'inscription",
  })
  @IsEnum(StatutInscription)
  @IsOptional()
  statut_formation?: StatutInscription;

  @ApiProperty({
    description: 'Niveau actuel (1-4)',
    required: false,
    minimum: 1,
    maximum: 4,
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  niveau_actuel?: number;
}
