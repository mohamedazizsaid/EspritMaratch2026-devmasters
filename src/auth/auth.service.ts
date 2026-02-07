import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
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
}
