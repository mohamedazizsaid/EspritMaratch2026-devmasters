import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ValidateResetCodeDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

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

    @Post('validate-reset-code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Valider le code de réinitialisation et changer le mot de passe' })
    @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
    @ApiResponse({ status: 401, description: 'Code invalide ou expiré' })
    async validateResetCode(@Body() validateResetCodeDto: ValidateResetCodeDto) {
        return this.authService.validateResetCode(validateResetCodeDto);
    }
}
