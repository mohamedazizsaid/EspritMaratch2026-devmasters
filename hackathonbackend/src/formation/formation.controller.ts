import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FormationService } from './formation.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { UpdateNiveauDto } from './dto/update-niveau.dto';
import { UpdateSeanceDto } from './dto/update-seance.dto';

@ApiTags('formation')
@ApiBearerAuth('JWT-auth')
@Controller('formation')
export class FormationController {
    constructor(private readonly formationService: FormationService) { }

    @Post()
    @ApiOperation({ summary: 'Créer une nouvelle formation (génère automatiquement niveaux et séances)' })
    @ApiResponse({ status: 201, description: 'La formation a été créée avec succès.' })
    create(@Body() createFormationDto: CreateFormationDto) {
        return this.formationService.create(createFormationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Récupérer toutes les formations' })
    @ApiResponse({ status: 200, description: 'Liste des formations récupérée.' })
    findAll() {
        return this.formationService.findAll();
    }

    @Get('detailed')
    @ApiOperation({ summary: 'Récupérer toutes les formations avec niveaux, séances et élèves' })
    @ApiResponse({ status: 200, description: 'Liste détaillée des formations récupérée.' })
    findAllDetailed() {
        return this.formationService.findAllDetailed();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer une formation avec sa hiérarchie complète' })
    @ApiResponse({ status: 200, description: 'Formation trouvée.' })
    @ApiResponse({ status: 404, description: 'Formation non trouvée.' })
    findOne(@Param('id') id: string) {
        return this.formationService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer une formation et tous ses niveaux/séances associés' })
    @ApiResponse({ status: 200, description: 'Formation supprimée.' })
    remove(@Param('id') id: string) {
        return this.formationService.remove(id);
    }

    @Get('formateur/:id_formateur/seances')
    @ApiOperation({ summary: 'Récupérer toutes les séances d\'un formateur' })
    @ApiResponse({ status: 200, description: 'Séances du formateur récupérées.' })
    getSeancesByFormateur(@Param('id_formateur') id_formateur: string) {
        return this.formationService.getSeancesByFormateur(id_formateur);
    }

    @Get('formateur/:id_formateur')
    @ApiOperation({ summary: 'Récupérer les formations d\'un formateur spécifique' })
    @ApiResponse({ status: 200, description: 'Formations du formateur récupérées.' })
    findByFormateur(@Param('id_formateur') id_formateur: string) {
        return this.formationService.findbyIdFormateur(id_formateur);
    }

    @Get('seance/:seanceId/students')
    @ApiOperation({ summary: 'Récupérer les élèves inscrits à la formation de la séance' })
    @ApiResponse({ status: 200, description: 'Liste des élèves récupérée.' })
    getStudentsBySeance(@Param('seanceId') seanceId: string) {
        return this.formationService.getStudentsBySeance(seanceId);
    }

    @Patch('seance/:seanceId/validate')
    @ApiOperation({ summary: 'Valider une séance (statut = true)' })
    @ApiResponse({ status: 200, description: 'Séance validée.' })
    validateSeance(@Param('seanceId') seanceId: string) {
        return this.formationService.validateSeance(seanceId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour une formation' })
    @ApiResponse({ status: 200, description: 'Formation mise à jour.' })
    update(@Param('id') id: string, @Body() updateFormationDto: UpdateFormationDto) {
        return this.formationService.update(id, updateFormationDto);
    }

    @Patch('niveau/:niveauId')
    @ApiOperation({ summary: 'Mettre à jour un niveau' })
    @ApiResponse({ status: 200, description: 'Niveau mis à jour.' })
    updateNiveau(@Param('niveauId') niveauId: string, @Body() updateNiveauDto: UpdateNiveauDto) {
        return this.formationService.updateNiveau(niveauId, updateNiveauDto);
    }

    @Patch('seance/:seanceId')
    @ApiOperation({ summary: 'Mettre à jour une séance' })
    @ApiResponse({ status: 200, description: 'Séance mise à jour.' })
    updateSeance(@Param('seanceId') seanceId: string, @Body() updateSeanceDto: UpdateSeanceDto) {
        return this.formationService.updateSeance(seanceId, updateSeanceDto);
    }

    @Get(':formationId/check-advancement')
    @ApiOperation({ summary: 'Vérifier l\'avancement automatique des niveaux' })
    @ApiResponse({ status: 200, description: 'Avancement vérifié.' })
    checkAdvancement(@Param('formationId') formationId: string) {
        return this.formationService.checkAdvancement(formationId);
    }

    @Post(':formationId/validate')
    @ApiOperation({ summary: 'Valider une formation: certifier les élèves présents et marquer les abandons' })
    @ApiResponse({ status: 200, description: 'Formation validée. Certificats créés pour les élèves éligibles.' })
    @ApiResponse({ status: 400, description: 'Tous les niveaux/séances ne sont pas encore terminés.' })
    @ApiResponse({ status: 404, description: 'Formation non trouvée.' })
    validateFormation(@Param('formationId') formationId: string) {
        return this.formationService.validateFormation(formationId);
    }

    @Post('check-formator-delays')
    @ApiOperation({ summary: 'Vérifier les retards des formateurs (>15 min) et envoyer notifications' })
    @ApiResponse({
        status: 201,
        description: 'Vérification terminée. Notifications envoyées aux formateurs en retard.',
        schema: {
            properties: {
                notified: { type: 'number', description: 'Nombre de formateurs notifiés' },
                errors: { type: 'number', description: 'Nombre d\'erreurs d\'envoi' },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Erreur lors de la vérification des retards.',
    })
    checkFormatorDelays() {
        return this.formationService.checkFormatorDelay();
    }
}
