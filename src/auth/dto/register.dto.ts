import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
    @ApiProperty({ description: 'Nom de famille', example: 'Dupont', maxLength: 100 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    nom: string;

    @ApiProperty({ description: 'Prénom', example: 'Jean', maxLength: 100 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    prenom: string;

    @ApiProperty({ description: 'Adresse email', example: 'jean.dupont@email.com', maxLength: 150 })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(150)
    email: string;

    @ApiProperty({ description: 'Mot de passe (min 6 caractères)', example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({
        description: 'Rôle de l\'utilisateur',
        enum: UserRole,
        example: UserRole.FORMATEUR,
        default: UserRole.FORMATEUR
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
