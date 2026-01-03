import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import {
  ScriptFAQ,
  ScriptSection,
} from 'src/modules/posts-management/library/interfaces/post-interview.interface';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';

export type FAQResult = {
  questions: string[];
  answers: string[];
};

export class PostGenerationPrompts {
  private static readonly FORMATTING_RULES = `
## CRITICAL FORMATTING RULES

**Content Formatting:**
- Write plain text content suitable for blog publishing
- DO NOT use markdown formatting (bold, italic, headers, etc.)
- DO NOT use special characters for styling (*, _, #, etc.)
- Write naturally flowing paragraphs as they would appear in a published blog post

**Link Formatting (ONLY Exception):**
- Links MUST be in markdown format: [link text](url)
- ONLY use links that are explicitly provided in the prompt
- NEVER create, invent, or hallucinate links that were not provided
- If no links are provided, do not include any links in the content

**Output Format:**
- Return ONLY a valid JSON object (no additional text, explanations, or formatting)
- DO NOT wrap JSON in code blocks, backticks, or any other formatting characters
- Ensure proper JSON syntax (double quotes, no trailing commas)
`;

  static readonly COPYWRITER_INTRODUCTION_PROMPT = (
    postInterview: PostInterview,
  ): LLMPrompt => {
    const {
      mainKeyword,
      secondaryKeywords,
      userDescription,
      keywordDensityTarget,
      language,
      toneOfVoice,
      targetAudience,
      generatedScriptDefinition,
    } = postInterview;

    if (!generatedScriptDefinition) {
      throw new Error('Generated script definition not found');
    }

    const systemPrompt = `You are an expert SEO copywriter. You are being given the task to write the introduction of a SEO optimized blog article.

    **Objectives:**
    - Reflect the purpose and angle from introductionDescription
    - Stay aligned with the h1 and the post metadata topics
    - Naturally incorporate relevant ideas from tags

    ## CRITICAL WORD COUNT REQUIREMENT
    **YOU MUST write EXACTLY ${generatedScriptDefinition.head.introductionLengthRange?.[0]} - ${generatedScriptDefinition.head.introductionLengthRange?.[1]} words total for the introduction.**
    Count your words carefully. If your draft is too short, expand it with more detail, examples, or context. If it's too long, condense it while keeping all key points.
    The word count is STRICTLY ENFORCED. Do not exceed or fall below these limits.
    
    ### Paragraph Word Count Rules (STRICTLY ENFORCED)
    - **Standard paragraphs**: 40-80 words each
    - **Critical paragraphs**: Up to 120 words maximum (only when absolutely necessary and highly readable)
    - **Introduction structure**: Create multiple paragraphs (typically 3-8 paragraphs) to reach the introduction word count target
    - **If content exceeds limits**: Split long paragraphs into multiple shorter ones

    **Output Format:**
    Return ONLY a JSON object with this structure (no additional text):
    --- BEGIN OUTPUT FORMAT TEMPLATE ---
    {
      "blocks": [
        {
          "type": "paragraph",
          "content": "First paragraph (40-80 words)..."
        },
        {
          "type": "paragraph",
          "content": "Second paragraph (40-80 words)..."
        }
      ]
    }
    --- END OUTPUT FORMAT TEMPLATE ---
    
    ${PostGenerationPrompts.FORMATTING_RULES}
    `;

    const userPrompt = `Write the introduction following all the specifications provided in the system instructions.
    
    **Context:**
    - Title of the post (h1): ${generatedScriptDefinition.head.h1}
    - Description for the introduction: ${generatedScriptDefinition.head.introductionDescription}
    - Post keyword intent: ${mainKeyword}
    - Post secondary keywords: ${secondaryKeywords?.join(', ')}
    - Post user description: ${userDescription}
    - Post metadata: ${generatedScriptDefinition.indexSummary}
    - Language: ${language}`;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };

  static readonly COPYWRITER_PARAGRAPH_PROMPT = (
    indexSummary: string,
    targetAudience: string,
    targetTone: string,
    section: ScriptSection,
    language: string,
  ): LLMPrompt => {
    const linksSection =
      section.links.length > 0
        ? `
    **Links to Include (MANDATORY - Do NOT create any other links):**
    ${section.links.map((link) => `- [${link.type}] ${link.url} - ${link.description}`).join('\n')}
    
    **IMPORTANT:** 
    - You MUST naturally integrate ALL the links listed above throughout the section
    - Use ONLY these links - do NOT create, invent, or add any other links
    - Format as markdown: [link text](url)
    - Distribute links naturally across paragraphs
    `
        : `
    **IMPORTANT:** No links have been provided for this section. Do NOT create or add any links.
    `;

    const systemPrompt = `You are an expert SEO copywriter. Write compelling, SEO-optimized content for this section.

    **Section Context:**
    - Title: ${section.title} (${section.level} heading - do not include in output)
    - Description: ${section.description}
    - Tone: ${targetTone}
    - Audience: ${targetAudience}
    - Article topics: ${indexSummary}
    - Language: ${language}
    ${linksSection}

    ## CRITICAL WORD COUNT REQUIREMENT
    **YOU MUST write EXACTLY ${section.lengthRange[0]} - ${section.lengthRange[1]} words total for this section.**
    Count your words carefully. If your draft is too short, expand it with more detail. If it's too long, condense it.
    The word count is STRICTLY ENFORCED. Do not exceed or fall below these limits.
    
    ### Paragraph Word Count Rules (STRICTLY ENFORCED)
    - **Standard paragraphs**: 40-80 words each
    - **Critical paragraphs**: Up to 120 words maximum (only when absolutely necessary)
    - **Section structure**: Create multiple paragraphs (typically 3-8 paragraphs) to reach the section word count target
    - **If content exceeds limits**: Split long paragraphs into multiple shorter ones

    **Output Format:**
    Return ONLY a JSON object with this structure (no additional text):
    --- BEGIN OUTPUT FORMAT TEMPLATE ---
    {
      "blocks": [
        {
          "type": "paragraph",
          "content": "First paragraph (40-80 words)..."
        },
        {
          "type": "paragraph",
          "content": "Second paragraph (40-80 words)..."
        }
      ]
    }
    --- END OUTPUT FORMAT TEMPLATE ---
    
    ${PostGenerationPrompts.FORMATTING_RULES}
    `;

    const userPrompt = `Write the section content following all the specifications provided in the system instructions.`;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };

  static readonly COPYWRITER_FAQ_PROMPT = (
    indexSummary: string,
    targetAudience: string,
    targetTone: string,
    faq: ScriptFAQ,
  ): LLMPrompt => {
    const systemPrompt = `You are an expert SEO copywriter. Write a compelling, SEO-optimized FAQ section.

    **Objectives:**
    - Reflect the purpose and angle from description
    - Stay aligned with article topics
    - Keep tone engaging and suitable for the target audience

    ## CRITICAL WORD COUNT REQUIREMENT
    **YOU MUST write approximately 300-600 words total across all questions and answers combined.**
    Count your words carefully. If your draft is too short, expand answers with more detail. If it's too long, condense answers or reduce questions.
    The word count is STRICTLY ENFORCED. Do not exceed or fall below these limits.

    **Output Format:**
    Return ONLY a JSON object with this structure (no additional text):
    --- BEGIN OUTPUT FORMAT TEMPLATE ---
    {
      "questions": ["Question 1?", "Question 2?"],
      "answers": ["Answer 1...", "Answer 2..."]
    }
    --- END OUTPUT FORMAT TEMPLATE ---
    
    ${PostGenerationPrompts.FORMATTING_RULES}
    `;

    const userPrompt = `Write the FAQ section following all the specifications provided in the system instructions.
    
    **Context:**
    - Description: ${faq.description}
    - Article topics: ${indexSummary}
    - Tone: ${targetTone}
    - Audience: ${targetAudience}`;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };
}
