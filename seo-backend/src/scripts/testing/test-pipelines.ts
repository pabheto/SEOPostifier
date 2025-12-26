import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { PostScriptsGenerator } from 'src/modules/posts-generation/library/generation/post-scripts.generator';
import {
  InterviewStatus,
  SearchIntent,
  ToneOfVoice,
} from 'src/modules/posts-management/library/interfaces/post-interview.interface';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';

const logFilePath = path.join(process.cwd(), 'logs', 'test-pipelines.log');
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

function logStep(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const payload =
    data !== undefined
      ? `${message} | data=${JSON.stringify(data, null, 2)}`
      : message;
  const line = `[${timestamp}] ${payload}\n`;
  fs.appendFileSync(logFilePath, line, { encoding: 'utf8' });
  console.log(line.trim()); // keep console visibility while debugging
}

async function testPipelineScript() {
  logStep('Bootstrapping Nest application');
  const app = await NestFactory.create(AppModule);
  await app.init();
  logStep('Nest application initialized');

  const pipelineScriptGenerator = app.get(PostScriptsGenerator);

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

  logStep('Using test post interview payload', testPostInterview);

  const exaResearchPlan =
    await pipelineScriptGenerator.STEP_generateResearchPlanForSerpQueries(
      testPostInterview,
    );

  logStep('Generated Exa research plan', exaResearchPlan);

  const exaResearchResults =
    await pipelineScriptGenerator.STEP_gatherExaResearchResults(
      exaResearchPlan,
    );

  logStep('Gathered Exa research results', exaResearchResults);

  const summarizedSERPResults =
    await pipelineScriptGenerator.STEP_summarizeExaResearchResults(
      exaResearchResults,
    );

  logStep('Summarized Exa research results', summarizedSERPResults);

  const optimizedSERPResults =
    await pipelineScriptGenerator.STEP_optimizeSERP_SearchResults(
      summarizedSERPResults,
    );

  logStep('Optimized Exa research results', optimizedSERPResults);
}

void testPipelineScript().catch((error) => {
  // Errors are already logged; ensure process exits with failure code.
  process.exitCode = 1;
  console.error(error);
});
