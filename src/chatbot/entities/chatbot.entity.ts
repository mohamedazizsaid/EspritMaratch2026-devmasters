import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatHistory extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Formation', required: false })
    formationId?: Types.ObjectId;

    @Prop({ required: true })
    userMessage: string;

    @Prop({ required: true })
    assistantResponse: string;

    @Prop({ default: 'text' })
    type: string; // 'text', 'image_analysis'

    @Prop({ default: null })
    imageUrl?: string;

    @Prop({ default: 'gemini-2.5-flash' })
    modelUsed: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
