import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ValidateResetCodeDto } from './dto/forgot-password.dto';
import { MailingService } from './mailing.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        private mailingService: MailingService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; access_token: string }> {
        const existingUser = await this.userModel.findOne({ email: registerDto.email });
        if (existingUser) {
            throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = new this.userModel({
            nom: registerDto.nom,
            prenom: registerDto.prenom,
            email: registerDto.email,
            password: hashedPassword,
            role: registerDto.role || UserRole.FORMATEUR,
        });

        await user.save();

        // Envoyer un email de bienvenue
        try {
            await this.mailingService.sendAccountCreation(user.email, {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
            // L'utilisateur est créé même si l'email n'est pas envoyé
        }

        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload);

        return {
            user: {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                actif: user.actif,
                date_creation: user.date_creation,
            },
            access_token,
        };
    }

    async login(loginDto: LoginDto): Promise<{ user: Partial<User>; access_token: string }> {
        console.log('[AuthService] Login attempt with email:', loginDto.email);
        
        const user = await this.userModel.findOne({ email: loginDto.email });
        if (!user) {
            console.log('[AuthService] User not found:', loginDto.email);
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        console.log('[AuthService] User found:', user.email);
        console.log('[AuthService] User has password field:', !!user.password);

        if (!user.actif) {
            console.log('[AuthService] User account is disabled:', user.email);
            throw new UnauthorizedException('Ce compte est désactivé');
        }

        if (!user.password) {
            console.error('[AuthService] User password is missing!', user.email);
            throw new UnauthorizedException('Données utilisateur invalides');
        }

        if (!loginDto.password) {
            console.error('[AuthService] Login password is empty!');
            throw new UnauthorizedException('Mot de passe requis');
        }

        console.log('[AuthService] Comparing passwords...');
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        
        if (!isPasswordValid) {
            console.log('[AuthService] Password mismatch for user:', user.email);
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        console.log('[AuthService] Login successful for user:', user.email);
        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload);

        return {
            user: {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                actif: user.actif,
                date_creation: user.date_creation,
            },
            access_token,
        };
    }

    async getMe(userId: string): Promise<Partial<User>> {
        const user = await this.userModel.findById(userId).select('-password');
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    async logout(): Promise<{ message: string }> {
        return { message: 'Déconnexion réussie' };
    }

    async getAllUsers(): Promise<Partial<User>[]> {
    return this.userModel.find({ role: { $ne: 'Admin' } }).select('-password').exec();
    }

    async getUserById(id: string): Promise<Partial<User>> {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    async updateUser(id: string, updateData: Partial<{ nom: string; prenom: string; email: string; password: string; role: UserRole; actif: boolean }>): Promise<Partial<User>> {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').exec();
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        const user = await this.userModel.findByIdAndDelete(id).exec();
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return { message: 'Utilisateur supprimé' };
    }

    /**
     * Demander la réinitialisation du mot de passe
     * Génère un code aléatoire et l'envoie par email
     */
    async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.userModel.findOne({ email: forgotPasswordDto.email });
        if (!user) {
            // Pour des raisons de sécurité, ne pas révéler si l'email existe
            return { message: 'Si cet email existe, vous recevrez un code de réinitialisation' };
        }

        // Générer un code aléatoire de 6 chiffres
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Définir l'expiration du code à 1 heure
        const resetCodeExpiry = new Date();
        resetCodeExpiry.setHours(resetCodeExpiry.getHours() + 1);

        // Sauvegarder le code et son expiration dans la base de données
        user.resetCode = resetCode;
        user.resetCodeExpiry = resetCodeExpiry;
        await user.save();

        // Envoyer l'email avec le code
        try {
            await this.mailingService.sendForgetPassword(
                user.email,
                resetCode,
                `${user.prenom} ${user.nom}`
            );
        } catch (error) {
            console.error('Erreur lors de l\'envoi du code:', error);
            throw new Error('Impossible d\'envoyer le code de réinitialisation');
        }

        return { message: 'Si cet email existe, vous recevrez un code de réinitialisation' };
    }

    /**
     * Valider le code de réinitialisation et changer le mot de passe
     */
    async validateResetCode(validateResetCodeDto: ValidateResetCodeDto): Promise<{ message: string }> {
        const user = await this.userModel.findOne({ email: validateResetCodeDto.email });
        if (!user) {
            throw new UnauthorizedException('Email non trouvé');
        }

        // Vérifier que le code existe et n'a pas expiré
        if (!user.resetCode || !user.resetCodeExpiry) {
            throw new UnauthorizedException('Aucune demande de réinitialisation en cours');
        }

        // Vérifier que le code n'a pas expiré
        if (new Date() > user.resetCodeExpiry) {
            throw new UnauthorizedException('Le code a expiré. Demandez un nouveau code.');
        }

        // Vérifier que le code correspond
        if (user.resetCode !== validateResetCodeDto.resetCode) {
            throw new UnauthorizedException('Code de réinitialisation incorrect');
        }

        // Hash le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(validateResetCodeDto.newPassword, 10);

        // Mettre à jour le mot de passe et supprimer les codes
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpiry = null;
        await user.save();

        return { message: 'Mot de passe réinitialisé avec succès' };
    }
}
