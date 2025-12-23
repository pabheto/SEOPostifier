import { BadRequestException } from '@nestjs/common';
import console from 'console';
import {
  GPT_OSS_120B_MODEL,
  GROQ_COMPOUND,
  GroqService,
} from 'src/modules/llm-manager';
import { ScriptsPrompting } from 'src/modules/llm-manager/library/prompts/scripts.prompting';
import { SerpPrompting } from 'src/modules/llm-manager/library/prompts/serp.prompting';
import { PostInterview } from '../../schemas/post-interview.schema';
import { ScriptFormatDefinition } from '../interfaces/post-interview.interface';

export class PostScriptsGenerator {
  static async createSerpQueries(
    postInterview: PostInterview,
    groqService: GroqService,
  ) {
    const createSerpQueriesPrompt =
      SerpPrompting.CREATE_SERP_QUERIES_FROM_INTERVIEW(postInterview);
    const createSerpQueriesResult = await groqService.generate('', {
      model: GROQ_COMPOUND,
      maxTokens: 8192,
      systemPrompt: createSerpQueriesPrompt.systemPrompts,
      userPrompt: createSerpQueriesPrompt.userPrompts,
    });
  }

  static async createSugerencesFromInterview(
    groqService: GroqService,
    mainKeyword: string,
    secondaryKeywords: string[],
    userDescription: string,
    mentionsBrand: boolean,
    brandName: string,
    brandDescription: string,
    language: string,
  ) {
    const generateArchitectureSuggestionsPrompt =
      ScriptsPrompting.GENERATE_SCRIPT_ARCHITECTURE_SUGGESTION(
        mainKeyword,
        secondaryKeywords,
        userDescription,
        mentionsBrand,
        brandName,
        brandDescription,
        language,
      );

    const generateArchitectureSuggestionsResult = await groqService.generate(
      '',
      {
        model: GROQ_COMPOUND,
        maxTokens: 8192,
        systemPrompt: generateArchitectureSuggestionsPrompt.systemPrompts,
        userPrompt: generateArchitectureSuggestionsPrompt.userPrompts,
      },
    );

    console.log(
      'Generated suggestions: ',
      generateArchitectureSuggestionsResult,
    );

    // Parse and validate JSON, with auto-fix if needed
    let suggestionsObject: { suggestions: any[] };
    try {
      suggestionsObject = JSON.parse(
        generateArchitectureSuggestionsResult.content,
      ) as { suggestions: any[] };
    } catch (parseError) {
      // If JSON parsing fails, request a fix from the LLM
      const { systemPrompts: fixSystemPrompts, userPrompts: fixUserPrompts } =
        ScriptsPrompting.FIX_JSON_PROMPT(
          generateArchitectureSuggestionsResult.content,
          parseError instanceof Error ? parseError.message : String(parseError),
        );

      const fixedJsonResult = await groqService.generate('', {
        model: GROQ_COMPOUND,
        maxTokens: 8192,
        systemPrompt: fixSystemPrompts,
        userPrompt: fixUserPrompts,
      });

      try {
        suggestionsObject = JSON.parse(fixedJsonResult.content) as {
          suggestions: any[];
        };
      } catch (retryParseError) {
        throw new BadRequestException(
          `Failed to parse suggestions JSON after fix attempt: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
        );
      }
    }

    return suggestionsObject;
  }

  static async createScriptTextFromInterview(
    interview: PostInterview,
    groqService: GroqService,
  ): Promise<string> {
    const generateBaseScriptPrompt =
      ScriptsPrompting.GENERATE_SEO_SCRIPT_PROMPT(interview);

    const script = await groqService.generate('', {
      model: GROQ_COMPOUND,
      maxTokens: 8096,
      systemPrompt: generateBaseScriptPrompt.systemPrompts,
      userPrompt: generateBaseScriptPrompt.userPrompts,
    });

    return script.content;
  }

  static async createScriptDefinitionFromText(
    scriptText: string,
    minWordCount: number,
    maxWordCount: number,
    needsFaqSection: boolean,
    groqService: GroqService,
  ): Promise<ScriptFormatDefinition> {
    const { systemPrompts, userPrompts } =
      ScriptsPrompting.FORMAT_SEO_SCRIPT_TO_JSON_PROMPT(
        scriptText,
        minWordCount,
        maxWordCount,
        needsFaqSection,
      );

    const scriptDefinitionResult = await groqService.generate('', {
      model: GPT_OSS_120B_MODEL,
      maxTokens: 20000,
      systemPrompt: systemPrompts,
      userPrompt: userPrompts,
    });

    let scriptDefinitionObject: ScriptFormatDefinition;
    try {
      scriptDefinitionObject = JSON.parse(
        scriptDefinitionResult.content,
      ) as ScriptFormatDefinition;
    } catch (parseError) {
      // If JSON parsing fails, request a fix from the LLM
      const { systemPrompts: fixSystemPrompts, userPrompts: fixUserPrompts } =
        ScriptsPrompting.FIX_JSON_PROMPT(
          scriptDefinitionResult.content,
          parseError instanceof Error ? parseError.message : String(parseError),
        );

      const fixedJsonResult = await groqService.generate('', {
        model: GPT_OSS_120B_MODEL,
        maxTokens: 20000,
        systemPrompt: fixSystemPrompts,
        userPrompt: fixUserPrompts,
      });

      try {
        scriptDefinitionObject = JSON.parse(
          fixedJsonResult.content,
        ) as ScriptFormatDefinition;
      } catch (retryParseError) {
        throw new BadRequestException(
          `Failed to parse JSON after fix attempt: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
        );
      }
    }

    return scriptDefinitionObject;
  }
}
