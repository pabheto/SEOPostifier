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
  SearchIntent,
  ToneOfVoice,
} from 'src/modules/post-interviews/library/interfaces/post-interview.interface';
import { PostInterview } from 'src/modules/post-interviews/schemas/post-interview.schema';
import { AppModule } from '../../app.module';

export type Image = {
  sourceType: 'user|ai_generated';
  sourceValue?: string;
  description?: string;
  alt?: string;
};

export type Section = {
  id: string;
  level: 'h2' | 'h3' | 'h4';
  title: string;
  lengthRange: [number, number];
  description: string;
  images?: Image[];
  links: {
    internal: string[];
    external: string[];
  };
};

export type ScriptFormatDefinition = {
  indexSummary: string;
  head: {
    h1: string;
    introductionDescription: string;
    slug: string;
    tags: string[];
  };
  body: {
    sections: Section[];
  };
  faq?: {
    description: string;
  };
};

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
    suggestedSlug: 'ultimate-seo-guide',
    suggestedCategories: ['SEO', 'Marketing'],
    suggestedTags: ['SEO', 'Google', 'Ranking'],
    isComplete: false,
    metadata: {},
    generatedPrompts: [],
  };

  // === Prepare output folder per result ===
  const rootOutputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(rootOutputDir)) {
    fs.mkdirSync(rootOutputDir, { recursive: true });
  }
  const slug =
    testPostInterview.suggestedSlug || 'seo_script_result_' + Date.now();
  const outputDir = path.join(rootOutputDir, slug);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ----- 1. Write the SEO Script Generation Prompt -----
  const generationPrompt =
    ScriptsPrompting.GENERATE_SEO_SCRIPT_PROMPT(testPostInterview);

  // Don't write the prompt file, just generate

  // ----- 2. Generate the script (Markdown) -----
  console.log('Generating SEO script...');
  const script = await groqService.generate(generationPrompt, {
    model: SCRIPT_CREATION_MODEL,
    maxTokens: 8096,
  });

  // Save the original script in Markdown
  fs.writeFileSync(path.join(outputDir, 'script.md'), script.content, 'utf8');
  console.log(`✓ Script (Markdown) saved to ${outputDir}/script.md`);

  // ----- 3. Format script as JSON -----
  console.log('Formatting script to JSON...');
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

  // Save the formatted script as JSON
  fs.writeFileSync(
    path.join(outputDir, 'script-formatted.json'),
    JSON.stringify(formattedScriptObject, null, 2),
    'utf8',
  );
  console.log(`✓ Script (JSON) saved to ${outputDir}/script-formatted.json`);
  console.log(
    `✓ Found ${formattedScriptObject.body.sections.length} sections to generate`,
  );

  // ----- 4. Compose the WHOLE article in one file -----
  console.log('\nGenerating article content...');
  let fullArticleContent = '';

  // a. Write h1
  if (formattedScriptObject.head?.h1) {
    fullArticleContent += `# ${formattedScriptObject.head.h1}\n\n`;
    console.log(`✓ Added H1: ${formattedScriptObject.head.h1}`);
  }

  // b. Write introduction
  console.log('✓ Generating introduction...');
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
  console.log(
    `\nGenerating content for ${formattedScriptObject.body.sections.length} sections...`,
  );
  for (let i = 0; i < formattedScriptObject.body.sections.length; i++) {
    const section = formattedScriptObject.body.sections[i];
    const sectionTitle = section.title;
    const sectionDescription = section.description;
    const wordRange = section.lengthRange;

    // Add section title based on its level
    const headingPrefix =
      section.level === 'h2' ? '##' : section.level === 'h3' ? '###' : '####';
    fullArticleContent += `${headingPrefix} ${sectionTitle}\n\n`;

    console.log(
      `  [${i + 1}/${formattedScriptObject.body.sections.length}] ${section.level.toUpperCase()}: ${sectionTitle} (${wordRange[0]}-${wordRange[1]} words)`,
    );

    const prompt = ScriptsPrompting.COPYWRITER_PARAGRAPH_PROMPT(
      formattedScriptObject.indexSummary,
      testPostInterview.targetAudience,
      testPostInterview.toneOfVoice,
      sectionTitle,
      sectionDescription,
      wordRange,
    );

    const paragraph = await groqService.generate(prompt, {
      model: MEDIUM_GENERATION_MODEL,
      maxTokens: 8096,
    });

    fullArticleContent += paragraph.content.trim() + '\n\n';
  }
  console.log('✓ All sections generated successfully');

  // d. FAQ section if present
  if (formattedScriptObject.faq) {
    console.log('\n✓ Generating FAQ section...');
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

  // Summary
  const h2Count = formattedScriptObject.body.sections.filter(
    (s) => s.level === 'h2',
  ).length;
  const h3Count = formattedScriptObject.body.sections.filter(
    (s) => s.level === 'h3',
  ).length;
  const h4Count = formattedScriptObject.body.sections.filter(
    (s) => s.level === 'h4',
  ).length;

  // Calculate total word range
  const totalMinWords = formattedScriptObject.body.sections.reduce(
    (sum, s) => sum + s.lengthRange[0],
    0,
  );
  const totalMaxWords = formattedScriptObject.body.sections.reduce(
    (sum, s) => sum + s.lengthRange[1],
    0,
  );

  console.log('\n=== GENERATION COMPLETE ===');
  console.log(`✓ Article saved to: ${outputDir}/article-complete.md`);
  console.log(`\nStructure Summary:`);
  console.log(`  - H1: 1`);
  console.log(`  - H2 sections: ${h2Count}`);
  console.log(`  - H3 subsections: ${h3Count}`);
  console.log(`  - H4 sub-subsections: ${h4Count}`);
  console.log(`  - FAQ: ${formattedScriptObject.faq ? 'Yes' : 'No'}`);
  console.log(
    `  - Total sections: ${formattedScriptObject.body.sections.length}`,
  );
  console.log(
    `\nWord Count Target: ${testPostInterview.minWordCount}-${testPostInterview.maxWordCount} words`,
  );
  console.log(
    `Planned Word Range: ${totalMinWords}-${totalMaxWords} words (from all sections)`,
  );
  console.log(`\nFiles created:`);
  console.log(`  1. ${outputDir}/script.md`);
  console.log(`  2. ${outputDir}/script-formatted.json`);
  console.log(`  3. ${outputDir}/article-complete.md`);
  console.log('\n✨ Done!');
}

void bootstrap();
