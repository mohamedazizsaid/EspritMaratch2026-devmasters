import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailingService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configuration du transporteur SMTP
        // Vous pouvez utiliser les variables d'environnement pour configurer le serveur SMTP
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true voor port 465, false voor andere ports
            auth: {
                user: process.env.SMTP_USER || 'your-email@example.com',
                pass: process.env.SMTP_PASSWORD || 'your-password',
            },
        });
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
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de création de compte envoyé à ${email}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de création:', error);
            throw new Error('Impossible d\'envoyer l\'email de création');
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
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de réinitialisation envoyé à ${email}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
            throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
        }
    }
}

