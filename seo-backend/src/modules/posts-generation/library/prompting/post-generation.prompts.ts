import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import {
  ScriptFAQ,
  ScriptSection,
} from 'src/modules/posts-management/library/interfaces/post-interview.interface';

export type FAQResult = {
  questions: string[];
  answers: string[];
};

export class PostGenerationPrompts {
  static readonly COPYWRITER_INTRODUCTION_PROMPT = (
    indexSummary: string,
    h1: string,
    introductionDescription: string,
    targetAudience: string,
    targetTone: string,
    lang: string,
    lengthRange?: [number, number],
  ): LLMPrompt => {
    const wordCountInstruction = lengthRange
      ? `
    ## CRITICAL WORD COUNT REQUIREMENT
    
    **YOU MUST write EXACTLY ${lengthRange[0]} - ${lengthRange[1]} words total for the introduction.**
    
    This is a HARD REQUIREMENT. Your response must be within this range:
    - Minimum: ${lengthRange[0]} words
    - Maximum: ${lengthRange[1]} words
    
    The language of the introduction is ${lang}.
    
    Count your words carefully. If your draft is too short, expand it with more detail, examples, or context. If it's too long, condense it while keeping all key points.
    The word count is STRICTLY ENFORCED. Do not exceed or fall below these limits.
    
    ### Paragraph Word Count Rules (STRICTLY ENFORCED)
    - **Standard paragraphs**: 40-80 words each
    - **Critical paragraphs**: Up to 120 words maximum (only when absolutely necessary and highly readable)
    - **Introduction structure**: Create multiple paragraphs (typically 3-8 paragraphs) to reach the introduction word count target
    - **If content exceeds limits**: Split long paragraphs into multiple shorter ones
    
    **How to structure the introduction:**
    1. Break content into multiple paragraphs of 40-80 words each
    2. Use 120-word paragraphs only for critical, complex explanations that cannot be split
    3. Ensure the total word count of ALL paragraphs combined = ${lengthRange[0]} - ${lengthRange[1]} words
    `
      : `
    ## Word Count Guidance
    Aim for approximately 200-400 words for the introduction. Be comprehensive but concise.
    
    ### Paragraph Structure
    - Create multiple paragraphs of 40-80 words each
    - Use 120-word paragraphs only when absolutely necessary
    - Typically 3-8 paragraphs to reach the target word count
    `;

    const systemPrompt = `You are an expert SEO copywriter. Write a compelling, SEO-optimized introduction.
    
    **Context:**
    - Title: ${h1}
    - Description: ${introductionDescription}
    - Article topics: ${indexSummary}
    - Tone: ${targetTone}
    - Audience: ${targetAudience}
    
    **Requirements:**
    - Reflect the purpose and angle from introductionDescription
    - Stay aligned with h1 topic
    - Naturally incorporate relevant ideas from tags
    - Keep tone ${targetTone}, engaging, suitable for ${targetAudience}
    
    ${wordCountInstruction}
    
    **Output Format:**
    Return ONLY a JSON object with this structure (no additional text):
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
    
    DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS
    
    **VALIDATION:**
    ${lengthRange ? `- Total words across all blocks: ${lengthRange[0]} - ${lengthRange[1]} words` : '- Total words: approximately 200-400 words'}
    - Each paragraph: 40-80 words (up to 120 if critical)
    - JSON must be valid (double quotes, no trailing commas)
    
    DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS
    `;

    const userPrompt = `Write the introduction following all the specifications provided in the system instructions.`;

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
    const isCoreSection = section.lengthRange[1] >= 400;
    const sectionGuidance = isCoreSection
      ? `This is a CORE section (400-500 words). You may need to create multiple subsections or expand content significantly.`
      : `This is a standard section (150-300 words).`;

    const linksSection =
      section.links.length > 0
        ? `
  **Links to Include (MANDATORY):**
  ${section.links.map((link) => `- [${link.type}]${link.url} - ${link.description} `).join('\n')}

  **Link Integration Requirements:**
  - You MUST naturally incorporate ALL suggested links into the content
  - Internal links should be embedded naturally within relevant paragraphs
  - External links should be used to support claims, provide authority, or cite sources
  - Links should feel organic and enhance the content, not forced
  - Distribute links throughout the section paragraphs (don't cluster them all in one place)
  `
        : '';

    const systemPrompt = `You are an expert SEO copywriter. Write compelling, SEO-optimized content for this section.

**Section Context:**
- Title: ${section.title} (${section.level} heading - do not include in output)
- Description: ${section.description}
- Tone: ${targetTone}
- Audience: ${targetAudience}
- Article topics: ${indexSummary}
- Language: ${language} MAKE SURE TO MATCH THE LANGUAGE ${language}
${linksSection}

## CRITICAL WORD COUNT REQUIREMENTS

### Section Total Word Count
**YOU MUST write EXACTLY ${section.lengthRange[0]} - ${section.lengthRange[1]} words total for this section.**
${sectionGuidance}

### Paragraph Word Count Rules (STRICTLY ENFORCED)
- **Standard paragraphs**: 40-80 words each
- **Critical paragraphs**: Up to 120 words maximum (only when absolutely necessary and highly readable)
- **Section structure**: Create multiple paragraphs (typically 3-8 paragraphs) to reach the section word count target
- **If content exceeds limits**: Split long paragraphs or create subsections (H3/H4) with their own word counts

**How to structure the section:**
1. Break content into multiple paragraphs of 40-80 words each
2. Use 120-word paragraphs only for critical, complex explanations that cannot be split
3. Ensure the total word count of ALL paragraphs combined = ${section.lengthRange[0]} - ${section.lengthRange[1]} words
4. If the section needs more than 500 words total, indicate that it should be subdivided into H3/H4 subsections

**Output Format:**
Return ONLY a JSON object with this structure (no additional text):
{
  "blocks": [
    {
      "type": "paragraph",
      "content": "First paragraph (40-80 words) with [internal link text](internal-link-slug) and [external link text](https://external-url.com)..."
    },
    {
      "type": "paragraph",
      "content": "Second paragraph (40-80 words)..."
    }
  ]
}

**Link Format in Content:**
- Internal links: Use markdown format [link text](internal link url) where the slug matches the internal link suggestion
- External links: Use markdown format [link text](https://full-url.com) with the actual URL from external link suggestions
- Links should be naturally integrated into the paragraph content, not added as separate sentences

NEVER ADD BACKTICKS, CODEBLOCK FENCES, OR FORMATTING CHARACTERS

**VALIDATION:**
- Total words across all blocks: ${section.lengthRange[0]} - ${section.lengthRange[1]} words
- Each paragraph: 40-80 words (up to 120 if critical)
${hasInternalLinks || hasExternalLinks ? `- Suggested links must be included in the content as long as they make sense` : ''}
- JSON must be valid (double quotes, no trailing commas)

DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS
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
    const wordCountInstruction = faq.lengthRange
      ? `
## CRITICAL WORD COUNT REQUIREMENT

**YOU MUST write a FAQ section with EXACTLY ${faq.lengthRange[0]} - ${faq.lengthRange[1]} total words across all questions and answers combined.**

This is a HARD REQUIREMENT. The total word count of all questions and answers must be within this range:
- Minimum: ${faq.lengthRange[0]} words
- Maximum: ${faq.lengthRange[1]} words

**How to ensure correct word count:**
1. Count words in all questions and answers combined
2. If too short: Expand answers with more detail, examples, or explanations
3. If too long: Condense answers while keeping key information, or reduce the number of questions

The word count is STRICTLY ENFORCED. Your response will be rejected if it doesn't meet this requirement.
`
      : `
## Word Count Guidance

Aim for approximately 300-600 words total across all questions and answers. Be comprehensive but concise.
`;

    const systemPrompt = `You are an expert SEO copywriter. Write a compelling, SEO-optimized FAQ section.

**Context:**
- Description: ${faq.description}
- Article topics: ${indexSummary}
- Tone: ${targetTone}
- Audience: ${targetAudience}

**Requirements:**
- Reflect purpose and angle from description
- Stay aligned with article topic
- Naturally incorporate relevant ideas
- Keep tone ${targetTone}, engaging, suitable for ${targetAudience}

${wordCountInstruction}

**Output Format:**
DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS
Return ONLY a JSON object (no additional text, no formatting characters):
{
  "questions": string[],
  "answers": string[]
}
  

**REMINDER: Total words (questions + answers) = ${faq.lengthRange ? `${faq.lengthRange[0]} - ${faq.lengthRange[1]} words` : '300-600 words'}**

DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS
`;

    const userPrompt = `Generate the FAQ section following all the specifications provided in the system instructions.`;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };
}
