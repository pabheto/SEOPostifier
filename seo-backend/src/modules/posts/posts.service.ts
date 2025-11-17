import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async findByStatus(status: string): Promise<Post[]> {
    return this.postModel.find({ status }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updatePostDto: Partial<CreatePostDto>): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Post | null> {
    return this.postModel.findByIdAndDelete(id).exec();
  }

  async getStats() {
    const total = await this.postModel.countDocuments().exec();
    const published = await this.postModel.countDocuments({ status: 'published' }).exec();
    const draft = await this.postModel.countDocuments({ status: 'draft' }).exec();
    const scheduled = await this.postModel.countDocuments({ status: 'scheduled' }).exec();

    return {
      total,
      published,
      draft,
      scheduled,
    };
  }
}
