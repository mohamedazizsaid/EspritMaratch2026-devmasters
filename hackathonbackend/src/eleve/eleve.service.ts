import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Eleve } from './entities/eleve.entity';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';
import { CloudinaryService } from './cloudinary.service';
import { Inscription } from 'src/inscription/entities/inscription.entity';

@Injectable()
export class EleveService {
  constructor(
    @InjectModel(Eleve.name) private eleveModel: Model<Eleve>,
    @InjectModel(Inscription.name) private inscriptionModel: Model<Inscription>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createEleveDto: CreateEleveDto,
    file?: Express.Multer.File,
  ): Promise<Eleve> {
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

  async update(
    id: string,
    updateEleveDto: UpdateEleveDto,
    file?: Express.Multer.File,
  ): Promise<Eleve> {
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
        match: { id_formateur: new Types.ObjectId(id_formateur) },
      })
      .populate('id_eleve')
      .exec();

    // Filtre pour ne garder que les élèves uniques
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
