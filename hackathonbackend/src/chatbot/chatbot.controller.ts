import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GeminiService } from './gemini.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ChatbotQueryDto,
  ChatbotResponseDto,
  ChatbotImageAnalysisDto,
  ChatbotImageAnalysisResponseDto,
} from './dto/chatbot.dto';

@ApiTags('chatbot')
@Controller('chatbot')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('ask')
  @Throttle({ default: { limit: 25, ttl: 60000 } }) // Protection IA: max 25 questions/min
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Poser une question à l'assistant Gemini intelligent",
    description:
      "Envoie une question à l'assistant Gemini qui fournira des conseils pédagogiques basés sur le contexte du formateur/responsable et sa formation",
  })
  @ApiResponse({
    status: 200,
    description: "Réponse de l'assistant Gemini",
    type: ChatbotResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur dans la requête',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async ask(
    @CurrentUser() user: any,
    @Body() query: ChatbotQueryDto,
  ): Promise<ChatbotResponseDto> {
    try {
      console.log('[ChatbotController] ask() called for user:', user.userId);
      console.log('[ChatbotController] query:', query);
      const result = await this.geminiService.askAssistant(user.userId, query);
      console.log('[ChatbotController] ask() completed successfully');
      return result;
    } catch (error) {
      console.error('[ChatbotController] ask() error:', error);
      console.error('[ChatbotController] error message:', error.message);
      console.error('[ChatbotController] error stack:', error.stack);
      throw error;
    }
  }

  @Post('analyze-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyser une image avec Gemini',
    description:
      "Envoie une image (en base64 ou URL) pour que Gemini l'analyse et fournisse des recommandations pédagogiques",
  })
  @ApiResponse({
    status: 200,
    description: "Analyse de l'image par Gemini",
    type: ChatbotImageAnalysisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Format d'image invalide",
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async analyzeImage(
    @CurrentUser() user: any,
    @Body() imageAnalysisDto: ChatbotImageAnalysisDto,
  ): Promise<ChatbotImageAnalysisResponseDto> {
    return this.geminiService.analyzeImage(user.userId, imageAnalysisDto);
  }

  @Post('upload-and-analyze')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Uploader et analyser une image',
    description:
      'Upload une image vers Cloudinary et la fait analyser par Gemini',
  })
  @ApiResponse({
    status: 200,
    description: 'Image analysée avec succès',
    type: ChatbotImageAnalysisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erreur lors de l'upload ou de l'analyse",
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async uploadAndAnalyze(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('message') message: string,
    @Query('formationId') formationId?: string,
  ): Promise<ChatbotImageAnalysisResponseDto> {
    if (!file) {
      throw new Error('Aucun fichier uploadé');
    }
    if (!message) {
      throw new Error('Le message est requis');
    }

    return this.geminiService.analyzeUploadedImage(
      user.userId,
      file,
      message,
      formationId,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: "Récupérer l'historique de chat",
    description:
      "Récupère les dernières conversations de l'utilisateur avec Gemini",
  })
  @ApiResponse({
    status: 200,
    description: 'Historique de chat',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getHistory(
    @CurrentUser() user: any,
    @Query('limit') limit: number = 20,
  ) {
    return this.geminiService.getChatHistory(user.userId, limit);
  }

  @Get('history/:formationId')
  @ApiOperation({
    summary: "Récupérer l'historique de chat d'une formation",
    description: 'Récupère les conversations liées à une formation spécifique',
  })
  @ApiResponse({
    status: 200,
    description: 'Historique de chat pour la formation',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getFormationHistory(
    @CurrentUser() user: any,
    @Param('formationId') formationId: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.geminiService.getFormationChatHistory(
      user.userId,
      formationId,
      limit,
    );
  }

  @Delete('history/:recordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un enregistrement de chat',
    description:
      "Supprime un enregistrement spécifique de l'historique de chat",
  })
  @ApiResponse({
    status: 204,
    description: 'Enregistrement supprimé avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Enregistrement non trouvé',
  })
  async deleteChatRecord(
    @CurrentUser() user: any,
    @Param('recordId') recordId: string,
  ): Promise<void> {
    return this.geminiService.deleteChatRecord(user.userId, recordId);
  }
}
