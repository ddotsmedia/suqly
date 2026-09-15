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
  Request,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  BadRequestException,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

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
    @Body() body: { imageUrl: string; thumbnailUrl: string },
  ) {
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
}
