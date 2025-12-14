import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) 
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  userId: Types.ObjectId;

  @Prop({ required: true })   
  date: Date;

  @Prop({ required: true }) 
  time: string;

  @Prop({ required: true }) 
  numberOfGuests: number;

  @Prop({ default: 'Pending' }) 
  status: string;

  @Prop() 
  notes?: string;

  @Prop({ required: true }) 
  name: string;

  @Prop({ required: true }) 
  phone: number;

  @Prop({ required: true }) 
  tableNumber: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
