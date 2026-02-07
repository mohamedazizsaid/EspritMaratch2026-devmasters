import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeminiService } from './gemini.service';
import { ChatbotController } from './chatbot.controller';
import { ChatHistory, ChatHistorySchema } from './entities/chatbot.entity';
import { Formation, FormationSchema } from '../formation/entities/formation.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { CloudinaryService } from '../eleve/cloudinary.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatHistory.name, schema: ChatHistorySchema },
            { name: Formation.name, schema: FormationSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    providers: [GeminiService, CloudinaryService],
    controllers: [ChatbotController],
    exports: [GeminiService],
})
export class ChatbotModule { }
