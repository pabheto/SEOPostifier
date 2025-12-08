import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/users/auth';
import { CurrentUser } from 'src/modules/users/auth';
import { RequireLicense } from '../../users/decorators/require-license.decorator';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
import { GeneratePostFromInterviewDto } from '../dto/generate-post-from-interview.dto';
import { GetInterviewByIdDto } from '../dto/get-interview-by-id.dto';
import { UpdatePostInterviewDto } from '../dto/update-post-interview.dto';
import { PostInterviewsService } from '../services/posts-interviews.service';
import { PostsManagementService } from '../services/posts-management.service';

@ApiTags('Posts Interviews Management')
@ApiSecurity('license-key')
@Controller('posts-interviews')
@RequireLicense()
export class PostsInterviewsController {
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  async createPostInterview(
    @Body() createPostInterviewDto: CreatePostInterviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = user.id;
    const interview = await this.postInterviewsService.createPostInterview(
      userId,
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
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
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
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
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
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
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

  @Get('get-interviews-list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get list of interviews' })
  @ApiResponse({
    status: 200,
    description: 'Interviews list retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  async getInterviewsList() {
    const interviews = await this.postInterviewsService.getInterviewsList();
    return { interviews };
  }

  // View
  @Get('get-interview/:interviewId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get script text for an interview' })
  @ApiResponse({
    status: 200,
    description: 'Script text retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  @ApiResponse({
    status: 404,
    description: 'Interview not found',
  })
  async getScriptText(@Param('interviewId') interviewId: string) {
    const postInterview =
      await this.postInterviewsService.getPostInterviewById(interviewId);

    return { interview: postInterview };
  }

  @Post('update')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update an existing post interview' })
  @ApiResponse({
    status: 200,
    description: 'Interview updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  @ApiResponse({
    status: 404,
    description: 'Interview not found',
  })
  async updatePostInterview(
    @Body() updatePostInterviewDto: UpdatePostInterviewDto,
  ) {
    const interview = await this.postInterviewsService.updatePostInterview(
      updatePostInterviewDto,
    );
    return { interview };
  }

  @Post('generate-suggestions')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate architecture suggestions for an interview' })
  @ApiResponse({
    status: 200,
    description: 'Suggestions generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid interview ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  @ApiResponse({
    status: 404,
    description: 'Interview not found',
  })
  async generateSuggestions(@Body() dto: GetInterviewByIdDto) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      dto.interviewId,
    );

    const suggestionsResponse =
      await this.postInterviewsService.generateSuggestionsFromInterview(
        postInterview,
      );

    // Parse the Groq response which has a 'content' property containing JSON string
    let suggestions = [];
    try {
      if (suggestionsResponse && suggestionsResponse.content) {
        const parsed = JSON.parse(suggestionsResponse.content);
        suggestions = parsed.suggestions || [];
      }
    } catch (error) {
      console.error('Failed to parse suggestions:', error);
      suggestions = [];
    }

    return { suggestions };
  }
}
