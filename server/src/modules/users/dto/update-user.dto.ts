import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  // Skip only omitted values; an explicitly supplied null is still validated.
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  name?: string;

  // Keep the same omitted-versus-null behavior for email.
  @ValidateIf((_object, value) => value !== undefined)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string | null;
}
