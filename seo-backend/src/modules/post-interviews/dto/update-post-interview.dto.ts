import { PartialType } from '@nestjs/swagger';
import { CreatePostInterviewDto } from './create-post-interview.dto';
import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewStatus, QuestionType } from '../schemas/post-interview.schema';

/**
 * DTO para las preguntas de la entrevista
 */
export class InterviewQuestionDto {
  @ApiPropertyOptional({ description: 'Clave única de la pregunta' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ description: 'Texto de la pregunta' })
  @IsString()
  questionText: string;

  @ApiPropertyOptional({ description: 'Respuesta del usuario' })
  answer: any;

  @ApiPropertyOptional({ enum: QuestionType, description: 'Tipo de pregunta' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * DTO para actualizar una entrevista existente
 */
export class UpdatePostInterviewDto extends PartialType(CreatePostInterviewDto) {
  @ApiPropertyOptional({ enum: InterviewStatus, description: 'Estado de la entrevista' })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional({ description: 'Si la entrevista está completa' })
  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de completado' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'ID del post en WordPress' })
  @IsOptional()
  @IsString()
  wordpressPostId?: string;

  @ApiPropertyOptional({ description: 'ID del post generado' })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiPropertyOptional({
    type: [InterviewQuestionDto],
    description: 'Preguntas de la entrevista'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewQuestionDto)
  questions?: InterviewQuestionDto[];
}

/**
 * DTO para agregar una pregunta individual
 */
export class AddQuestionDto {
  @ApiPropertyOptional({ description: 'Clave única de la pregunta' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ description: 'Texto de la pregunta' })
  @IsString()
  questionText: string;

  @ApiPropertyOptional({ description: 'Respuesta del usuario' })
  answer: any;

  @ApiPropertyOptional({ enum: QuestionType, description: 'Tipo de pregunta' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * DTO para marcar una entrevista como completa
 */
export class CompleteInterviewDto {
  @ApiPropertyOptional({ description: 'Título final del post' })
  @IsOptional()
  @IsString()
  tentativeTitle?: string;

  @ApiPropertyOptional({ description: 'Meta descripción final' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Slug final' })
  @IsOptional()
  @IsString()
  suggestedSlug?: string;

  @ApiPropertyOptional({ description: 'Notas finales' })
  @IsOptional()
  @IsString()
  notesForWriter?: string;
}