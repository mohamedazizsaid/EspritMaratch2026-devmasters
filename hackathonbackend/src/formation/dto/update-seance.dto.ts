import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSeanceDto {
    @IsString()
    @IsOptional()
    titre?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    date_prevue?: Date;

    @IsString()
    @IsOptional()
    heure_debut?: string;

    @IsString()
    @IsOptional()
    heure_fin?: string;

    @IsBoolean()
    @IsOptional()
    statut?: boolean;
}
