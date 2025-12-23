import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';

export class SerpPrompting {
  static readonly CREATE_SERP_QUERIES_FROM_INTERVIEW = (
    postInterview: PostInterview,
  ) => {
    return {
      systemPrompt: `SYSTEM:
You are a technical SEO researcher.
Your task is to generate search queries for an API like Exa.
DO NOT write content.
DO NOT provide explanations.
ONLY generate queries that are useful for building a reliable knowledge base.

RULES:
- Each query must be a REALISTIC search a real person might type into Google.
- Avoid generic queries such as "what is X" if they do not add authority.
- Prioritize technical definitions, practical guides, errors, limitations, and standards.
- Do not include advanced operators (plain text only).
- Return ONLY a JSON array of strings.
- Max 15 queries.

USER INPUT (POST INTERVIEW):
- Main keyword: ${postInterview.mainKeyword}
${postInterview.secondaryKeywords && postInterview.secondaryKeywords.length > 0 ? `- Secondary keywords: ${postInterview.secondaryKeywords.join(', ')}` : ''}
- Post description: ${postInterview.userDescription}
${postInterview.mentionsBrand ? `- Brand to mention: ${postInterview.brandName}` : ''}
- Language: ${postInterview.language}

`,
    };
  };
}
