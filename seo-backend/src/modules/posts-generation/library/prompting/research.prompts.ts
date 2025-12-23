import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';

export type RESPONSE_CreateResearchPlanForSerpQueries = {
  researchQueries: [
    {
      intent: 'definition | official_docs | best_practices | how_to | statistics | comparisons | common_mistakes | use_cases | case_studies';
      query: string;
      priority: 1 | 2 | 3;
    },
  ];
};

export class ResearchPrompts {
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
- Assume the research will be filtered by authoritative domains later

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
- Generate 5–8 research queries total
- Each query must serve a DISTINCT information need
- Queries must be suitable for discovering authoritative sources
- Avoid redundancy between queries

OUTPUT JSON STRUCTURE:
{
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
}
