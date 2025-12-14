import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true }) 
  menuItemId: Types.ObjectId;

  @Prop({ required: true }) 
  quantity: number;

    @Prop({ required: true }) 
  price: number;
}

@Schema({ timestamps: true }) 
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true }) 
  userId: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] }) 
  items: CartItem[];

  @Prop({ default: 0 }) 
  totalPrice: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
export const CartSchema = SchemaFactory.createForClass(Cart);

