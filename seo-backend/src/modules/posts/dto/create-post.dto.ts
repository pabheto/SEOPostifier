import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'How to Improve Your SEO in 2025',
  })
  title: string;

  @ApiProperty({
    description: 'Post content in HTML or markdown',
    example: '<p>SEO is an essential part of digital marketing...</p>',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'Short excerpt or summary of the post',
    example: 'Learn the latest SEO strategies to boost your rankings.',
  })
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Post status',
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Target keywords for SEO optimization',
    type: [String],
    example: ['seo', 'digital marketing', 'search optimization'],
  })
  keywords?: string[];

  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Ultimate Guide to SEO in 2025 | Expert Tips',
  })
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Discover proven SEO strategies and techniques to improve your website rankings in 2025.',
  })
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Featured image URL',
    example: 'https://example.com/images/seo-guide.jpg',
  })
  featuredImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Post author name',
    example: 'John Doe',
  })
  author?: string;

  @ApiPropertyOptional({
    description: 'Post categories',
    type: [String],
    example: ['SEO', 'Marketing'],
  })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Post tags',
    type: [String],
    example: ['optimization', 'content', 'strategy'],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Scheduled publish date',
    type: Date,
    example: '2025-12-01T10:00:00Z',
  })
  publishedAt?: Date;
}
