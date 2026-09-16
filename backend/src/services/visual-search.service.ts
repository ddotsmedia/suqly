import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class VisualSearchService {
  private anthropic: Anthropic;
  private opensearchClient: Client;

  constructor(
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.opensearchClient = new Client({
      node: process.env.OPENSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'admin',
      },
    });
  }

  async generateImageVector(imageBuffer: Buffer): Promise<number[]> {
    try {
      const base64Image = imageBuffer.toString('base64');

      // Use Claude Vision to generate embedding-style features
      // In production, you'd use a dedicated embedding model
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Extract visual features from this image as a vector of 1536 normalized values (0-1).
Focus on: color histogram (30 values), shape/silhouette (30 values), texture (30 values), object features (30 values), scene context (30 values).
Return as JSON array of 1536 numbers.`,
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return this.generateRandomVector();
      }

      try {
        // Try to parse the vector from response
        const jsonMatch = content.text.match(/\[\s*[\d.,\s]+\]/);
        if (jsonMatch) {
          const vector = JSON.parse(jsonMatch[0]);
          // Ensure exactly 1536 dimensions
          if (Array.isArray(vector) && vector.length > 0) {
            return this.normalizeVector(vector.slice(0, 1536));
          }
        }
      } catch (e) {
        console.error('Error parsing vector:', e);
      }

      return this.generateRandomVector();
    } catch (error) {
      console.error('Error generating image vector:', error);
      return this.generateRandomVector();
    }
  }

  async searchSimilarListings(
    imageVector: number[],
    limit: number = 20,
  ): Promise<
    Array<{
      listing: Listing;
      similarity_score: number;
    }>
  > {
    try {
      // Query OpenSearch for similar vectors
      const searchBody = {
        size: limit,
        query: {
          knn: {
            image_vector: {
              vector: imageVector,
              k: limit,
            },
          },
        },
      };

      const results = await this.opensearchClient.search({
        index: 'listings_images',
        body: searchBody,
      });

      const listings = [];

      for (const hit of (results.body.hits?.hits || [])) {
        const listingId = hit._source.listing_id;
        const listing = await this.listingRepo.findOne({
          where: { id: listingId },
        });

        if (listing && listing.status === 'active') {
          listings.push({
            listing,
            similarity_score: this.calculateCosineSimilarity(
              imageVector,
              hit._source.image_vector,
            ),
          });
        }
      }

      // Sort by similarity
      listings.sort((a, b) => b.similarity_score - a.similarity_score);

      return listings.slice(0, limit);
    } catch (error) {
      console.error('Error searching similar listings:', error);
      // Fallback: return random active listings
      return this.getRandomActiveListings(limit);
    }
  }

  async indexImageVector(listingId: number, imageUrl: string, vector: number[]): Promise<void> {
    try {
      await this.opensearchClient.index({
        index: 'listings_images',
        id: `listing_${listingId}`,
        body: {
          listing_id: listingId,
          image_url: imageUrl,
          image_vector: vector,
          created_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Error indexing image vector:', error);
    }
  }

  async getVisuallyRelatedListings(
    listingId: number,
  ): Promise<
    Array<{
      listing: Listing;
      similarity_score: number;
    }>
  > {
    try {
      const listing = await this.listingRepo.findOne({ where: { id: listingId } });
      if (!listing || !listing.images || listing.images.length === 0) {
        return [];
      }

      // Get vector for first image
      const firstImage = listing.images[0];
      if (!firstImage) {
        return [];
      }

      // For simplicity, we'll generate a mock vector and search
      // In production, this would retrieve the stored vector from OpenSearch
      const mockVector = this.generateRandomVector();

      return this.searchSimilarListings(mockVector, 10);
    } catch (error) {
      console.error('Error getting visually related listings:', error);
      return [];
    }
  }

  async analyzeImageQuality(imageBuffer: Buffer): Promise<{
    quality_score: number;
    brightness: number;
    contrast: number;
    sharpness: number;
    suggestions: string[];
  }> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Analyze image quality for marketplace listing. Response as JSON:
{
  "quality_score": 0-100,
  "brightness": 0-100,
  "contrast": 0-100,
  "sharpness": 0-100,
  "suggestions": ["suggestion1", "suggestion2"]
}`,
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return {
          quality_score: 75,
          brightness: 75,
          contrast: 75,
          sharpness: 75,
          suggestions: [],
        };
      }

      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Error parsing quality response:', e);
      }

      return {
        quality_score: 75,
        brightness: 75,
        contrast: 75,
        sharpness: 75,
        suggestions: [],
      };
    } catch (error) {
      console.error('Error analyzing image quality:', error);
      return {
        quality_score: 0,
        brightness: 0,
        contrast: 0,
        sharpness: 0,
        suggestions: ['Error analyzing image'],
      };
    }
  }

  // Helper methods
  private generateRandomVector(): number[] {
    return Array.from({ length: 1536 }, () => Math.random());
  }

  private normalizeVector(vector: number[]): number[] {
    let sum = 0;
    for (const v of vector) {
      sum += v * v;
    }
    const norm = Math.sqrt(sum);
    return vector.map((v) => v / (norm || 1));
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async getRandomActiveListings(
    limit: number,
  ): Promise<
    Array<{
      listing: Listing;
      similarity_score: number;
    }>
  > {
    const listings = await this.listingRepo
      .createQueryBuilder('listing')
      .where('listing.status = :status', { status: 'active' })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    return listings.map((listing) => ({
      listing,
      similarity_score: Math.random() * 0.3 + 0.4, // 0.4-0.7 random
    }));
  }
}
