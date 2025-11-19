import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewStatus, SearchIntent } from '../schemas/post-interview.schema';

/**
 * DTO para filtros de búsqueda de entrevistas
 */
export class QueryPostInterviewDto {
  @ApiPropertyOptional({ enum: InterviewStatus, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de proyecto' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por completitud' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isComplete?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por idioma' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: SearchIntent, description: 'Filtrar por intención de búsqueda' })
  @IsOptional()
  @IsEnum(SearchIntent)
  searchIntent?: SearchIntent;

  @ApiPropertyOptional({ description: 'Buscar por palabra clave principal' })
  @IsOptional()
  @IsString()
  mainKeyword?: string;

  @ApiPropertyOptional({ description: 'Filtrar desde fecha' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar hasta fecha' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de WordPress' })
  @IsOptional()
  @IsString()
  wordpressPostId?: string;

  @ApiPropertyOptional({ description: 'Búsqueda de texto libre' })
  @IsOptional()
  @IsString()
  search?: string;

  // ============================================
  // Opciones de paginación
  // ============================================

  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite de resultados', default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo para ordenar',
    enum: ['createdAt', 'updatedAt', 'completedAt', 'mainKeyword', 'status'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección de ordenamiento',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO para respuesta paginada
 */
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}