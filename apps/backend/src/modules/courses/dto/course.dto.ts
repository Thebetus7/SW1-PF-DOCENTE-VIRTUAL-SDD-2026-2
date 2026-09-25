import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'El título del curso es requerido' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del curso es requerida' })
  description!: string;
}

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty({ message: 'El título del módulo es requerido' })
  title!: string;

  orderIndex!: number;
}

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty({ message: 'El título de la lección es requerido' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID del recurso de video de YouTube es requerido' })
  videoResourceId!: string;

  @IsString()
  @IsNotEmpty({ message: 'El contexto pedagógico para la IA es requerido' })
  pedagogicalContext!: string;

  orderIndex!: number;
}
