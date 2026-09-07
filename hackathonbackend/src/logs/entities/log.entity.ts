import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info',
  })
  type: string;

  @Prop({
    type: String,
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'READ',
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'OTHER',
    ],
    default: 'OTHER',
  })
  action: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  method: string;

  @Prop()
  endpoint: string;

  @Prop()
  statusCode: number;

  @Prop()
  userId: string;

  @Prop()
  userName: string;

  @Prop()
  userEmail: string;

  @Prop()
  ipAddress: string;

  @Prop({ type: Object })
  requestBody: Record<string, any>;

  @Prop({ type: Object })
  responseData: Record<string, any>;

  @Prop()
  duration: number;

  @Prop()
  userAgent: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);
