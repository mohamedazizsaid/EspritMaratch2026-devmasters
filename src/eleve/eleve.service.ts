import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Eleve } from './entities/eleve.entity';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';
import { CloudinaryService } from './cloudinary.service';
import { Inscription } from 'src/inscription/entities/inscription.entity';
import { Presence } from 'src/presence/entities/presence.entity';
import { Seance } from 'src/formation/entities/seance.entity';
import { Niveau } from 'src/formation/entities/niveau.entity';

@Injectable()
export class EleveService {
    constructor(
        @InjectModel(Eleve.name) private eleveModel: Model<Eleve>,
        @InjectModel(Inscription.name) private inscriptionModel: Model<Inscription>,
        @InjectModel(Presence.name) private presenceModel: Model<Presence>,
        @InjectModel(Seance.name) private seanceModel: Model<Seance>,
        @InjectModel(Niveau.name) private niveauModel: Model<Niveau>,
        private cloudinaryService: CloudinaryService,
    ) { }

    async create(createEleveDto: CreateEleveDto, file?: Express.Multer.File): Promise<Eleve> {
        if (file) {
            const upload = await this.cloudinaryService.uploadFile(file);
            createEleveDto.avatar = upload.secure_url;
        }
        const createdEleve = new this.eleveModel(createEleveDto);
        return createdEleve.save();
    }

    async findAll(): Promise<Eleve[]> {
        return this.eleveModel.find().exec();
    }

    async findOne(id: string): Promise<Eleve> {
        const eleve = await this.eleveModel.findById(id).exec();
        if (!eleve) {
            throw new NotFoundException(`Eleve with ID ${id} not found`);
        }
        return eleve;
    }

    async update(id: string, updateEleveDto: UpdateEleveDto, file?: Express.Multer.File): Promise<Eleve> {
        if (file) {
            const upload = await this.cloudinaryService.uploadFile(file);
            updateEleveDto.avatar = upload.secure_url;
        }
        const updatedEleve = await this.eleveModel
            .findByIdAndUpdate(id, updateEleveDto, { new: true })
            .exec();
        if (!updatedEleve) {
            throw new NotFoundException(`Eleve with ID ${id} not found`);
        }
        return updatedEleve;
    }

    async remove(id: string): Promise<Eleve> {
        const deletedEleve = await this.eleveModel.findByIdAndDelete(id).exec();
        if (!deletedEleve) {
            throw new NotFoundException(`Eleve with ID ${id} not found`);
        }
        return deletedEleve;
    }


    async findElevesByFormateur(id_formateur: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(id_formateur)) {
            return [];
        }

        // Récupère les inscriptions liées aux formations du formateur
        const inscriptions = await this.inscriptionModel
            .find()
            .populate({
                path: 'id_formation',
                match: { id_formateur: new Types.ObjectId(id_formateur) }
            })
            .populate('id_eleve')
            .exec();

        // Filtre pour ne garder que les inscriptions valides
        const validInscriptions = inscriptions.filter(ins => ins.id_formation && ins.id_eleve);

        // Collect unique formation IDs to compute total seances per formation
        const formationIds = [...new Set(validInscriptions.map(ins => (ins.id_formation as any)._id.toString()))];

        // For each formation, count total seances across all niveaux
        const formationTotalSeances: Record<string, number> = {};
        for (const fId of formationIds) {
            const niveaux = await this.niveauModel.find({ id_formation: new Types.ObjectId(fId) }).exec();
            const niveauIds = niveaux.map(n => n._id);
            const totalSeances = await this.seanceModel.countDocuments({ id_niveau: { $in: niveauIds } }).exec();
            formationTotalSeances[fId] = totalSeances;
        }

        // Build a map of eleve -> best progress across all their inscriptions
        const elevesMap = new Map<string, { eleve: any; progress: number; grade: string }>();

        for (const ins of validInscriptions) {
            const eleve = ins.id_eleve as any;
            const eleveId = eleve._id.toString();
            const formationId = (ins.id_formation as any)._id.toString();
            const totalSeances = formationTotalSeances[formationId] || 0;

            let progress = 0;
            if (totalSeances > 0) {
                // Count presences where present = true for this inscription
                const attendedCount = await this.presenceModel.countDocuments({
                    id_inscription: ins._id,
                    present: true,
                }).exec();
                progress = Math.round((attendedCount / totalSeances) * 100);
            } else {
                // No seances defined yet — use niveau_actuel as fallback
                const inscription = ins as any;
                const niveaux = await this.niveauModel.countDocuments({ id_formation: new Types.ObjectId(formationId) }).exec();
                if (niveaux > 0) {
                    progress = Math.round(((inscription.niveau_actuel || 1) / niveaux) * 100);
                }
            }

            // Determine grade from statut_formation
            const statut = (ins as any).statut_formation || 'en_cours';
            let grade = 'En cours';
            if (statut === 'completee') grade = 'Complété';
            else if (statut === 'abandonnee') grade = 'Abandonné';

            // Keep the best progress for this student
            const existing = elevesMap.get(eleveId);
            if (!existing || progress > existing.progress) {
                elevesMap.set(eleveId, { eleve, progress, grade });
            }
        }

        // Return eleves with computed progress
        return Array.from(elevesMap.values()).map(({ eleve, progress, grade }) => ({
            ...eleve.toObject ? eleve.toObject() : eleve,
            progress,
            grade,
        }));
    }
}
