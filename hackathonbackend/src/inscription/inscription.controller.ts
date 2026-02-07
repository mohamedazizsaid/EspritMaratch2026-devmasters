import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InscriptionService } from './inscription.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('inscription')
@ApiBearerAuth('JWT-auth')
@Controller('inscription')
export class InscriptionController {
    constructor(private readonly inscriptionService: InscriptionService) { }

    @Post()
    @ApiOperation({ summary: 'Inscrire un élève à une formation' })
    @ApiResponse({ status: 201, description: 'L\'élève a été inscrit avec succès.' })
    @ApiResponse({ status: 409, description: 'L\'élève est déjà inscrit à cette formation.' })
    create(@Body() createInscriptionDto: CreateInscriptionDto) {
        return this.inscriptionService.create(createInscriptionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Récupérer toutes les inscriptions' })
    @ApiResponse({ status: 200, description: 'Liste des inscriptions récupérée.' })
    findAll() {
        return this.inscriptionService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer les détails d\'une inscription' })
    @ApiResponse({ status: 200, description: 'Inscription trouvée.' })
    @ApiResponse({ status: 404, description: 'Inscription non trouvée.' })
    findOne(@Param('id') id: string) {
        return this.inscriptionService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour le statut ou le niveau d\'une inscription' })
    @ApiResponse({ status: 200, description: 'Inscription mise à jour.' })
    updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
        return this.inscriptionService.updateStatus(id, updateStatusDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer une inscription' })
    @ApiResponse({ status: 200, description: 'Inscription supprimée.' })
    remove(@Param('id') id: string) {
        return this.inscriptionService.remove(id);
    }

    @Get('formateur/:id_formateur/eleves')
    @ApiOperation({ summary: 'Récupérer tous les élèves inscrits aux formations d\'un formateur' })
    @ApiResponse({ status: 200, description: 'Liste des élèves récupérée.' })
    findElevesByFormateur(@Param('id_formateur') id_formateur: string) {
        return this.inscriptionService.findElevesByFormateur(id_formateur);
    }
}
