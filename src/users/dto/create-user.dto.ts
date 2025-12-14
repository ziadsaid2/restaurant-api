import { IsEmail, IsNotEmpty, IsString, IsOptional, IsStrongPassword, IsNumberString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()  
  @IsNotEmpty()     
  email: string;

  @IsString() 
  @IsNotEmpty()
  @IsStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumberString({}, { message: 'phone must be a number conforming to the specified constraints' })
  @Length(8, 15, { message: 'phone must be a number conforming to the specified constraints' })
  phone?: string;
}
