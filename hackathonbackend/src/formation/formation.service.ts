import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Formation } from './entities/formation.entity';
import { Niveau } from './entities/niveau.entity';
import { Seance } from './entities/seance.entity';
import {
  Inscription,
  StatutInscription,
} from '../inscription/entities/inscription.entity';
import { Presence } from '../presence/entities/presence.entity';
import { Certification } from '../certification/entities/certification.entity';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { UpdateNiveauDto } from './dto/update-niveau.dto';
import { UpdateSeanceDto } from './dto/update-seance.dto';
import { MailingService } from '../auth/mailing.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FormationService {
  private readonly logger = new Logger('FormationService');

  constructor(
    @InjectModel(Formation.name) private formationModel: Model<Formation>,
    @InjectModel(Niveau.name) private niveauModel: Model<Niveau>,
    @InjectModel(Seance.name) private seanceModel: Model<Seance>,
    @InjectModel('Inscription') private inscriptionModel: Model<Inscription>,
    @InjectModel(Presence.name) private presenceModel: Model<Presence>,
    @InjectModel(Certification.name)
    private certificationModel: Model<Certification>,
    private mailingService: MailingService,
  ) {}

  async create(createFormationDto: CreateFormationDto): Promise<Formation> {
    const formation = new this.formationModel(createFormationDto);
    await formation.save();

    // Create 4 levels
    for (let i = 1; i <= 4; i++) {
      const niveau = new this.niveauModel({
        id_formation: formation._id,
        numero_niveau: i,
        nom_niveau: `Niveau ${i}`,
        statut: false,
      });
      await niveau.save();

      // Create 6 sessions for each level
      for (let j = 1; j <= 6; j++) {
        const seance = new this.seanceModel({
          id_niveau: niveau._id,
          numero_seance: j,
          titre: `Seance ${j}`,
          // date_prevue, heure_debut, heure_fin are left null/undefined as requested to be modifiable later
        });
        await seance.save();
      }
    }

    return formation;
  }

  async findAll(): Promise<Formation[]> {
    return this.formationModel.find().exec();
  }

  async findAllDetailed(): Promise<any[]> {
    const formations = await this.formationModel
      .find()
      .populate('id_formateur', 'nom prenom email')
      .exec();

    const result = await Promise.all(
      formations.map(async (formation) => {
        const formObj = formation.toObject();

        // Get niveaux with seances
        const niveaux = await this.niveauModel
          .find({ id_formation: formation._id })
          .sort({ numero_niveau: 1 })
          .exec();

        const niveauxWithSeances = await Promise.all(
          niveaux.map(async (niveau) => {
            const seances = await this.seanceModel
              .find({ id_niveau: niveau._id })
              .sort({ numero_seance: 1 })
              .exec();
            return { ...niveau.toObject(), seances };
          }),
        );

        // Get inscriptions with populated eleves
        const formationId = formation._id;
        const formationIdStr = formationId.toString();
        const inscriptions = await this.inscriptionModel
          .find({
            $or: [
              { id_formation: formationId },
              { id_formation: formationIdStr },
            ],
          })
          .populate('id_eleve')
          .exec();

        return {
          ...formObj,
          niveaux: niveauxWithSeances,
          inscriptions,
          totalEleves: inscriptions.length,
          totalNiveaux: niveaux.length,
          totalSeances: niveauxWithSeances.reduce(
            (sum, n) => sum + n.seances.length,
            0,
          ),
          niveauxCompletes: niveaux.filter((n) => n.statut).length,
          seancesValidees: niveauxWithSeances.reduce(
            (sum, n) => sum + n.seances.filter((s: any) => s.statut).length,
            0,
          ),
        };
      }),
    );

    return result;
  }

  async findOne(id: string): Promise<any> {
    const formation = await this.formationModel.findById(id).exec();
    if (!formation) {
      throw new NotFoundException(`Formation with ID ${id} not found`);
    }

    // Optional: Populate levels and sessions if needed for the detail view
    const niveaux = await this.niveauModel
      .find({ id_formation: formation._id })
      .exec();

    // We can also fetch sessions if we want a full tree, but let's stick to formation + niveaux first or just formation.
    // User logic "getbyid" usually implies getting the details.
    // Let's attach levels.
    const result = formation.toObject();
    const niveauxWithSeances = await Promise.all(
      niveaux.map(async (niveau) => {
        const seances = await this.seanceModel
          .find({ id_niveau: niveau._id })
          .exec();
        return { ...niveau.toObject(), seances };
      }),
    );

    return { ...result, niveaux: niveauxWithSeances };
  }

  async remove(id: string): Promise<void> {
    const formation = await this.formationModel.findByIdAndDelete(id).exec();
    if (!formation) {
      throw new NotFoundException(`Formation with ID ${id} not found`);
    }

    // Find all levels
    const niveaux = await this.niveauModel
      .find({ id_formation: formation._id })
      .exec();

    for (const niveau of niveaux) {
      // Delete sessions for this level
      await this.seanceModel.deleteMany({ id_niveau: niveau._id }).exec();
    }

    // Delete levels
    await this.niveauModel.deleteMany({ id_formation: formation._id }).exec();
  }

  async findbyIdFormateur(id_formateur: string): Promise<Formation[]> {
    if (!Types.ObjectId.isValid(id_formateur)) {
      return [];
    }
    return this.formationModel
      .find({ id_formateur: new Types.ObjectId(id_formateur) })
      .exec();
  }

  async getSeancesByFormateur(id_formateur: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(id_formateur)) {
      return [];
    }

    // Get all formations for the formateur
    const formations = await this.formationModel
      .find({ id_formateur: new Types.ObjectId(id_formateur) })
      .exec();

    if (formations.length === 0) {
      return [];
    }

    // Get all niveaux for these formations
    const formationIds = formations.map((f) => f._id);
    const niveaux = await this.niveauModel
      .find({ id_formation: { $in: formationIds } })
      .exec();

    if (niveaux.length === 0) {
      return [];
    }

    // Get all seances for these niveaux
    const niveauIds = niveaux.map((n) => n._id);
    const seances = await this.seanceModel
      .find({ id_niveau: { $in: niveauIds } })
      .populate({
        path: 'id_niveau',
        populate: {
          path: 'id_formation',
        },
      })
      .exec();

    // Map to a more useful structure
    return seances.map((seance) => ({
      _id: seance._id,
      titre: seance.titre,
      numero_seance: seance.numero_seance,
      date_prevue: seance.date_prevue,
      heure_debut: seance.heure_debut,
      heure_fin: seance.heure_fin,
      statut: seance.statut,
      formation:
        (seance.id_niveau as any)?.id_formation?.nom_formation || 'Formation',
      niveau: (seance.id_niveau as any)?.nom_niveau || 'Niveau',
    }));
  }

  async getStudentsBySeance(seanceId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(seanceId)) {
      return [];
    }

    // 1. Get Seance to find Level then Formation
    const seance = await this.seanceModel.findById(seanceId).exec();
    if (!seance) {
      throw new NotFoundException(`Seance with ID ${seanceId} not found`);
    }

    const niveau = await this.niveauModel.findById(seance.id_niveau).exec();
    if (!niveau) {
      throw new NotFoundException(`Niveau for seance not found`);
    }

    // 2. Get all inscriptions for this formation
    // Query with both ObjectId and string to handle legacy data
    const formationId = niveau.id_formation;
    const formationIdStr = formationId.toString();
    const inscriptions = await this.inscriptionModel
      .find({
        $or: [{ id_formation: formationId }, { id_formation: formationIdStr }],
      })
      .populate('id_eleve')
      .exec();

    return inscriptions;
  }

  async validateSeance(seanceId: string): Promise<any> {
    if (!Types.ObjectId.isValid(seanceId)) {
      throw new NotFoundException('Invalid Seance ID');
    }

    const seance = await this.seanceModel
      .findByIdAndUpdate(seanceId, { statut: true }, { new: true })
      .exec();

    if (!seance) {
      throw new NotFoundException(`Seance with ID ${seanceId} not found`);
    }

    // If this is séance 6 (last session of the level), mark the level as completed
    // and enable the next level
    if (seance.numero_seance === 6) {
      // Mark current niveau as completed
      const currentNiveau = await this.niveauModel
        .findByIdAndUpdate(seance.id_niveau, { statut: true }, { new: true })
        .exec();

      if (currentNiveau && currentNiveau.numero_niveau < 4) {
        // Enable the next niveau
        const nextNiveau = await this.niveauModel
          .findOneAndUpdate(
            {
              id_formation: currentNiveau.id_formation,
              numero_niveau: currentNiveau.numero_niveau + 1,
            },
            { statut: true },
            { new: true },
          )
          .exec();

        // Also update niveau_actuel on all inscriptions for this formation
        await this.inscriptionModel
          .updateMany(
            {
              $or: [
                { id_formation: currentNiveau.id_formation },
                { id_formation: currentNiveau.id_formation.toString() },
              ],
            },
            { niveau_actuel: currentNiveau.numero_niveau + 1 },
          )
          .exec();

        return {
          seance,
          niveauCompleted: currentNiveau,
          nextNiveauEnabled: nextNiveau,
        };
      }

      // If this is the last niveau (niveau 4), trigger formation validation
      if (currentNiveau && currentNiveau.numero_niveau === 4) {
        const formationValidation = await this.validateFormation(
          currentNiveau.id_formation.toString(),
        );
        return { seance, niveauCompleted: currentNiveau, formationValidation };
      }

      return { seance, niveauCompleted: currentNiveau };
    }

    return seance;
  }

  async validateFormation(formationId: string): Promise<any> {
    if (!Types.ObjectId.isValid(formationId)) {
      throw new NotFoundException('Invalid Formation ID');
    }

    const formation = await this.formationModel.findById(formationId).exec();
    if (!formation) {
      throw new NotFoundException(`Formation with ID ${formationId} not found`);
    }

    // 1. Get all niveaux for this formation
    const niveaux = await this.niveauModel
      .find({ id_formation: formationId })
      .sort({ numero_niveau: 1 })
      .exec();

    // 2. Check if all niveaux are completed
    const allNiveauxCompleted =
      niveaux.length === 4 && niveaux.every((n) => n.statut === true);
    if (!allNiveauxCompleted) {
      throw new BadRequestException(
        'Tous les niveaux ne sont pas encore terminés',
      );
    }

    // 3. Get all seances for all niveaux
    const niveauIds = niveaux.map((n) => n._id);
    const seances = await this.seanceModel
      .find({ id_niveau: { $in: niveauIds } })
      .exec();

    // 4. Check if all seances are validated
    const allSeancesValidated =
      seances.length === 24 && seances.every((s) => s.statut === true);
    if (!allSeancesValidated) {
      throw new BadRequestException(
        'Toutes les séances ne sont pas encore validées',
      );
    }

    // 5. Get all inscriptions for this formation
    const inscriptions = await this.inscriptionModel
      .find({
        $or: [
          { id_formation: new Types.ObjectId(formationId) },
          { id_formation: formationId },
        ],
        statut_formation: StatutInscription.EN_COURS,
      })
      .populate('id_eleve')
      .exec();

    const certified = [];
    const notCertified = [];

    // 6. For each inscription, check presence per niveau
    for (const inscription of inscriptions) {
      let allNiveauxPassed = true;

      for (const niveau of niveaux) {
        // Get seance IDs for this niveau
        const niveauSeanceIds = seances
          .filter((s) => s.id_niveau.toString() === niveau._id.toString())
          .map((s) => s._id);

        // Count presences marked as true for this inscription in this niveau
        const presenceCount = await this.presenceModel
          .countDocuments({
            id_inscription: inscription._id,
            id_seance: { $in: niveauSeanceIds },
            present: true,
          })
          .exec();

        if (presenceCount < 4) {
          allNiveauxPassed = false;
          break;
        }
      }

      if (allNiveauxPassed) {
        // Check if certification already exists
        const existingCert = await this.certificationModel
          .findOne({ id_inscription: inscription._id })
          .exec();

        if (!existingCert) {
          // Create certification
          const cert = new this.certificationModel({
            id_inscription: inscription._id,
            numero_certificat: `CERT-${uuidv4()}`,
            date_delivrance: new Date(),
          });
          await cert.save();
        }

        // Mark inscription as completed
        await this.inscriptionModel
          .findByIdAndUpdate(inscription._id, {
            statut_formation: StatutInscription.COMPLETEE,
            date_completion: new Date(),
          })
          .exec();

        certified.push(inscription);
      } else {
        // Mark inscription as abandoned (not enough presences)
        await this.inscriptionModel
          .findByIdAndUpdate(inscription._id, {
            statut_formation: StatutInscription.ABANDONNEE,
          })
          .exec();

        notCertified.push(inscription);
      }
    }

    return {
      formation: formation.nom_formation,
      totalEleves: inscriptions.length,
      certified: certified.length,
      notCertified: notCertified.length,
      details: {
        certifiedEleves: certified.map((i) => ({
          inscription_id: i._id,
          eleve: (i as any).id_eleve,
          statut: 'completee',
        })),
        notCertifiedEleves: notCertified.map((i) => ({
          inscription_id: i._id,
          eleve: (i as any).id_eleve,
          statut: 'abandonnee',
        })),
      },
    };
  }

  async update(
    id: string,
    updateFormationDto: UpdateFormationDto,
  ): Promise<Formation> {
    const formation = await this.formationModel
      .findByIdAndUpdate(id, updateFormationDto, { new: true })
      .exec();
    if (!formation) {
      throw new NotFoundException(`Formation with ID ${id} not found`);
    }
    return formation;
  }

  async updateNiveau(
    niveauId: string,
    updateNiveauDto: UpdateNiveauDto,
  ): Promise<Niveau> {
    const niveau = await this.niveauModel
      .findByIdAndUpdate(niveauId, updateNiveauDto, { new: true })
      .exec();
    if (!niveau) {
      throw new NotFoundException(`Niveau with ID ${niveauId} not found`);
    }
    return niveau;
  }

  async updateSeance(
    seanceId: string,
    updateSeanceDto: UpdateSeanceDto,
  ): Promise<Seance> {
    const seance = await this.seanceModel
      .findByIdAndUpdate(seanceId, updateSeanceDto, { new: true })
      .exec();
    if (!seance) {
      throw new NotFoundException(`Seance with ID ${seanceId} not found`);
    }
    return seance;
  }

  async checkAdvancement(formationId: string): Promise<any> {
    if (!Types.ObjectId.isValid(formationId)) {
      throw new NotFoundException('Invalid Formation ID');
    }

    const niveaux = await this.niveauModel
      .find({ id_formation: formationId })
      .sort({ numero_niveau: 1 })
      .exec();

    if (niveaux.length === 0) {
      return { advanced: false, currentNiveau: 1 };
    }

    // Find current active niveau (highest completed + 1)
    let currentNiveau = 1;
    for (const niveau of niveaux) {
      if (niveau.statut) {
        currentNiveau = Math.min(niveau.numero_niveau + 1, 4);
      }
    }

    return { advanced: currentNiveau > 1, currentNiveau };
  }

  /**
   * Convertit une heure au format "HH:MM" en minutes depuis minuit
   * @param timeStr Heure au format "HH:MM"
   * @returns Nombre de minutes depuis minuit, ou 0 si format invalide
   */
  private parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  }

  /**
   * Combine une date avec une heure au format "HH:MM"
   * @param datePrevue Date de la séance
   * @param heureDebut Heure de début au format "HH:MM"
   * @returns Date combinée avec l'heure
   */
  private combineDateAndTime(datePrevue: Date, heureDebut: string): Date {
    if (!datePrevue || !heureDebut) return null;

    const minutes = this.parseTimeToMinutes(heureDebut);
    const combinedDate = new Date(datePrevue);
    combinedDate.setHours(0, 0, 0, 0);
    combinedDate.setMinutes(combinedDate.getMinutes() + minutes);

    return combinedDate;
  }

  /**
   * Vérifie les retards des formateurs (plus de 15 minutes après l'heure prévue)
   * et envoie des notifications par email
   * @returns Objet indiquant le nombre de notifications envoyées et les erreurs
   */
  async checkFormatorDelay(): Promise<{ notified: number; errors: number }> {
    this.logger.log(
      '🕐 Démarrage de la vérification des retards des formateurs...',
    );

    let notifiedCount = 0;
    let errorCount = 0;
    const DELAY_THRESHOLD_MINUTES = 15;
    const now = new Date();

    try {
      // Récupère toutes les séances avec les informations de niveau et formation
      const seances = await this.seanceModel
        .find({ date_prevue: { $exists: true, $ne: null } })
        .populate({
          path: 'id_niveau',
          populate: {
            path: 'id_formation',
            populate: {
              path: 'id_formateur',
            },
          },
        })
        .exec();

      this.logger.debug(
        `📋 ${seances.length} séances trouvées avec date_prevue`,
      );

      for (const seance of seances) {
        try {
          // Vérifier que les infos nécessaires existent
          if (!seance.id_niveau || !seance.id_niveau.id_formation) {
            this.logger.warn(
              `⚠️ Seance ${seance._id} - Relations manquantes (Niveau ou Formation)`,
            );
            continue;
          }

          const formation = seance.id_niveau.id_formation;
          if (!formation.id_formateur) {
            this.logger.warn(
              `⚠️ Seance ${seance._id} - Formation ${formation._id} sans formateur`,
            );
            continue;
          }

          // Combine la date prévue avec l'heure de début
          const seanceStartTime = this.combineDateAndTime(
            seance.date_prevue,
            seance.heure_debut,
          );

          if (!seanceStartTime) {
            this.logger.debug(
              `⏭️ Seance ${seance._id} - Heure de début invalide`,
            );
            continue;
          }

          // Ajoute 15 minutes au délai maximum accepté
          const delayThreshold = new Date(seanceStartTime);
          delayThreshold.setMinutes(
            delayThreshold.getMinutes() + DELAY_THRESHOLD_MINUTES,
          );

          // Vérifie si le formateur est en retard
          if (now > delayThreshold) {
            const minutesDelay = Math.round(
              (now.getTime() - seanceStartTime.getTime()) / (1000 * 60),
            );

            const formateur = formation.id_formateur;
            const formateurName = `${formateur.prenom} ${formateur.nom}`;

            this.logger.log({
              '📌 RETARD DETECTE': {
                formateur: formateurName,
                email: formateur.email,
                seance: seance.titre,
                minutesDelay,
                date: seanceStartTime.toLocaleString('fr-FR'),
              },
            });

            try {
              // Envoie la notification
              await this.mailingService.sendFormatorDelayNotification(
                formateur.email,
                formateurName,
                seance.titre,
                minutesDelay,
              );

              notifiedCount++;
              this.logger.log(
                `✅ Notification envoyée à ${formateurName} (${formateur.email})`,
              );
            } catch (emailError) {
              errorCount++;
              this.logger.error(
                `❌ Erreur lors de l'envoi de l'email à ${formateurName}: ${emailError.message}`,
              );
            }
          }
        } catch (seanceError) {
          errorCount++;
          this.logger.error(
            `❌ Erreur lors du traitement de la séance ${seance._id}: ${seanceError.message}`,
          );
        }
      }

      this.logger.log(
        `✨ Vérification terminée - ${notifiedCount} formatrice(s) notifié(e)s, ${errorCount} erreur(s)`,
      );
      return { notified: notifiedCount, errors: errorCount };
    } catch (error) {
      this.logger.error(
        `❌ Erreur critique lors de la vérification des retards: ${error.message}`,
      );
      throw new BadRequestException(
        `Impossible de vérifier les retards: ${error.message}`,
      );
    }
  }

  /**
   * Calculates student progression based on presence (attendance) for a given formateur.
   * Progression = (seances attended as present) / (total seances in enrolled formations) × 100
   */
  async getStudentProgressByFormateur(
    id_formateur: string,
  ): Promise<Record<string, number>> {
    if (!Types.ObjectId.isValid(id_formateur)) {
      return {};
    }

    // 1. Get all formations for this formateur
    const formations = await this.formationModel
      .find({ id_formateur: new Types.ObjectId(id_formateur) })
      .exec();

    if (formations.length === 0) return {};

    const formationIds = formations.map((f) => f._id);

    // 2. Get all niveaux for these formations
    const niveaux = await this.niveauModel
      .find({ id_formation: { $in: formationIds } })
      .exec();

    if (niveaux.length === 0) return {};

    // 3. Build a map: formationId -> total seances count
    const niveauIds = niveaux.map((n) => n._id);
    const seances = await this.seanceModel
      .find({ id_niveau: { $in: niveauIds } })
      .exec();

    // Map niveauId -> formationId
    const niveauToFormation: Record<string, string> = {};
    for (const n of niveaux) {
      niveauToFormation[n._id.toString()] = n.id_formation.toString();
    }

    // Map formationId -> total seances
    const formationSeanceCount: Record<string, number> = {};
    // Map seanceId -> formationId
    const seanceToFormation: Record<string, string> = {};
    for (const s of seances) {
      const fId = niveauToFormation[s.id_niveau.toString()];
      if (fId) {
        formationSeanceCount[fId] = (formationSeanceCount[fId] || 0) + 1;
        seanceToFormation[s._id.toString()] = fId;
      }
    }

    // 4. Get all inscriptions for these formations
    const inscriptions = await this.inscriptionModel
      .find({
        $or: [
          { id_formation: { $in: formationIds } },
          { id_formation: { $in: formationIds.map((id) => id.toString()) } },
        ],
      })
      .populate('id_eleve')
      .exec();

    if (inscriptions.length === 0) return {};

    // Map inscriptionId -> { eleveId, formationId }
    const inscriptionMap: Record<
      string,
      { eleveId: string; formationId: string }
    > = {};
    // Track per student: which formations they're in -> for total seances
    const studentFormations: Record<string, Set<string>> = {};

    for (const insc of inscriptions) {
      const eleveId =
        (insc.id_eleve as any)?._id?.toString() || insc.id_eleve?.toString();
      const fId = insc.id_formation?.toString();
      if (eleveId && fId) {
        inscriptionMap[insc._id.toString()] = { eleveId, formationId: fId };
        if (!studentFormations[eleveId]) {
          studentFormations[eleveId] = new Set();
        }
        studentFormations[eleveId].add(fId);
      }
    }

    // 5. Get all presences for all seances
    const seanceIds = seances.map((s) => s._id);
    const presences = await this.presenceModel
      .find({ id_seance: { $in: seanceIds } })
      .exec();

    // 6. Count presences (present=true) per student
    const studentPresenceCount: Record<string, number> = {};
    for (const p of presences) {
      if (!p.present) continue;
      const inscId = p.id_inscription?.toString();
      const info = inscriptionMap[inscId];
      if (info) {
        studentPresenceCount[info.eleveId] =
          (studentPresenceCount[info.eleveId] || 0) + 1;
      }
    }

    // 7. Calculate progression per student
    const result: Record<string, number> = {};
    for (const [eleveId, formationSet] of Object.entries(studentFormations)) {
      let totalSeances = 0;
      for (const fId of formationSet) {
        totalSeances += formationSeanceCount[fId] || 0;
      }
      const attended = studentPresenceCount[eleveId] || 0;
      result[eleveId] =
        totalSeances > 0 ? Math.round((attended / totalSeances) * 100) : 0;
    }

    return result;
  }
}
