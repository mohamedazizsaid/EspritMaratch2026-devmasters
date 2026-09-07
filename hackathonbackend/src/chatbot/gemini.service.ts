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
import { Eleve } from '../eleve/entities/eleve.entity';
import { Inscription } from '../inscription/entities/inscription.entity';
import { Presence } from '../presence/entities/presence.entity';
import { Seance } from '../formation/entities/seance.entity';
import { Niveau } from '../formation/entities/niveau.entity';
import { Certification } from '../certification/entities/certification.entity';
import { CloudinaryService } from '../eleve/cloudinary.service';
import { ChatbotQueryDto, ChatbotImageAnalysisDto } from './dto/chatbot.dto';

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
    @InjectModel(Eleve.name)
    private eleveModel: Model<Eleve>,
    @InjectModel(Inscription.name)
    private inscriptionModel: Model<Inscription>,
    @InjectModel(Presence.name)
    private presenceModel: Model<Presence>,
    @InjectModel(Seance.name)
    private seanceModel: Model<Seance>,
    @InjectModel(Niveau.name)
    private niveauModel: Model<Niveau>,
    @InjectModel(Certification.name)
    private certificationModel: Model<Certification>,
    private cloudinaryService: CloudinaryService,
  ) {}

  onModuleInit() {
    try {
      console.log('[GeminiService] Initialisation du module...');
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      console.log('[GeminiService] GEMINI_API_KEY trouvée:', !!apiKey);

      if (!apiKey) {
        console.error('[GeminiService] ERREUR: GEMINI_API_KEY non configurée');
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }

      console.log('[GeminiService] Clé API trouvée, longueur:', apiKey.length);
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log('[GeminiService] GoogleGenerativeAI initialisé');

      // Using Gemini 2.5 Flash
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
      console.log('[GeminiService] Modèle Gemini 2.5 Flash chargé');
    } catch (error) {
      console.error("[GeminiService] ERREUR lors de l'initialisation:", error);
      throw error;
    }
  }

  /**
   * Récupère toutes les données de la base de données et les formate pour le contexte Gemini
   */
  private async fetchFullDatabaseContext(): Promise<string> {
    let dbContext = '';

    try {
      // 1. Toutes les formations
      const formations = await this.formationModel.find().lean();
      dbContext += `\n=== FORMATIONS (${formations.length}) ===\n`;
      for (const f of formations) {
        dbContext += `- ID: ${f._id} | Nom: ${f.nom_formation} | Description: ${f.description || 'N/A'} | Statut: ${f.statut} | Date création: ${f.date_creation ? new Date(f.date_creation).toLocaleDateString('fr-FR') : 'N/A'} | ID Formateur: ${f.id_formateur || 'N/A'}\n`;
      }

      // 2. Tous les niveaux
      const niveaux = await this.niveauModel
        .find()
        .populate('id_formation', 'nom_formation')
        .lean();
      dbContext += `\n=== NIVEAUX (${niveaux.length}) ===\n`;
      for (const n of niveaux) {
        const formationNom = (n.id_formation as any)?.nom_formation || 'N/A';
        dbContext += `- ID: ${n._id} | Niveau ${n.numero_niveau}: ${n.nom_niveau} | Formation: ${formationNom} | Statut: ${n.statut ? 'Actif' : 'Inactif'}\n`;
      }

      // 3. Toutes les séances
      const seances = await this.seanceModel
        .find()
        .populate({
          path: 'id_niveau',
          populate: { path: 'id_formation', select: 'nom_formation' },
        })
        .lean();
      dbContext += `\n=== SÉANCES (${seances.length}) ===\n`;
      for (const s of seances) {
        const niveau = s.id_niveau as any;
        const formationNom = niveau?.id_formation?.nom_formation || 'N/A';
        const niveauNom = niveau?.nom_niveau || 'N/A';
        dbContext += `- ID: ${s._id} | Séance ${s.numero_seance}: ${s.titre} | Niveau: ${niveauNom} | Formation: ${formationNom} | Date prévue: ${s.date_prevue ? new Date(s.date_prevue).toLocaleDateString('fr-FR') : 'N/A'} | Heure: ${s.heure_debut || 'N/A'} - ${s.heure_fin || 'N/A'} | Statut: ${s.statut ? 'Effectuée' : 'Non effectuée'}\n`;
      }

      // 4. Tous les élèves
      const eleves = await this.eleveModel.find().lean();
      dbContext += `\n=== ÉLÈVES (${eleves.length}) ===\n`;
      for (const e of eleves) {
        dbContext += `- ID: ${e._id} | ${e.nom} ${e.prenom} | Email: ${e.email || 'N/A'} | Tél: ${e.telephone || 'N/A'} | Statut: ${e.statut} | Date inscription: ${e.date_inscription ? new Date(e.date_inscription).toLocaleDateString('fr-FR') : 'N/A'}\n`;
      }

      // 5. Toutes les inscriptions
      const inscriptions = await this.inscriptionModel
        .find()
        .populate('id_eleve', 'nom prenom email')
        .populate('id_formation', 'nom_formation')
        .lean();
      dbContext += `\n=== INSCRIPTIONS (${inscriptions.length}) ===\n`;
      for (const ins of inscriptions) {
        const eleve = ins.id_eleve as any;
        const formation = ins.id_formation as any;
        dbContext += `- ID: ${ins._id} | Élève: ${eleve?.nom || 'N/A'} ${eleve?.prenom || ''} | Formation: ${formation?.nom_formation || 'N/A'} | Niveau actuel: ${ins.niveau_actuel} | Statut: ${ins.statut_formation} | Date inscription: ${ins.date_inscription ? new Date(ins.date_inscription).toLocaleDateString('fr-FR') : 'N/A'}\n`;
      }

      // 6. Toutes les présences
      const presences = await this.presenceModel
        .find()
        .populate({
          path: 'id_inscription',
          populate: [
            { path: 'id_eleve', select: 'nom prenom' },
            { path: 'id_formation', select: 'nom_formation' },
          ],
        })
        .populate({
          path: 'id_seance',
          select: 'titre numero_seance date_prevue heure_debut heure_fin',
        })
        .lean();
      dbContext += `\n=== PRÉSENCES (${presences.length}) ===\n`;
      for (const p of presences) {
        const inscription = p.id_inscription as any;
        const seance = p.id_seance as any;
        const eleveNom = inscription?.id_eleve
          ? `${inscription.id_eleve.nom} ${inscription.id_eleve.prenom}`
          : 'N/A';
        const formationNom = inscription?.id_formation?.nom_formation || 'N/A';
        const seanceTitre = seance?.titre || 'N/A';
        const seanceDate = seance?.date_prevue
          ? new Date(seance.date_prevue).toLocaleDateString('fr-FR')
          : 'N/A';
        dbContext += `- Élève: ${eleveNom} | Formation: ${formationNom} | Séance: ${seanceTitre} (${seanceDate}) | Présent: ${p.present ? 'Oui' : 'Non'} | Date pointage: ${p.date_pointage ? new Date(p.date_pointage).toLocaleDateString('fr-FR') : 'N/A'} | Remarques: ${p.remarques || 'Aucune'}\n`;
      }

      // 7. Tous les formateurs/users
      const users = await this.userModel
        .find()
        .select('-password -twoFactorSecret -resetCode')
        .lean();
      dbContext += `\n=== UTILISATEURS / FORMATEURS (${users.length}) ===\n`;
      for (const u of users) {
        dbContext += `- ID: ${u._id} | ${u.nom} ${u.prenom} | Email: ${u.email} | Rôle: ${u.role} | Actif: ${u.actif} | Date création: ${u.date_creation ? new Date(u.date_creation).toLocaleDateString('fr-FR') : 'N/A'}\n`;
      }

      // 8. Toutes les certifications
      const certifications = await this.certificationModel
        .find()
        .populate({
          path: 'id_inscription',
          populate: [
            { path: 'id_eleve', select: 'nom prenom' },
            { path: 'id_formation', select: 'nom_formation' },
          ],
        })
        .lean();
      dbContext += `\n=== CERTIFICATIONS (${certifications.length}) ===\n`;
      for (const c of certifications) {
        const inscription = c.id_inscription as any;
        const eleveNom = inscription?.id_eleve
          ? `${inscription.id_eleve.nom} ${inscription.id_eleve.prenom}`
          : 'N/A';
        const formationNom = inscription?.id_formation?.nom_formation || 'N/A';
        dbContext += `- N° Certificat: ${c.numero_certificat} | Élève: ${eleveNom} | Formation: ${formationNom} | Date délivrance: ${c.date_delivrance ? new Date(c.date_delivrance).toLocaleDateString('fr-FR') : 'N/A'} | Délivré par: ${c.delivre_par || 'N/A'}\n`;
      }
    } catch (error) {
      console.error('[fetchFullDatabaseContext] Erreur:', error);
      dbContext += `\n[Erreur lors de la récupération de certaines données: ${error.message}]\n`;
    }

    return dbContext;
  }

  /**
   * Construit un prompt contextuel basé sur les informations du formateur et toute la base de données
   */
  private async buildContextualPrompt(
    user: any,
    formationId?: string,
    additionalContext?: string,
  ): Promise<string> {
    // Récupérer les données complètes de la DB
    const databaseContext = await this.fetchFullDatabaseContext();

    let context = `Tu es un assistant intelligent dédié à la gestion de notre plateforme de formation.
Tu as accès à TOUTE la base de données de la plateforme. Utilise ces données réelles pour répondre aux questions.
Tu dois répondre de façon précise avec les vraies données ci-dessous. Ne fabrique JAMAIS de données.

Informations de l'utilisateur connecté:
- Nom: ${user.nom} ${user.prenom}
- Rôle: ${user.role}
- Email: ${user.email}

===== DONNÉES DE LA BASE DE DONNÉES =====
${databaseContext}
===== FIN DES DONNÉES =====`;

    if (formationId) {
      try {
        const formation = await this.formationModel.findById(formationId);
        if (formation) {
          context += `

L'utilisateur pose une question en rapport avec la formation: ${formation.nom_formation} (ID: ${formationId})`;
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
- Utilise UNIQUEMENT les données réelles de la base de données ci-dessus pour répondre
- Ne fabrique jamais de données, si l'information n'est pas dans la base, dis-le clairement
- Sois précis avec les noms, dates, heures et chiffres tirés de la base
- Si on te demande la liste des élèves d'une formation, croise les inscriptions avec les élèves
- Si on te demande les présences d'une séance, croise les présences avec les inscriptions et les élèves
- Si on te demande des statistiques, calcule-les à partir des données réelles
- Sois concis mais complet
- Fournis des conseils pratiques quand c'est pertinent
- Formate bien tes réponses (listes, tableaux si nécessaire)`;

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
      console.log("[askAssistant] Sauvegarde dans l'historique...");
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
        ? (await this.formationModel.findById(query.formationId))?.nom_formation
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
      console.error("[askAssistant] Message d'erreur:", errorMessage);

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
      const imageData = imageAnalysisDto.imageData;
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
                data: Buffer.from(imageData, 'base64').toString('base64'),
              },
            },
          ];
        } catch {
          throw new BadRequestException(
            "Format d'image invalide. Utilisez base64 ou une URL valide.",
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
                "L'analyse a été complétée. Veuillez lire le texte d'analyse ci-dessus pour les détails.",
              ],
        metadata: {
          formateur: `${user.nom} ${user.prenom}`,
          formation: imageAnalysisDto.formationId
            ? (await this.formationModel.findById(imageAnalysisDto.formationId))
                ?.nom_formation
            : undefined,
          timestamp: new Date(),
          modelUsed: 'gemini-2.5-flash',
          imageUrl: imageUrl,
        },
      };
    } catch (error) {
      console.error('Error in analyzeImage:', error);
      throw new BadRequestException(
        "Erreur lors de l'analyse de l'image: " + error.message,
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
      const uploadResult = await this.cloudinaryService.uploadFile(file);

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
        "Erreur lors du traitement de l'image uploadée: " + error.message,
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
