import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import {
  GroqService,
  MEDIUM_GENERATION_MODEL,
  SCRIPT_CREATION_MODEL,
} from 'src/modules/llm-manager';
import { ScriptsPrompting } from 'src/modules/llm-manager/library/prompts/scripts.prompting';
import {
  InterviewStatus,
  ScriptFormatDefinition,
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
    maxExternalLinks: 10,
    maxInternalLinks: 10,
    notesForWriter: '',
    status: InterviewStatus.DRAFT,
    projectId: 'testProjectId',
    userId: 'testUserId',
  };

  // === Prepare output folder per result ===
  const rootOutputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(rootOutputDir)) {
    fs.mkdirSync(rootOutputDir, { recursive: true });
  }
  const slug = 'seo_script_result_' + Date.now();
  const outputDir = path.join(rootOutputDir, slug);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ----- 1. Write the SEO Script Generation Prompt -----
  const generationPrompt =
    ScriptsPrompting.GENERATE_SEO_SCRIPT_PROMPT(testPostInterview);

  // Don't write the prompt file, just generate

  // ----- 2. Generate the script (Markdown) -----
  const script = await groqService.generate(generationPrompt, {
    model: SCRIPT_CREATION_MODEL,
    maxTokens: 8096,
  });

  // ----- 3. Save script as JSON -----
  const formattedScript = await groqService.generate(
    ScriptsPrompting.FORMAT_SEO_SCRIPT_TO_JSON_PROMPT(script.content),
    {
      model: SCRIPT_CREATION_MODEL,
      maxTokens: 8096,
    },
  );

  const formattedScriptObject = JSON.parse(
    formattedScript.content,
  ) as ScriptFormatDefinition;

  // ----- 4. Compose the WHOLE article in one file -----
  let fullArticleContent = '';

  // a. Write h1
  if (formattedScriptObject.head?.h1) {
    fullArticleContent += `# ${formattedScriptObject.head.h1}\n\n`;
  }

  // b. Write introduction
  const introduction = await groqService.generate(
    ScriptsPrompting.COPYWRITER_INTRODUCTION_PROMPT(
      formattedScriptObject.indexSummary,
      formattedScriptObject.head.h1,
      formattedScriptObject.head.introductionDescription,
      testPostInterview.targetAudience,
      testPostInterview.toneOfVoice,
    ),
    {
      model: MEDIUM_GENERATION_MODEL,
      maxTokens: 8096,
    },
  );
  fullArticleContent += introduction.content.trim() + '\n\n';

  // c. Write sections
  for (const section of formattedScriptObject.body.sections) {
    const sectionTitle = section.title;
    const sectionDescription = section.description;

    // Add section title based on its level
    const headingPrefix =
      section.level === 'h2' ? '##' : section.level === 'h3' ? '###' : '####';
    fullArticleContent += `${headingPrefix} ${sectionTitle}\n\n`;

    const prompt = ScriptsPrompting.COPYWRITER_PARAGRAPH_PROMPT(
      formattedScriptObject.indexSummary,
      testPostInterview.targetAudience,
      testPostInterview.toneOfVoice,
      sectionTitle,
      sectionDescription,
    );

    const paragraph = await groqService.generate(prompt, {
      model: MEDIUM_GENERATION_MODEL,
      maxTokens: 8096,
    });

    fullArticleContent += paragraph.content.trim() + '\n\n';
  }

  // d. FAQ section if present
  if (formattedScriptObject.faq) {
    const sectionTitle = 'Frequently Asked Questions';
    const sectionDescription = formattedScriptObject.faq.description;

    // Add FAQ section title
    fullArticleContent += `## ${sectionTitle}\n\n`;

    const faq = await groqService.generate(
      ScriptsPrompting.COPYWRITER_FAQ_PROMPT(
        formattedScriptObject.indexSummary,
        testPostInterview.targetAudience,
        testPostInterview.toneOfVoice,
        sectionTitle,
        sectionDescription,
      ),
      {
        model: MEDIUM_GENERATION_MODEL,
        maxTokens: 8096,
      },
    );
    fullArticleContent += faq.content.trim() + '\n\n';
  }

  // Save the entire article in ONE file
  fs.writeFileSync(
    path.join(outputDir, 'article-complete.md'),
    fullArticleContent.trim(),
    'utf8',
  );

  console.log(
    `All-in-one article for "${slug}" written to ${outputDir}/article-complete.md`,
  );
}

void bootstrap();
