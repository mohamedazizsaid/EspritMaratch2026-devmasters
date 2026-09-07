import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogsService } from './logs.service';

@ApiTags('logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) {}

    @Get()
    @ApiOperation({ summary: 'Récupérer tous les logs avec pagination et filtres' })
    @ApiResponse({ status: 200, description: 'Liste des logs récupérée.' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'type', required: false, type: String })
    @ApiQuery({ name: 'action', required: false, type: String })
    @ApiQuery({ name: 'method', required: false, type: String })
    getAllLogs(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('action') action?: string,
        @Query('method') method?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('userId') userId?: string,
        @Query('endpoint') endpoint?: string,
    ) {
        const filters: any = {};
        if (type) filters.type = type;
        if (action) filters.action = action;
        if (method) filters.method = method;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (userId) filters.userId = userId;
        if (endpoint) filters.endpoint = endpoint;

        return this.logsService.getAllLogs(
            parseInt(page || '1', 10),
            parseInt(limit || '50', 10),
            Object.keys(filters).length > 0 ? filters : undefined,
        );
    }

    @Get('stats')
    @ApiOperation({ summary: 'Récupérer les statistiques des logs' })
    @ApiResponse({ status: 200, description: 'Statistiques des logs.' })
    getLogStats() {
        return this.logsService.getLogStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer un log par ID' })
    @ApiResponse({ status: 200, description: 'Log trouvé.' })
    getLogById(@Param('id') id: string) {
        return this.logsService.getLogById(id);
    }

    @Delete('cleanup')
    @ApiOperation({ summary: 'Nettoyer les anciens logs' })
    @ApiResponse({ status: 200, description: 'Logs nettoyés.' })
    cleanupOldLogs(@Query('days') days?: string) {
        return this.logsService.cleanupOldLogs(parseInt(days || '30', 10));
    }

    @Delete('purge-all')
    @ApiOperation({ summary: 'Supprimer TOUS les logs (purge complète)' })
    @ApiResponse({ status: 200, description: 'Tous les logs supprimés.' })
    purgeAllLogs() {
        return this.logsService.purgeAllLogs();
    }
}
