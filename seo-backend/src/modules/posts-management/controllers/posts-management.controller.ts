import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/users/auth';
import { CurrentUser } from 'src/modules/users/auth';
import { RequireLicense } from '../../users/decorators/require-license.decorator';
import { GeneratePostFromInterviewDto } from '../dto/generate-post-from-interview.dto';
import { GetInterviewByIdDto } from '../dto/get-interview-by-id.dto';
import { GetPostByIdDto } from '../dto/get-post-by-id.dto';
import { PostInterviewsService } from '../services/posts-interviews.service';
import { PostsManagementService } from '../services/posts-management.service';

@ApiTags('Posts Management')
@ApiSecurity('license-key')
@Controller('posts')
@RequireLicense()
export class PostsManagementController {
  constructor(
    private readonly postsManagementService: PostsManagementService,
    private readonly postInterviewsService: PostInterviewsService,
  ) {}

  @Post('generate-from-interview')
  @HttpCode(201)
  @ApiOperation({ summary: 'Generate a post from an interview' })
  @ApiResponse({
    status: 201,
    description: 'Post generated successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation error - invalid interview ID or interview not ready',
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
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      generatePostDto.interviewId,
      user.id,
    );

    const post =
      await this.postsManagementService.createPostDraftFromInterview(
        postInterview,
      );

    return { post };
  }

  @Get('interview/:interviewId/generation-status')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Check the generation status of a post by interview ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Generation status retrieved successfully',
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
  async checkGenerationStatus(
    @Param() dto: GetInterviewByIdDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const postInterview = await this.postInterviewsService.getPostInterviewById(
      dto.interviewId,
      user.id,
    );

    const status =
      await this.postsManagementService.checkGenerationStatusOfPost(
        postInterview,
      );

    return { status };
  }

  @Get('list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get list of posts for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Posts list retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  async listPostsForUser(@CurrentUser() user: AuthenticatedUser) {
    const userId = user.id;
    const posts = await this.postsManagementService.listPostsForUser(userId);
    return { posts };
  }

  @Get(':postId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid post ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async getPostById(
    @Param() dto: GetPostByIdDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const post = await this.postsManagementService.getPostById(
      dto.postId,
      user.id,
    );
    if (!post) {
      throw new NotFoundException(`Post not found with id: ${dto.postId}`);
    }
    return { post };
  }
}
