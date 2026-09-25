import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe contener al menos 8 caracteres' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  fullName!: string;

  @IsEnum(UserRole, { message: 'El rol debe ser STUDENT o TEACHER' })
  role!: UserRole;
}
