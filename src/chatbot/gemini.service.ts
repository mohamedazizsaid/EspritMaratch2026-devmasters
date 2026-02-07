import {
    Injectable,
    OnModuleInit,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatHistory } from './entities/chatbot.entity';
import { Formation } from '../formation/entities/formation.entity';
import { User } from '../auth/entities/user.entity';
import { CloudinaryService } from '../eleve/cloudinary.service';
import {
    ChatbotQueryDto,
    ChatbotImageAnalysisDto,
} from './dto/chatbot.dto';

@Injectable()
export class GeminiService implements OnModuleInit {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(
        private configService: ConfigService,
        @InjectModel(ChatHistory.name)
        private chatHistoryModel: Model<ChatHistory>,
        @InjectModel(Formation.name)
        private formationModel: Model<Formation>,
        @InjectModel(User.name)
        private userModel: Model<User>,
        private cloudinaryService: CloudinaryService,
    ) { }

    onModuleInit() {
        try {
            console.log('[GeminiService] Initialisation du module...');
            const apiKey = this.configService.get<string>('GEMINI_API_KEY');
            console.log('[GeminiService] GEMINI_API_KEY trouvée:', !!apiKey);

            if (!apiKey) {
                console.error('[GeminiService] ERREUR: GEMINI_API_KEY non configurée');
                throw new Error('GEMINI_API_KEY is not set in environment variables');
            }

            console.log(
                '[GeminiService] Clé API trouvée, longueur:',
                apiKey.length,
            );
            this.genAI = new GoogleGenerativeAI(apiKey);
            console.log('[GeminiService] GoogleGenerativeAI initialisé');

            // Using Gemini 2.5 Flash
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
            });
            console.log('[GeminiService] Modèle Gemini 2.5 Flash chargé');
        } catch (error) {
            console.error('[GeminiService] ERREUR lors de l\'initialisation:', error);
            throw error;
        }
    }

    /**
     * Construit un prompt contextuel basé sur les informations du formateur et sa formation
     */
    private async buildContextualPrompt(
        user: any,
        formationId?: string,
        additionalContext?: string,
    ): Promise<string> {
        let context = `Tu es un assistant intelligent pour les formateurs et responsables de formation. 
Tu aides à améliorer les méthodes pédagogiques, l'organisation des formations et les stratégies d'enseignement.

Informations du formateur/responsable:
- Nom: ${user.nom} ${user.prenom}
- Rôle: ${user.role}
- Email: ${user.email}`;

        if (formationId) {
            try {
                const formation = await this.formationModel.findById(formationId);
                if (formation) {
                    context += `

Informations sur la formation:
- Nom: ${formation.nom_formation}
- Description: ${formation.description || 'N/A'}
- Statut: ${formation.statut}
- Date de création: ${new Date(formation.date_creation).toLocaleDateString('fr-FR')}`;
                }
            } catch (error) {
                console.error('Error fetching formation context:', error);
            }
        }

        if (additionalContext) {
            context += `

Contexte additionnel:
${additionalContext}`;
        }

        context += `

Instructions:
- Réponds toujours en français
- Sois concis mais complet
- Fournis des conseils pratiques et actionnables
- Si tu donnes des exemples, assure-toi qu'ils sont pertinents pour le contexte de formation
- Propose des solutions innovantes quand c'est approprié
- Sois empathique et encourageant`;

        return context;
    }

    /**
     * Envoie une question à Gemini et reçoit une réponse
     */
    async askAssistant(
        userId: string,
        query: ChatbotQueryDto,
    ): Promise<{
        reponse: string;
        metadata: any;
    }> {
        try {
            console.log('[askAssistant] Début de la requête pour userId:', userId);
            console.log('[askAssistant] Query:', query);

            // Valider que l'utilisateur existe
            const user = await this.userModel.findById(userId);
            if (!user) {
                console.error('[askAssistant] Utilisateur non trouvé:', userId);
                throw new NotFoundException('Utilisateur non trouvé');
            }
            console.log('[askAssistant] Utilisateur trouvé:', user.nom, user.prenom);

            // Construire le prompt contextuel
            console.log('[askAssistant] Construction du prompt contextuel...');
            const contextualPrompt = await this.buildContextualPrompt(
                user,
                query.formationId,
                query.context,
            );

            // Préparer le message final
            const fullMessage = `${contextualPrompt}

Message de l'utilisateur:
${query.message}`;

            console.log('[askAssistant] Appel à Gemini 2.5 Flash...');
            console.log('[askAssistant] Model disponible:', !!this.model);

            // Appeler Gemini 2.5 Flash
            if (!this.model) {
                throw new Error(
                    'Gemini model not initialized. Check GEMINI_API_KEY configuration.',
                );
            }

            const result = await this.model.generateContent(fullMessage);
            console.log('[askAssistant] Réponse reçue de Gemini');

            const response = result.response.text();
            console.log('[askAssistant] Texte extrait, longueur:', response.length);

            // Sauvegarder dans l'historique
            console.log('[askAssistant] Sauvegarde dans l\'historique...');
            const chatRecord = new this.chatHistoryModel({
                userId: new Types.ObjectId(userId),
                formationId: query.formationId
                    ? new Types.ObjectId(query.formationId)
                    : null,
                userMessage: query.message,
                assistantResponse: response,
                type: 'text',
                modelUsed: 'gemini-2.5-flash',
            });
            await chatRecord.save();
            console.log('[askAssistant] Enregistrement sauvegardé');

            const formationName = query.formationId
                ? (await this.formationModel.findById(query.formationId))
                    ?.nom_formation
                : undefined;

            return {
                reponse: response,
                metadata: {
                    formateur: `${user.nom} ${user.prenom}`,
                    formation: formationName,
                    timestamp: new Date(),
                    modelUsed: 'gemini-2.5-flash',
                },
            };
        } catch (error) {
            console.error('[askAssistant] ERREUR COMPLÈTE:', error);
            console.error('[askAssistant] Stack trace:', error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error('[askAssistant] Message d\'erreur:', errorMessage);

            throw new BadRequestException(
                `Erreur lors du traitement de votre demande: ${errorMessage}`,
            );
        }
    }

    /**
     * Analyse une image avec Gemini et fournit des recommandations
     */
    async analyzeImage(
        userId: string,
        imageAnalysisDto: ChatbotImageAnalysisDto,
    ): Promise<{
        analyse: string;
        recommandations: string[];
        metadata: any;
    }> {
        try {
            // Valider que l'utilisateur existe
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new NotFoundException('Utilisateur non trouvé');
            }

            // Convertir l'image si nécessaire
            let imageData = imageAnalysisDto.imageData;
            let imageUrl: string = null;

            // Si c'est une URL, garder l'URL, sinon la traiter comme base64
            if (imageData.startsWith('http')) {
                imageUrl = imageData;
            }

            // Construire le prompt contextuel
            const contextualPrompt = await this.buildContextualPrompt(
                user,
                imageAnalysisDto.formationId,
                `L'utilisateur souhaite une analyse d'une image liée à la formation.`,
            );

            // Préparer le message avec l'image
            const fullMessage = `${contextualPrompt}

Message de l'utilisateur:
${imageAnalysisDto.message}

Veuillez analyser l'image fournie et fournir:
1. Une analyse détaillée du contenu
2. Des recommandations pour améliorer le contenu ou le contexte pédagogique
3. Des suggestions pour mieux utiliser cela dans le contexte de formation`;

            // Appeler Gemini avec l'image
            let content: any;

            if (imageUrl) {
                // Utiliser l'URL directement
                content = [
                    { text: fullMessage },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imageData,
                        },
                    },
                ];
            } else {
                // Essayer de décoder le base64
                try {
                    content = [
                        { text: fullMessage },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: Buffer.from(imageData, 'base64').toString(
                                    'base64',
                                ),
                            },
                        },
                    ];
                } catch (error) {
                    throw new BadRequestException(
                        'Format d\'image invalide. Utilisez base64 ou une URL valide.',
                    );
                }
            }

            const result = await this.model.generateContent(content);
            const analysisText = result.response.text();

            // Extraire les recommandations (les lignes commençant par un nombre et un point)
            const recommandations = analysisText
                .split('\n')
                .filter((line) => /^\d+\./.test(line.trim()))
                .map((line) => line.replace(/^\d+\.\s*/, '').trim());

            // Sauvegarder dans l'historique
            const chatRecord = new this.chatHistoryModel({
                userId: new Types.ObjectId(userId),
                formationId: imageAnalysisDto.formationId
                    ? new Types.ObjectId(imageAnalysisDto.formationId)
                    : null,
                userMessage: imageAnalysisDto.message,
                assistantResponse: analysisText,
                type: 'image_analysis',
                imageUrl: imageUrl,
                modelUsed: 'gemini-2.5-flash',
            });
            await chatRecord.save();

            return {
                analyse: analysisText,
                recommandations:
                    recommandations.length > 0
                        ? recommandations
                        : [
                            'L\'analyse a été complétée. Veuillez lire le texte d\'analyse ci-dessus pour les détails.',
                        ],
                metadata: {
                    formateur: `${user.nom} ${user.prenom}`,
                    formation: imageAnalysisDto.formationId
                        ? (
                            await this.formationModel.findById(
                                imageAnalysisDto.formationId,
                            )
                        )?.nom_formation
                        : undefined,
                    timestamp: new Date(),
                    modelUsed: 'gemini-2.5-flash',
                    imageUrl: imageUrl,
                },
            };
        } catch (error) {
            console.error('Error in analyzeImage:', error);
            throw new BadRequestException(
                'Erreur lors de l\'analyse de l\'image: ' + error.message,
            );
        }
    }

    /**
     * Analyse une image uploadée avec Cloudinary
     */
    async analyzeUploadedImage(
        userId: string,
        file: Express.Multer.File,
        message: string,
        formationId?: string,
    ): Promise<{
        analyse: string;
        recommandations: string[];
        metadata: any;
    }> {
        try {
            // Upload vers Cloudinary
            const uploadResult =
                await this.cloudinaryService.uploadFile(file);

            // Utiliser l'URL de Cloudinary pour l'analyse
            const analysisDto: ChatbotImageAnalysisDto = {
                imageData: uploadResult.secure_url,
                message: message,
                formationId: formationId,
            };

            return this.analyzeImage(userId, analysisDto);
        } catch (error) {
            console.error('Error in analyzeUploadedImage:', error);
            throw new BadRequestException(
                'Erreur lors du traitement de l\'image uploadée: ' +
                error.message,
            );
        }
    }

    /**
     * Récupère l'historique de chat de l'utilisateur
     */
    async getChatHistory(
        userId: string,
        limit: number = 20,
    ): Promise<ChatHistory[]> {
        return this.chatHistoryModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Récupère l'historique de chat pour une formation spécifique
     */
    async getFormationChatHistory(
        userId: string,
        formationId: string,
        limit: number = 20,
    ): Promise<ChatHistory[]> {
        return this.chatHistoryModel
            .find({
                userId: new Types.ObjectId(userId),
                formationId: new Types.ObjectId(formationId),
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Supprime un enregistrement de chat
     */
    async deleteChatRecord(userId: string, recordId: string): Promise<void> {
        const record = await this.chatHistoryModel.findByIdAndDelete(recordId);
        if (!record || !record.userId.equals(new Types.ObjectId(userId))) {
            throw new NotFoundException(
                'Enregistrement de chat non trouvé ou accès refusé',
            );
        }
    }
}
