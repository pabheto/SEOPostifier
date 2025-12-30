import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { GroqService } from 'src/modules/llm-manager/groq.service';
import { GeneratePostSuggestions_Util } from 'src/modules/posts-generation/pipelines/generate-post-suggestions.util';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
import { UpdatePostInterviewDto } from '../dto/update-post-interview.dto';
import { InterviewStatus } from '../library/interfaces/post-interview.interface';
import { PostInterviewsRepository } from '../repositories/post-interviews.repository';
import {
  PostInterview,
  PostInterviewDocument,
} from '../schemas/post-interview.schema';

@Injectable()
export class PostInterviewsService {
  constructor(
    @InjectModel(PostInterview.name)
    private postInterviewModel: Model<PostInterviewDocument>,

    private groqService: GroqService,
    private readonly postInterviewsRepository: PostInterviewsRepository,
  ) {}

  async createPostInterview(
    userId: string,
    createPostInterviewDto: CreatePostInterviewDto,
  ): Promise<PostInterviewDocument> {
    // Import uuid if not already imported at the top:
    // import { v4 as uuidv4 } from 'uuid';

    const interviewId = randomUUID();
    const postInterview = new this.postInterviewModel({
      interviewId,
      userId,
      ...createPostInterviewDto,
    });
    return postInterview.save();
  }

  async getPostInterviewById(
    interviewId: string,
    userId?: string,
  ): Promise<PostInterview> {
    console.log('getPostInterviewById', interviewId, userId);
    const postInterviewDocument =
      await this.postInterviewsRepository.findByIdWithUserId(
        interviewId,
        userId,
      );

    if (!postInterviewDocument) {
      throw new NotFoundException(
        `Post interview not found with interviewId: ${interviewId}`,
      );
    }

    return postInterviewDocument.toObject();
  }

  async getInterviewsList(userId: string): Promise<PostInterviewDocument[]> {
    const interviews = await this.postInterviewModel.find({ userId });
    return interviews;
  }

  async updatePostInterview(
    updatePostInterviewDto: UpdatePostInterviewDto,
  ): Promise<PostInterviewDocument> {
    // Verify the interview exists
    const postInterview = await this.getPostInterviewById(
      updatePostInterviewDto.interviewId,
    );

    // Update only provided fields
    const updateData: Partial<PostInterview> = { ...postInterview };
    const fieldsToUpdate = [
      'mainKeyword',
      'secondaryKeywords',
      'userDescription',
      'keywordDensityTarget',
      'language',
      'searchIntent',
      'targetAudience',
      'toneOfVoice',
      'minWordCount',
      'maxWordCount',
      'needsFaqSection',
      'mentionsBrand',
      'brandName',
      'brandDescription',
      'externalLinksToIncludeAutomatically',
      'internalLinksToUse',
      'externalLinksToUse',
      'includeExternalLinks',
      'includeInternalLinks',
      'includeInternalLinksAutomatically',
      'blogInternalLinksMeta',
    ];

    let hasChanges = false;
    for (const field of fieldsToUpdate) {
      if (
        updatePostInterviewDto[field as keyof UpdatePostInterviewDto] !==
        undefined
      ) {
        updateData[field as keyof PostInterview] = updatePostInterviewDto[
          field as keyof UpdatePostInterviewDto
        ] as never;
        hasChanges = true;
      }
    }

    // Reset status to draft if parameters changed (so user needs to regenerate)
    if (hasChanges) {
      updateData.status = InterviewStatus.DRAFT;
      // Clear generated content if parameters changed
      updateData.generatedScriptText = undefined;
      updateData.generatedScriptDefinition = undefined;
      updateData.associatedPostId = undefined;
    }

    return this.postInterviewsRepository.save(updateData as PostInterview);
  }

  async generateSuggestionsFromInterview(postInterview: PostInterview) {
    const suggestions =
      await GeneratePostSuggestions_Util.createSugerencesFromInterview(
        this.groqService,
        postInterview.mainKeyword,
        postInterview.secondaryKeywords ?? [],
        postInterview.userDescription || '',
        postInterview.mentionsBrand,
        postInterview.brandName || '',
        postInterview.brandDescription || '',
        postInterview.language || 'es',
      );

    return suggestions;
  }
}
