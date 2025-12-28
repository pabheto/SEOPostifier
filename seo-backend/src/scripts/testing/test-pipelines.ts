import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { GeneratePost_Pipeline } from 'src/modules/posts-generation/pipelines/generate-post.pipeline';
import {
  InterviewStatus,
  SearchIntent,
  ToneOfVoice,
} from 'src/modules/posts-management/library/interfaces/post-interview.interface';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';

const logFilePath = path.join(process.cwd(), 'logs', 'test-pipelines.log');
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

function safeSerialize(data: unknown) {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return `"__unserializable__:${(error as Error)?.message ?? 'unknown'}"`;
  }
}

function writeLog(message: string, data?: unknown, durationMs?: number) {
  const timestamp = new Date().toISOString();
  const payloadParts = [message];

  if (typeof durationMs === 'number') {
    payloadParts.push(`durationMs=${durationMs.toFixed(2)}`);
  }

  if (data !== undefined) {
    payloadParts.push(`data=${safeSerialize(data)}`);
  }

  const line = `[${timestamp}] ${payloadParts.join(' | ')}\n`;
  fs.appendFileSync(logFilePath, line, { encoding: 'utf8' });
  console.log(line.trim()); // keep console visibility while debugging
}

async function logStep<T>(
  message: string,
  action: () => Promise<T> | T,
  dataSelector?: (result: T) => unknown,
): Promise<T>;
async function logStep(message: string): Promise<void>;
async function logStep<T>(
  message: string,
  action?: () => Promise<T> | T,
  dataSelector?: (result: T) => unknown,
): Promise<T | void> {
  if (!action) {
    writeLog(message);
    return;
  }

  const start = Date.now();

  try {
    const result = await action();
    const dataToLog =
      typeof dataSelector === 'function' ? dataSelector(result) : result;

    writeLog(message, dataToLog, Date.now() - start);
    return result;
  } catch (error) {
    writeLog(
      `${message} (failed)`,
      (error as Error)?.message ?? error,
      Date.now() - start,
    );
    throw error;
  }
}

async function testPipelineScript() {
  const app = await logStep(
    'Bootstrapping Nest application',
    async () => {
      const appInstance = await NestFactory.create(AppModule);
      await appInstance.init();
      return appInstance;
    },
    () => undefined, // avoid serializing the Nest app
  );

  const pipelineScriptGenerator = app.get(GeneratePost_Pipeline);

  const testPostInterview: PostInterview = {
    interviewId: 'testInterviewId',
    mainKeyword: 'online marketing',
    secondaryKeywords: ['digital marketing'],
    userDescription:
      'A post discussing the urgency for companies to digitize and implement digital marketing',
    keywordDensityTarget: 0.017,
    language: 'es',
    searchIntent: SearchIntent.INFORMATIONAL,
    targetAudience: 'SEO experts',
    toneOfVoice: ToneOfVoice.PROFESSIONAL,
    minWordCount: 2000,
    maxWordCount: 2500,
    needsFaqSection: true,
    mentionsBrand: true,
    brandName: 'Vértigo marketing',
    brandDescription: 'Marketing agency',
    imagesConfig: {
      aiImagesCount: 5,
      useUserImages: false,
      userImages: [],
    },
    includeInternalLinks: false,
    includeExternalLinks: false,
    internalLinksToUse: [],
    externalLinksToUse: [],
    externalLinksToIncludeAutomatically: 10,
    status: InterviewStatus.DRAFT,
    projectId: 'testProjectId',
    userId: 'testUserId',
  };

  await logStep('Using test post interview payload', () => testPostInterview);

  const exaResearchPlan = await logStep('Generated Exa research plan', () => {
    return pipelineScriptGenerator.STEP_generateResearchPlanForSerpQueries(
      testPostInterview,
    );
  });

  const exaResearchResults = await logStep(
    'Gathered Exa research results',
    () =>
      pipelineScriptGenerator.STEP_gatherExaResearchResults(exaResearchPlan),
  );

  const summarizedSERPResults = await logStep(
    'Summarized Exa research results',
    () =>
      pipelineScriptGenerator.STEP_summarizeExaResearchResults(
        exaResearchResults,
      ),
  );

  const optimizedSERPResults = await logStep(
    'Optimized Exa research results',
    () =>
      pipelineScriptGenerator.STEP_optimizeSERP_SearchResults(
        summarizedSERPResults,
      ),
  );

  const scriptDraft = await logStep('Created script draft', () => {
    return pipelineScriptGenerator.STEP_createScriptDraft(
      testPostInterview,
      optimizedSERPResults,
    );
  });

  await logStep('Optimized script', () =>
    pipelineScriptGenerator.STEP_optimizeScriptDraft(
      testPostInterview,
      optimizedSERPResults,
      scriptDraft,
    ),
  );

  await logStep('Script generated successfully');
}

void testPipelineScript().catch((error) => {
  // Errors are already logged; ensure process exits with failure code.
  process.exitCode = 1;
  console.error(error);
});
