import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) 
export class Menu extends Document {
  @Prop({ required: true }) 
  name: string;

  @Prop({ required: true }) 
  description: string;

  @Prop({ required: true }) 
  price: number;

  @Prop({ required: true }) 
  category: string;

  @Prop() 
  image: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
