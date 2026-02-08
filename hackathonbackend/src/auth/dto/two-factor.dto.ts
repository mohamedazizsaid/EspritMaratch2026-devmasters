import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorDto {
    @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ description: 'TOTP code from authenticator app', example: '123456' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class EnableTwoFactorDto {
    @ApiProperty({ description: 'TOTP code to confirm setup', example: '123456' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}

export class DisableTwoFactorDto {
    @ApiProperty({ description: 'TOTP code to confirm disable', example: '123456' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}
