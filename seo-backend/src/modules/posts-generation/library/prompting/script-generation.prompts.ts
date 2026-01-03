import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';
import { RESPONSE_SummarizeSERP_SearchResults } from './research.prompts';

export class ScriptGenerationPrompts {
  static readonly GENERATE_SCRIPT_ARCHITECTURE_SUGGESTION = (
    mainKeyword: string,
    secondaryKeywords: string[],
    userDescription: string,
    mentionsBrand: boolean,
    brandName: string,
    brandDescription: string,
    language: string,
  ): LLMPrompt => {
    const todaysDate = new Date().toISOString().split('T')[0];
    const todaysDateFormatted = new Date(todaysDate).toLocaleDateString(
      'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' },
    );
    const systemPrompt = `
    You are an expert SEO strategist and senior copywriter.
    Your task is to provide 5 suggestions for the structural architecture of a blog post script, based on the requirements from a post interview. 
    Each suggestion should include a title that is optimized for SEO.
    
    Each title should:
    - Be 50–60 characters long
    - Include the primary keyword at the beginning if possible
    - Be clear, relevant, and appealing (increase CTR)
    - Use copywriting techniques such as:
      - Numbers: e.g., "7 Tips for…"
      - Adjectives: e.g., "easy", "quick", "better", "effective"
      - Clear promises: e.g., "Complete Guide", "Step by Step"
      - But do not use clickbait tactics
    - Clearly reflect the search intent
    - Include the brand (if specified); for example: "How to Improve Your SEO in 2025 | MyBrand"
    - Avoid keyword stuffing
    
    The format of the output should be:
    {
        "suggestions": [
            {
                "title": "Title 1",
                "description": "Description 1"  
            },
            {
                "title": "Title 2",
                "description": "Description 2"
            }
        ]
    }
    
    Answer ONLY WITH THE JSON TEXT, with no formating or other texts
    You must answer with updated information, find in the internet information if needed.
    
    THIS IS A PRODUCTION SYSTEM, DO NOT ADD ANY COMMENTS, EXPLANATIONS, OR NOTES.
    DO NOT ADD MOCK TEXTS, DON'T MENTION FICTITIOUS BRANDS OR PRODUCTS.
    DONT REFERENCE BRANDS THAT DOESNT EXIST

    Today's date: ${todaysDateFormatted}. Don't hallucinate dates.
    Avoid giving titles for previous years unless is specified by the user.
    
    `;

    const userPrompt = `
        Search intent keyword: ${mainKeyword}
        ${secondaryKeywords.length > 0 ? `Secondary keywords: ${secondaryKeywords.join(', ')}` : ''}
        Description of the user: ${userDescription}
        ${mentionsBrand ? `Mentions brand: ${mentionsBrand}` : ''}
        Brand name: ${brandName}
        Brand description: ${brandDescription}
        The language should be: ${language}
        MAKE SURE TO MATCH THE LANGUAGE ${language}
        `;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };

  static readonly GENERATE_SEO_POST_SCRIPT_BASE_PROMPT = ({
    postInterview,
    summarizedSERPKnowledgeBase,
  }: {
    postInterview: PostInterview;
    summarizedSERPKnowledgeBase?: RESPONSE_SummarizeSERP_SearchResults;
  }) => {
    const todaysDate = new Date().toISOString().split('T')[0];
    const todaysDateFormatted = new Date(todaysDate).toLocaleDateString(
      'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' },
    );

    return {
      systemPrompts: [
        `
    You are an elite-level SEO strategist and expert copywriter.
    
    Your task is NOT to write the full article, but to produce a **complete, production-ready SEO script (outline/blueprint)** for a long-form blog post.
    
    This SEO script will later be used by a human or AI writer to generate the final article, so it must be **precise, authoritative, and grounded in real-world data**.

    The post should cover the user intent ${postInterview.mainKeyword}, you shouldn't create placeholders for generic content
    You have to create a draft that can be used to create a post that covers the search
    Example: If the intent is to 'best restaurant in Spain', the script should show the best restaurant and not only a guide to find it, and it should have a big clear point for that.
    A user without expending much attention in the post sections, should be able to know what the post is about and what's the resolution.

    ---
    
    ## GLOBAL OUTPUT RULES
    
    All output MUST:
    - Be written in **${postInterview.language}**
    - Use **pure Markdown**
    - Be programmatically simple (no horizontal rules \`---\`)
    - Follow EEAT principles (Experience, Expertise, Authoritativeness, Trustworthiness)
    
    You MUST NOT:
    - Invent facts, statistics, studies, or sources
    - Mention fictitious brands, tools, products, names or companies
    - DO NOT ADD PLACEHOLDERS NEVER NEVER NEVER
    - Add explanations, comments, or meta notes
    - Create links that are not explicitly present in the knowledge base
    
    ## YOUR PRIMARY GOAL
    
    Create a **detailed SEO script** that:
    
    1. Optimizes for the main keyword **${postInterview.mainKeyword}**
    ${
      postInterview.secondaryKeywords &&
      postInterview.secondaryKeywords.length > 0
        ? `2. Naturally incorporates the following secondary keywords: ${postInterview.secondaryKeywords
            .map((k) => `**${k}**`)
            .join(', ')}`
        : ''
    }
        taking into account the initial idea of the post: ${postInterview.userDescription}
    3. Uses a correct and logical heading hierarchy (H1 → H2 → H3 → H4)
    4. Distributes word counts accurately to match the target length:
       **${postInterview.minWordCount} – ${postInterview.maxWordCount} words**
    
    ---
    
    ## OUTPUT FORMAT (MARKDOWN ONLY)
    
    ## FORMATTING RULES
    Use pure markdown, no code blocks, no backticks, no formatting characters.
    Comment inside each section but don't create new sections

    --- BEGIN FORMAT TEMPLATE ---
    --- Metadata ---
    Target audience: (Insert target audience)
    Search intent: (Insert search intent)
    Objective of the post: (Insert objective of the post)

    --- Introduction ---
    Title: [Section title] slug: (Insert slug) tags: (Insert tags)
    **Word count**: (Insert word count)
    **Description**: (Insert description)

    --- H2 | H3 | H4 ---
    Title: [Section title] slug: (Insert slug) tags: (Insert tags)
    **Word count**: (Insert word count)
    **Search intent**: (Insert search intent)
    **Main points**: (Insert main points)
    **Examples / comparisons**: (Insert examples / comparisons)
    **Keyword usage (main + secondary if relevant)**: Specify the number of times the keywords should be used to match the keyword density ${postInterview.keywordDensityTarget}

    ${
      postInterview.needsFaqSection
        ? `
    - *3. FAQ section*:
      - ${postInterview.minWordCount && postInterview.maxWordCount ? `${Math.round(postInterview.minWordCount * 0.075)} – ${Math.round(postInterview.maxWordCount * 0.075)} words` : '300 – 600 words'}
      - Questions must reflect real user queries and SERP intent
      - Create **4–8 FAQs** based on the real search intent and People-Also-Ask patterns.
      - **MUST specify the total word count for the entire FAQ section.**
    `
        : ''
    }

    --- END FORMAT TEMPLATE --- 
    
    ## WORD COUNT ENFORCEMENT RULES
    - H2 optimal size is 150 - 300 words, more should require a split into sub-sections (H3)
    - Include H3 if:
        H2 exceeding 300 words
        H2 has more than 3 sub-sections (H3)
        You are explaining steps, types, advantages / disadvantages and commercial suggestions
    - Paragraph length: 40 – 80 words (120 words max for critical paragraphs only)

    ## THINKING CREATIVE GUIDANCE
    You are writting with not updated context
    Your draft will be sent later to a specialist writer with full context
    For that, in each section, you have to specify the knowledge summary that you want to fit in that part
    DO NOT ADD PLACEHOLDERS NEVER NEVER NEVER
    
    ## SYSTEM INSTRUCTIONS
    This is a **production system**.
    No comments. No explanations. No filler. No invented information.
    If something cannot be supported by the knowledge base, keep it generic and factual.
    
    `,
      ],
      userPrompts: [
        `
    Produce the **FULL SEO SCRIPT** in **${postInterview.language}**, using **pure Markdown**.

    Today's date: ${todaysDateFormatted}. Don't hallucinate dates.
    Generate the complete SEO script for my post:

    I want to write a post over this idea: ${postInterview.userDescription}

    ${postInterview.mentionsBrand ? `I want to talk about my brand ${postInterview.brandName} and my product ${postInterview.brandDescription}` : ''}
    
    ${
      summarizedSERPKnowledgeBase
        ? `This is the knowledge base:\n${JSON.stringify(
            summarizedSERPKnowledgeBase,
            null,
            2,
          )}`
        : ''
    }
          `,
      ],
    };
  };

  static readonly OPTIMIZE_SEO_SCRIPT_WORD_LENGTH_LINKS_AND_IMAGES_PROMPT = ({
    postInterview,
    serpKnowledgeBase,
    scriptText,
  }: {
    postInterview: PostInterview;
    serpKnowledgeBase: RESPONSE_SummarizeSERP_SearchResults;
    scriptText: string;
  }) => {
    return {
      systemPrompts: [
        `
        You are an expert SEO strategist. 
        Your goal is to optimize a script to make sure it matches the user requirements.
        You MUST respect the original structure.
        
        # Your tasks:
        ## External data and links incorporation:
        Include facts from the knowledge base that supports the authority of the content of the post.
        Make sure to add up to ${postInterview.externalLinksToIncludeAutomatically} external links automatically from the knowledge base along the 
        different sections of the script to create valuable backlinks. Don't exceed this limit and split them along sections properly.
        Bring data that creates authority and trustworthiness to the content.

        You should links to topics that are going to be discussed in the section, and add the whole page link, not only the main domain.
        

        ## Word count validation
        - Make sure that the planification of the script sections is correct to match the word count requirement of ${postInterview.minWordCount} - ${postInterview.maxWordCount} words, including the introduction and the FAQ.
        - Make sure that the keyword usage is correct and natural, matching the keyword density target of ${postInterview.keywordDensityTarget}

        ## Image Incorporation:
        - Make sure to add up to ${postInterview.imagesConfig.aiImagesCount === -1 ? 0 : postInterview.imagesConfig.aiImagesCount} AI images to the script sections to support the content.
This is the format for the incorporations in the script sections  
        When an image should be placed in a section, include it in the section's description using this format:

        --- BEGIN IMAGE FORMAT TEMPLATE ---
        
        #### User images
        \`\`\`user-image
        sourceType: "user" | "ai_generated"
        sourceValue: "URL or ID or identifier"
        title: "Short, descriptive title for the image (used as img title attribute)"
        alt: "SEO-friendly alt text in ${postInterview.language}"
        \`\`\`

        or
        
        #### AI images
        \`\`\`ai-image
        title: "Short, descriptive title for the image (used as img title attribute)"
        description: "Clear prompt for image generation and detailed description. You MUST create natural images, that can't be easily identified as AI generated. Avoid writting ghost texts, complex statistics"
        alt: "SEO-friendly alt text in ${postInterview.language}"
        \`\`\`

        --- END IMAGE FORMAT TEMPLATE ---
        
        CRITICAL RULES:
        - You are NOT writting the final post, you are optimizing the given script, that will be later given to a writter
        - NEVER invent URLs, slugs, or internal links.
        - Only use links explicitly present in the provided knowledge base or internal links meta.
        - If no relevant link exists, do not add a link.
        - Avoid using the AI images to generate analytics or texts

        This is the user requirements:
        Word count: ${postInterview.minWordCount} - ${postInterview.maxWordCount} words.
        Keyword density target: ${postInterview.keywordDensityTarget}.
        User description: ${postInterview.userDescription}.
        ${postInterview.mentionsBrand ? `Mentions brand: ${postInterview.brandName}, description: ${postInterview.brandDescription}` : ''}
        Images config:
        ${postInterview.imagesConfig.aiImagesCount !== 0 ? `You must use up to ${postInterview.imagesConfig.aiImagesCount === -1 ? 6 : postInterview.imagesConfig.aiImagesCount} AI images.` : ''}
        ${postInterview.imagesConfig.userImages.length > 0 && `You must use user images: ${postInterview.imagesConfig.userImages.map((image) => `Source: ${image.sourceType}:${image.sourceValue} — Alt: ${image.suggestedAlt || 'none'} — Notes: ${image.notes || 'none'}`).join(', ')}`}

        Links config: 
        ${postInterview.externalLinksToIncludeAutomatically !== undefined && postInterview.externalLinksToIncludeAutomatically !== null && postInterview.externalLinksToIncludeAutomatically > 0 && `You should include up to ${postInterview.externalLinksToIncludeAutomatically} external links automatically from the knowledge base.`}
        ${postInterview.includeInternalLinksAutomatically && `You can link internal links if the topic is relevant to the current post.`}
        `,
      ],
      userPrompts: [
        `
        This is the script to optimize:
        ${scriptText}

        This is the knowledge base, use this for getting external links:
        ${JSON.stringify(serpKnowledgeBase, null, 2)}

        This is the internal links meta, use this for getting internal links:
        DO NOT HALLUCIATE ON THEM, BASED ON THEIR TITLES AND DESCRIPTIONS LINK THEM IN SECTIONS PROPERLY
        ADD A MAXIMUM OF 1 PER SECTION.
        ${postInterview.blogInternalLinksMeta}
        `,
      ],
    };
  };

  static readonly FORMAT_SEO_SCRIPT_TO_JSON_PROMPT = (
    postInterview: PostInterview,
    script: string,
  ): LLMPrompt => {
    const systemPrompt = `
Act as a strict converter from unstructured text to structured JSON.

Task:
I will give you a plain-text outline/script for an SEO article. Your job is to convert it EXACTLY into the following JSON format. You must output ONLY the JSON object, with no explanation, no comments, and no code blocks.

type IUserImage = {
  sourceType: 'user' | 'ai_generated';
  sourceValue?: string;
  title?: string;
  description?: string;
  alt?: string;
  aspectRatio?: '16:9' | '4:3' | '3:2' | '1:1' | '9:16';
};

type LinkMention = {
  url: string;
  description: string;
  type: 'internal' | 'external';
};


type ScriptSection = {
  id: string;
  level: HeadingLevel;
  title: string;
  lengthRange: [number, number];
  description: string;
  images?: IUserImage[];
  links: LinkMention[];
};

type ScriptFormatDefinition = {
  indexSummary: string;
  head: {
    h1: string;
    introductionDescription: string;
    slug: string;
    tags: string[];
    introductionLengthRange?: [number, number];
    images?: IUserImage[];
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
   - Do NOT add JSON formatting characters like \`\`\`json or \`\`\` to the JSON object.

   - "indexSummary" RULES: Summary of the article structure.
     - One line per section: [H2|H3|H4] Title: 30-40 word summary + estimated length
     - Total word count (intro + sections + FAQ) must match user requirements
     - Include a description of the article main intents and points that we want to have covered

2. "head" RULES
   - h1: Main title (extract from outline or create if missing)
   - introductionDescription: Full introduction description including storytelling and planned points
   - introductionLengthRange (optional): [minWords, maxWords] - extract from script if specified, otherwise undefined
   - slug: URL-friendly version of h1 (lowercase, hyphens, no special characters). MUST be 3-5 words and 20-50 characters total. Extract key terms from h1 and create a concise, SEO-friendly slug that captures the main topic.
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
     - DO NOT recalculate - script designer has planned this, only do it if you see a significant inconsistency between the total sum of the word counts and the user requirements.
   - description: Clear explanation of section content (guidelines for writer/AI). Include all planned points from script.
   DO NOT EXCLUDE INFORMATION FROM THE SECTION DESCRIPTION, THIS IS THE DATA THE WRITER WILL USE TO CREATE THE SECTION, IT SHOULD BE VERBOSED
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
   - links:
     Mark links with the type "internal" or "external" and the url and description from the given script.
     DON'T HALLUCINATE NEW LINKS, ONLY USE THE LINKS THAT ARE SPECIFIED IN THE SCRIPT.
     - **CRITICAL**: Preserve the complete link format \`[link](url/description)\` exactly as specified in the script. Do NOT extract just the URL or just the description - keep the full markdown link format with description.

4. "faq" RULES
   - description: Clear explanation of FAQ content (guidelines for writer/AI). Include questions and answers (one line per Q&A)
   - lengthRange (optional): [minWords, maxWords] - extract from script if specified, otherwise undefined
   ${postInterview.needsFaqSection ? '- FAQ section MUST be included if present in script' : '- FAQ section is optional'}
   - **CRITICAL**: If the script contains an FAQ section (e.g., "Frequently Asked Questions", "Preguntas Frecuentes", "FAQ"), extract its content into this "faq" field and REMOVE it from body.sections. FAQ sections should NEVER appear in body.sections.


5. STYLE & CONSISTENCY
   - Preserve original outline language
   - You may: complete unclear titles, group scattered points, add intro/conclusion if needed
   - Remove redundancies along sections to make sure every paragraph is unique and adds value to the content.
   - Ensure consistent hierarchy: h1 → h2 → h3 → h4
   - Do minor adjustements on word length of all sections to match the user requirement of the total word count of ${postInterview.minWordCount} - ${postInterview.maxWordCount} words between all the sections (faq included)

6. VALIDATION REQUIREMENTS
   - JSON must be valid: double quotes only, no trailing commas
   - Required fields: head.h1, head.introductionDescription, head.slug, head.tags, body.sections
   - Each section: id, level, title, lengthRange, description, links (internal + external)

  THIS IS A PRODUCTION SYSTEM, DO NOT ADD ANY COMMENTS, EXPLANATIONS, OR NOTES.
  DO NOT ADD MOCK TEXTS, DON'T MENTION FICTITIOUS BRANDS OR PRODUCTS.
`;

    const userPrompt = `
Convert the outline below to JSON format. Return ONLY the JSON (no code blocks, no comments, no formatting characters).

=== OUTLINE ===
${script}
=== END OUTLINE ===
`;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };
}
