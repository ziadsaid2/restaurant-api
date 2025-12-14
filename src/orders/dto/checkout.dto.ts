import { IsString, IsNotEmpty, Matches, IsNumber, IsOptional } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsNumber()
  @IsNotEmpty()
  phone: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(Cash on Delivery|Card)$/, { message: 'Payment method must be either "Cash on Delivery" or "Card"' })
  paymentMethod: string; 

  @IsString()
  @IsOptional()
  notes?: string;
}

