import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { Response } from 'express';

@ApiTags('certification')
@ApiBearerAuth('JWT-auth')
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Post()
  @ApiOperation({ summary: 'Délivrer un nouveau certificat' })
  @ApiResponse({ status: 201, description: 'Certificat généré avec succès.' })
  @ApiResponse({
    status: 409,
    description: 'Un certificat existe déjà pour cette inscription.',
  })
  create(@Body() createCertificationDto: CreateCertificationDto) {
    return this.certificationService.create(createCertificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les certificats délivrés' })
  @ApiResponse({ status: 200, description: 'Liste des certificats récupérée.' })
  findAll() {
    return this.certificationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer les détails d'un certificat" })
  @ApiResponse({ status: 200, description: 'Certificat trouvé.' })
  @ApiResponse({ status: 404, description: 'Certificat non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.certificationService.findOne(id);
  }

  @Get('download/:id')
  @ApiOperation({
    summary:
      'Télécharger le PDF du certificat et en enregistrer une copie sur le Desktop',
  })
  @ApiResponse({ status: 200, description: 'Fichier PDF généré.' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    return this.certificationService.generatePdf(id, res);
  }
}
