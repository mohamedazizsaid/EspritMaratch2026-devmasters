import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EleveService } from './eleve.service';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';

@ApiTags('eleves')
@ApiBearerAuth('JWT-auth')
@Controller('eleves')
export class EleveController {
    constructor(private readonly eleveService: EleveService) { }

    @Post()
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Créer un nouvel élève' })
    @ApiResponse({ status: 201, description: 'L\'élève a été créé avec succès.' })
    create(
        @Body() createEleveDto: CreateEleveDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.eleveService.create(createEleveDto, file);
    }

    @Get()
    @ApiOperation({ summary: 'Récupérer tous les élèves' })
    @ApiResponse({ status: 200, description: 'Liste des élèves récupérée.' })
    findAll() {
        return this.eleveService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer un élève par son ID' })
    @ApiResponse({ status: 200, description: 'L\'élève a été trouvé.' })
    @ApiResponse({ status: 404, description: 'Élève non trouvé.' })
    findOne(@Param('id') id: string) {
        return this.eleveService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Mettre à jour les informations d\'un élève' })
    @ApiResponse({ status: 200, description: 'L\'élève a été mis à jour.' })
    update(
        @Param('id') id: string,
        @Body() updateEleveDto: UpdateEleveDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.eleveService.update(id, updateEleveDto, file);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un élève' })
    @ApiResponse({ status: 200, description: 'L\'élève a été supprimé.' })
    remove(@Param('id') id: string) {
        return this.eleveService.remove(id);
    }


    @Get('eleves-by-formateur/:id_formateur')
    @ApiOperation({ summary: 'Récupérer tous les élèves inscrits à une formation' })
    @ApiResponse({ status: 200, description: 'Liste des élèves récupérée.' })
    findElevesByFormateur(@Param('id_formateur') id_formateur: string) {
        return this.eleveService.findElevesByFormateur(id_formateur);
    }
}
