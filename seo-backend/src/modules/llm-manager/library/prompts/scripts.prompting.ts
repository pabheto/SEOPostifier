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
    } = postInterview;

    // Extract image configuration with proper defaults
    // -1 means "default/auto" - let the AI decide what's reasonable
    const aiImagesCountRaw = imagesConfig?.aiImagesCount ?? 0;
    const isAutoImageMode = aiImagesCountRaw === -1;
    const aiImagesCount = isAutoImageMode ? undefined : aiImagesCountRaw;
    const useUserImages = imagesConfig?.useUserImages ?? false;
    const userImages = imagesConfig?.userImages ?? [];

    // Calculate total desired images
    // If aiImagesCount is -1 (auto mode), we'll let AI decide, so we only count user images
    const totalDesiredImages =
      (isAutoImageMode ? 0 : (aiImagesCount ?? 0)) +
      (useUserImages ? userImages.length : 0);

    const hasUserImages = useUserImages && userImages.length > 0;
    // hasAnyImages is true if: auto mode (-1), specific count > 0, or user provided images
    const hasAnyImages =
      isAutoImageMode || // Auto mode - let AI decide
      (aiImagesCount !== undefined && aiImagesCount > 0) || // Specific count > 0
      hasUserImages; // User provided images

    const imageSection = hasAnyImages
      ? `
  ### Image Strategy
  
  - **Total desired images**: ${isAutoImageMode ? 'You decide what is reasonable for this article (consider article length, topic complexity, and content structure)' : totalDesiredImages}
  - **Max AI-generated images**: ${isAutoImageMode ? 'You decide what is reasonable for this article based on content needs' : aiImagesCount}
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
  
  ${
    isAutoImageMode
      ? `1. **AI Images Count**: You decide what is reasonable for this article. Consider the article length, topic complexity, and content structure when determining how many images would enhance the content.
  2. If user images exist, prioritize them.
  3. Use AI images when they would enhance the content.
  4. Include image blocks **directly within the relevant section** where they should appear.`
      : `1. Total image blocks MUST NOT exceed \`totalDesiredImages\`.
  2. AI image blocks MUST NOT exceed \`aiImagesCount\`.
  3. If user images exist, prioritize them.
  4. Only use AI images when slots remain.
  5. Include image blocks **directly within the relevant section** where they should appear.`
  }
  
  ### Image Block Format (include in section descriptions)
  
  When an image should be placed in a section, include it in the section's description using this format:
  
  #### User images
  \`\`\`user-image
  sourceType: "user" | "ai_generated"
  sourceValue: "URL or ID or identifier"
  title: "Short, descriptive title for the image (used as img title attribute)"
  description: "Detailed description/context for the image (used as caption)"
  alt: "SEO-friendly alt text in ${language}"
  \`\`\`
  
  #### AI images
  \`\`\`ai-image
  title: "Short, descriptive title for the image (used as img title attribute)"
  description: "Clear prompt for image generation and detailed description (used as caption)"
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
  - **Brand required**: ${
    mentionsBrand
      ? `YES — ${brandName || 'brand'} (${brandDescription || 'no description'})`
      : 'No'
  }

  // LINKS
  ${
    postInterview.externalLinksToIncludeAutomatically !== undefined &&
    postInterview.externalLinksToIncludeAutomatically !== null
      ? postInterview.externalLinksToIncludeAutomatically === -1
        ? `- **External links**: You decide what is reasonable for this article. Find authoritative external links in search engines that would enhance the content. Consider the article length, topic complexity, and content structure when determining how many external links would be appropriate. Distribute them in the different sections. Format each link as \`[link text](full-url) - description\`.`
        : `- You have to find in search engines up to ${postInterview.externalLinksToIncludeAutomatically} external links to include in the article. Find them with purpose when creating the script. Distribute them in the different sections. Format each link as \`[link text](full-url) - description\`.`
      : ''
  }
  ${
    postInterview.externalLinksToUse &&
    `
    CUSTOM EXTERNAL LINKS USAGE:
  - You have to use the following external links: ${postInterview.externalLinksToUse.join(', ')}. Distribute them in the sections during the script creation.
  - When including these links in the script, format each as: \`[descriptive link text](url)\` - description of the source and usage.
  `
  }
  ${
    postInterview.internalLinksToUse &&
    `
  CUSTOM INTERNAL LINKS USAGE:
  - You have to use the following internal links: ${postInterview.internalLinksToUse.join(', ')}. Distribute them in the sections during the script creation.
  - When including these links in the script, format each as: \`[descriptive link text](slug-or-url)\` - description of the source and usage.
  `
  }
  
  ${imageSection}
  ---
  
  ## 2. Your Goal

  Create a **detailed SEO script** that:
  1. Optimizes for **${mainKeyword}** ranking
  2. Fully satisfies **${searchIntent}** intent
  3. Uses proper heading hierarchy (H1, H2, H3, H4)
  4. Includes keyword guidance, link placement (if enabled), and image blocks (if enabled)
  5. Distributes word counts across sections to match the target article length (${minWordCount && maxWordCount ? `${minWordCount} - ${maxWordCount} words` : 'as specified'})
  
  **Research Requirement:** When you need updated information, research the web and include sources and details in section/introduction descriptions so the writer (without internet access) can use them.  
  ---
  
  ## 3. Output Format (Markdown)
  
  ### 3.1. Title & Meta
  - **H1**: Create a compelling, SEO-optimized title that:
    - Includes the main keyword naturally
    - Uses power words (e.g., "Ultimate", "Complete", "Essential", "Proven", "Secret", "Powerful", "Effective", "Best", "Top", "Expert", "Advanced", "Comprehensive", "Definitive", "Master", "Revolutionary", "Breakthrough", "Game-Changing", "Must-Know", "Critical", "Vital")
    - Contains a positive or negative statement when appropriate (e.g., "Why X Works" vs "Why X Fails", "The Truth About X" vs "The Hidden Dangers of X", "How to Avoid X" vs "How to Achieve X")
    - If compatible with the user description and topic, includes a number (e.g., "5 Ways to...", "10 Best...", "7 Secrets of...", "3 Steps to...", "The Top 12...")
    - Balances all these elements naturally without forcing them
  - **Introduction description**: Explain the problem the article solves, mention the main keyword once, include micro-storytelling or relevant facts/statistics, describe points for the writer to develop later, include real-world information with sources
  - **Introduction word count**: Specify exact range (e.g., "Introduction word count: 250 - 350 words")
  - **Target article length**: ${minWordCount && maxWordCount ? `${minWordCount} - ${maxWordCount} words` : 'Specify target length'}
  - **Optional**: slug + tags (3-8 keywords)
  
  ### 3.2. "General Structure of the Article"
  List H2/H3/H4 headings with 1–2 line summaries. Add the estimated word count for each section (150-300 words standard, 400-500 for core sections only). Ensure the sum of all sections + introduction + FAQ matches the user word range requirement.
  ALWAYS SPECIFY THE HEADING LEVEL (H2|H3|H4) AND THE DESIRED WORD COUNT.
  
  ### 3.3. Detailed Section Scripts
  
  Use this pattern:
  
  \`\`\`markdown
  ## H2|H3|H4 – [Heading]
  
  - **Purpose**
  - **Estimated word count**: [MIN] - [MAX] words (MUST specify exact range: 150-300 for standard sections, 400-500 for core sections only)
  - **Search intent covered**
  - **Main points**
  - **Examples / comparisons**
  - **Keyword usage**
  ${postInterview.internalLinksToUse && postInterview.internalLinksToUse.length > 0 ? '- **Internal link suggestions (if enabled)**: For every link suggestion, use the format `[link text](slug-or-url)` followed by a description. Example: `[SEO best practices](/seo-guide)` - Guide to SEO fundamentals, use when discussing optimization techniques.' : ''}
  ${postInterview.externalLinksToUse && postInterview.externalLinksToUse.length > 0 ? '- **External link suggestions (if enabled)**: For every link suggestion, use the format `[link text](full-url)` followed by a description. Example: `[Google Search Central](https://developers.google.com/search)` - Official Google SEO documentation, use to cite authoritative sources.' : ''}
  ${hasAnyImages ? '- **Image blocks** (if applicable): Include image blocks directly here using the format specified in Image Placement Rules' : ''}
  - **Tone notes**
  \`\`\`
  
  **CRITICAL WORD COUNT REQUIREMENTS:**
  
  ### Section Word Count Rules
  - **Standard sections**: 150-300 words (H2, H3, H4)
  - **Core sections**: 400-500 words maximum (only for essential, high-value sections)
  - **If a section needs more than 500 words**: Subdivide it into multiple subsections (H3/H4) with their own word counts
  - **Introduction**: ${minWordCount && maxWordCount ? `${Math.round(minWordCount * 0.1)} - ${Math.round(maxWordCount * 0.1)} words` : '200-400 words'} (typically 8-12% of total)
  ${needsFaqSection ? `- **FAQ section**: ${minWordCount && maxWordCount ? `${Math.round(minWordCount * 0.075)} - ${Math.round(maxWordCount * 0.075)} words` : '300-600 words'} (typically 5-10% of total)` : ''}
  
  ### Paragraph Structure Rules
  - Each paragraph within a section: **40-80 words** (standard)
  - Critical paragraphs: **up to 120 words maximum** (only when absolutely necessary and highly readable)
  - Sections should contain multiple paragraphs to reach their word count target
  - If a single paragraph exceeds 120 words, split it into multiple paragraphs
  
  ### Total Word Count
  - The SUM of all section word counts (intro + body sections + FAQ) must equal approximately ${minWordCount && maxWordCount ? `${minWordCount} - ${maxWordCount} words` : 'the target article length'}
  - Format word counts clearly as: "Estimated word count: 200 - 300 words" or "Word count: 150-300"
  
  ${faqSection}
  
  ${imagePlacementRules}
  
  
  
  ${brandSection}
  
  ## 7. Style Requirements
  - Human, expert, natural tone with rich vocabulary
  - Deep explanations that fully satisfy search intent
  
  ---
  
  ## 8. Final Instruction
  Produce the **full SEO script** in **${language}**, using **pure Markdown** (no horizontal rules).
  
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
  requiresDeepResearch?: boolean;
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

   - "indexSummary" RULES: Summary of the article structure.
     - One line per section: [H2|H3|H4] Title: 30-40 word summary + estimated length
     - Total word count (intro + sections + FAQ) must match user requirements

2. "head" RULES
   - h1: Main title (extract from outline or create if missing)
   - introductionDescription: Full introduction description including storytelling and planned points
   - introductionLengthRange (optional): [minWords, maxWords] - extract from script if specified, otherwise undefined
   - slug: URL-friendly version of h1 (lowercase, hyphens, no special characters)
   - tags: 3-8 core keywords/topics as array of strings

3. "body.sections" RULES
   - Each section: logical part of outline (main topics, subtopics, subsections)
   - level: h2 (main sections), h3/h4 (subsections, nested logically)
   - title: Clean, descriptive title
   - id: Unique string "sec-1", "sec-2", etc. (sequential)
   - **CRITICAL**: DO NOT include FAQ sections (e.g., "Frequently Asked Questions", "Preguntas Frecuentes", "FAQ") in body.sections. FAQ content must ONLY go in the "faq" field, never in body.sections.
   - lengthRange: [minWords, maxWords] - **EXTRACT EXACTLY from script**
     - Look for: "Estimated word count: X-Y words", "Word count: X-Y", "X-Y words"
     - If specified in script: use EXACTLY
     - If NOT specified: defaults are H2: 200-300, H3/H4: 150-250, Core: 400-500 max
     - DO NOT recalculate - script designer has planned this
   - description: Clear explanation of section content (guidelines for writer/AI). Include all planned points from script.
     **IMPORTANT**: If description contains image blocks (\`\`\`user-image or \`\`\`ai-image), extract to images array and remove block syntax from description
   - images (optional):
     - Extract image blocks from section description if present
     - For each \`\`\`user-image or \`\`\`ai-image block:
       - Extract: sourceType, sourceValue, title, description, alt
       - Remove block syntax from description
       - Add to images array
     - Image structure:
       - sourceType: "user" or "ai_generated" (from block or inferred from \`\`\`ai-image)
       - sourceValue (optional): from block or short identifier
       - title (optional): Short descriptive title for the image (from block or generate from description)
       - description (optional): AI prompt or user image context (detailed description for caption)
       - alt (optional): from block or generate SEO-friendly alt text
     - If no blocks found: leave images undefined/empty
   - requiresDeepResearch (optional): If you consider that the content of the section requires updated information, set this to true so the writer can search the facts in google. If that's the case, in the description, add a suggestion to the writer of what to search for.
   - links:
     - internal: Array of internal links in format \`[link text](slug-or-url)\` with description. Extract EXACTLY as written in the script. DON'T ADD INTERNAL LINKS IF IT'S NOT SPECIFIED IN THE SCRIPT. Example: \`[SEO best practices](/seo-guide) - Guide to SEO fundamentals\`
     - external: Array of external links in format \`[link text](full-url)\` with description. Extract EXACTLY as written in the script, including the full URL. DON'T ADD EXTERNAL LINKS IF IT'S NOT SPECIFIED IN THE SCRIPT. Example: \`[Google Search Central](https://developers.google.com/search) - Official Google SEO documentation\`
     - **CRITICAL**: Preserve the complete link format \`[link](url/description)\` exactly as specified in the script. Do NOT extract just the URL or just the description - keep the full markdown link format with description.

4. "faq" RULES
   - description: Clear explanation of FAQ content (guidelines for writer/AI). Include questions and answers (one line per Q&A)
   - lengthRange (optional): [minWords, maxWords] - extract from script if specified, otherwise undefined
   ${needsFaqSection ? '- FAQ section MUST be included if present in script' : '- FAQ section is optional'}
   - **CRITICAL**: If the script contains an FAQ section (e.g., "Frequently Asked Questions", "Preguntas Frecuentes", "FAQ"), extract its content into this "faq" field and REMOVE it from body.sections. FAQ sections should NEVER appear in body.sections.

${wordCountValidation}

5. STYLE & CONSISTENCY
   - Preserve original outline language
   - You may: complete unclear titles, group scattered points, add intro/conclusion if needed
   - Remove redundancies along sections to make sure every paragraph is unique and adds value to the content.
   - Ensure consistent hierarchy: h1 → h2 → h3 → h4
   - Research web when needed - include sources/details in descriptions (don't summarize, preserve full information for writer)

6. VALIDATION REQUIREMENTS
   - JSON must be valid: double quotes only, no trailing commas
   - Required fields: head.h1, head.introductionDescription, head.slug, head.tags, body.sections
   - Each section: id, level, title, lengthRange, description, links (internal + external)

Convert the outline below to JSON format. Return ONLY the JSON (no code blocks, no comments, no formatting characters).

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

**YOU MUST write EXACTLY ${lengthRange[0]} - ${lengthRange[1]} words total for the introduction.**

This is a HARD REQUIREMENT. Your response must be within this range:
- Minimum: ${lengthRange[0]} words
- Maximum: ${lengthRange[1]} words

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

    return `You are an expert SEO copywriter. Write a compelling, SEO-optimized introduction.

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
  };

  static readonly COPYWRITER_PARAGRAPH_PROMPT = (
    indexSummary: string,
    targetAudience: string,
    targetTone: string,
    section: ScriptSection,
  ) => {
    const isCoreSection = section.lengthRange[1] >= 400;
    const sectionGuidance = isCoreSection
      ? `This is a CORE section (400-500 words). You may need to create multiple subsections or expand content significantly.`
      : `This is a standard section (150-300 words).`;

    // Build links information if available
    const hasInternalLinks =
      section.links?.internal && section.links.internal.length > 0;
    const hasExternalLinks =
      section.links?.external && section.links.external.length > 0;
    const linksSection =
      hasInternalLinks || hasExternalLinks
        ? `
  **Links to Include (MANDATORY):**
  ${hasInternalLinks ? `- **Internal links**: ${section.links.internal.map((link) => `"${link}"`).join(', ')}` : ''}
  ${hasExternalLinks ? `- **External links**: ${section.links.external.map((link) => `"${link}"`).join(', ')}` : ''}

  **Link Integration Requirements:**
  - You MUST naturally incorporate ALL suggested links into the content
  - Internal links should be embedded naturally within relevant paragraphs
  - External links should be used to support claims, provide authority, or cite sources
  - Links should feel organic and enhance the content, not forced
  - Distribute links throughout the section paragraphs (don't cluster them all in one place)
  `
        : '';

    return `You are an expert SEO copywriter. Write compelling, SEO-optimized content for this section.

**Section Context:**
- Title: ${section.title} (${section.level} heading - do not include in output)
- Description: ${section.description}
- Tone: ${targetTone}
- Audience: ${targetAudience}
- Article topics: ${indexSummary}
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
- Internal links: Use markdown format [link text](internal-link-slug) where the slug matches the internal link suggestion
- External links: Use markdown format [link text](https://full-url.com) with the actual URL from external link suggestions
- Links should be naturally integrated into the paragraph content, not added as separate sentences

NEVER ADD BACKTICKS, CODEBLOCK FENCES, OR FORMATTING CHARACTERS

**VALIDATION:**
- Total words across all blocks: ${section.lengthRange[0]} - ${section.lengthRange[1]} words
- Each paragraph: 40-80 words (up to 120 if critical)
${hasInternalLinks || hasExternalLinks ? `- ALL suggested links must be included in the content` : ''}
- JSON must be valid (double quotes, no trailing commas)

DO NOT ADD ANY CODEBLOCK FENCES, BACKTICKS, OR FORMATTING CHARACTERS

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

    return `You are an expert SEO copywriter. Write a compelling, SEO-optimized FAQ section.

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
  };
}
