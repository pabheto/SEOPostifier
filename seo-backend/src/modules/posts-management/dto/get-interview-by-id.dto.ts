import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetInterviewByIdDto {
  @ApiProperty({
    description: 'ID único de la entrevista',
    example: 'int_lx4h9k2_abc1234',
  })
  @IsNotEmpty({ message: 'interviewId is required' })
  @IsString({ message: 'interviewId must be a string' })
  interviewId: string;
}
