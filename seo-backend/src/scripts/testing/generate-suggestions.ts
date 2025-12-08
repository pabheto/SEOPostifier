import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { GroqService } from 'src/modules/llm-manager';
import { PostScriptsGenerator } from 'src/modules/posts-management/library/generation/post-scripts.generator';
import {
  InterviewStatus,
  SearchIntent,
  ToneOfVoice,
} from 'src/modules/posts-management/library/interfaces/post-interview.interface';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';
import { AppModule } from '../../app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const groqService = app.get(GroqService);

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

  // === Prepare output folder per result ===
  const rootOutputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(rootOutputDir)) {
    fs.mkdirSync(rootOutputDir, { recursive: true });
  }
  const slug = 'script_suggestions_' + Date.now();
  const outputDir = path.join(rootOutputDir, slug);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Generating script architecture suggestions...\n');

  // Test the PostScriptsGenerator.createSuggerencesFromInterview method
  const suggestions = await PostScriptsGenerator.createSugerencesFromInterview(
    groqService,
    testPostInterview.mainKeyword,
    testPostInterview.secondaryKeywords ?? [],
    testPostInterview.userDescription ?? '',
    testPostInterview.mentionsBrand,
    testPostInterview.brandName ?? '',
    testPostInterview.brandDescription ?? '',
  );

  // Parse and display suggestions
  let suggestionsObject: any;
  try {
    suggestionsObject = JSON.parse(suggestions.content) as {
      suggestions: Array<{ title: string; description: string }>;
    };
    console.log('\n✅ Successfully generated suggestions!\n');
    console.log('Suggestions:', JSON.stringify(suggestionsObject, null, 2));
  } catch (error) {
    console.error('❌ Failed to parse suggestions JSON:', error);
    suggestionsObject = { raw: suggestions.content };
  }

  // Save suggestions to file
  fs.writeFileSync(
    path.join(outputDir, 'suggestions.json'),
    JSON.stringify(suggestionsObject, null, 2),
    'utf8',
  );

  // Also save raw response
  fs.writeFileSync(
    path.join(outputDir, 'suggestions-raw.txt'),
    suggestions.content,
    'utf8',
  );

  console.log(`\n📁 Suggestions saved to ${outputDir}/suggestions.json`);
  console.log(`📄 Raw response saved to ${outputDir}/suggestions-raw.txt`);

  await app.close();
}

void bootstrap();
