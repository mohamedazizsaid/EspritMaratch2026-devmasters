import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import * as QRCode from 'qrcode';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ForgotPasswordDto,
  ValidateResetCodeDto,
} from './dto/forgot-password.dto';
import { MailingService } from './mailing.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: Partial<User>; access_token: string }> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });
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
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
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
        onBoarding: user.onBoarding,
        accessibility: user.accessibility,
      },
      access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: Partial<User>;
    access_token?: string;
    requiresTwoFactor?: boolean;
    tempUserId?: string;
  }> {
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
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      console.log('[AuthService] Password mismatch for user:', user.email);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // If 2FA is enabled, don't return the token yet
    if (user.twoFactorEnabled) {
      console.log('[AuthService] 2FA required for user:', user.email);
      return {
        user: {
          _id: user._id,
          email: user.email,
        },
        requiresTwoFactor: true,
        tempUserId: user._id.toString(),
      };
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
        onBoarding: user.onBoarding,
        accessibility: user.accessibility,
        twoFactorEnabled: user.twoFactorEnabled,
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

  /**
   * Compléter l'onboarding d'un utilisateur
   * Sauvegarde les préférences d'accessibilité et marque onBoarding = true
   */
  async completeOnboarding(
    userId: string,
    accessibilityData: string,
  ): Promise<Partial<User>> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    user.accessibility = accessibilityData;
    user.onBoarding = true;
    await user.save();

    this.logger.log(`✅ Onboarding complété pour l'utilisateur: ${user.email}`);

    return {
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      onBoarding: user.onBoarding,
      accessibility: user.accessibility,
    };
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    return this.userModel
      .find({ role: { $ne: 'Admin' } })
      .select('-password')
      .exec();
  }

  async getUserById(id: string): Promise<Partial<User>> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async updateUser(
    id: string,
    updateData: Partial<{
      nom: string;
      prenom: string;
      email: string;
      password: string;
      role: UserRole;
      actif: boolean;
    }>,
  ): Promise<Partial<User>> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
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
  async requestPasswordReset(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(
      `🔍 Recherche de l'utilisateur: ${forgotPasswordDto.email}`,
    );

    const user = await this.userModel.findOne({
      email: forgotPasswordDto.email,
    });
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe
      this.logger.warn(`⚠️ Email non trouvé: ${forgotPasswordDto.email}`);
      return {
        message:
          'Si cet email existe, vous recevrez un code de réinitialisation',
      };
    }

    this.logger.log(`✅ Utilisateur trouvé: ${user.email}`);

    // Générer un code aléatoire de 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log(`📝 Code généré: ${resetCode}`);

    // Définir l'expiration du code à 1 heure
    const resetCodeExpiry = new Date();
    resetCodeExpiry.setHours(resetCodeExpiry.getHours() + 1);

    // Sauvegarder le code et son expiration dans la base de données
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;

    try {
      await user.save();
      this.logger.log(
        `💾 Code sauvegardé en base de données pour: ${user.email}`,
      );
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la sauvegarde: ${error.message}`);
      throw new Error('Impossible de sauvegarder le code de réinitialisation');
    }

    // Envoyer l'email avec le code
    try {
      this.logger.log(`📧 Envoi de l'email à: ${user.email}`);
      await this.mailingService.sendForgetPassword(
        user.email,
        resetCode,
        `${user.prenom} ${user.nom}`,
      );
      this.logger.log(`✅ Email envoyé avec succès à: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de l'envoi du code: ${error.message}`,
        error.stack,
      );
      throw new Error("Impossible d'envoyer le code de réinitialisation");
    }

    return {
      message: 'Si cet email existe, vous recevrez un code de réinitialisation',
    };
  }

  /**
   * Valider le code de réinitialisation et changer le mot de passe
   */
  async validateResetCode(
    validateResetCodeDto: ValidateResetCodeDto,
  ): Promise<{ message: string }> {
    this.logger.log(
      `🔍 Validation du code pour: ${validateResetCodeDto.email}`,
    );

    const user = await this.userModel.findOne({
      email: validateResetCodeDto.email,
    });
    if (!user) {
      this.logger.warn(`⚠️ Email non trouvé: ${validateResetCodeDto.email}`);
      throw new UnauthorizedException('Email non trouvé');
    }

    this.logger.log(`✅ Utilisateur trouvé: ${user.email}`);

    // Vérifier que le code existe et n'a pas expiré
    if (!user.resetCode || !user.resetCodeExpiry) {
      this.logger.warn(
        `⚠️ Aucun code de réinitialisation en attente pour: ${user.email}`,
      );
      throw new UnauthorizedException(
        'Aucune demande de réinitialisation en cours',
      );
    }

    // Vérifier que le code n'a pas expiré
    if (new Date() > user.resetCodeExpiry) {
      this.logger.warn(
        `⏰ Code expiré pour: ${user.email}. Expiry: ${user.resetCodeExpiry}`,
      );
      throw new UnauthorizedException(
        'Le code a expiré. Demandez un nouveau code.',
      );
    }

    // Vérifier que le code correspond
    if (user.resetCode !== validateResetCodeDto.resetCode) {
      this.logger.warn(
        `❌ Code incorrect fourni pour: ${user.email}. Attendu: ${user.resetCode}, Reçu: ${validateResetCodeDto.resetCode}`,
      );
      throw new UnauthorizedException('Code de réinitialisation incorrect');
    }

    this.logger.log(`✅ Code valide pour: ${user.email}`);

    // Hash le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(
      validateResetCodeDto.newPassword,
      10,
    );
    this.logger.log(`🔐 Mot de passe hashé pour: ${user.email}`);

    // Mettre à jour le mot de passe et supprimer les codes
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;

    try {
      await user.save();
      this.logger.log(
        `💾 Mot de passe mis à jour avec succès pour: ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la sauvegarde: ${error.message}`,
        error.stack,
      );
      throw new Error('Impossible de mettre à jour le mot de passe');
    }

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  /**
   * Connexion via Google OAuth
   * Crée ou récupère l'utilisateur et génère un token JWT
   */
  async googleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  }): Promise<{
    user: Partial<User>;
    access_token?: string;
    requiresTwoFactor?: boolean;
    tempUserId?: string;
  }> {
    this.logger.log(`🔍 Google login pour: ${googleUser.email}`);

    // Chercher si l'utilisateur existe déjà
    const user = await this.userModel.findOne({ email: googleUser.email });

    if (!user) {
      // L'utilisateur n'existe pas - On ne le crée pas car seul l'admin peut ajouter des utilisateurs
      this.logger.warn(`⚠️ Utilisateur Google non trouvé: ${googleUser.email}`);
      throw new UnauthorizedException(
        "Votre compte Google n'est pas autorisé. Contactez votre administrateur.",
      );
    }

    this.logger.log(`✅ Utilisateur trouvé via Google: ${user.email}`);

    // Vérifier si le compte est actif
    if (!user.actif) {
      this.logger.warn(`⚠️ Compte désactivé: ${user.email}`);
      throw new UnauthorizedException('Ce compte est désactivé');
    }

    // Mettre à jour les informations Google si nécessaire
    if (googleUser.picture && user.googlePicture !== googleUser.picture) {
      user.googlePicture = googleUser.picture;
      await user.save();
    }

    // If 2FA is enabled, don't return the token yet
    if (user.twoFactorEnabled) {
      this.logger.log(`🔐 2FA required for Google user: ${user.email}`);
      return {
        user: {
          _id: user._id,
          email: user.email,
        },
        requiresTwoFactor: true,
        tempUserId: user._id.toString(),
      };
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(`✅ Token généré pour Google user: ${user.email}`);

    return {
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        actif: user.actif,
        date_creation: user.date_creation,
        googlePicture: user.googlePicture,
        onBoarding: user.onBoarding,
        accessibility: user.accessibility,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      access_token,
    };
  }

  // ==================== 2FA TOTP ====================

  /**
   * Generate a TOTP secret and QR code for 2FA setup
   */
  async generateTwoFactorSecret(
    userId: string,
  ): Promise<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const secret = otplib.generateSecret();
    const appName = 'Hackathon Formation';
    const otpauthUrl = otplib.generateURI({
      issuer: appName,
      label: user.email,
      secret,
    });

    // Store the secret temporarily (not enabled yet until verified)
    user.twoFactorSecret = secret;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return { secret, qrCodeDataUrl, otpauthUrl };
  }

  /**
   * Enable 2FA after user verifies the TOTP code
   */
  async enableTwoFactor(
    userId: string,
    code: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (!user.twoFactorSecret)
      throw new UnauthorizedException("Veuillez d'abord générer un secret 2FA");

    const result = otplib.verifySync({
      token: code,
      secret: user.twoFactorSecret,
    });
    if (!result.valid) {
      throw new UnauthorizedException('Code 2FA invalide. Veuillez réessayer.');
    }

    user.twoFactorEnabled = true;
    await user.save();

    return { message: 'Authentification à deux facteurs activée avec succès' };
  }

  /**
   * Verify 2FA TOTP code during login
   */
  async verifyTwoFactor(
    userId: string,
    code: string,
  ): Promise<{ user: Partial<User>; access_token: string }> {
    console.log('[2FA] Starting verification for userId:', userId);

    const user = await this.userModel.findById(userId);
    if (!user) {
      console.log('[2FA] User not found:', userId);
      throw new NotFoundException('Utilisateur non trouvé');
    }

    console.log('[2FA] User found:', user.email);
    console.log('[2FA] 2FA enabled:', user.twoFactorEnabled);
    console.log('[2FA] Has secret:', !!user.twoFactorSecret);

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      console.log('[2FA] 2FA not enabled or no secret');
      throw new UnauthorizedException(
        "2FA n'est pas activé pour cet utilisateur",
      );
    }

    console.log('[2FA] Verifying code:', code);
    console.log('[2FA] Secret exists:', !!user.twoFactorSecret);

    const result = otplib.verifySync({
      token: code,
      secret: user.twoFactorSecret,
    });
    console.log('[2FA] Verification result:', result);

    if (!result.valid) {
      console.log('[2FA] Invalid code - result:', result);
      throw new UnauthorizedException('Code 2FA invalide ou expiré');
    }

    console.log('[2FA] Code verified successfully, generating token');
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
        googlePicture: user.googlePicture,
        onBoarding: user.onBoarding,
        accessibility: user.accessibility,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      access_token,
    };
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(
    userId: string,
    code: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException("2FA n'est pas activé");
    }

    const result = otplib.verifySync({
      token: code,
      secret: user.twoFactorSecret,
    });
    if (!result.valid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    return { message: 'Authentification à deux facteurs désactivée' };
  }

  /**
   * Get 2FA status for a user
   */
  async getTwoFactorStatus(userId: string): Promise<{ enabled: boolean }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { enabled: user.twoFactorEnabled || false };
  }
}
