import {
  ScriptFAQ,
  ScriptSection,
} from 'src/modules/posts-management/library/interfaces/post-interview.interface';
import { PostInterview } from '../../../posts-management/schemas/post-interview.schema';

export class ScriptsPrompting {
  static readonly GENERATE_SEO_SCRIPT_PROMPT = (
    postInterview: PostInterview,
  ) => {
    // Extract properties from PostInterview
    const {
      language,
      mainKeyword,
      secondaryKeywords = [],
      keywordDensityTarget = 0.017,
      searchIntent,
      targetAudience,
      toneOfVoice,
      minWordCount,
      maxWordCount,
      needsFaqSection = true,
      userDescription,
      mentionsBrand = false,
      brandName,
      brandDescription,
      imagesConfig,
      includeInternalLinks = true,
      includeExternalLinks = true,
      internalLinksToUse = [],
      externalLinksToUse = [],
      maxInternalLinks,
      maxExternalLinks,
      notesForWriter,
    } = postInterview;

    // Extract image configuration with proper defaults
    const aiImagesCount = imagesConfig?.aiImagesCount ?? 0;
    const useUserImages = imagesConfig?.useUserImages ?? false;
    const userImages = imagesConfig?.userImages ?? [];

    // Calculate total desired images
    const totalDesiredImages =
      aiImagesCount + (useUserImages ? userImages.length : 0);

    // Conditional helpers
    const wantsLinks = includeInternalLinks || includeExternalLinks;

    const hasUserImages = useUserImages && userImages.length > 0;
    const hasAnyImages =
      totalDesiredImages > 0 || aiImagesCount > 0 || hasUserImages;

    const linksSection = wantsLinks
      ? `
  ### Link Strategy
  
  - **Include internal links?** ${includeInternalLinks ? 'Yes' : 'No'}
  ${
    includeInternalLinks
      ? `- **Internal links to consider**: ${internalLinksToUse.length ? internalLinksToUse.join(', ') : '_none provided_'}
  - **Max internal links**: ${maxInternalLinks ?? 'not specified'}`
      : ''
  }
  - **Include external links?** ${includeExternalLinks ? 'Yes' : 'No'}
  ${
    includeExternalLinks
      ? `- **External links to consider**: ${externalLinksToUse.length ? externalLinksToUse.join(', ') : '_none provided_'}
  - **Max external links**: ${maxExternalLinks ?? 'not specified'}`
      : ''
  }
  `.trim()
      : `
  ### Link Strategy
  
  - No internal or external links should be suggested for this article.`.trim();

    const imageSection = hasAnyImages
      ? `
  ### Image Strategy
  
  - **Total desired images**: ${totalDesiredImages}
  - **Max AI-generated images**: ${aiImagesCount}
  - **User will provide images?** ${useUserImages ? 'YES' : 'NO'}
  - **User images available**:
  ${
    hasUserImages
      ? userImages
          .map(
            (img) =>
              `  - Source: \`${img.sourceType}:${img.sourceValue}\` — Alt: ${
                img.suggestedAlt || 'none'
              } — Notes: ${img.notes || 'none'}`,
          )
          .join('\n')
      : '  - None'
  }
  `.trim()
      : `
  ### Image Strategy
  
  - No images should be planned for this article.`.trim();

    const faqSection = needsFaqSection
      ? `
  ### 3.4. FAQ Section (if enabled)
  
  Since \`needsFaqSection\` is **true**, include at the end:
  
  \`\`\`markdown
  ## Frequently Asked Questions
  
  - **FAQ word count**: [MIN] - [MAX] words (MUST specify exact range)
  
  ### Question 1
  - **Short expected answer**: ...
  
  ### Question 2
  - **Short expected answer**: ...
  \`\`\`
  
  Create **4–8 FAQs** based on the real search intent and People-Also-Ask patterns.
  Each answer should be concise (to be expanded later).
  **MUST specify the total word count for the entire FAQ section.**
  `.trim()
      : '';

    const faqNote = needsFaqSection
      ? ''
      : `> Note: FAQ section must NOT be included because \`needsFaqSection\` is false.`.trim();

    const linkRules = wantsLinks
      ? `
  ## 5. Internal & External Links
  
  Respect the user's settings.
  
  ### Internal links
  ${
    includeInternalLinks
      ? `- Use ONLY the provided internal URLs.
  - Suggest natural anchor text.
  - Include internal link suggestions *inside each relevant section* under “Internal link suggestions”.`
      : `- Do NOT suggest internal links.`
  }
  
  ### External links
  ${
    includeExternalLinks
      ? `- Suggest the **type** of authoritative source, not competitors.
  - Include suggestions inside the relevant sections.`
      : `- Do NOT suggest external links.`
  }
  `.trim()
      : `
  ## 5. Internal & External Links
  
  - No link suggestions of any kind.`.trim();

    const brandSection = mentionsBrand
      ? `
  ## 6. Brand Mentions
  
  Since brand mentions are required:
  
  - Include the brand **${brandName || 'the brand'}** in:
    - One dedicated subsection (case study, solution, etc.).
    - One or two subtle mentions elsewhere (only where natural).
  
  Brand context: ${brandDescription || 'no description provided'}.
  
  Avoid spammy or forced mentions.`.trim()
      : `
  ## 6. Brand Mentions
  
  - No brand mention is required.`.trim();

    const imagePlacementRules = hasAnyImages
      ? `
  ### Image Placement Rules (within sections)
  
  1. Total image blocks MUST NOT exceed \`totalDesiredImages\`.
  2. AI image blocks MUST NOT exceed \`aiImagesCount\`.
  3. If user images exist, prioritize them.
  4. Only use AI images when slots remain.
  5. Include image blocks **directly within the relevant section** where they should appear.
  
  ### Image Block Format (include in section descriptions)
  
  When an image should be placed in a section, include it in the section's description using this format:
  
  #### User images
  \`\`\`user-image
  sourceType: "user" | "ai_generated"
  sourceValue: "URL or ID or identifier"
  description: "Short descriptive context"
  alt: "SEO-friendly alt text in ${language}"
  \`\`\`
  
  #### AI images
  \`\`\`ai-image
  description: "Clear prompt for image generation"
  alt: "SEO-friendly alt text in ${language}"
  \`\`\`
  
  Place these blocks within the section description where the image should appear in the content flow.
  `.trim()
      : '';

    return `
  You are an elite-level SEO strategist and senior copy chief.  
  Your task is NOT to write the full article, but to create a **complete SEO script (outline/blueprint)** for a long-form blog post.
  
  All output MUST:
  - Be written in **${language}**
  - Use **Markdown**
  - Be programmatically simple (no horizontal rules \`---\`)
  
  ---
  
  ## 1. Input Data (Context)
  
  - **Main keyword**: \`${mainKeyword}\`
  - **Secondary keywords**: ${
    secondaryKeywords.length
      ? secondaryKeywords.map((k) => `\`${k}\``).join(', ')
      : '_none provided_'
  }
  - **Keyword density target**: ${(keywordDensityTarget * 100).toFixed(2)}%
  - **Search intent**: \`${searchIntent}\`
  - **Target audience**: ${targetAudience}
  - **Tone of voice**: \`${toneOfVoice}\`
  - **Desired article length**: ${
    minWordCount || maxWordCount
      ? `${minWordCount ?? 'unspecified'}–${maxWordCount ?? 'unspecified'} words`
      : 'unspecified (default 1500–4000)'
  }
  - **User description**: ${userDescription || '_none provided_'}
  - **Notes for writer**: ${notesForWriter || '_none provided_'}
  - **Brand required**: ${
    mentionsBrand
      ? `YES — ${brandName || 'brand'} (${brandDescription || 'no description'})`
      : 'No'
  }
  
  ${linksSection}
  
  ${imageSection}
  
  ---
  
  ## 2. Your Goal
  
  Create a **detailed SEO script** that:
  1. Is optimized to rank for **${mainKeyword}**
  2. Fully satisfies **${searchIntent}** intent
  3. Uses **H1, H2, H3, occasional H4**
  4. Includes:
     - Keyword & semantic guidance
     - Internal/external link placement (if enabled)
     - Image placement blocks (if enabled)
  5. Fully satisfies the desired article length. Distribute the size of each section to match the user word range requirement.
  
  Please, research in the web when you need to obtain updated information
  Include the source and the details of the information in the description of each section or introduction so the writter 
  without internet access can use it to write the content.
  ---
  
  ## 3. Output Format (Markdown)
  
  ### 3.1. Title & Meta
  - Provide an H1 with the main keyword
  - Introduction description: Explain what problem the article will solve.
Mention the main keyword naturally once.
Include either a micro-storytelling element or a relevant fact or statistic.
You must describe the points of the introduction to allow the writer to develop it later
You can include real world information here
  - **Introduction word count**: Specify the word count range for the introduction (e.g., "Introduction word count: 250 - 350 words")
  - Specify the target word count for the article as mentioned in the input data

  - Optional slug + tags
  
  ### 3.2. “General Structure of the Article”
  List H2/H3/H4 headings with 1–2 line summaries. Add the estimated word count for each section and make sure that the sum of all the sections + introduction + FAQ matches the user word range requirement.
  
  ### 3.3. Detailed Section Scripts
  
  Use this pattern:
  
  \`\`\`markdown
  ## H2 – [Heading]
  
  - **Purpose**
  - **Estimated word count**: [MIN] - [MAX] words (MUST specify exact range, e.g., "300 - 450 words")
  - **Search intent covered**
  - **Main points**
  - **Examples / comparisons**
  - **Keyword usage**
  - **Internal link suggestions** (if enabled)
  - **External link suggestions** (if enabled)
  ${hasAnyImages ? '- **Image blocks** (if applicable): Include image blocks directly here using the format specified in Image Placement Rules' : ''}
  - **Tone notes**
  \`\`\`
  
  **CRITICAL WORD COUNT REQUIREMENTS:**
  - You MUST specify word count ranges for EVERY section (H2, H3, H4)
  - You MUST specify word count for the introduction (typically 8-12% of total: ${minWordCount && maxWordCount ? `${Math.round(minWordCount * 0.1)} - ${Math.round(maxWordCount * 0.1)} words` : '200-400 words'})
  ${needsFaqSection ? `- You MUST specify word count for the FAQ section (typically 5-10% of total: ${minWordCount && maxWordCount ? `${Math.round(minWordCount * 0.075)} - ${Math.round(maxWordCount * 0.075)} words` : '300-600 words'})` : ''}
  - The SUM of all section word counts (intro + body sections + FAQ) should equal approximately ${minWordCount && maxWordCount ? `${minWordCount} - ${maxWordCount} words` : 'the target article length'}
  - Format word counts clearly as: "Estimated word count: 300 - 450 words" or "Word count: 250-400"
  
  ${faqSection}
  
  ${imagePlacementRules}
  
  ${linkRules}
  
  ${brandSection}
  
  ## 7. Style Requirements
  - Human, expert, natural tone
  - Rich vocabulary
  - Deep explanations
  - Full search-intent satisfaction
  
  ---
  
  ## 8. Final Instruction
  Produce the **full SEO script** now in **${language}**, using **pure Markdown**.
  
  ${faqNote}
  `;
  };

  static readonly FORMAT_SEO_SCRIPT_TO_JSON_PROMPT = (
    script: string,
    minWordCount?: number,
    maxWordCount?: number,
    needsFaqSection?: boolean,
  ) => {
    const hasWordCountTarget = minWordCount && maxWordCount;
    const wordCountValidation = hasWordCountTarget
      ? `
## WORD COUNT VALIDATION (Reference Only)

The target article length is ${minWordCount} - ${maxWordCount} words. Use this as a reference to verify that the word counts extracted from the script are reasonable, but DO NOT recalculate or redistribute them. Extract exactly what the script designer specified.
`
      : '';

    return `
Act as a strict converter from unstructured text to structured JSON.

Task:
I will give you a plain-text outline/script for an SEO article. Your job is to convert it EXACTLY into the following JSON format. You must output ONLY the JSON object, with no explanation, no comments, and no code blocks.

type Image = {
  sourceType: 'user' | 'ai_generated';
  sourceValue?: string;
  description?: string;
  alt?: string;
};

type ScriptSection = {
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

type ScriptFormatDefinition = {
  indexSummary: string;
  head: {
    h1: string;
    introductionDescription: string;
    slug: string;
    tags: string[];
    introductionLengthRange?: [number, number];
  };
  body: {
    sections: ScriptSection[];
  };
  faq?: {
    description: string;
    lengthRange?: [number, number];
  };
};

Important instructions:

1. RESPONSE FORMAT
   - Output ONLY a valid JSON object that matches ScriptFormatDefinition exactly.
   - Do NOT include any text before or after the JSON.
   - Do NOT use code blocks, backticks, or comments.

   - "indexSummary" RULES: It must be a summary of the general structure of the article. 
   One line with the title and a summary of 30 - 40 words of the content of that section and specifying if is an H2, H3 or H4
   1 Line per section with the format [H2|H3|H4] Title: Summary + The estimated length of each section
   THE SUM OF ALL THE CONTENT OF THE SECTIONS + INTRODUCTION + FAQ SHOULD MATCH THE USER WORD RANGE REQUIREMENT

2. "head" RULES
   - h1: main title of the article (extracted from the outline, or create a concise descriptive one if missing).
   - introductionDescription: Include the description of the introduction for the writter. Add the story telling and description planned by the script.
   - introductionLengthRange (optional): [minWords, maxWords] for the introduction section.
     **EXTRACT the word count from the script if specified. If not specified in the script, leave it undefined.**
   - slug: URL-friendly version of the h1 (lowercase, hyphens, no special characters).
   - tags: 3 to 8 core keywords or topics as an array of strings.

3. "body.sections" RULES
   - Each section must represent a logical part of the outline (main topics, subtopics, subsections).
   - level:
     - h2: main sections of the article.
     - h3 / h4: subsections logically nested under higher levels.
   - title: clean, descriptive title for the section.
   - id: unique string per section, formatted as "sec-1", "sec-2", "sec-3", etc., following order.
   - lengthRange: [minWords, maxWords] estimated for that section.
     **CRITICAL: EXTRACT the exact word count range specified in the script for each section.**
     - Look for phrases like "Estimated word count: X-Y words", "Word count: X-Y", "X-Y words", etc.
     - If the script explicitly mentions a word count for a section, use that EXACTLY.
     - If NO word count is mentioned in the script for a section, use a reasonable default: 250-400 words for main sections, 150-300 for subsections.
     - DO NOT calculate or redistribute word counts based on total article length. The script designer has already planned this.
   - description: A clear explanation of what the section should contain (guidelines for the writer/AI). Add what has been planned in the script. **IMPORTANT**: If the section description contains image blocks (\`\`\`user-image or \`\`\`ai-image), extract them to the images array and remove the image block syntax from the description, keeping only the descriptive text.
   - images (optional):
     - **CRITICAL**: Extract image blocks from the section description if present.
     - Look for code blocks with \`\`\`user-image or \`\`\`ai-image markers within the section description.
     - For each image block found:
       - Extract all fields from the block (sourceType, sourceValue, description, alt)
       - Remove the image block syntax from the section description
       - Add the image to the images array
     - Must follow the Image type structure:
       - sourceType: "user" if sourceType is "user" in the block, "ai_generated" if sourceType is "ai_generated" or if it's an \`\`\`ai-image block
       - sourceValue (optional): extract from the block if present, or use a short indication of the image type
       - description (optional): extract the description from the block - this should be the prompt for AI generation or context for user images
       - alt (optional): extract the alt text from the block, or generate SEO-friendly alt text if not provided
     - If no image blocks are found in the section, leave images undefined or empty.
   - links:
     - internal: array of suggested internal link targets (slugs or conceptual placeholders).
     - external: array of generic resource descriptions (e.g., "Google ranking factors study", "Official schema.org docs").
       → Do NOT include real URLs.

4. "faq" RULES
   - description: a clear explanation of what the FAQ section should contain (guidelines for the writer/AI).
   - Find suitable questions and write them in the description. If it's short, provide the answers
   - One line per question and answer or description.
   - lengthRange (optional): [minWords, maxWords] for the FAQ section.
     **EXTRACT the word count from the script if specified. If not specified in the script, leave it undefined.**
   ${needsFaqSection ? '- FAQ section MUST be included if present in the script.' : '- FAQ section is optional.'}

${wordCountValidation}

5. STYLE & CONSISTENCY
   - Preserve the language of the original outline (if the outline is in English, keep everything in English).
   - You may:
     - Complete unclear titles.
     - Group scattered bullet points into coherent sections.
     - Add an introduction or conclusion if necessary for a complete article structure.
   - Ensure consistent hierarchy logic between h1 → h2 → h3 → h4.
   - Please, research in the web when you need to obtain updated information
   Don't shorten much the information, try to keep the description of each section or introduction respecting the given online,
   just focus on parsing that information in the JSON not summarizing it

6. VALIDATION REQUIREMENTS
   - JSON must be fully valid: double quotes only, no trailing commas.
   - All required fields must be present:
     - head.h1, head.introductionDescription, head.slug, head.tags
     - body.sections
     - Each Section must contain: id, level, title, lengthRange, description, links (internal + external).

Now I will provide the outline. Convert it into the required JSON format and return ONLY the JSON.
DONT USE ANY CHARACTERS THAT CAUSE JSON FORMATTING ERRORS

=== OUTLINE ===
${script}
=== END OUTLINE ===
`;
  };

  static readonly COPYWRITER_INTRODUCTION_PROMPT = (
    indexSummary: string,
    h1: string,
    introductionDescription: string,
    targetAudience: string,
    targetTone: string,
    lengthRange?: [number, number],
  ) => {
    const wordCountInstruction = lengthRange
      ? `
## CRITICAL WORD COUNT REQUIREMENT

**YOU MUST write EXACTLY ${lengthRange[0]} - ${lengthRange[1]} words.**

This is a HARD REQUIREMENT. Your response must be within this range:
- Minimum: ${lengthRange[0]} words
- Maximum: ${lengthRange[1]} words

Count your words carefully. If your draft is too short, expand it with more detail, examples, or context. If it's too long, condense it while keeping all key points.

The word count is STRICTLY ENFORCED. Do not exceed or fall below these limits.
`
      : `
## Word Count Guidance

Aim for approximately 200-400 words for the introduction. Be comprehensive but concise.
`;

    return `
You are an expert SEO copywriter. 
Write a compelling, SEO-optimized introduction for the article. 
The intro should reflect the purpose and angle suggested in introductionDescription, stay aligned with the topic in h1, and naturally use relevant ideas from the tags. 
Keep the tone ${targetTone}, engaging, and suitable for high-quality SEO content for ${targetAudience} audience.

The title is ${h1}
Match this description: ${introductionDescription}

The topics of the article are ${indexSummary}

${wordCountInstruction}

Return ONLY the paragraph of the introduction with no additional text of instructions.
    `;
  };

  static readonly COPYWRITER_PARAGRAPH_PROMPT = (
    indexSummary: string,
    targetAudience: string,
    targetTone: string,
    section: ScriptSection,
  ) => {
    return `You are an expert SEO copywriter. 

Write a compelling, SEO-optimized paragraph for the section.
The paragraph should reflect the purpose and angle suggested in sectionDescription, stay aligned with the topic in sectionTitle, and naturally use relevant ideas from the tags.
Keep the tone ${targetTone}, engaging, and suitable for high-quality SEO content for ${targetAudience} audience.

Title ${section.title} (don't include, just for content reference)
The level of this paragraph is inside a ${section.level} heading.
Description: ${section.description}

## CRITICAL WORD COUNT REQUIREMENT

**YOU MUST write EXACTLY ${section.lengthRange[0]} - ${section.lengthRange[1]} words for this section.**

This is a HARD REQUIREMENT. The total word count of all paragraph blocks combined must be within this range:
- Minimum: ${section.lengthRange[0]} words
- Maximum: ${section.lengthRange[1]} words

**How to ensure correct word count:**
1. Count words in your response carefully
2. If your draft is too short (below ${section.lengthRange[0]} words):
   - Add more detail, examples, or explanations
   - Expand on key points mentioned in the description
   - Include relevant context or background information
3. If your draft is too long (above ${section.lengthRange[1]} words):
   - Condense sentences while keeping all key points
   - Remove redundant information
   - Combine similar ideas

The word count is STRICTLY ENFORCED. Your response will be rejected if it doesn't meet this requirement.

For context with other sections, the topics of the article are ${indexSummary}

Return only the paragraph of the section in a JSON format matching the following type structure.
Use one paragraph block per contextual paragraph of the content.
PostBlock {
  type: "paragraph";
  content: string;
}

Your result should be in this JSON format, plain JSON, no formatting or additional text.
{
    "blocks": PostBlock[]
}

**REMINDER: Total words across all blocks MUST be ${section.lengthRange[0]} - ${section.lengthRange[1]} words.**
`;
  };

  static readonly COPYWRITER_FAQ_PROMPT = (
    indexSummary: string,
    targetAudience: string,
    targetTone: string,
    faq: ScriptFAQ,
  ) => {
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

    return `You are an expert SEO copywriter. 
    Write a compelling, SEO-optimized FAQ section for the article.
    The FAQ section should reflect the purpose and angle suggested in sectionDescription, stay aligned with the topic in sectionTitle, and naturally use relevant ideas from the tags.
    Keep the tone ${targetTone}, engaging, and suitable for high-quality SEO content for ${targetAudience} audience.

    For context with other sections, the topics of the article are ${indexSummary}
    Match this description: ${faq.description}

    ${wordCountInstruction}

    Return ONLY the FAQ section with no additional text of instructions.
    You must return it in JSON format plain text matching the following structure
    dont add any additional formatting characters, just plain JSON text

{
  questions: string[];
  answers: string[];
}

**REMINDER: Total words across all questions and answers MUST be ${faq.lengthRange ? `${faq.lengthRange[0]} - ${faq.lengthRange[1]} words` : 'approximately 300-600 words'}.**
  `;
  };
}
