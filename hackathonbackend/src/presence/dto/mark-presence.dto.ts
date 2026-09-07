import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkPresenceDto {
  @ApiProperty({ description: "ID de l'inscription" })
  @IsString()
  @IsNotEmpty()
  id_inscription: string;

  @ApiProperty({ description: 'ID de la séance' })
  @IsString()
  @IsNotEmpty()
  id_seance: string;

  @ApiProperty({ description: 'Est présent ?' })
  @IsBoolean()
  @IsNotEmpty()
  present: boolean;

  @ApiProperty({ description: 'Remarques éventuelles', required: false })
  @IsString()
  @IsOptional()
  remarques?: string;
}
