import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class SearchNlpService {
  private anthropic: Anthropic;

  private categoryMapping: Record<string, string> = {
    // Vehicles
    'cars?': 'vehicles',
    'auto?|vehicles?|cars?|trucks?': 'vehicles',
    'motorcycles?|bikes?': 'motorcycles',
    'boats?|yachts?': 'boats',

    // Electronics
    'phones?|iphones?|galaxies?': 'mobile_phones',
    'laptops?|computers?|pcs?': 'computers',
    'tvs?|televisions?|screens?': 'electronics',
    'cameras?|dslrs?': 'cameras',

    // Real Estate
    'apartments?|flats?': 'apartments',
    'houses?|villas?': 'houses',
    'lands?|plots?': 'land',
    'offices?|commercial': 'commercial',

    // Furniture
    'sofas?|couches?': 'furniture',
    'beds?': 'furniture',
    'tables?|desks?': 'furniture',

    // Clothing
    'clothes?|shirts?|dresses?': 'clothing',
    'shoes?|sneakers?': 'shoes',
    'bags?|purses?': 'bags',

    // Services
    'tutoring?|lessons?|education': 'services',
    'cleaning|maintenance': 'services',
    'repair': 'services',
  };

  private emirateMapping: Record<string, string> = {
    'dubai?|dxb': 'dubai',
    'abudhabi?|abu dhabi|auh|ad': 'abu_dhabi',
    'sharjah?|sjh': 'sharjah',
    'ajman|ajm': 'ajman',
    'fujairah|fujairah': 'fujairah',
    'ras ?al ?khaimah|rak': 'ras_al_khaimah',
    'umm ?al ?quwain|uq': 'umm_al_quwain',
  };

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  private getClient(): Anthropic {
    if (!this.anthropic) {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
      });
    }
    return this.anthropic;
  }

  private isConfigured(): boolean {
    return this.apiKey && this.apiKey.startsWith('sk-');
  }

  async parseConversationalQuery(query: string): Promise<{
    intent: string;
    category?: string;
    emirate?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    sortBy?: string;
    filters: Record<string, any>;
  }> {
    if (!this.isConfigured()) {
      return this.parseQueryManually(query);
    }

    try {
      const response = await this.getClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Parse this marketplace search query and extract structured filters.
Query: "${query}"

Extract:
- intent: 'search' or 'browse'
- category: product category
- emirate: location (dubai, abu_dhabi, sharjah, etc)
- price_min: minimum price (if mentioned)
- price_max: maximum price (if mentioned)
- condition: new/used/like-new
- sort_by: price_asc, price_desc, newest, relevance
- keywords: search terms

Response as JSON only:
{
  "intent": "search",
  "category": "mobile_phones",
  "emirate": "dubai",
  "price_min": 500,
  "price_max": 2000,
  "condition": "used",
  "sort_by": "price_asc",
  "keywords": ["iphone", "13", "pro"]
}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return { intent: 'search', filters: {} };
      }

      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return this.parseQueryManually(query);
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
          intent: parsed.intent || 'search',
          category: this.normalizeCategory(parsed.category),
          emirate: this.normalizeEmirate(parsed.emirate),
          priceMin: parsed.price_min,
          priceMax: parsed.price_max,
          condition: this.normalizeCondition(parsed.condition),
          sortBy: this.normalizeSortBy(parsed.sort_by),
          filters: {
            keywords: parsed.keywords || [],
          },
        };
      } catch (e) {
        console.error('Error parsing Claude response:', e);
        return this.parseQueryManually(query);
      }
    } catch (error) {
      console.error('Error parsing conversational query:', error);
      return this.parseQueryManually(query);
    }
  }

  private parseQueryManually(query: string): {
    intent: string;
    category?: string;
    emirate?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    sortBy?: string;
    filters: Record<string, any>;
  } {
    const lowerQuery = query.toLowerCase();
    let category: string | undefined;
    let emirate: string | undefined;
    let priceMin: number | undefined;
    let priceMax: number | undefined;
    let condition: string | undefined;
    let sortBy: string | undefined;

    // Extract category
    for (const [pattern, cat] of Object.entries(this.categoryMapping)) {
      if (new RegExp(pattern, 'i').test(lowerQuery)) {
        category = cat;
        break;
      }
    }

    // Extract emirate
    for (const [pattern, em] of Object.entries(this.emirateMapping)) {
      if (new RegExp(pattern, 'i').test(lowerQuery)) {
        emirate = em;
        break;
      }
    }

    // Extract price range
    const pricePattern = /(\d+)\s*(?:to|-|–)\s*(\d+)/i;
    const priceMatch = lowerQuery.match(pricePattern);
    if (priceMatch) {
      priceMin = parseInt(priceMatch[1]);
      priceMax = parseInt(priceMatch[2]);
    } else {
      const minPattern = /(?:minimum|min|starting)\s*(?:price|cost)?\s*(?:aed|dhs)?\s*(\d+)/i;
      const minMatch = lowerQuery.match(minPattern);
      if (minMatch) priceMin = parseInt(minMatch[1]);

      const maxPattern = /(?:maximum|max|under|below)\s*(?:aed|dhs)?\s*(\d+)/i;
      const maxMatch = lowerQuery.match(maxPattern);
      if (maxMatch) priceMax = parseInt(maxMatch[1]);
    }

    // Extract condition
    if (/\bnew\b/i.test(lowerQuery)) condition = 'new';
    else if (/\bused\b/i.test(lowerQuery)) condition = 'used';
    else if (/\blike[\s-]?new\b/i.test(lowerQuery)) condition = 'like-new';

    // Extract sort preference
    if (/cheap|cheapest|lowest/i.test(lowerQuery)) sortBy = 'price_asc';
    else if (/expensive|most|highest/i.test(lowerQuery)) sortBy = 'price_desc';
    else if (/new|latest/i.test(lowerQuery)) sortBy = 'newest';

    return {
      intent: 'search',
      category,
      emirate,
      priceMin,
      priceMax,
      condition,
      sortBy,
      filters: {
        keywords: [query],
      },
    };
  }

  private normalizeCategory(cat?: string): string | undefined {
    if (!cat) return undefined;
    return cat.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeEmirate(em?: string): string | undefined {
    if (!em) return undefined;
    return em.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeCondition(cond?: string): string | undefined {
    if (!cond) return undefined;
    const normalized = cond.toLowerCase();
    if (normalized.includes('new')) return 'new';
    if (normalized.includes('like')) return 'like-new';
    if (normalized.includes('used')) return 'used';
    return undefined;
  }

  private normalizeSortBy(sort?: string): string | undefined {
    if (!sort) return undefined;
    return sort.toLowerCase();
  }

  async generateSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await this.getClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `Generate ${limit} relevant marketplace search suggestions based on: "${query}"

Return as JSON array of strings:
["suggestion1", "suggestion2", ...]`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return [];
      }

      try {
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]).slice(0, limit);
        }
      } catch (e) {
        console.error('Error parsing suggestions:', e);
      }

      return [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  async refineSearchResults(
    initialResults: Array<{ id: number; title: string }>,
    userFeedback: string,
  ): Promise<Array<{ id: number; title: string; reranked: boolean }>> {
    if (!this.isConfigured()) {
      return initialResults.map((r) => ({ ...r, reranked: false }));
    }

    try {
      const resultsList = initialResults
        .map((r, i) => `${i + 1}. ${r.title}`)
        .join('\n');

      const response = await this.getClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `User feedback: "${userFeedback}"

Current search results:
${resultsList}

Which results match the feedback? Return JSON with array of result indices (1-indexed):
{"matching_indices": [1, 3, 5]}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return initialResults.map((r) => ({ ...r, reranked: false }));
      }

      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const matchingIndices = new Set(parsed.matching_indices || []);

          // Reorder: matching first, then others
          const matching = initialResults.filter((_, i) =>
            matchingIndices.has(i + 1),
          );
          const others = initialResults.filter((_, i) => !matchingIndices.has(i + 1));

          return [
            ...matching.map((r) => ({ ...r, reranked: true })),
            ...others.map((r) => ({ ...r, reranked: false })),
          ];
        }
      } catch (e) {
        console.error('Error parsing rerank response:', e);
      }

      return initialResults.map((r) => ({ ...r, reranked: false }));
    } catch (error) {
      console.error('Error refining results:', error);
      return initialResults.map((r) => ({ ...r, reranked: false }));
    }
  }
}
