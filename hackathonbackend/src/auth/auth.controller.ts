import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Param, Patch, Delete, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ValidateResetCodeDto } from './dto/forgot-password.dto';
import { VerifyTwoFactorDto, EnableTwoFactorDto, DisableTwoFactorDto } from './dto/two-factor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
    @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
    @ApiResponse({ status: 409, description: 'Un utilisateur avec cet email existe déjà' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
    @ApiResponse({ status: 200, description: 'Connexion réussie, retourne le token JWT' })
    @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Déconnexion de l\'utilisateur' })
    @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async logout() {
        return this.authService.logout();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
    @ApiResponse({ status: 200, description: 'Profil utilisateur' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async getMe(@CurrentUser() user: any) {
        return this.authService.getMe(user.userId);
    }

    @Get('users')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
    @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
    async getAllUsers() {
        return this.authService.getAllUsers();
    }

    @Get('users/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
    @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    async getUserById(@Param('id') id: string) {
        return this.authService.getUserById(id);
    }

    @Patch('users/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
    @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    async updateUser(@Param('id') id: string, @Body() updateData: any) {
        return this.authService.updateUser(id, updateData);
    }

    @Delete('users/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Supprimer un utilisateur' })
    @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    async deleteUser(@Param('id') id: string) {
        return this.authService.deleteUser(id);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Demander la réinitialisation du mot de passe' })
    @ApiResponse({ status: 200, description: 'Un code de réinitialisation a été envoyé' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.requestPasswordReset(forgotPasswordDto);
    }

    @Patch('onboarding/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Compléter l\'onboarding d\'un utilisateur' })
    @ApiResponse({ status: 200, description: 'Onboarding complété avec succès' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    async completeOnboarding(
        @Param('id') id: string,
        @Body() body: { accessibility: string },
    ) {
        return this.authService.completeOnboarding(id, body.accessibility);
    }

    @Post('validate-reset-code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Valider le code de réinitialisation et changer le mot de passe' })
    @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
    @ApiResponse({ status: 401, description: 'Code invalide ou expiré' })
    async validateResetCode(@Body() validateResetCodeDto: ValidateResetCodeDto) {
        return this.authService.validateResetCode(validateResetCodeDto);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Initier la connexion Google OAuth' })
    @ApiResponse({ status: 302, description: 'Redirection vers Google' })
    async googleAuth() {
        // Ce point d'entrée redirige vers Google
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Callback Google OAuth' })
    @ApiResponse({ status: 302, description: 'Redirection vers le frontend avec le token' })
    async googleAuthCallback(@Req() req: any, @Res() res: Response) {
        try {
            const result = await this.authService.googleLogin({
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                picture: req.user.picture,
            });

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

            // Handle 2FA required case
            if (result.requiresTwoFactor) {
                const params = new URLSearchParams({
                    requiresTwoFactor: 'true',
                    tempUserId: result.tempUserId || '',
                    email: result.user.email || '',
                });
                return res.redirect(`${frontendUrl}/verify-2fa?${params.toString()}`);
            }

            // Normal flow - redirect with token
            const params = new URLSearchParams({
                token: result.access_token,
                userId: result.user._id?.toString() || '',
                email: result.user.email || '',
                role: result.user.role || '',
                nom: result.user.nom || '',
                prenom: result.user.prenom || '',
                onBoarding: result.user.onBoarding?.toString() || 'false',
            });

            return res.redirect(`${frontendUrl}/auth/google/callback?${params.toString()}`);
        } catch (error) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const errorMessage = encodeURIComponent(error.message || 'Erreur de connexion Google');
            return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
        }
    }

    // ==================== 2FA Endpoints ====================

    @Post('2fa/generate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Générer un secret 2FA et QR code' })
    @ApiResponse({ status: 200, description: 'Secret et QR code générés' })
    async generateTwoFactor(@CurrentUser() user: any) {
        return this.authService.generateTwoFactorSecret(user.userId);
    }

    @Post('2fa/enable')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Activer 2FA après vérification du code' })
    @ApiResponse({ status: 200, description: '2FA activé avec succès' })
    @ApiResponse({ status: 401, description: 'Code invalide' })
    async enableTwoFactor(@CurrentUser() user: any, @Body() dto: EnableTwoFactorDto) {
        return this.authService.enableTwoFactor(user.userId, dto.code);
    }

    @Post('2fa/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Vérifier le code 2FA lors de la connexion' })
    @ApiResponse({ status: 200, description: 'Code vérifié, token retourné' })
    @ApiResponse({ status: 401, description: 'Code invalide' })
    async verifyTwoFactor(@Body() dto: VerifyTwoFactorDto) {
        return this.authService.verifyTwoFactor(dto.userId, dto.code);
    }

    @Post('2fa/disable')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Désactiver 2FA' })
    @ApiResponse({ status: 200, description: '2FA désactivé' })
    @ApiResponse({ status: 401, description: 'Code invalide' })
    async disableTwoFactor(@CurrentUser() user: any, @Body() dto: DisableTwoFactorDto) {
        return this.authService.disableTwoFactor(user.userId, dto.code);
    }

    @Get('2fa/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Vérifier le statut 2FA' })
    @ApiResponse({ status: 200, description: 'Statut 2FA retourné' })
    async getTwoFactorStatus(@CurrentUser() user: any) {
        return this.authService.getTwoFactorStatus(user.userId);
    }
}
