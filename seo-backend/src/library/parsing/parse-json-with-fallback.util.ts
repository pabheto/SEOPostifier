import { BadRequestException, Logger } from '@nestjs/common';
import {
  DeepseekModel,
  DeepseekService,
} from 'src/modules/llm-manager/deep-seek.service';
import { FormattingPrompts } from 'src/modules/posts-generation/library/prompting/formatting.prompts';
import { safeJsonParse } from './parse-json.util';

export interface ParseJsonWithFallbackOptions {
  /**
   * Maximum tokens for the DeepSeek fix attempt
   * @default 8096
   */
  maxTokens?: number;

  /**
   * Context description for error messages (e.g., "research plan", "SERP summary")
   * This will be used in the error message: "Failed to parse {context} JSON after fix attempt"
   */
  errorContext?: string;

  /**
   * Custom logger instance. If not provided, a default logger will be used.
   */
  logger?: Logger;
}

/**
 * Attempts to parse JSON content with automatic fallback to DeepSeek for fixing malformed JSON.
 * Logs a warning when fallback is triggered, including the content that failed to parse.
 *
 * @param content - The JSON string to parse
 * @param deepseekService - DeepSeek service instance for fixing malformed JSON
 * @param options - Optional configuration
 * @returns Parsed object of type T
 * @throws BadRequestException if parsing fails even after fix attempt
 *
 * @example
 * const result = await parseJsonWithFallback<SERP_ResearchPlan>(
 *   llmResponse.content,
 *   this.deepseekService,
 *   {
 *     errorContext: 'research plan',
 *     maxTokens: 8096,
 *     logger: this.logger,
 *   }
 * );
 */
export async function parseJsonWithFallback<T>(
  content: string,
  deepseekService: DeepseekService,
  options: ParseJsonWithFallbackOptions = {},
): Promise<T> {
  const {
    maxTokens = 8096,
    errorContext = 'JSON',
    logger = new Logger('ParseJsonWithFallback'),
  } = options;

  // First attempt: try to parse directly
  try {
    return safeJsonParse<T>(content);
  } catch (parseError) {
    // Log warning with the content that failed to parse
    logger.warn(
      `Initial JSON parsing failed for ${errorContext}. Attempting fix with DeepSeek.`,
    );
    logger.warn(
      `Failed content (first 500 chars): ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`,
    );
    logger.warn(
      `Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
    );

    // Fallback: Use DeepSeek to fix the malformed JSON
    const fixPrompt = FormattingPrompts.FIX_JSON_PROMPT(
      content,
      parseError instanceof Error ? parseError.message : String(parseError),
    );

    const fixedJsonResult = await deepseekService.generate(fixPrompt, {
      model: DeepseekModel.DEEPSEEK_CHAT,
      maxTokens,
    });

    // Second attempt: try to parse the fixed JSON
    try {
      const result = safeJsonParse<T>(fixedJsonResult.content);
      logger.log(
        `Successfully fixed and parsed ${errorContext} JSON using DeepSeek`,
      );
      return result;
    } catch (retryParseError) {
      // Log the final failure
      logger.error(
        `Failed to parse ${errorContext} JSON even after DeepSeek fix attempt`,
      );
      logger.error(
        `Fixed content (first 500 chars): ${fixedJsonResult.content.substring(0, 500)}${fixedJsonResult.content.length > 500 ? '...' : ''}`,
      );
      logger.error(
        `Retry parse error: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
      );

      throw new BadRequestException(
        `Failed to parse ${errorContext} JSON after fix attempt: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
      );
    }
  }
}
