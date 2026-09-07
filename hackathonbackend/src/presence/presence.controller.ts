import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PresenceService } from './presence.service';
import { MarkPresenceDto } from './dto/mark-presence.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';

@ApiTags('presence')
@ApiBearerAuth('JWT-auth')
@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post()
  @ApiOperation({ summary: "Marquer la présence d'un élève à une séance" })
  @ApiResponse({ status: 201, description: 'Présence enregistrée.' })
  markPresence(@Body() markPresenceDto: MarkPresenceDto) {
    return this.presenceService.markPresence(markPresenceDto);
  }

  @Get('seance/:seanceId')
  @ApiOperation({ summary: 'Récupérer les présences pour une séance donnée' })
  @ApiResponse({ status: 200, description: 'Liste des présences récupérée.' })
  findBySeance(@Param('seanceId') seanceId: string) {
    return this.presenceService.findBySeance(seanceId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une présence (ex: changer statut ou remarques)',
  })
  @ApiResponse({ status: 200, description: 'Présence mise à jour.' })
  update(
    @Param('id') id: string,
    @Body() updatePresenceDto: UpdatePresenceDto,
  ) {
    return this.presenceService.update(id, updatePresenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un enregistrement de présence' })
  @ApiResponse({ status: 200, description: 'Présence supprimée.' })
  remove(@Param('id') id: string) {
    return this.presenceService.remove(id);
  }
}
