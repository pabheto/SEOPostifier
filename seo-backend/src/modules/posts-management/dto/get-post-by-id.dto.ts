import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPostByIdDto {
  @ApiProperty({
    description: 'ID único del post (string, no ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty({ message: 'postId is required' })
  @IsString({ message: 'postId must be a string' })
  postId: string;
}


