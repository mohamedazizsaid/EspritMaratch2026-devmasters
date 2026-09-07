import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNiveauDto {
  @ApiProperty({ description: 'Nom du niveau', required: false })
  @IsString()
  @IsOptional()
  nom_niveau?: string;

  @ApiProperty({
    description: 'Statut du niveau (actif / inactif)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  statut?: boolean;
}
