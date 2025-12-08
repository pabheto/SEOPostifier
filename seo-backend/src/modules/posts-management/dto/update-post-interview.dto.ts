import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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

export class UpdatePostInterviewDto {
  @ApiProperty({ description: 'ID único de la entrevista' })
  @IsString()
  @IsNotEmpty()
  interviewId: string;

  @ApiPropertyOptional({ description: 'Palabra clave principal del post' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mainKeyword?: string;

  @ApiPropertyOptional({
    description: 'Lista de palabras clave secundarias o variaciones',
    type: [String],
    default: [],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  secondaryKeywords?: string[];

  @ApiPropertyOptional({
    description: 'Descripción del usuario de lo que quiere tratar en este post',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  userDescription?: string;

  @ApiPropertyOptional({
    description: 'Densidad objetivo de palabra clave (ej: 0.017 para 1.7%)',
    default: 0.017,
  })
  @IsOptional()
  @IsNumber()
  keywordDensityTarget?: number;

  @ApiPropertyOptional({
    description: 'Idioma del post (ISO 639-1: "es", "en", etc.)',
    example: 'es',
    pattern: '^[a-z]{2}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}$/, {
    message:
      'language must be a valid ISO 639-1 language code (e.g., "es", "en", "fr")',
  })
  language?: string;

  @ApiPropertyOptional({
    description: 'Intención de búsqueda del contenido',
    enum: SearchIntent,
  })
  @IsOptional()
  @IsEnum(SearchIntent)
  searchIntent?: SearchIntent;

  @ApiPropertyOptional({ description: 'Descripción del público objetivo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Tono de voz del contenido',
    enum: ToneOfVoice,
  })
  @IsOptional()
  @IsEnum(ToneOfVoice)
  toneOfVoice?: ToneOfVoice;

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
  needsFaqSection?: boolean;

  @ApiPropertyOptional({
    description: 'Si mencionar una marca específica',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  mentionsBrand?: boolean;

  @ApiPropertyOptional({ description: 'Nombre de la marca a mencionar' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ description: 'Descripción/contexto de la marca' })
  @IsOptional()
  @IsString()
  brandDescription?: string;

  @ApiPropertyOptional({
    description: 'Enlaces externos a incluir automáticamente',
    minimum: 0,
    default: undefined,
  })
  @IsOptional()
  @IsInt()
  @Min(-1)
  externalLinksToIncludeAutomatically?: number;

  @ApiPropertyOptional({
    description: 'Enlaces internos a usar',
    type: [String],
    default: [],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  internalLinksToUse?: string[];

  @ApiPropertyOptional({
    description: 'Enlaces externos a usar',
    type: [String],
    default: [],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  externalLinksToUse?: string[];

  @ApiPropertyOptional({
    description: 'Si incluir enlaces externos de autoridad',
    default: undefined,
  })
  @IsOptional()
  @IsBoolean()
  includeExternalLinks?: boolean;

  @ApiPropertyOptional({
    description: 'Si incluir sugerencias de enlaces internos',
    default: undefined,
  })
  @IsOptional()
  @IsBoolean()
  includeInternalLinks?: boolean;

  @ApiPropertyOptional({
    description: 'Si incluir enlaces internos automáticamente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeInternalLinksAutomatically?: boolean;

  @ApiPropertyOptional({
    description: 'Metadatos de enlaces internos del blog',
  })
  @IsOptional()
  @IsString()
  blogInternalLinksMeta?: string;
}
