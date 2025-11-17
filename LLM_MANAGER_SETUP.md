# LLM Manager with Groq SDK

Complete integration of Groq SDK for AI-powered content generation in the SEO Postifier backend.

## Overview

The LLM Manager module provides a simple wrapper around the Groq SDK, enabling easy integration of large language models for content generation, SEO optimization, and text processing.

## Installation

```bash
cd seo-backend
pnpm add groq-sdk
```

## Structure

```
seo-backend/src/modules/llm-manager/
├── llm.constants.ts          # Model definitions and constants
├── groq.service.ts           # Groq SDK wrapper service
├── llm-manager.controller.ts # API endpoints for testing
├── llm-manager.module.ts     # NestJS module definition
└── index.ts                  # Barrel export file
```

## Model Constants

Three models are configured for different use cases:

### 1. SCRIPT_CREATION_MODEL
```typescript
const SCRIPT_CREATION_MODEL = 'openai/gpt-oss-120b';
```
**Use for**: Complex content generation, detailed articles, long-form content

### 2. MEDIUM_GENERATION_MODEL
```typescript
const MEDIUM_GENERATION_MODEL = 'llama-3.3-70b-versatile';
```
**Use for**: Balanced performance, general content generation, SEO descriptions

### 3. CHEAP_GENERATION_MODEL
```typescript
const CHEAP_GENERATION_MODEL = 'meta-llama/llama-guard-4-12b';
```
**Use for**: Content moderation, simple classifications, quick responses

## Configuration

### Environment Variables

Add to `.env`:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from: https://console.groq.com/keys

### Module Import

The module is already imported in `app.module.ts`:
```typescript
import { LlmManagerModule } from './modules/llm-manager';

@Module({
  imports: [
    // ... other imports
    LlmManagerModule,
  ],
})
export class AppModule {}
```

## Usage

### Basic Text Generation

```typescript
import { GroqService, MEDIUM_GENERATION_MODEL } from './modules/llm-manager';

@Injectable()
export class YourService {
  constructor(private readonly groqService: GroqService) {}

  async generateContent() {
    const response = await this.groqService.generate(
      'Write a short article about SEO best practices',
      {
        model: MEDIUM_GENERATION_MODEL,
        temperature: 0.7,
        maxTokens: 1024,
      }
    );

    console.log(response.content); // Generated text
    console.log(response.usage.totalTokens); // Token count
  }
}
```

### With System Prompt

```typescript
const response = await this.groqService.generate(
  'Write meta description for a blog about React hooks',
  {
    model: MEDIUM_GENERATION_MODEL,
    systemPrompt: 'You are an SEO expert. Generate concise, keyword-rich meta descriptions.',
    temperature: 0.5,
    maxTokens: 200,
  }
);
```

### Conversation with History

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful SEO assistant' },
  { role: 'user', content: 'What are the top SEO factors?' },
  { role: 'assistant', content: 'The top factors are...' },
  { role: 'user', content: 'Tell me more about backlinks' },
];

const response = await this.groqService.generateWithHistory(messages, {
  model: MEDIUM_GENERATION_MODEL,
});
```

### Streaming Responses

```typescript
async generateStreamingContent() {
  const stream = this.groqService.generateStream(
    'Write a long article about SEO',
    {
      model: SCRIPT_CREATION_MODEL,
      maxTokens: 4096,
    }
  );

  for await (const chunk of stream) {
    // Process each chunk as it arrives
    process.stdout.write(chunk);
  }
}
```

## API Endpoints

### POST /llm/generate

Test the LLM generation through REST API (documented in Swagger).

**Request:**
```json
{
  "prompt": "Write a short article about SEO best practices",
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.7,
  "maxTokens": 1024,
  "systemPrompt": "You are an SEO expert and content writer."
}
```

**Response:**
```json
{
  "content": "SEO (Search Engine Optimization) is crucial...",
  "model": "llama-3.3-70b-versatile",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 487,
    "totalTokens": 512
  },
  "finishReason": "stop"
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:4000/llm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a meta description for an article about WordPress plugins",
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.5,
    "maxTokens": 200
  }'
```

## Service Methods

### `generate(prompt, options)`

Generate text completion.

**Parameters:**
- `prompt` (string): The user prompt
- `options` (optional):
  - `model`: Model to use (default: MEDIUM_GENERATION_MODEL)
  - `temperature`: 0-2 (default: 0.7)
  - `maxTokens`: Max tokens to generate (default: 1024)
  - `topP`: Nucleus sampling (default: 1)
  - `systemPrompt`: System message for context

**Returns:** `Promise<LLMResponse>`

### `generateStream(prompt, options)`

Generate streaming text completion.

**Parameters:** Same as `generate()`

**Returns:** `AsyncIterable<string>`

### `generateWithHistory(messages, options)`

Generate with conversation context.

**Parameters:**
- `messages`: Array of `{ role, content }` objects
- `options`: Same as `generate()` (except systemPrompt)

**Returns:** `Promise<LLMResponse>`

## Response Type

```typescript
interface LLMResponse {
  content: string;           // Generated text
  model: string;            // Model used
  usage: {
    promptTokens: number;   // Input tokens
    completionTokens: number; // Output tokens
    totalTokens: number;    // Total tokens
  };
  finishReason: string;     // 'stop', 'length', etc.
}
```

## Example: SEO Content Generation

```typescript
import { Injectable } from '@nestjs/common';
import {
  GroqService,
  SCRIPT_CREATION_MODEL,
  MEDIUM_GENERATION_MODEL
} from './modules/llm-manager';

@Injectable()
export class SeoContentService {
  constructor(private readonly groqService: GroqService) {}

  async generateBlogPost(topic: string, keywords: string[]) {
    const systemPrompt = `You are an expert SEO content writer.
    Write engaging, well-structured articles that rank well in search engines.
    Focus on: ${keywords.join(', ')}`;

    const prompt = `Write a comprehensive blog post about: ${topic}

    Requirements:
    - 800-1000 words
    - Include H2 and H3 headings
    - Natural keyword integration
    - Engaging introduction and conclusion`;

    const response = await this.groqService.generate(prompt, {
      model: SCRIPT_CREATION_MODEL,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    return {
      content: response.content,
      tokensUsed: response.usage.totalTokens,
      model: response.model,
    };
  }

  async generateMetaDescription(title: string, content: string) {
    const prompt = `Create an SEO-optimized meta description for:
    Title: ${title}
    Content preview: ${content.substring(0, 200)}...

    Requirements:
    - 150-160 characters
    - Include primary keyword
    - Compelling call-to-action`;

    const response = await this.groqService.generate(prompt, {
      model: MEDIUM_GENERATION_MODEL,
      systemPrompt: 'You are an SEO expert specializing in meta descriptions.',
      temperature: 0.5,
      maxTokens: 100,
    });

    return response.content.trim();
  }

  async generateKeywords(content: string) {
    const response = await this.groqService.generate(
      `Extract 10 relevant SEO keywords from this content:\n${content}`,
      {
        model: MEDIUM_GENERATION_MODEL,
        temperature: 0.3,
        maxTokens: 200,
      }
    );

    return response.content.split('\n').filter(k => k.trim());
  }
}
```

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const response = await this.groqService.generate(prompt);
  // Use response
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle API key error
  } else if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else {
    // Handle other errors
  }
}
```

## Best Practices

### 1. Choose the Right Model

- **Long-form content**: Use SCRIPT_CREATION_MODEL
- **General tasks**: Use MEDIUM_GENERATION_MODEL
- **Simple tasks**: Use CHEAP_GENERATION_MODEL

### 2. Optimize Token Usage

```typescript
// Be specific in prompts
const response = await groqService.generate(
  'Write a 200-word article about React hooks',
  { maxTokens: 300 } // Account for prompt tokens
);
```

### 3. Use System Prompts

```typescript
// Better results with context
const response = await groqService.generate(prompt, {
  systemPrompt: 'You are an expert in modern web development with focus on SEO.',
});
```

### 4. Temperature Settings

- **Creative content** (0.7-1.0): Blog posts, articles
- **Factual content** (0.3-0.5): Meta descriptions, keywords
- **Deterministic** (0-0.2): Classifications, extractions

### 5. Stream for Long Content

```typescript
// Better UX for long responses
for await (const chunk of groqService.generateStream(prompt)) {
  // Send chunk to client immediately
  socket.emit('chunk', chunk);
}
```

## Testing

### Test via Swagger

1. Start the backend: `pnpm run start:dev`
2. Open Swagger UI: http://localhost:4000/api
3. Navigate to **llm** tag
4. Test `/llm/generate` endpoint

### Test Programmatically

```typescript
import { Test } from '@nestjs/testing';
import { GroqService } from './groq.service';

describe('GroqService', () => {
  let service: GroqService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GroqService],
    }).compile();

    service = module.get<GroqService>(GroqService);
  });

  it('should generate text', async () => {
    const response = await service.generate('Hello, world!');
    expect(response.content).toBeDefined();
    expect(response.usage.totalTokens).toBeGreaterThan(0);
  });
});
```

## Swagger Documentation

All endpoints are fully documented in Swagger:

- **Tag**: `llm`
- **Endpoint**: `POST /llm/generate`
- **Interactive testing**: "Try it out" button
- **Request/Response examples**: Included

Access at: http://localhost:4000/api

## Troubleshooting

### "GROQ_API_KEY is required" Error

```bash
# Set in .env file
echo "GROQ_API_KEY=your_key_here" >> seo-backend/.env

# Or export temporarily
export GROQ_API_KEY=your_key_here
```

### Rate Limiting

Groq has rate limits. Implement retry logic:

```typescript
async generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.groqService.generate(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

### Token Limits

Different models have different limits:

- Monitor `usage.totalTokens` in responses
- Use `maxTokens` to control output length
- Split large prompts if needed

## Integration Examples

### With Posts Module

```typescript
// In posts.service.ts
import { GroqService, MEDIUM_GENERATION_MODEL } from '../llm-manager';

@Injectable()
export class PostsService {
  constructor(
    private readonly groqService: GroqService,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async createPostWithAI(topic: string, keywords: string[]) {
    // Generate content
    const content = await this.groqService.generate(
      `Write an article about: ${topic}`,
      {
        model: MEDIUM_GENERATION_MODEL,
        systemPrompt: `Focus on these keywords: ${keywords.join(', ')}`,
      }
    );

    // Generate meta
    const metaDescription = await this.groqService.generate(
      `Write a meta description for: ${topic}`,
      { maxTokens: 200 }
    );

    // Save to database
    const post = new this.postModel({
      title: topic,
      content: content.content,
      metaDescription: metaDescription.content,
      keywords,
      status: 'draft',
    });

    return post.save();
  }
}
```

### With WordPress Plugin

The WordPress plugin can call the backend API:

```php
// In WordPress plugin
$response = wp_remote_post('http://localhost:4000/llm/generate', [
    'body' => json_encode([
        'prompt' => 'Write about ' . $topic,
        'model' => 'llama-3.3-70b-versatile',
    ]),
    'headers' => ['Content-Type' => 'application/json'],
]);

$data = json_decode(wp_remote_retrieve_body($response));
$generated_content = $data->content;
```

## Next Steps

1. **Set your API key**: Add `GROQ_API_KEY` to `.env`
2. **Test the endpoint**: Use Swagger UI at http://localhost:4000/api
3. **Integrate with Posts**: Use GroqService in your post generation logic
4. **Add more endpoints**: Create specialized endpoints for different content types
5. **Implement caching**: Cache common prompts to reduce API calls

## Resources

- **Groq Console**: https://console.groq.com
- **Groq Documentation**: https://console.groq.com/docs
- **Available Models**: https://console.groq.com/docs/models
- **Rate Limits**: Check Groq dashboard

---

**All set up and ready to generate AI-powered content!** 🚀
