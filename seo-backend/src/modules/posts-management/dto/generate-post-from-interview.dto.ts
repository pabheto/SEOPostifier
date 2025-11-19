import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GeneratePostFromInterviewDto {
  @ApiProperty({
    description: 'ID de la entrevista del post desde la cual generar el post',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  interviewId: string;
}
