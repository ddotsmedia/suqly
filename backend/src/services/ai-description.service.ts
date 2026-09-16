import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiDescriptionService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateFromImage(
    imageBuffer: Buffer,
  ): Promise<{
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    confidence: number;
  }> {
    try {
      // Convert buffer to base64 for Claude Vision API
      const base64Image = imageBuffer.toString('base64');

      // Detect image type (assume JPEG for now, could be improved)
      const mediaType = 'image/jpeg';

      // Call Claude Vision to analyze image
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Analyze this product/item image and provide:
1. A concise title (max 60 chars) in English
2. A concise title (max 60 chars) in Arabic
3. A detailed description (200-300 words) in English
4. A detailed description (200-300 words) in Arabic

Focus on:
- Item type and brand (if visible)
- Condition (new, used, like-new)
- Color, size, materials
- Notable features or defects
- Estimated value category (budget, mid-range, premium)

Format your response as JSON:
{
  "title_en": "...",
  "title_ar": "...",
  "description_en": "...",
  "description_ar": "...",
  "confidence": 0.85
}`,
              },
            ],
          },
        ],
      });

      // Extract JSON from response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        title_en: result.title_en || 'Item',
        title_ar: result.title_ar || 'عنصر',
        description_en: result.description_en || '',
        description_ar: result.description_ar || '',
        confidence: result.confidence || 0.8,
      };
    } catch (error) {
      console.error('Error generating description from image:', error);
      return {
        title_en: 'Item',
        title_ar: 'عنصر',
        description_en: 'Item for sale',
        description_ar: 'عنصر للبيع',
        confidence: 0,
      };
    }
  }

  async generateProductTitle(imageBuffer: Buffer, category?: string): Promise<string> {
    try {
      const base64Image = imageBuffer.toString('base64');
      const mediaType = 'image/jpeg';

      const prompt = category
        ? `Generate a short, compelling product title (max 60 chars) for a ${category} item shown in this image. Just the title, nothing else.`
        : 'Generate a short, compelling product title (max 60 chars) for the item shown in this image. Just the title, nothing else.';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return 'Item';
      }

      return content.text.trim().substring(0, 60);
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Item';
    }
  }

  async detectItemCondition(
    imageBuffer: Buffer,
  ): Promise<{
    condition: string;
    confidence: number;
    details: string;
  }> {
    try {
      const base64Image = imageBuffer.toString('base64');
      const mediaType = 'image/jpeg';

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
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Assess the condition of this item. Response format:
{
  "condition": "new|like-new|used|heavily-used",
  "confidence": 0.0-1.0,
  "details": "Brief description of condition"
}`,
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return { condition: 'unknown', confidence: 0, details: '' };
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { condition: 'unknown', confidence: 0, details: '' };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error detecting condition:', error);
      return { condition: 'unknown', confidence: 0, details: '' };
    }
  }

  async extractProductFeatures(
    imageBuffer: Buffer,
  ): Promise<{
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
    features: string[];
  }> {
    try {
      const base64Image = imageBuffer.toString('base64');
      const mediaType = 'image/jpeg';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Extract product features from this image. Response format:
{
  "brand": "Brand name or null",
  "color": "Color or null",
  "size": "Size or null",
  "material": "Material or null",
  "features": ["feature1", "feature2"]
}`,
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return { features: [] };
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { features: [] };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error extracting features:', error);
      return { features: [] };
    }
  }

  async generateArabicDescription(englishDescription: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Translate this product description to Arabic, maintaining the professional tone and detail:

${englishDescription}

Provide only the Arabic translation, nothing else.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return '';
      }

      return content.text.trim();
    } catch (error) {
      console.error('Error generating Arabic description:', error);
      return '';
    }
  }

  async improveDescription(rawDescription: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Improve this product description for a marketplace listing. Make it more compelling and professional while keeping the facts:

${rawDescription}

Provide the improved version only, no explanations.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return rawDescription;
      }

      return content.text.trim();
    } catch (error) {
      console.error('Error improving description:', error);
      return rawDescription;
    }
  }
}
