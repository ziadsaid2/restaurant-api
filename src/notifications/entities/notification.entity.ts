import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })  
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  userId: Types.ObjectId;

  @Prop({ required: true }) 
  title: string;

  @Prop({ required: true }) 
  message: string;

  @Prop({ required: true, default: 'general' }) 
  type: string;

  @Prop() 
  relatedId?: string;

  @Prop({type: Object}) 
  data?: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

