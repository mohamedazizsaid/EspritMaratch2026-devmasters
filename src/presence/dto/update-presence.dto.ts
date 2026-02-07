import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePresenceDto {
    @ApiProperty({ description: 'Est présent ?', required: false })
    @IsBoolean()
    @IsOptional()
    present?: boolean;

    @ApiProperty({ description: 'Remarques éventuelles', required: false })
    @IsString()
    @IsOptional()
    remarques?: string;
}
