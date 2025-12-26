import { Injectable } from '@nestjs/common';
import cleanWebContent from 'src/library/parsing/clean-webpage-text.util';
import { executeWithRateLimit } from 'src/library/rate-limit.util';
import {
  AnthropicModel,
  AntrophicService,
} from 'src/modules/llm-manager/antrophic.service';
import { ExaService } from 'src/modules/llm-manager/exa.service';
import {
  OpenaiModel,
  OpenaiService,
} from 'src/modules/llm-manager/openai.service';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';
import {
  SERP_ResearchPlan,
  SERP_ResearchSearchResults,
  SERP_SearchResult,
} from '../library/interfaces/serp.interfaces';
import {
  ResearchPrompts,
  RESPONSE_SummarizeSERP_SearchResults,
} from '../library/prompting/research.prompts';
import { ScriptGenerationPrompts } from '../library/prompting/script-generation.prompts';

@Injectable()
export class GeneratePostScript_Pipeline {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly exaService: ExaService,
    private readonly antrophicService: AntrophicService,
  ) {}

  async STEP_generateResearchPlanForSerpQueries(
    postInterview: PostInterview,
  ): Promise<SERP_ResearchPlan> {
    const researchPlanForSerpQueriesPrompt =
      ResearchPrompts.PROMPT_CreateResearchPlanForSerpQueries(postInterview);

    // Using OpenAI GPT 5.2 mini
    const researchPlanForSerpQueriesResult = await this.openaiService.generate(
      researchPlanForSerpQueriesPrompt,
      {
        model: OpenaiModel.GPT_52_MINI,
        maxTokens: 8092,
      },
    );

    // TODO: Implement fallbacks here
    const parsedResult = JSON.parse(
      researchPlanForSerpQueriesResult.content,
    ) as SERP_ResearchPlan;

    return parsedResult;
  }

  async STEP_gatherExaResearchResults(
    exaResearchPlan: SERP_ResearchPlan,
  ): Promise<SERP_ResearchSearchResults[]> {
    return executeWithRateLimit(
      exaResearchPlan.researchQueries,
      async (query) => {
        const exaResults = await this.exaService.search({
          query: query.query,
          numResults: 2,
        });

        const searchResults: SERP_SearchResult[] = exaResults.results.map(
          (result) => ({
            url: result.url ?? '',
            title: result.title ?? '',
            author: result.author ?? '',
            content: result.text,
            searchIntentQuery: query.query,
          }),
        );

        return {
          query,
          searchResults,
        };
      },
      3, // Limit to 3 requests per second to stay within EXA rate limits
    );
  }

  async STEP_summarizeExaResearchResults(
    exaResearchResults: SERP_ResearchSearchResults[],
  ) {
    const cleanedExaResearchResults: SERP_SearchResult[] = [];
    // Clean each individual search result so batching uses per-URL content
    for (const { searchResults } of exaResearchResults) {
      for (const searchResult of searchResults) {
        cleanedExaResearchResults.push({
          ...searchResult,
          content: cleanWebContent(searchResult.content),
        });
      }
    }

    // Sort results by content length (shortest first) for better batching
    cleanedExaResearchResults.sort(
      (a, b) => a.content.length - b.content.length,
    );

    // Batching if web content in short, maximum, 10k chars per batch
    const batchedExaResearchResults: SERP_SearchResult[][] = [];
    let currentBatch: SERP_SearchResult[] = [];
    let currentBatchLength = 0;

    for (const result of cleanedExaResearchResults) {
      const resultContentLength = result.content.length;

      // If adding this result would exceed 10k chars, start a new batch
      if (
        currentBatchLength + resultContentLength > 10000 &&
        currentBatch.length > 0
      ) {
        batchedExaResearchResults.push(currentBatch);
        currentBatch = [result];
        currentBatchLength = resultContentLength;
      } else {
        currentBatch.push(result);
        currentBatchLength += resultContentLength;
      }
    }

    // Add the last batch if it has content
    if (currentBatch.length > 0) {
      batchedExaResearchResults.push(currentBatch);
    }

    // Process each batch in parallel
    const batchPromises = batchedExaResearchResults.map(async (batch) => {
      const summarizeExaResearchResultsPrompt =
        ResearchPrompts.PROMPT_SummarizeSERP_SearchResults(batch);
      const summaryResponse = await this.openaiService.generate(
        summarizeExaResearchResultsPrompt,
        {
          model: OpenaiModel.GPT_52_MINI,
          maxTokens: 8096,
        },
      );

      // TODO: Implement fallbacks
      const parsedSummaryResponse = JSON.parse(
        summaryResponse.content,
      ) as RESPONSE_SummarizeSERP_SearchResults;
      return parsedSummaryResponse;
    });

    const batchResults = await Promise.all(batchPromises);
    const summarizedSERPResults: RESPONSE_SummarizeSERP_SearchResults = [];

    for (const batchResult of batchResults) {
      summarizedSERPResults.push(...batchResult);
    }

    return summarizedSERPResults;
  }

  async STEP_optimizeSERP_SearchResults(
    summarizedSERPResults: RESPONSE_SummarizeSERP_SearchResults,
  ) {
    const optimizeSERP_SearchResultsPrompt =
      ResearchPrompts.PROMPT_OptimizeSERP_SearchResults(summarizedSERPResults);
    const optimizeSERP_SearchResultsResult = await this.openaiService.generate(
      optimizeSERP_SearchResultsPrompt,
      {
        model: OpenaiModel.GPT_52_MINI,
        maxTokens: 8096,
      },
    );

    // TODO: Implement fallbacks
    const parsedOptimizeSERP_SearchResultsResult = JSON.parse(
      optimizeSERP_SearchResultsResult.content,
    ) as RESPONSE_SummarizeSERP_SearchResults;
    return parsedOptimizeSERP_SearchResultsResult;
  }

  async STEP_createScriptDraft(
    postInterview: PostInterview,
    serpKnowledgeBase: RESPONSE_SummarizeSERP_SearchResults,
  ): Promise<string> {
    const createScriptDraftPrompt =
      ScriptGenerationPrompts.GENERATE_SEO_POST_SCRIPT_BASE_PROMPT({
        postInterview,
        summarizedSERPKnowledgeBase: serpKnowledgeBase,
      });
    const createScriptDraftResult = await this.antrophicService.generate(
      createScriptDraftPrompt,
      {
        model: AnthropicModel.CLAUDE_SONNET_4_5,
        maxTokens: 20480,
      },
    );

    return createScriptDraftResult.content;
  }

  async STEP_optimizeScriptDraft(
    postInterview: PostInterview,
    serpKnowledgeBase: RESPONSE_SummarizeSERP_SearchResults,
    scriptText: string,
  ): Promise<string> {
    const optimizeScriptDraftPrompt =
      ScriptGenerationPrompts.OPTIMIZE_SEO_SCRIPT_WORD_LENGTH_LINKS_AND_IMAGES_PROMPT(
        {
          postInterview,
          serpKnowledgeBase,
          scriptText,
        },
      );
    const optimizeScriptDraftResult = await this.antrophicService.generate(
      optimizeScriptDraftPrompt,
      {
        model: AnthropicModel.CLAUDE_SONNET_4_5,
        maxTokens: 20480,
      },
    );

    return optimizeScriptDraftResult.content;
  }

  /**
   * Pipeline to generate a script from a post interview
   */
  async generateScriptFromPostInterview(postInterview: PostInterview) {
    // 1. Create research plan for SERP queries
    await this.STEP_generateResearchPlanForSerpQueries(postInterview);

    // 2. Gather EXA research results
  }
}
