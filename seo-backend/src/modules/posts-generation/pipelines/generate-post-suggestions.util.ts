import { BadRequestException } from '@nestjs/common';
import { GROQ_COMPOUND, GroqService } from 'src/modules/llm-manager';
import { FormattingPrompts } from '../library/prompting/formatting.prompts';
import { ScriptGenerationPrompts } from '../library/prompting/script-generation.prompts';

export class GeneratePostSuggestions_Util {
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
      ScriptGenerationPrompts.GENERATE_SCRIPT_ARCHITECTURE_SUGGESTION(
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
        FormattingPrompts.FIX_JSON_PROMPT(
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
}
