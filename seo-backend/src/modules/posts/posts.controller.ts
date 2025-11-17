import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new post',
    description: 'Creates a new blog post with SEO optimization data',
  })
  @ApiResponse({
    status: 201,
    description: 'Post successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts',
    description: 'Retrieves all posts, optionally filtered by status',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'scheduled'],
    description: 'Filter posts by status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of posts retrieved successfully',
  })
  async findAll(@Query('status') status?: string) {
    if (status) {
      return this.postsService.findByStatus(status);
    }
    return this.postsService.findAll();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get post statistics',
    description: 'Returns statistics about posts (total, published, draft, scheduled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        published: { type: 'number', example: 75 },
        draft: { type: 'number', example: 20 },
        scheduled: { type: 'number', example: 5 },
      },
    },
  })
  async getStats() {
    return this.postsService.getStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a post by ID',
    description: 'Retrieves a single post by its MongoDB ID',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the post',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a post',
    description: 'Updates an existing post by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the post',
  })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: Partial<CreatePostDto>,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a post',
    description: 'Deletes a post by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the post',
  })
  @ApiResponse({
    status: 204,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);
  }
}
