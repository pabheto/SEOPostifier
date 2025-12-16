import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { GroqService } from '../../llm-manager';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
import { UpdatePostInterviewDto } from '../dto/update-post-interview.dto';
import { PostScriptsGenerator } from '../library/generation/post-scripts.generator';
import { InterviewStatus } from '../library/interfaces/post-interview.interface';
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
  ): Promise<PostInterviewDocument> {
    const query: { interviewId: string; userId?: string } = { interviewId };
    if (userId) {
      query.userId = userId;
    }

    const postInterview = await this.postInterviewModel.findOne(query);
    if (!postInterview) {
      throw new NotFoundException(
        `Post interview not found with interviewId: ${interviewId}`,
      );
    }
    return postInterview;
  }

  async generateAndUpdateScriptText(
    postInterview: PostInterviewDocument,
  ): Promise<PostInterviewDocument> {
    const scriptText = await PostScriptsGenerator.createScriptTextFromInterview(
      postInterview,
      this.groqService,
    );

    postInterview.generatedScriptText = scriptText;
    postInterview.status = InterviewStatus.SCRIPT_TEXT_GENERATED;
    await postInterview.save();

    return postInterview;
  }

  async generateAndUpdateScriptDefinition(
    postInterview: PostInterviewDocument,
  ): Promise<PostInterviewDocument> {
    if (
      !postInterview.generatedScriptText ||
      (postInterview.status !== InterviewStatus.SCRIPT_TEXT_GENERATED &&
        postInterview.status !== InterviewStatus.SCRIPT_DEFINITION_GENERATED)
    ) {
      throw new BadRequestException('Script text not generated');
    }

    const scriptDefinitionObject =
      await PostScriptsGenerator.createScriptDefinitionFromText(
        postInterview.generatedScriptText,
        postInterview.minWordCount || 500,
        postInterview.maxWordCount || 2000,
        postInterview.needsFaqSection || false,
        this.groqService,
      );

    postInterview.generatedScriptDefinition = scriptDefinitionObject;
    postInterview.status = InterviewStatus.SCRIPT_DEFINITION_GENERATED;
    await postInterview.save();

    return postInterview;
  }

  async getInterviewsList(userId: string): Promise<PostInterviewDocument[]> {
    const interviews = await this.postInterviewModel.find({ userId });
    return interviews;
  }

  async updatePostInterview(
    updatePostInterviewDto: UpdatePostInterviewDto,
  ): Promise<PostInterviewDocument> {
    const postInterview = await this.getPostInterviewById(
      updatePostInterviewDto.interviewId,
    );

    // Update only provided fields
    const updateData: Partial<PostInterview> = {};
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

    for (const field of fieldsToUpdate) {
      if (
        updatePostInterviewDto[field as keyof UpdatePostInterviewDto] !==
        undefined
      ) {
        updateData[field as keyof PostInterview] = updatePostInterviewDto[
          field as keyof UpdatePostInterviewDto
        ] as never;
      }
    }

    // Reset status to draft if parameters changed (so user needs to regenerate)
    if (Object.keys(updateData).length > 0) {
      updateData.status = InterviewStatus.DRAFT;
      // Clear generated content if parameters changed
      postInterview.generatedScriptText = undefined;
      postInterview.generatedScriptDefinition = undefined;
      postInterview.associatedPostId = undefined;
    }

    Object.assign(postInterview, updateData);
    return postInterview.save();
  }

  async generateSuggestionsFromInterview(postInterview: PostInterviewDocument) {
    const suggestions =
      await PostScriptsGenerator.createSugerencesFromInterview(
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
