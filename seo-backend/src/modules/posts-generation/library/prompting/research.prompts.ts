import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';
import {
  SERP_SearchResult,
  SERP_SearchResultMetadata,
} from '../interfaces/serp.interfaces';

export type RESPONSE_SummarizeSERP_SearchResults = {
  url: string;
  metadata: SERP_SearchResultMetadata;
}[];

export class ResearchPrompts {
  /**
   *
   * @param postInterview
   * @returns Prompt to generate JSON in format SERP_ResearchPlan
   */
  static readonly PROMPT_CreateResearchPlanForSerpQueries = (
    postInterview: PostInterview,
  ): LLMPrompt => {
    const systemPrompt = `You are a research planner for SEO content.

Your task is to generate a focused, complete set of search queries that will be used with a SERP API (Exa) to gather authoritative, up-to-date information for an SEO article.

You DO NOT write content.
You DO NOT search the web.
You ONLY plan what needs to be researched.

Think in terms of INFORMATION NEEDS, not keywords.

RULES:
- Queries must be concise, clear, and intent-driven
- Avoid generic or vague queries
- Prefer queries that surface authoritative or primary sources
- Do NOT invent brands, products, or companies
- Do NOT include URLs
- Do NOT include years unless strictly necessary

RESEARCH INTENT TYPES (use these exact values):
- definition
- official_docs
- best_practices
- how_to
- statistics
- comparisons
- common_mistakes
- use_cases
- case_studies

Generate only the intents that are relevant to the topic.
Quality > quantity.

OUTPUT FORMAT:
Return ONLY valid JSON.
Do NOT add explanations, comments, or formatting.
`;

    const userPrompt = `Generate research queries for an SEO article using the following post interview data.

POST INTERVIEW:
- Main topic / keyword: ${postInterview.mainKeyword}
${postInterview.searchIntent && `- Search intent: ${postInterview.searchIntent}`}
${postInterview.secondaryKeywords && `- Secondary keywords: ${postInterview.secondaryKeywords.join(', ')}`}
- Post description / angle: ${postInterview.userDescription}

REQUIREMENTS:
- Generate 3–6 research queries total
- Each query must serve a DISTINCT information need
- Queries must be suitable for discovering authoritative sources
- Avoid redundancy between queries

OUTPUT JSON STRUCTURE:
{
  "country": "string", // example "ES"
  "researchQueries": [
    {
      "intent": "definition | official_docs | best_practices | how_to | statistics | comparisons | common_mistakes | use_cases | case_studies",
      "query": "search query text",
      "priority": 1 | 2 | 3
    }
  ]
}
`;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };

  static readonly PROMPT_SummarizeSERP_SearchResults = (
    searchResults: SERP_SearchResult[],
  ): LLMPrompt => {
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = `
  You are a deterministic information extractor and classifier.
  
  Your task is to process SERP search results and extract structured metadata for EACH result independently.
  
  STRICT SCOPE RULES:
  - Treat every input result as a completely isolated source of truth
  - NEVER merge, compare, or cross-reference multiple results
  - NEVER use information outside the provided content
  - NEVER infer, assume, generalize, or extrapolate
  - NEVER invent facts, statistics, or claims
  - NEVER reference page content directly, we want to extract facts knowledge, not "this page says that"
  - AVOID bringing outdated information, use the most recent information available. Today's date is ${today}.
    
  FACT EXTRACTION RULES:
  - Extract ONLY facts explicitly stated in the content
  - Each fact must be a standalone, declarative, encyclopedic statement
  - Each fact must be useful for answering the search intent
  - 4–6 facts per result
  - No semantic duplication between facts
  - Do NOT reference the source, page, article, or author
  - Do NOT use phrases such as:
    - "The page says"
    - "This article explains | states | mentions"
    - "According to"
  - Facts must read as if they could appear verbatim in an SEO article
  - Only bring statistical data when it is explicitly requested with the search intent, always try to answer the query intent
  
  CONTEXT SNIPPET RULES:
  - Extract 2–4 context snippets per result
  - Each snippet must be 2–3 complete sentences
  - Prefer original wording and sentence structure from the source
  - Light trimming is allowed, paraphrasing is NOT
  - Do NOT aggressively summarize
  - Do NOT reference the page or article itself
  - Snippets must provide factual context that supports accurate writing
  
  CLASSIFICATION RULES:
  
  AUTHORITY:
  - high: official documentation, primary sources, standards bodies, major institutions
  - medium: reputable blogs, industry publications, educational websites
  
  CONTENT TYPE:
  - official_docs: official product, platform, or organization documentation
  - blog: educational or opinion-based blog content
  - research: academic, peer-reviewed, or formal research material
  - news: journalistic or reporting content
  - reference: encyclopedic, glossary-style, or definition-focused content
  
  USAGE:
  - primary: how this source should be used in an article
    - allowed values only:
      definition | guidelines | statistics | examples | comparisons | how_to
  - citationRequired:
    - true if factual claims should be explicitly cited
    - false if commonly accepted or definitional
  
  OUTPUT RULES:
  - Output ONLY valid JSON
  - Output MUST strictly follow the provided schema
  - No comments, explanations, markdown, or extra text
  - Preserve each URL EXACTLY as provided
  - Each input result MUST produce exactly one output object
  `;

    const userPrompt = `
  Extract metadata for the following SERP search results.
  
  INPUT:
  ${JSON.stringify(searchResults, null, 2)}
  
  OUTPUT FORMAT:
  [
    {
      "url": "string",
      "searchIntentQuery": "string",
      "metadata": {
        "authority": "high | medium",
        "contentType": "official_docs | blog | research | news | reference",
        "facts": [
          "string"
        ],
        "contextSnippets": [
          "string"
        ],
        "usage": {
          "primary": [
            "definition | guidelines | statistics | examples | comparisons | how_to"
          ],
          "citationRequired": true | false
        }
      }
    }
  ]
  `;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };

  static readonly PROMPT_OptimizeSERP_SearchResults = (
    summarizedSERPResults: RESPONSE_SummarizeSERP_SearchResults,
  ): LLMPrompt => {
    const systemPrompt = `
  You are an information deduplication and source selection engine.
  
  Your task is to analyze a set of sources and REMOVE those that are redundant or near-duplicate.
  You do NOT rewrite, merge, synthesize, or alter facts.
  You ONLY decide which sources to keep or remove.
  
  Each source is immutable. Facts are read-only.
  
  ========================
  GOAL
  ========================
  
  Produce a reduced knowledge base where:
  - Each remaining source adds UNIQUE informational value
  - Redundant sources are removed
  - The result is suitable for creating an SEO article outline
  
  Target size after pruning: 8–12 sources (unless fewer exist).
  
  ========================
  ALLOWED / FORBIDDEN
  ========================
  
  You MUST NOT:
  - Rewrite, rephrase, or edit facts
  - Combine information across sources
  - Create or infer new facts
  - Modify authority, contentType, or usage
  
  You MAY:
  - Compare sources by semantic overlap
  - Keep the stronger source when redundancy exists
  - Remove entire sources or redundant facts/contextSnippets
  
  ========================
  NON-REMOVABLE CASES
  ========================
  
  NEVER remove a source if:
  - authority = "high" and the overlapping source is "medium"
  - contentType = "official_docs" and overlap is with blogs
  - usage.primary includes "statistics" AND the statistics are unique
  
  ========================
  REDUNDANCY CRITERIA
  ========================
  
  Two sources are redundant if:
  - They cover the same core concepts
  - ~60% or more of facts overlap semantically
  - Neither provides a distinct angle, data point, or use case
  - Remove facts providing information about the webpage instead of the concept
  
  ========================
  SOURCE PRIORITY (DESCENDING)
  ========================
  
  When choosing between redundant sources, prefer:
  1. Higher authority (high > medium)
  2. contentType:
     official_docs > research > reference > blog > news
  3. Stronger alignment with searchIntentQuery
  4. More atomic and specific facts
  5. Less promotional language
  
  ========================
  OUTPUT
  ========================
  
  Return ONLY valid JSON.

  [
    {
      "url": "string",
      "searchIntentQuery": "string",
      "metadata": {
        "authority": "high | medium",
        "contentType": "official_docs | blog | research | news | reference",
        "facts": ["string"],
        "contextSnippets": ["string"],
        "usage": {
          "primary": [
            "definition | guidelines | statistics | examples | comparisons | how_to"
          ],
          "citationRequired": true | false
        }
      }
    }
  ]
  
  
  DO NOT INVENT ADDITIONAL FIELDS FOR THE JSON OUTPUT.
  Return ONLY the JSON output.
  DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS.
  DON'T MENTION THE REMOVED SOURCES, JUST ADD IN THE OUTPUT THE ONES REQUIRED TO BE KEEPED
  
  `;

    const userPrompt = `
  Deduplicate and prune the following knowledge base.
  
  INPUT:
  ${JSON.stringify(summarizedSERPResults, null, 2)}
  
  Rules reminder:
  - Do NOT rewrite or summarize
  - Remove only clearly redundant sources
  - Prefer authoritative and non-generic sources 
  `;

    return { systemPrompts: [systemPrompt], userPrompts: [userPrompt] };
  };
}
