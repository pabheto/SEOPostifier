import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateLicenseDto {
  @ApiProperty({
    description: 'License key to activate',
    example: 'LIC1734287654321ABC123',
  })
  @IsString()
  @IsNotEmpty()
  licenseKey: string;

  @ApiProperty({
    description: 'URL of the site where the license will be activated',
    example: 'https://example.com',
  })
  @IsString()
  @IsNotEmpty()
  siteUrl: string;
}
