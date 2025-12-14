import { IsDateString, IsString, IsNotEmpty, IsNumber, IsOptional, Min, Matches, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, Validate, Max, IsPositive } from 'class-validator';

@ValidatorConstraint({ name: 'isNotPastDate', async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Booking date cannot be in the past';
  }
}

export class CreateBookingDto {
  @IsDateString() 
  @IsNotEmpty()
  @Validate(IsNotPastDateConstraint) 
  date: string; 

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format (e.g., 19:00)' })
  time: string; // "19:00"

  @IsNumber() 
  @Min(1) 
  numberOfGuests: number;

  @IsString()
  @IsOptional() 
  notes?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  @IsPositive()
  tableNumber: number;

  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsNumber()
  @IsNotEmpty()
  phone: number;
}
