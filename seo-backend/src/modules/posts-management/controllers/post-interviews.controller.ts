import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
import { GeneratePostFromInterviewDto } from '../dto/generate-post-from-interview.dto';
import { GetInterviewByIdDto } from '../dto/get-interview-by-id.dto';
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
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new post interview' })
  @ApiResponse({
    status: 201,
    description: 'Interview created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input data',
  })
  async createPostInterview(
    @Body() createPostInterviewDto: CreatePostInterviewDto,
  ) {
    const interview = await this.postInterviewsService.createPostInterview(
      createPostInterviewDto,
    );
    return interview;
  }

  @Post('generate-script-text')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate script text for an interview' })
  @ApiResponse({
    status: 200,
    description: 'Script text generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid interview ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Interview not found',
  })
  async generateScriptText(@Body() dto: GetInterviewByIdDto) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      dto.interviewId,
    );

    const updatedInterview =
      await this.postInterviewsService.generateAndUpdateScriptText(
        postInterview,
      );

    return { interview: updatedInterview };
  }

  @Post('generate-script-definition')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate script definition for an interview' })
  @ApiResponse({
    status: 200,
    description: 'Script definition generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid interview ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Interview not found',
  })
  async generateScriptDefinition(@Body() dto: GetInterviewByIdDto) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      dto.interviewId,
    );

    const updatedInterview =
      await this.postInterviewsService.generateAndUpdateScriptDefinition(
        postInterview,
      );

    return { interview: updatedInterview };
  }

  @Post('generate-post')
  @HttpCode(201)
  @ApiOperation({ summary: 'Generate a post from an interview' })
  @ApiResponse({
    status: 201,
    description: 'Post generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid interview ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Interview not found',
  })
  async generatePostFromInterview(
    @Body() generatePostDto: GeneratePostFromInterviewDto,
  ) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      generatePostDto.interviewId,
    );

    const post =
      await this.postsManagementService.createPostDraftFromInterview(
        postInterview,
      );

    return { post };
  }
}
