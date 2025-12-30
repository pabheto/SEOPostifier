/**
 * Safely parses JSON content by cleaning common formatting issues
 * that LLMs might introduce (like markdown code blocks, extra backticks, etc.)
 */
export function safeJsonParse<T = unknown>(content: string): T {
  // Remove markdown code blocks with json language identifier
  let cleaned = content.trim();

  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/, '');

  // Remove any leading/trailing backticks that might remain
  cleaned = cleaned.replace(/^`+/, '');
  cleaned = cleaned.replace(/`+$/, '');

  // Remove any leading/trailing whitespace again after cleaning
  cleaned = cleaned.trim();

  // Try to parse the cleaned content
  return JSON.parse(cleaned) as T;
}

/**
 * Attempts to parse JSON with automatic cleanup.
 * If parsing fails, returns the error for manual handling.
 */
export function trySafeJsonParse<T = unknown>(
  content: string,
): { success: true; data: T } | { success: false; error: Error } {
  try {
    const data = safeJsonParse<T>(content);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

