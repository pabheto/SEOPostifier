import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostInterviewsService } from './post-interviews.service';

@ApiTags('Post Interviews')
@Controller('post-interviews')
export class PostInterviewsController {
  constructor(private readonly postInterviewsService: PostInterviewsService) {}
}
