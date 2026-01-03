import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import {
  SearchIntent,
  ToneOfVoice,
} from '../library/interfaces/post-interview.interface';

/**
 * DTO para imágenes aportadas por el usuario
 */
export class UserImageDto {
  @ApiPropertyOptional({
    description: 'Tipo de fuente de la imagen',
    example: 'url',
  })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiProperty({
    description: 'Valor de la fuente (URL, ID de WordPress, etc.)',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  sourceValue: string;

  @ApiPropertyOptional({
    description: 'Text ALT sugerido para la imagen',
    example: 'Imagen descriptiva del producto',
  })
  @IsOptional()
  @IsString()
  suggestedAlt?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales para la IA o editor',
    example: 'Usar esta imagen en la sección de introducción',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO para la configuración de imágenes del post
 */
export class ImagesConfigDto {
  @ApiPropertyOptional({
    description: 'Cuántas imágenes debe generar la IA',
    minimum: -1,
    default: -1,
  })
  @IsOptional()
  @IsInt()
  @Min(-1)
  aiImagesCount?: number = -1;

  @ApiPropertyOptional({
    description: 'Descripciones de las imágenes generadas por la IA',
    type: [String],
    default: [],
  })
  @IsOptional()
  @Transform(({ value }): string[] => {
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
  aiImagesUserDescriptions?: string[] = [];

  @ApiPropertyOptional({
    description: 'Si el usuario aportará imágenes propias',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  useUserImages?: boolean = false;

  @ApiPropertyOptional({
    description: 'Array de imágenes aportadas por el usuario',
    type: [UserImageDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserImageDto)
  userImages?: UserImageDto[] = [];
}

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
  @Transform(({ value }): string[] => {
    if (Array.isArray(value)) return value as string[];
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
  secondaryKeywords?: string[] = [];

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
  @Transform(({ value }): string[] => {
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
  internalLinksToUse?: string[] = [];

  @ApiPropertyOptional({
    description: 'Enlaces externos a usar',
    type: [String],
    default: [],
  })
  @IsOptional()
  @Transform(({ value }): string[] => {
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

  @ApiPropertyOptional({
    description: 'Si incluir enlaces internos automáticamente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeInternalLinksAutomatically?: boolean = false;

  @ApiPropertyOptional({
    description: 'Metadatos de enlaces internos del blog',
  })
  @IsOptional()
  @IsString()
  blogInternalLinksMeta?: string;

  @ApiPropertyOptional({
    description: 'Configuración completa de imágenes',
    type: ImagesConfigDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImagesConfigDto)
  imagesConfig?: ImagesConfigDto;
}
