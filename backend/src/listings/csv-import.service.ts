import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';

interface CsvRow {
  title?: string;
  category?: string;
  price?: string;
  description?: string;
  condition?: string;
  location?: string;
  phone?: string;
  whatsapp_enabled?: string;
  telegram_username?: string;
  [key: string]: string | undefined;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface ImportResult {
  created: number;
  failed: number;
  errors: ValidationError[];
  listings: number[];
}

interface FieldMapping {
  title: string;
  category: string;
  price: string;
  description?: string;
  condition?: string;
  location?: string;
  phone?: string;
  whatsapp_enabled?: string;
  telegram_username?: string;
}

const VALID_CATEGORIES = [
  'goods',
  'property',
  'motors',
  'jobs',
  'services',
  'businesses',
];
const VALID_CONDITIONS = ['new', 'used', 'refurbished'];
const VALID_EMIRATES = [
  'dubai',
  'abudhabi',
  'sharjah',
  'ajman',
  'umm_al_quwain',
  'ras_al_khaimah',
  'fujairah',
  'al_ain',
];

@Injectable()
export class CsvImportService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(ListingImage)
    private imagesRepository: Repository<ListingImage>,
  ) {}

  async parseCSV(buffer: Buffer): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvRow[] = [];
      const stream = Readable.from([buffer]);

      stream
        .pipe(csvParser())
        .on('data', (row: CsvRow) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (error) => {
          reject(new BadRequestException(`CSV parsing error: ${error.message}`));
        });
    });
  }

  validateRow(
    row: CsvRow,
    rowIndex: number,
    fieldMapping: FieldMapping,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const title = row[fieldMapping.title]?.trim();
    if (!title) {
      errors.push({
        row: rowIndex,
        field: 'title',
        value: title || '',
        error: 'Required field',
      });
    } else if (title.length > 200) {
      errors.push({
        row: rowIndex,
        field: 'title',
        value: title,
        error: 'Max 200 characters',
      });
    }

    const category = row[fieldMapping.category]?.trim().toLowerCase();
    if (!category) {
      errors.push({
        row: rowIndex,
        field: 'category',
        value: category || '',
        error: 'Required field',
      });
    } else if (!VALID_CATEGORIES.includes(category)) {
      errors.push({
        row: rowIndex,
        field: 'category',
        value: category,
        error: `Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    const priceStr = row[fieldMapping.price]?.trim();
    const price = priceStr ? parseFloat(priceStr) : null;
    if (!price || isNaN(price) || price < 1) {
      errors.push({
        row: rowIndex,
        field: 'price',
        value: priceStr || '',
        error: 'Required and must be a number >= 1',
      });
    }

    const description = row[fieldMapping.description]?.trim();
    if (description && description.length > 5000) {
      errors.push({
        row: rowIndex,
        field: 'description',
        value: description.substring(0, 50),
        error: 'Max 5000 characters',
      });
    }

    const condition = row[fieldMapping.condition]?.trim().toLowerCase();
    if (condition && !VALID_CONDITIONS.includes(condition)) {
      errors.push({
        row: rowIndex,
        field: 'condition',
        value: condition,
        error: `Must be one of: ${VALID_CONDITIONS.join(', ')}`,
      });
    }

    if (fieldMapping.phone) {
      const phone = row[fieldMapping.phone]?.trim();
      if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        errors.push({
          row: rowIndex,
          field: 'phone',
          value: phone,
          error: 'Invalid phone number format (E.164)',
        });
      }
    }

    return errors;
  }

  async importListings(
    buffer: Buffer,
    userId: number,
    fieldMapping: FieldMapping,
    imageIds?: number[],
  ): Promise<ImportResult> {
    const rows = await this.parseCSV(buffer);

    if (!rows.length) {
      throw new BadRequestException('CSV file is empty');
    }

    if (rows.length > 100) {
      throw new BadRequestException('Maximum 100 listings per import');
    }

    const result: ImportResult = {
      created: 0,
      failed: 0,
      errors: [],
      listings: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validationErrors = this.validateRow(row, i + 2, fieldMapping);

      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        result.failed++;
        continue;
      }

      try {
        const listing = await this.createListingFromRow(
          row,
          userId,
          fieldMapping,
        );

        if (imageIds && imageIds.length > 0) {
          await this.attachImagesToListing(listing.id, imageIds);
        }

        result.listings.push(listing.id);
        result.created++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          field: 'general',
          value: '',
          error: error instanceof Error ? error.message : 'Failed to create listing',
        });
      }
    }

    return result;
  }

  private async createListingFromRow(
    row: CsvRow,
    userId: number,
    fieldMapping: FieldMapping,
  ): Promise<Listing> {
    const title = row[fieldMapping.title]?.trim() || '';
    const category = row[fieldMapping.category]?.trim().toLowerCase() || '';
    const priceStr = row[fieldMapping.price]?.trim() || '0';
    const price = parseFloat(priceStr);
    const description = row[fieldMapping.description]?.trim() || '';
    const location = row[fieldMapping.location]?.trim() || 'dubai';

    const listing = this.listingsRepository.create({
      userId,
      title,
      category,
      price,
      description,
      emirate: location.toLowerCase(),
      status: 'pending_review',
      currency: 'AED',
      slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    });

    return this.listingsRepository.save(listing);
  }

  private async attachImagesToListing(
    listingId: number,
    imageIds: number[],
  ): Promise<void> {
    for (const imageId of imageIds) {
      const image = await this.imagesRepository.findOne({
        where: { id: imageId },
      });

      if (image) {
        image.listingId = listingId;
        await this.imagesRepository.save(image);
      }
    }
  }

  generateTemplate(): string {
    const headers = [
      'title',
      'category',
      'price',
      'description',
      'condition',
      'location',
      'phone',
      'whatsapp_enabled',
      'telegram_username',
    ];
    const example = [
      'iPhone 15 Pro Max',
      'goods',
      '4500',
      'Excellent condition, original box included',
      'used',
      'dubai',
      '+971501234567',
      'yes',
      '@username',
    ];

    return [headers.join(','), example.join(',')].join('\n');
  }
}
