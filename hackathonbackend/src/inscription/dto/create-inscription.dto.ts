import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInscriptionDto {
  @ApiProperty({ description: "ID de l'élève" })
  @IsString()
  @IsNotEmpty()
  id_eleve: string;

  @ApiProperty({ description: 'ID de la formation' })
  @IsString()
  @IsNotEmpty()
  id_formation: string;
}
