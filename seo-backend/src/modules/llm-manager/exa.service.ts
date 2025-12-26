import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exa from 'exa-js';

@Injectable()
export class ExaService {
  private readonly exa: Exa;
  private readonly logger = new Logger(ExaService.name);
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('EXA_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'EXA_API_KEY not found in environment variables. API calls will fail until configured.',
      );
    }

    this.exa = new Exa(apiKey);
  }

  async search({
    query,
    numResults = 10,
  }: {
    query: string;
    numResults: number;
  }) {
    const results = await this.exa.search(query, {
      numResults,
      contents: {
        text: true,
        context: { maxCharacters: 10000, maxSnippets: 10 },
      },
    });
    return results;
  }
}
