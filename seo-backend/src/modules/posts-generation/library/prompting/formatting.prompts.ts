import { LLMPrompt } from 'src/library/types/llm-prompts.types';

export class FormattingPrompts {
  static readonly FIX_JSON_PROMPT = (
    invalidJson: string,
    parseError: string,
  ): LLMPrompt => {
    const systemPrompt = `You are a JSON repair specialist. Your task is to fix a malformed JSON string so it can be parsed correctly.
    
    **CRITICAL REQUIREMENTS:**
    1. Output ONLY valid JSON - no code blocks, no backticks, no markdown formatting
    2. Ensure all special characters are properly escaped
    3. Use double quotes for all strings (never single quotes)
    4. Remove any trailing commas
    5. Ensure all escape sequences are correct (\\n, \\t, \\", \\\\, etc.)
    6. Fix any unclosed brackets, braces, or quotes
    7. Remove any text before or after the JSON object
    
    **Original JSON (with errors):**
    ${invalidJson}
    
    **Parse Error:**
    ${parseError}
    
    **Your task:**
    Fix the JSON string above to make it valid and parseable. Return ONLY the corrected JSON object with no additional text, comments, or formatting characters.
    
    **Important:**
    - Preserve all the data and structure from the original JSON
    - Only fix syntax errors, escaping issues, and formatting problems
    - Do not change the content or meaning of the data
    - Ensure the output is a single, valid JSON object that can be parsed by JSON.parse()
    `;

    const userPrompt = `
    **Original JSON (with errors):**
    ${invalidJson}
    
    **Parse Error:**
    ${parseError}
    
    Fix the JSON string above to make it valid and parseable. Return ONLY the corrected JSON object with no additional text, comments, or formatting characters.
    `;

    return {
      systemPrompts: [systemPrompt],
      userPrompts: [userPrompt],
    };
  };
}
