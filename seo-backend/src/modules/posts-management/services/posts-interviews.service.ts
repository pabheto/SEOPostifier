import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import {
  GPT_OSS_120B_MODEL,
  GROQ_COMPOUND,
  GroqService,
} from '../../llm-manager';
import { ScriptsPrompting } from '../../llm-manager/library/prompts/scripts.prompting';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
import { UpdatePostInterviewDto } from '../dto/update-post-interview.dto';
import {
  InterviewStatus,
  ScriptFormatDefinition,
} from '../library/interfaces/post-interview.interface';
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
  ): Promise<PostInterviewDocument> {
    const postInterview = await this.postInterviewModel.findOne({
      interviewId,
    });
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
    const prompt = ScriptsPrompting.GENERATE_SEO_SCRIPT_PROMPT(postInterview);

    const script = await this.groqService.generate(prompt, {
      model: GROQ_COMPOUND,
      maxTokens: 8096,
    });

    postInterview.generatedScriptText = script.content;
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
    const prompt = ScriptsPrompting.FORMAT_SEO_SCRIPT_TO_JSON_PROMPT(
      postInterview.generatedScriptText,
      postInterview.minWordCount,
      postInterview.maxWordCount,
      postInterview.needsFaqSection,
    );

    const scriptDefinitionResult = await this.groqService.generate(prompt, {
      model: GPT_OSS_120B_MODEL,
      maxTokens: 8096,
    });

    const scriptDefinitionObject = JSON.parse(
      scriptDefinitionResult.content,
    ) as ScriptFormatDefinition;

    postInterview.generatedScriptDefinition = scriptDefinitionObject;
    postInterview.status = InterviewStatus.SCRIPT_DEFINITION_GENERATED;
    await postInterview.save();

    return postInterview;
  }

  async getInterviewsList(): Promise<PostInterviewDocument[]> {
    const interviews = await this.postInterviewModel.find();
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
}
