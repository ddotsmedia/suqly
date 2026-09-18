import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch, EmailFrequency } from './saved-search.entity';
import { ListingsService } from './listings.service';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearch)
    private savedSearchRepository: Repository<SavedSearch>,
    private listingsService: ListingsService,
  ) {}

  async create(
    userId: number,
    name: string,
    query: Record<string, any>,
    filters: Record<string, any>,
    emailAlert: boolean = false,
    frequency: EmailFrequency = 'never',
  ): Promise<SavedSearch> {
    const savedSearch = this.savedSearchRepository.create({
      userId,
      name,
      query,
      filters,
      emailAlert,
      frequency,
    });
    return this.savedSearchRepository.save(savedSearch);
  }

  async findByUser(
    userId: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: SavedSearch[]; total: number }> {
    const [data, total] = await this.savedSearchRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total };
  }

  async findById(id: number, userId: number): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, userId },
    });

    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }

    return savedSearch;
  }

  async update(
    id: number,
    userId: number,
    name: string,
    query: Record<string, any>,
    filters: Record<string, any>,
    emailAlert: boolean,
    frequency: EmailFrequency,
  ): Promise<SavedSearch> {
    const savedSearch = await this.findById(id, userId);

    Object.assign(savedSearch, {
      name,
      query,
      filters,
      emailAlert,
      frequency,
    });

    return this.savedSearchRepository.save(savedSearch);
  }

  async delete(id: number, userId: number): Promise<void> {
    const savedSearch = await this.findById(id, userId);
    await this.savedSearchRepository.remove(savedSearch);
  }

  async findDueForEmailAlert(): Promise<SavedSearch[]> {
    const now = new Date();
    const dailyCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weeklyCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const searches = await this.savedSearchRepository
      .createQueryBuilder('ss')
      .where('ss.emailAlert = :emailAlert', { emailAlert: true })
      .andWhere(
        '(ss.frequency = :daily AND (ss.lastAlertSent IS NULL OR ss.lastAlertSent < :dailyCutoff)) OR (ss.frequency = :weekly AND (ss.lastAlertSent IS NULL OR ss.lastAlertSent < :weeklyCutoff))',
        {
          daily: 'daily',
          weekly: 'weekly',
          dailyCutoff,
          weeklyCutoff,
        },
      )
      .leftJoinAndSelect('ss.user', 'user')
      .getMany();

    return searches;
  }

  async markAlertSent(id: number): Promise<void> {
    await this.savedSearchRepository.update(
      { id },
      { lastAlertSent: new Date() },
    );
  }

  async searchListings(
    query: Record<string, any>,
    filters: Record<string, any>,
  ): Promise<any[]> {
    return this.listingsService.findAll(filters, 1, 100);
  }
}
