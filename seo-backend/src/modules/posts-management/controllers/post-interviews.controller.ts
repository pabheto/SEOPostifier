import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
import { GeneratePostFromInterviewDto } from '../dto/generate-post-from-interview.dto';
import { PostInterviewsService } from '../services/posts-interviews.service';
import { PostsManagementService } from '../services/posts-management.service';

@ApiTags('Posts Interviews Management')
@Controller('posts-interviews')
export class PostsManagementController {
  constructor(
    private readonly postInterviewsService: PostInterviewsService,
    private readonly postsManagementService: PostsManagementService,
  ) {}

  @Post('create')
  createPostInterview(@Body() createPostInterviewDto: CreatePostInterviewDto) {
    return this.postInterviewsService.createPostInterview(
      createPostInterviewDto,
    );
  }

  @Post('generate-script-text')
  async generateScriptText(@Body() postInterviewId: string) {
    const postInterview =
      await this.postInterviewsService.getPostInterviewById(postInterviewId);

    return this.postInterviewsService.generateAndUpdateScriptText(
      postInterview,
    );
  }

  @Post('generate-script-definition')
  async generateScriptDefinition(@Body() postInterviewId: string) {
    const postInterview =
      await this.postInterviewsService.getPostInterviewById(postInterviewId);

    return this.postInterviewsService.generateAndUpdateScriptDefinition(
      postInterview,
    );
  }

  @Post('generate-post')
  async generatePostFromInterview(
    @Body() generatePostDto: GeneratePostFromInterviewDto,
  ) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      generatePostDto.interviewId,
    );

    return this.postsManagementService.createPostDraftFromInterview(
      postInterview,
    );
  }
}
