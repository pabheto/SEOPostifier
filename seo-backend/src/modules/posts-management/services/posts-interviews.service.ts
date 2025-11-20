import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { GroqService, SCRIPT_CREATION_MODEL } from '../../llm-manager';
import { ScriptsPrompting } from '../../llm-manager/library/prompts/scripts.prompting';
import { CreatePostInterviewDto } from '../dto/create-post-interview.dto';
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
      model: SCRIPT_CREATION_MODEL,
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
    );

    const scriptDefinitionResult = await this.groqService.generate(prompt, {
      model: SCRIPT_CREATION_MODEL,
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
}
