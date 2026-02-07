import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailingService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger('MailingService');

    constructor() {
        // Configuration du transporteur SMTP
        const smtpConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true voor port 465, false voor andere ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        };

        this.logger.log('🔧 Initialisation du service SMTP...');
        this.logger.debug(`Configuration: ${smtpConfig.host}:${smtpConfig.port} (secure: ${smtpConfig.secure})`);

        // Vérifier que les credentials sont configurés
        if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
            this.logger.warn('⚠️ ATTENTION: Variables d\'environnement SMTP_USER ou SMTP_PASSWORD non configurées!');
        }

        this.transporter = nodemailer.createTransport(smtpConfig);
    }

    /**
     * Envoie un email de création de compte à l'utilisateur
     * @param email Email de l'utilisateur
     * @param user Données de l'utilisateur (nom, prénom)
     */
    async sendAccountCreation(
        email: string,
        user: { nom: string; prenom: string; email: string }
    ): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL || 'noreply@hackathon.com',
            to: email,
            subject: 'Bienvenue ! Votre compte a été créé',
            html: `
                <h2>Bienvenue ${user.prenom} ${user.nom}!</h2>
                <p>Votre compte a été créé avec succès.</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p>Vous pouvez maintenant vous connecter à votre compte.</p>
                <p>Besoin d'aide ? <a href="mailto:support@hackathon.com">Contactez-nous</a></p>
                <p>Cordialement,<br/>L'équipe Hackathon</p>
            `,
        };

        try {
            this.logger.log(`📧 Envoi d'email d'inscription à ${email}...`);
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email d'inscription envoyé à ${email} (ID: ${info.messageId})`);
        } catch (error) {
            this.logger.error(`❌ Erreur lors de l\'envoi de l\'email d'inscription:`, error.message);
            throw new Error(`Impossible d\'envoyer l\'email de création: ${error.message}`);
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe avec un code
     * @param email Email de l'utilisateur
     * @param resetCode Code de réinitialisation
     * @param userName Nom de l'utilisateur
     */
    async sendForgetPassword(
        email: string,
        resetCode: string,
        userName: string
    ): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL || 'noreply@hackathon.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe - Code de validation',
            html: `
                <h2>Réinitialisation de mot de passe</h2>
                <p>Bonjour ${userName},</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Voici votre code de validation (valide pendant 1 heure):</p>
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="text-align: center; font-size: 24px; letter-spacing: 2px; margin: 0;">
                        ${resetCode}
                    </h3>
                </div>
                <p>Entrez ce code dans l'application pour réinitialiser votre mot de passe.</p>
                <p><strong>Important:</strong> Ce code expire dans 1 heure.</p>
                <p>Si vous n'avez pas demandé la réinitialisation, ignorez cet email.</p>
                <p>Cordialement,<br/>L'équipe Hackathon</p>
            `,
        };

        try {
            this.logger.log(`📧 Envoi du code de réinitialisation à ${email}...`);
            this.logger.debug(`Code: ${resetCode}`);
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email de réinitialisation envoyé à ${email} (ID: ${info.messageId})`);
        } catch (error) {
            this.logger.error(`❌ Erreur lors de l\'envoi du code à ${email}:`, error.message);
            throw new Error(`Impossible d\'envoyer le code de réinitialisation: ${error.message}`);
        }
    }

    /**
     * Envoie un email de notification de retard au formateur
     * @param email Email du formateur
     * @param formateurName Nom du formateur
     * @param seanceName Nom/titre de la séance
     * @param minutesDeLay Nombre de minutes de retard
     */
    async sendFormatorDelayNotification(
        email: string,
        formateurName: string,
        seanceName: string,
        minutesDeLay: number
    ): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL || 'noreply@hackathon.com',
            to: email,
            subject: '⚠️ Notification de retard - Action requise',
            html: `
                <h2>Notification de Retard</h2>
                <p>Bonjour ${formateurName},</p>
                <p>Vous êtes <strong>en retard de 15 minutes</strong> pour la séance suivante:</p>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p><strong>Séance:</strong> ${seanceName}</p>
                </div>
                <p><strong>⚠️ Actions requises:</strong></p>
                <ul>
                    <li>Si vous allez être absent, <strong>contactez l'administration immédiatement</strong></li>
                    <li>Renseignez votre statut de présence dans l'application</li>
                </ul>
                <p>Merci de votre diligence et de votre responsabilité envers les élèves.</p>
                <p><strong>Besoin d'aide?</strong> Contactez l'administration: <a href="mailto:admin@hackathon.com">admin@hackathon.com</a></p>
                <p>Cordialement,<br/>L'équipe Hackathon</p>
            `,
        };

        try {
            this.logger.log(`📧 Envoi notification de retard à ${email}...`);
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email de notification de retard envoyé à ${email} (ID: ${info.messageId})`);
        } catch (error) {
            this.logger.error(`❌ Erreur lors de l\'envoi de la notification de retard à ${email}:`, error.message);
            throw new Error(`Impossible d\'envoyer la notification de retard: ${error.message}`);
        }
    }
}

