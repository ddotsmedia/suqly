import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  BadRequestException,
  ParseFloatPipe,
  ParseIntPipe,
  UploadedFiles,
  UploadedFile,
  Response,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ListingsService } from './listings.service';
import { GeocodingService } from './geocoding.service';
import { ImageUploadService } from './image-upload.service';
import { CsvImportService } from './csv-import.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private listingsService: ListingsService,
    private geocodingService: GeocodingService,
    private imageUploadService: ImageUploadService,
    private csvImportService: CsvImportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active listings with filters' })
  async getListings(
    @Query('category') category?: string,
    @Query('emirate') emirate?: string,
    @Query('community') community?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      category,
      emirate,
      community,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
    };

    const result = await this.listingsService.findAll(
      filters,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );

    return {
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date(),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get listing by slug' })
  async getBySlug(@Param('slug') slug: string) {
    const listing = await this.listingsService.findBySlug(slug);
    return {
      success: true,
      data: listing,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  async getListing(@Param('id') id: string) {
    const listing = await this.listingsService.findById(parseInt(id));
    return {
      success: true,
      data: listing,
      timestamp: new Date(),
    };
  }

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new listing (authenticated)' })
  async createListing(@Body() createData: any, @Request() req: any) {
    if (!createData.title || !createData.category || !createData.emirate) {
      throw new BadRequestException(
        'Title, category, and emirate are required',
      );
    }

    const listing = await this.listingsService.create(req.user.id, createData);
    return {
      success: true,
      data: listing,
      timestamp: new Date(),
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing (authenticated)' })
  async updateListing(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    const listing = await this.listingsService.update(
      parseInt(id),
      req.user.id,
      updateData,
    );
    return {
      success: true,
      data: listing,
      timestamp: new Date(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing (authenticated)' })
  async deleteListing(@Param('id') id: string, @Request() req: any) {
    await this.listingsService.delete(parseInt(id), req.user.id);
    return {
      success: true,
      data: { id: parseInt(id) },
      timestamp: new Date(),
    };
  }

  @Post(':id/publish')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish listing (authenticated)' })
  async publishListing(@Param('id') id: string, @Request() req: any) {
    const listing = await this.listingsService.publish(parseInt(id), req.user.id);
    return {
      success: true,
      data: listing,
      timestamp: new Date(),
    };
  }

  @Post(':id/images')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add image to listing (authenticated)' })
  async addImage(
    @Param('id') id: string,
    @Body() body: { imageUrl?: string; thumbnailUrl?: string; imageBase64?: string },
  ) {
    if (body.imageBase64) {
      const image = await this.listingsService.addImageWithCompression(
        parseInt(id),
        body.imageBase64,
      );
      return {
        success: true,
        data: image,
        timestamp: new Date(),
      };
    }

    const image = await this.listingsService.addImage(
      parseInt(id),
      body.imageUrl,
      body.thumbnailUrl,
    );
    return {
      success: true,
      data: image,
      timestamp: new Date(),
    };
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get listings within radius (spatial search)' })
  async getNearbyListings(
    @Query('lat', new ParseFloatPipe()) lat: number,
    @Query('lng', new ParseFloatPipe()) lng: number,
    @Query('radius', new ParseIntPipe({ optional: true })) radius: number = 5,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const listings = await this.listingsService.findAll({}, 1, 1000);
    const nearby = await this.geocodingService.searchNearby(
      lat,
      lng,
      radius,
      listings.data,
    );
    return {
      success: true,
      data: nearby.slice(0, limit),
      count: nearby.length,
      timestamp: new Date(),
    };
  }

  @Get(':id/coordinates')
  @ApiOperation({ summary: 'Get listing coordinates' })
  async getCoordinates(@Param('id', new ParseIntPipe()) id: number) {
    const listing = await this.listingsService.findById(id);
    return {
      success: true,
      data: {
        id: listing.id,
        coordinates: listing.getCoordinates(),
        address: listing.addressGeo,
      },
      timestamp: new Date(),
    };
  }

  @Post('geocode')
  @ApiOperation({ summary: 'Forward geocode address' })
  async geocodeAddress(@Body() body: { address: string }) {
    const result = await this.geocodingService.forwardGeocode(body.address);
    return {
      success: !!result,
      data: result,
      timestamp: new Date(),
    };
  }

  @Post('upload/images')
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload multiple images (authenticated)' })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    await this.imageUploadService.validateMultipleImages(files);
    await this.imageUploadService.ensureUploadDir();

    const images = [];
    for (const file of files) {
      const compressed = await this.imageUploadService.validateAndCompressImage(file);
      images.push({
        id: compressed.id,
        filename: compressed.filename,
        sizeBytes: compressed.sizeBytes,
        uploadedAt: new Date(),
      });
    }

    return {
      success: true,
      data: { images },
      timestamp: new Date(),
    };
  }

  @Get('import/csv/template')
  @ApiOperation({ summary: 'Download CSV import template' })
  async getCsvTemplate(@Response() res: any) {
    const template = this.csvImportService.generateTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=listings-template.csv');
    res.send(template);
  }

  @Post('import/csv')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import listings from CSV (authenticated)' })
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { fieldMapping?: string; imageIds?: string },
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No CSV file provided');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be CSV format');
    }

    const fieldMapping = body.fieldMapping
      ? JSON.parse(body.fieldMapping)
      : {
          title: 'title',
          category: 'category',
          price: 'price',
          description: 'description',
          condition: 'condition',
          location: 'location',
          phone: 'phone',
          whatsapp_enabled: 'whatsapp_enabled',
          telegram_username: 'telegram_username',
        };

    const imageIds = body.imageIds
      ? body.imageIds.split(',').map((id) => parseInt(id))
      : [];

    const result = await this.csvImportService.importListings(
      file.buffer,
      req.user.id,
      fieldMapping,
      imageIds,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }
}
