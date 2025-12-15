import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLicenseDto {
  @ApiProperty({
    description: 'Name for the license',
    example: 'My Blog License',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
