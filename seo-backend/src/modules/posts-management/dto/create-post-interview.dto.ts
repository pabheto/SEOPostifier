import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  SearchIntent,
  ToneOfVoice,
} from '../library/interfaces/post-interview.interface';

export class CreatePostInterviewDto {
  @ApiProperty({ description: 'Palabra clave principal del post' })
  @IsString()
  @IsNotEmpty()
  mainKeyword: string;

  @ApiPropertyOptional({
    description: 'Lista de palabras clave secundarias o variaciones',
    type: [String],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryKeywords?: string[] = [];

  @ApiPropertyOptional({
    description: 'Descripción del usuario de lo que quiere tratar en este post',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  userDescription?: string;

  @ApiPropertyOptional({
    description: 'Densidad objetivo de palabra clave (ej: 0.017 para 1.7%)',
    default: 0.017,
  })
  @IsOptional()
  @IsNumber()
  keywordDensityTarget?: number = 0.017;

  @ApiProperty({
    description: 'Idioma del post (ISO 639-1: "es", "en", etc.)',
    example: 'es',
    pattern: '^[a-z]{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]{2}$/, {
    message:
      'language must be a valid ISO 639-1 language code (e.g., "es", "en", "fr")',
  })
  language: string;

  @ApiProperty({
    description: 'Intención de búsqueda del contenido',
    enum: SearchIntent,
  })
  @IsEnum(SearchIntent)
  searchIntent: SearchIntent;

  @ApiProperty({ description: 'Descripción del público objetivo' })
  @IsString()
  @IsNotEmpty()
  targetAudience: string;

  @ApiProperty({ description: 'Tono de voz del contenido', enum: ToneOfVoice })
  @IsEnum(ToneOfVoice)
  toneOfVoice: ToneOfVoice;

  @ApiPropertyOptional({
    description: 'Mínimo de palabras deseadas',
    minimum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  minWordCount?: number;

  @ApiPropertyOptional({
    description: 'Máximo de palabras deseadas',
    minimum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  maxWordCount?: number;

  @ApiPropertyOptional({ description: 'Si incluir sección FAQ', default: true })
  @IsOptional()
  @IsBoolean()
  needsFaqSection?: boolean = true;

  @ApiPropertyOptional({
    description: 'Si mencionar una marca específica',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  mentionsBrand?: boolean = false;

  @ApiPropertyOptional({ description: 'Nombre de la marca a mencionar' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ description: 'Descripción/contexto de la marca' })
  @IsOptional()
  @IsString()
  brandDescription?: string;

  @ApiPropertyOptional({
    description: 'Máximo de enlaces internos',
    minimum: 0,
    default: undefined,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxInternalLinks?: number;

  @ApiPropertyOptional({
    description: 'Máximo de enlaces externos',
    minimum: 0,
    default: undefined,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxExternalLinks?: number;

  @ApiPropertyOptional({
    description: 'Enlaces internos a usar',
    type: [String],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internalLinksToUse?: string[] = [];

  @ApiPropertyOptional({
    description: 'Enlaces externos a usar',
    type: [String],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  externalLinksToUse?: string[] = [];

  @ApiPropertyOptional({
    description: 'Si incluir enlaces externos de autoridad',
    default: undefined,
  })
  @IsOptional()
  @IsBoolean()
  includeExternalLinks?: boolean = false;

  @ApiPropertyOptional({
    description: 'Si incluir sugerencias de enlaces internos',
    default: undefined,
  })
  @IsOptional()
  @IsBoolean()
  includeInternalLinks?: boolean = false;

  @ApiPropertyOptional({ description: 'Notas adicionales para el redactor/IA' })
  @IsOptional()
  @IsString()
  notesForWriter?: string;
}
