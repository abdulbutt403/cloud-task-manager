import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class ReplaceUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @IsNotEmpty()
  lastName!: string | null;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
