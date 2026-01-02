export type SERP_ResearchQuery = {
  intent: 'definition | official_docs | best_practices | how_to | statistics | comparisons | common_mistakes | use_cases | case_studies';
  query: string;
  priority: 1 | 2 | 3;
};

export type SERP_ResearchPlan = {
  country?: string;
  researchQueries: SERP_ResearchQuery[];
};
export type SERP_SearchResult = {
  url: string;
  title: string;
  author: string;
  content: string;
  searchIntentQuery: string; // Redundancy: Query used to find this element
};

export type SERP_ResearchSearchResults = {
  query: SERP_ResearchQuery;
  searchResults: SERP_SearchResult[];
};

export type SERP_SearchResultMetadata = {
  // Quality / trustworthiness
  authority: 'high' | 'medium';
  contentType: 'official_docs' | 'blog' | 'research' | 'news' | 'reference';
  customSummary?: string; // Custom summary of the content, crafted when facts and contextSnippets are not a good format for the type of data
  facts?: string[]; // 3–6 atomic, citation-ready facts
  contextSnippets?: string[]; // 2–4 snippets, 2–3 sentences, original wording
  usage: {
    primary: (
      | 'definition'
      | 'guidelines'
      | 'statistics'
      | 'examples'
      | 'comparisons'
      | 'how_to'
    )[];
    citationRequired: boolean;
  };
};
