import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';
import { RESPONSE_SummarizeSERP_SearchResults } from './research.prompts';
import { LLMPrompt } from 'src/library/types/llm-prompts.types';

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
    
    ---
    
    ## GLOBAL OUTPUT RULES
    
    All output MUST:
    - Be written in **${postInterview.language}**
    - Use **pure Markdown**
    - Be programmatically simple (no horizontal rules \`---\`)
    - Follow EEAT principles (Experience, Expertise, Authoritativeness, Trustworthiness)
    
    You MUST NOT:
    - Invent facts, statistics, studies, or sources
    - Mention fictitious brands, tools, products, or companies
    - Add explanations, comments, or meta notes
    - Create links that are not explicitly present in the knowledge base
    
    ---
    
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
    5. Explicitly integrates **up-to-date information** from the provided SERP knowledge base (if present)
    
    ---
    
   ${
     summarizedSERPKnowledgeBase &&
     `## CRITICAL: KNOWLEDGE BASE USAGE RULES (SERP)
    You MUST actively use it to enrich the SEO script.
    
    Each knowledge base item contains:
    - \`url\`: the ONLY valid source for linking
    - \`metadata.facts\`: atomic, citation-ready facts
    - \`metadata.contextSnippets\`: short explanatory context
    - \`metadata.usage.primary\`: intended use (definition, statistics, how_to, etc.)
    - \`metadata.usage.citationRequired\`: whether factual claims must be attributed
    
    ### How to use the knowledge base correctly:
    
    - Use **facts** to guide:
      - Definitions
      - Statistics
      - Guidelines
      - Comparisons
      - Best practices
    - Use **contextSnippets** to:
      - Inform introductions
      - Support explanations
      - Shape examples and reasoning
    - Decide **where links belong** based on:
      - Section intent
      - Metadata usage type
    - Only suggest links using this format:
      \`[link content description](exact-url-from-knowledge-base)\`
    - If no relevant knowledge base item exists for a section:
      - Do NOT invent data
      - Keep the section high-level and explanatory
    
    If the knowledge base contradicts common assumptions, ALWAYS defer to the knowledge base.
    `
   }
    ---
    
    ## OUTPUT FORMAT (MARKDOWN ONLY)
    
    ### 1. Title & Meta
    
    - **H1**: SEO-optimized title that:
      - Includes the main keyword naturally
      - Uses power words when appropriate
      - May include a number if relevant
      - Reflects real search intent (informational, commercial, problem-solving)
    
    - **Introduction description**:
      - Clearly explain the problem the article solves
      - Mention the main keyword ONCE
      - Include:
        - Micro-storytelling OR
        - Real-world facts/statistics derived from the knowledge base (if available)
      - Outline what the reader will learn
    
    - **Introduction word count**:
      - ${
        postInterview.minWordCount && postInterview.maxWordCount
          ? `${Math.round(postInterview.minWordCount * 0.1)} – ${Math.round(postInterview.maxWordCount * 0.1)} words`
          : '200 – 400 words'
      }
    
    - **Target article length**:
      - ${postInterview.minWordCount} – ${postInterview.maxWordCount} words
    
    - **Optional**:
      - Slug (3–5 words, URL-friendly)
      - Tags (3–8 relevant keywords)
    
    ---
    
    ### 2. General Structure of the Article sections
    
    List ALL sections with:
    - Heading level (H2 / H3 / H4)
    - 1–2 line summary
    - Exact estimated word count
    
    Ensure the **sum of all sections + introduction + FAQ** matches the target range.
    Use EXACTLY this structure for EACH section:
    
    \`\`\`markdown
    ## H2 | H3 | H4 – [Heading]
    
    - **Purpose**
    - **Estimated word count**: [MIN] – [MAX] words
    - **Search intent covered**
    - **Main points**
    - **Examples / comparisons**
    - **Keyword usage** (main + secondary if relevant): Specify the number of times the keywords should be used to match the keyword density ${postInterview.keywordDensityTarget}
    - **Tone notes**
    \`\`\`

    ${
      postInterview.needsFaqSection
        ? `
    - **3. FAQ section**:
      - ${postInterview.minWordCount && postInterview.maxWordCount ? `${Math.round(postInterview.minWordCount * 0.075)} – ${Math.round(postInterview.maxWordCount * 0.075)} words` : '300 – 600 words'}
      - Questions must reflect real user queries and SERP intent
      - Create **4–8 FAQs** based on the real search intent and People-Also-Ask patterns.
      - **MUST specify the total word count for the entire FAQ section.**
    `
        : ''
    }
    
    ---
    
    ## WORD COUNT ENFORCEMENT RULES
    
    - **Standard sections (H2/H3/H4)**: 150 – 300 words
    - **Core sections (max 2–3 total)**: 400 – 500 words
    - Sections exceeding 500 words MUST be split into sub-sections
    - Paragraph length: 40 – 80 words (120 words max for critical paragraphs only)
    
    ${
      postInterview.needsFaqSection
        ? `
    - **FAQ section**:
      - ${postInterview.minWordCount && postInterview.maxWordCount ? `${Math.round(postInterview.minWordCount * 0.075)} – ${Math.round(postInterview.maxWordCount * 0.075)} words` : '300 – 600 words'}
      - Questions must reflect real user queries and SERP intent
    `
        : ''
    }
    
    ---
    
    ## FINAL INSTRUCTION
    
    Produce the **FULL SEO SCRIPT** in **${postInterview.language}**, using **pure Markdown**.
    
    This is a **production system**.
    No comments. No explanations. No filler. No invented information.
    If something cannot be supported by the knowledge base, keep it generic and factual.
    
    `,
      ],
      userPrompts: [
        `
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
        Your tasks:
        - Make sure that the planification of the script sections is correct to match the word count requirement of ${postInterview.minWordCount} - ${postInterview.maxWordCount} words.
        - Incorporate external link mentions to support the affirmations.
        - Incorporate internal link mentions to support the affirmations ONLY if can be done naturally with the current content structure.
        - Make sure that the keyword usage is correct and natural, matching the keyword density target of ${postInterview.keywordDensityTarget}.
        - Remove content redundancies and make sure that the script is clear and concise following EEAT principles.
        - Incorporate image mentions to support the affirmations ONLY if can be done naturally with the current content structure.

        CRITICAL RULES:
        - NEVER invent URLs, slugs, or internal links.
        - Only use links explicitly present in the provided knowledge base or internal links meta.
        - If no relevant link exists, do not add a link.

        ## IMAGE INCORPORATION: This is the format for the incorporations in the script sections  
        When an image should be placed in a section, include it in the section's description using this format:
        
        #### User images
        \`\`\`user-image
        sourceType: "user" | "ai_generated"
        sourceValue: "URL or ID or identifier"
        title: "Short, descriptive title for the image (used as img title attribute)"
        alt: "SEO-friendly alt text in ${postInterview.language}"
        \`\`\`
        
        #### AI images
        \`\`\`ai-image
        title: "Short, descriptive title for the image (used as img title attribute)"
        description: "Clear prompt for image generation and detailed description. You MUST create natural images, that can't be easily identified as AI generated. Avoid writting ghost texts, complex statistics"
        alt: "SEO-friendly alt text in ${postInterview.language}"
        \`\`\`

        ## LINK INCORPORATION: This is the format to add link references to the script section
        - **Link Usage**: Integrate links that sound natural with the section. DON'T CREATE INTERNAL LINKS THAT ARE NOT MENTIONED IN THE PARAMETERS.
  FOR THE LINK USAGE, ALWAYS ALWAYS USE THIS FORMAT: use the format [link content description](slug-or-url)

        This is the user requirements:
        Word count: ${postInterview.minWordCount} - ${postInterview.maxWordCount} words.
        Keyword density target: ${postInterview.keywordDensityTarget}.
        User description: ${postInterview.userDescription}.
        ${postInterview.mentionsBrand ? `Mentions brand: ${postInterview.brandName}, description: ${postInterview.brandDescription}` : ''}
        Images config: 
        ${postInterview.imagesConfig.aiImagesCount && `You must use up to ${postInterview.imagesConfig.aiImagesCount} AI images.`}
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
        ${postInterview.blogInternalLinksMeta}
        `,
      ],
    };
  };
}
