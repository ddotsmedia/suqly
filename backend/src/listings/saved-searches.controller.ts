import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearch, EmailFrequency } from './saved-search.entity';

@Controller('listings/saved-searches')
@UseGuards(JwtGuard)
export class SavedSearchesController {
  constructor(private savedSearchesService: SavedSearchesService) {}

  @Post()
  async create(
    @Request() req,
    @Body() body: any,
  ): Promise<SavedSearch> {
    const {
      name,
      query,
      filters,
      emailAlert = false,
      frequency = 'never',
    } = body;

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    return this.savedSearchesService.create(
      req.user.id,
      name,
      query || {},
      filters || {},
      emailAlert,
      frequency,
    );
  }

  @Get()
  async findByUser(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ): Promise<{ data: SavedSearch[]; total: number }> {
    return this.savedSearchesService.findByUser(req.user.id, limit, offset);
  }

  @Get(':id')
  async findById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SavedSearch> {
    return this.savedSearchesService.findById(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ): Promise<SavedSearch> {
    const {
      name,
      query,
      filters,
      emailAlert = false,
      frequency = 'never',
    } = body;

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    return this.savedSearchesService.update(
      id,
      req.user.id,
      name,
      query || {},
      filters || {},
      emailAlert,
      frequency,
    );
  }

  @Delete(':id')
  async delete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.savedSearchesService.delete(id, req.user.id);
    return { success: true };
  }

  @Get(':id/results')
  async getResults(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any[]> {
    const savedSearch = await this.savedSearchesService.findById(
      id,
      req.user.id,
    );
    return this.savedSearchesService.searchListings(
      savedSearch.query,
      savedSearch.filters,
    );
  }
}
