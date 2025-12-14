import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false }) 
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true }) 
  menuItemId: Types.ObjectId;

  @Prop({ required: true }) 
  quantity: number;

  @Prop({ required: true }) 
  price: number;
}

@Schema({ timestamps: true }) 
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  userId: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true }) 
  items: OrderItem[];

  @Prop({ required: true, default: 'Pending' }) 
  status: string;

  @Prop({ required: true }) 
  deliveryAddress: string;

  @Prop({ required: true }) 
  phone: number;

  @Prop({ required: true }) 
  paymentMethod: string;

  @Prop() 
  notes?: string;

  @Prop({ required: true }) 
  totalPrice: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
export const OrderSchema = SchemaFactory.createForClass(Order);
