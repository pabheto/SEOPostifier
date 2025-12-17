import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/posts.schema';
import {
  PaginatedResult,
  PaginationOptions,
} from './post-interviews.repository';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async findAllPaginated(
    options: PaginationOptions,
    filters?: Record<string, any>,
  ): Promise<PaginatedResult<PostDocument>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const query = filters || {};

    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.postModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as PostDocument[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(postId: string): Promise<PostDocument | null> {
    const result = await this.postModel.findById(postId).lean().exec();
    return result as PostDocument | null;
  }
}
