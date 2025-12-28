import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import {
  PostInterview,
  PostInterviewDocument,
} from '../schemas/post-interview.schema';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PostInterviewsRepository {
  constructor(
    @InjectModel(PostInterview.name)
    private readonly postInterviewModel: Model<PostInterviewDocument>,
  ) {}

  async save(postInterview: PostInterview): Promise<PostInterviewDocument> {
    const interviewId = postInterview.interviewId ?? randomUUID();

    return this.postInterviewModel
      .findOneAndUpdate(
        { interviewId },
        { $set: { ...postInterview, interviewId } },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        },
      )
      .exec();
  }

  async findAllPaginated(
    options: PaginationOptions,
    filters?: Record<string, unknown>,
  ): Promise<PaginatedResult<PostInterviewDocument>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const query = filters || {};

    const [data, total] = await Promise.all([
      this.postInterviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postInterviewModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(interviewId: string): Promise<PostInterviewDocument | null> {
    return this.postInterviewModel.findOne({ interviewId }).exec();
  }
}
