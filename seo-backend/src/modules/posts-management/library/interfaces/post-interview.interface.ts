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
  sourceValue?: string;
  description?: string;
  alt?: string;
};

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

export type ScriptSection = {
  id: string;
  level: HeadingLevel;
  title: string;
  lengthRange: [number, number];
  description: string;
  images?: IUserImage[];
  links: {
    internal: string[];
    external: string[];
  };
};

export type ScriptFAQ = {
  description: string;
};

export type ScriptFormatDefinition = {
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
  faq?: ScriptFAQ;
};
