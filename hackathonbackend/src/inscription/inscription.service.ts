import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inscription, StatutInscription } from './entities/inscription.entity';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Types } from 'mongoose';

@Injectable()
export class InscriptionService {
  constructor(
    @InjectModel(Inscription.name) private inscriptionModel: Model<Inscription>,
  ) {}

  async create(
    createInscriptionDto: CreateInscriptionDto,
  ): Promise<Inscription> {
    const eleveId = new Types.ObjectId(createInscriptionDto.id_eleve);
    const formationId = new Types.ObjectId(createInscriptionDto.id_formation);

    // Check if duplicate enrollment
    const existing = await this.inscriptionModel
      .findOne({
        id_eleve: eleveId,
        id_formation: formationId,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        'Eleve is already enrolled in this formation',
      );
    }

    const createdInscription = new this.inscriptionModel({
      ...createInscriptionDto,
      id_eleve: eleveId,
      id_formation: formationId,
    });
    return createdInscription.save();
  }

  async findAll(): Promise<Inscription[]> {
    return this.inscriptionModel
      .find()
      .populate('id_eleve')
      .populate('id_formation')
      .exec();
  }

  async findOne(id: string): Promise<Inscription> {
    const inscription = await this.inscriptionModel
      .findById(id)
      .populate('id_eleve')
      .populate('id_formation')
      .exec();

    if (!inscription) {
      throw new NotFoundException(`Inscription with ID ${id} not found`);
    }
    return inscription;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Inscription> {
    const updateData: any = { ...updateStatusDto };

    // If completed, set date
    if (updateStatusDto.statut_formation === StatutInscription.COMPLETEE) {
      updateData.date_completion = new Date();
    }

    const updatedInscription = await this.inscriptionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedInscription) {
      throw new NotFoundException(`Inscription with ID ${id} not found`);
    }

    return updatedInscription;
  }

  async remove(id: string): Promise<Inscription> {
    const deleted = await this.inscriptionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Inscription with ID ${id} not found`);
    }
    return deleted;
  }

  async findElevesByFormateur(id_formateur: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(id_formateur)) {
      return [];
    }

    // 1. Find all inscriptions where the formation's id_formateur matches
    // We use populate with a match filter on the formation
    const inscriptions = await this.inscriptionModel
      .find()
      .populate({
        path: 'id_formation',
        match: { id_formateur: new Types.ObjectId(id_formateur) },
      })
      .populate('id_eleve')
      .exec();

    // 2. Filter out inscriptions where id_formation is null (because of match filter)
    // and extract unique students (eleves)
    const elevesMap = new Map();
    inscriptions.forEach((ins) => {
      if (ins.id_formation && ins.id_eleve) {
        const eleve = ins.id_eleve as any;
        if (!elevesMap.has(eleve._id.toString())) {
          elevesMap.set(eleve._id.toString(), eleve);
        }
      }
    });

    return Array.from(elevesMap.values());
  }
}
