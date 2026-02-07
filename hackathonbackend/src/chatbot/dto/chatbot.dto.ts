import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatbotQueryDto {
    @ApiProperty({
        description: 'Le message ou question du formateur/responsable de formation',
        example: 'Comment puis-je améliorer ma méthode pédagogique ?',
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        description: 'L\'ID de la formation (optionnel)',
        required: false,
    })
    @IsString()
    @IsOptional()
    formationId?: string;

    @ApiProperty({
        description: 'Contexte supplémentaire (optionnel)',
        required: false,
    })
    @IsString()
    @IsOptional()
    context?: string;
}

export class ChatbotResponseDto {
    @ApiProperty({
        description: 'La réponse de l\'assistant Gemini',
    })
    reponse: string;

    @ApiProperty({
        description: 'Métadonnées sur la réponse',
    })
    metadata: {
        formateur: string;
        formation?: string;
        timestamp: Date;
        modelUsed: string;
    };
}

export class ChatbotImageAnalysisDto {
    @ApiProperty({
        description: 'Le message associé à l\'image',
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        description: 'Image en base64 ou URL',
    })
    @IsString()
    @IsNotEmpty()
    imageData: string;

    @ApiProperty({
        description: 'L\'ID de la formation (optionnel)',
        required: false,
    })
    @IsString()
    @IsOptional()
    formationId?: string;
}

export class ChatbotImageAnalysisResponseDto {
    @ApiProperty({
        description: 'L\'analyse de l\'image par Gemini',
    })
    analyse: string;

    @ApiProperty({
        description: 'Recommandations basées sur l\'image',
    })
    recommandations: string[];

    @ApiProperty({
        description: 'Métadonnées sur l\'analyse',
    })
    metadata: {
        formateur: string;
        formation?: string;
        timestamp: Date;
        modelUsed: string;
        imageUrl?: string;
    };
}
