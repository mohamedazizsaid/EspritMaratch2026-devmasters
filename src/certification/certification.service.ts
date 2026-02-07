import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { Inscription } from '../inscription/entities/inscription.entity';
import { v4 as uuidv4 } from 'uuid';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class CertificationService {
    constructor(
        @InjectModel(Certification.name) private certificationModel: Model<Certification>,
        @InjectModel(Inscription.name) private inscriptionModel: Model<Inscription>,
    ) { }

    async create(createCertificationDto: CreateCertificationDto): Promise<Certification> {
        // Verify inscription exists
        const inscription = await this.inscriptionModel.findById(createCertificationDto.id_inscription).exec();
        if (!inscription) {
            throw new NotFoundException(`Inscription not found`);
        }

        // Check if already certified
        const existing = await this.certificationModel.findOne({ id_inscription: createCertificationDto.id_inscription }).exec();
        if (existing) {
            throw new ConflictException('Certificate already exists for this inscription');
        }

        // Generate secure unique certificate number
        const numero_certificat = `CERT-${uuidv4()}`;

        const certification = new this.certificationModel({
            ...createCertificationDto,
            numero_certificat,
        });

        return certification.save();
    }

    async findAll(): Promise<Certification[]> {
        return this.certificationModel
            .find()
            .populate({
                path: 'id_inscription',
                populate: [
                    { path: 'id_eleve' },
                    { path: 'id_formation' }
                ]
            })
            .exec();
    }

    async findOne(id: string): Promise<Certification> {
        const cert = await this.certificationModel
            .findById(id)
            .populate({
                path: 'id_inscription',
                populate: [
                    { path: 'id_eleve' },
                    { path: 'id_formation' }
                ]
            })
            .exec();
        if (!cert) {
            throw new NotFoundException(`Certification with ID ${id} not found`);
        }
        return cert;
    }

    async generatePdf(id: string, res: Response): Promise<void> {
        const cert = await this.findOne(id);
        const eleve = (cert.id_inscription as any).id_eleve;
        const formation = (cert.id_inscription as any).id_formation;

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        // Pipe PDF to response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=certificate-${cert.numero_certificat}.pdf`,
        });
        doc.pipe(res);

        // --- Save to Desktop ---
        try {
            const desktopPath = path.join(os.homedir(), 'Desktop');
            const fileName = `certificate-${cert.numero_certificat}.pdf`;
            const fullPath = path.join(desktopPath, fileName);

            // Create a write stream for the Desktop
            const desktopStream = fs.createWriteStream(fullPath);
            doc.pipe(desktopStream);
            console.log(`Certificate saved to Desktop: ${fullPath}`);
        } catch (error) {
            console.error('Failed to save certificate to Desktop:', error);
        }

        // --- Design Professional Certificate ---

        // Border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

        // Header
        doc.moveDown(2);
        doc.fontSize(30).font('Times-Roman').text('CERTIFICAT DE RÉUSSITE', { align: 'center' });

        doc.moveDown();
        doc.fontSize(15).font('Helvetica').text('Ce certificat est fièrement décerné à', { align: 'center' });

        // Student Name
        doc.moveDown();
        doc.fontSize(25).font('Helvetica-Bold').text(`${eleve.nom} ${eleve.prenom}`, { align: 'center', underline: true });

        // Body
        doc.moveDown();
        doc.fontSize(15).font('Helvetica').text('Pour avoir complété avec succès la formation :', { align: 'center' });

        // Formation Name
        doc.moveDown();
        doc.fontSize(20).font('Helvetica-Bold').text(`${formation.nom_formation}`, { align: 'center' });

        // Date
        doc.moveDown(2);
        doc.fontSize(12).text(`Délivré le : ${cert.date_delivrance.toLocaleDateString()}`, { align: 'center' });

        // Certificate Number (Verification)
        doc.moveDown();
        doc.fontSize(10).text(`N° Certificat : ${cert.numero_certificat}`, { align: 'center' });

        // Signatures
        doc.moveDown(4);

        const signatureY = doc.y;
        doc.text('______________________', 100, signatureY);
        doc.text('Directeur', 100, signatureY + 15);

        doc.text('______________________', 500, signatureY);
        doc.text(`Délivré par: ${cert.delivre_par}`, 500, signatureY + 15);

        doc.end();
    }
}
