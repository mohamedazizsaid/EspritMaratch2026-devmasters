import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FormationService } from './formation.service';

/**
 * Scheduler pour les tâches de formation
 * Vérifie automatiquement les retards des formateurs à intervalle régulier
 */
@Injectable()
export class FormationScheduler {
    private readonly logger = new Logger('FormationScheduler');

    constructor(private readonly formationService: FormationService) {}

    /**
     * Vérifie les retards des formateurs toutes les 5 minutes
     * Désactiver: commenter ou supprimer le décorateur @Cron
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleFormatorDelayCheck() {
        this.logger.log('⏰ Exécution du scheduler de vérification des retards...');
        
        try {
            const result = await this.formationService.checkFormatorDelay();
            this.logger.log(`✨ Vérification terminée: ${result.notified} notification(s), ${result.errors} erreur(s)`);
        } catch (error) {
            this.logger.error(`Erreur lors de la vérification automatique: ${error.message}`);
        }
    }

    /**
     * Alternative: Vérifier chaque jour à 8h du matin
     * Décommenter et adapter selon vos besoins
     */
    // @Cron('0 8 * * *') // 8h chaque jour
    // async dailyFormatorDelayCheck() {
    //     this.logger.log('📅 Vérification quotidienne des retards (8h)...');
    //     const result = await this.formationService.checkFormatorDelay();
    //     this.logger.log(`Vérification quotidienne: ${result.notified} notification(s)`);
    // }
}
