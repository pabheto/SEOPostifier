export enum SearchIntent {
  INFORMATIONAL = 'informational',
  TRANSACTIONAL = 'transactional',
  COMMERCIAL = 'commercial',
  NAVIGATIONAL = 'navigational',
}

export enum InterviewStatus {
  DRAFT = 'draft',
  SCRIPT_TEXT_GENERATED = 'script_text_generated',
  SCRIPT_DEFINITION_GENERATED = 'script_definition_generated',
}

export enum ToneOfVoice {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  TECHNICAL = 'technical',
  EDUCATIONAL = 'educational',
  CASUAL = 'casual',
  FORMAL = 'formal',
}

export type IUserImage = {
  sourceType: 'user' | 'ai_generated';
  sourceValue?: string;
  title?: string;
  description?: string;
  alt?: string;
  aspectRatio?: '16:9' | '4:3' | '3:2' | '1:1' | '9:16';
};

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

export type ScriptSection = {
  id: string;
  level: HeadingLevel;
  title: string;
  lengthRange: [number, number];
  description: string;
  images?: IUserImage[];
  requiresDeepResearch?: boolean;
  links: {
    internal: string[];
    external: string[];
  };
};

export type ScriptFAQ = {
  description: string;
  lengthRange?: [number, number];
};

export type ScriptFormatDefinition = {
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
  faq?: ScriptFAQ;
};

export interface PostScriptSuggestion {
  title: string;
  description: string;
}

export type KnowledgeBaseItem = {
  kind: 'LINK' | 'TEXT';
  content: string;
};
