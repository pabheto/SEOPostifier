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
  
  ### Question 1
  - **Short expected answer**: ...
  
  ### Question 2
  - **Short expected answer**: ...
  \`\`\`
  
  Create **4–8 FAQs** based on the real search intent and People-Also-Ask patterns.
  Each answer should be concise (to be expanded later).
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

    const imagePlacementDetails = hasAnyImages
      ? `
  ## 4. Image Placement Blocks
  
  Define the exact placement of all images.
  
  ### Rules
  
  1. Total image blocks MUST NOT exceed \`totalDesiredImages\`.
  2. AI image blocks MUST NOT exceed \`aiImagesCount\`.
  3. If user images exist, prioritize them.
  4. Only use AI images when slots remain.
  
  ### Block Format
  
  #### User images
  \`\`\`user-image
  sourceType: "url|wordpress_media_id|other"
  sourceValue: "URL or ID or identifier"
  sectionHeading: "Exact H2/H3 location"
  description: "Short descriptive context"
  alt: "SEO-friendly alt text in ${language}"
  \`\`\`
  
  #### AI images
  \`\`\`ai-image
  sectionHeading: "Exact H2/H3 location"
  description: "Clear prompt for image generation"
  alt: "SEO-friendly alt text in ${language}"
  \`\`\`
  `.trim()
      : `
  ## 4. Image Placement
  
  No images should be used.`.trim();

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
  
  ---
  
  ## 3. Output Format (Markdown)
  
  ### 3.1. Title & Meta
  - Provide an H1 with the main keyword
  - Introduction description: Explain what problem the article will solve.
Mention the main keyword naturally once.
Include either a micro-storytelling element or a relevant fact or statistic.
You must describe the points of the introduction to allow the writer to develop it later


  - Optional slug + tags
  
  ### 3.2. “General Structure of the Article”
  List H2/H3/H4 headings with 1–2 line summaries.
  
  ### 3.3. Detailed Section Scripts
  
  Use this pattern:
  
  \`\`\`markdown
  ## H2 – [Heading]
  
  - **Purpose**
  - **Estimated word count**
  - **Search intent covered**
  - **Main points**
  - **Examples / comparisons**
  - **Keyword usage**
  - **Internal link suggestions** (if enabled)
  - **External link suggestions** (if enabled)
  - **Tone notes**
  \`\`\`
  
  ${faqSection}
  
  ${imagePlacementDetails}
  
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

  static readonly FORMAT_SEO_SCRIPT_TO_JSON_PROMPT = (script: string) => {
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
  };
  body: {
    sections: ScriptSection[];
  };
  faq?: {
    description: string;
  };
};

Important instructions:

1. RESPONSE FORMAT
   - Output ONLY a valid JSON object that matches ScriptFormatDefinition exactly.
   - Do NOT include any text before or after the JSON.
   - Do NOT use code blocks, backticks, or comments.

   - "indexSummary" RULES: It must be a summary of the general structure of the article. 
   One line with the title and a summary of 10 - 20 words of the content of that section. 
   1 Line per section! It must give the whole context of the article organization.

2. "head" RULES
   - h1: main title of the article (extracted from the outline, or create a concise descriptive one if missing).
   - metaDescription: 140–160 characters, compelling SEO summary.
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
     - Use the ranges specified in the script, otherwise use a reasonable range to match around 250 - 400 words.
   - description: a clear explanation of what the section should contain (guidelines for the writer/AI).
   - images (optional):
     - Include ONLY if the outline suggests an image or if an image adds value.
     - Must follow the Image type structure.
     - sourceType: "user" if the image should be provided by the user, "ai_generated" if it should be generated with AI.
     - sourceValue (optional): short indication of the image type (e.g., "product photo", "comparison chart").
     - description (optional): detailed explanation of what the image should show. Only for AI generated images.
     - alt (optional): descriptive alt-text optimized for SEO and accessibility.
   - links:
     - internal: array of suggested internal link targets (slugs or conceptual placeholders).
     - external: array of generic resource descriptions (e.g., "Google ranking factors study", "Official schema.org docs").
       → Do NOT include real URLs.

    "faq" RULES
    - description: a clear explanation of what the FAQ section should contain (guidelines for the writer/AI).
    Find suitable questions and write them in the description. If it's short, provide the answers
    One line per question and answer or description.
    

4. STYLE & CONSISTENCY
   - Preserve the language of the original outline (if the outline is in English, keep everything in English).
   - You may:
     - Complete unclear titles.
     - Group scattered bullet points into coherent sections.
     - Add an introduction or conclusion if necessary for a complete article structure.
   - Ensure consistent hierarchy logic between h1 → h2 → h3 → h4.

5. VALIDATION REQUIREMENTS
   - JSON must be fully valid: double quotes only, no trailing commas.
   - All required fields must be present:
     - head.h1, head.metaDescription, head.slug, head.tags
     - body.sections
     - Each Section must contain: id, level, title, lengthRange, description, links (internal + external).

Now I will provide the outline. Convert it into the required JSON format and return ONLY the JSON.

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
  ) => {
    return `
You are an expert SEO copywriter. 
Write a compelling, SEO-optimized introduction for the article. 
The intro should reflect the purpose and angle suggested in introductionDescription, stay aligned with the topic in h1, and naturally use relevant ideas from the tags. 
Keep the tone ${targetTone}, engaging, and suitable for high-quality SEO content for ${targetAudience} audience.

The title is ${h1}
Match this description: ${introductionDescription}

The topics of the article are ${indexSummary}

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
Total words: ${section.lengthRange[0]} - ${section.lengthRange[1]}

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
`;
  };

  static readonly COPYWRITER_FAQ_PROMPT = (
    indexSummary: string,
    targetAudience: string,
    targetTone: string,
    faq: ScriptFAQ,
  ) => {
    return `You are an expert SEO copywriter. 
    Write a compelling, SEO-optimized FAQ section for the article.
    The FAQ section should reflect the purpose and angle suggested in sectionDescription, stay aligned with the topic in sectionTitle, and naturally use relevant ideas from the tags.
    Keep the tone ${targetTone}, engaging, and suitable for high-quality SEO content for ${targetAudience} audience.

    For context with other sections, the topics of the article are ${indexSummary}
    Match this description: ${faq.description}

    Return ONLY the FAQ section with no additional text of instructions.
    You must return it in JSON format plain text matching the following structure
    dont add any additional formatting characters, just plain JSON text

{
  questions: string[];
  answers: string[];
}

  `;
  };
}
