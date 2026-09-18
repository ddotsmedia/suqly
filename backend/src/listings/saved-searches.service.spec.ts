import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearch } from './saved-search.entity';
import { ListingsService } from './listings.service';
import { NotFoundException } from '@nestjs/common';

describe('SavedSearchesService', () => {
  let service: SavedSearchesService;
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockListingsService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchesService,
        {
          provide: getRepositoryToken(SavedSearch),
          useValue: mockRepository,
        },
        {
          provide: ListingsService,
          useValue: mockListingsService,
        },
      ],
    }).compile();

    service = module.get<SavedSearchesService>(SavedSearchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a saved search', async () => {
    const savedSearch = {
      id: 1,
      userId: 1,
      name: 'Test Search',
      query: { keyword: 'iphone' },
      filters: { emirate: 'dubai' },
      emailAlert: true,
      frequency: 'daily',
    };

    mockRepository.create.mockReturnValue(savedSearch);
    mockRepository.save.mockResolvedValue(savedSearch);

    const result = await service.create(1, 'Test Search', { keyword: 'iphone' }, { emirate: 'dubai' }, true, 'daily');

    expect(result).toEqual(savedSearch);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should find saved searches by user', async () => {
    const searches = [
      { id: 1, name: 'Search 1', userId: 1 },
      { id: 2, name: 'Search 2', userId: 1 },
    ];

    mockRepository.findAndCount.mockResolvedValue([searches, 2]);

    const result = await service.findByUser(1, 10, 0);

    expect(result.data).toEqual(searches);
    expect(result.total).toBe(2);
  });

  it('should throw NotFoundException for non-existent saved search', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findById(999, 1)).rejects.toThrow(NotFoundException);
  });

  it('should update a saved search', async () => {
    const originalSearch = { id: 1, userId: 1, name: 'Old Name' };
    const updatedSearch = { ...originalSearch, name: 'New Name' };

    mockRepository.findOne.mockResolvedValue(originalSearch);
    mockRepository.save.mockResolvedValue(updatedSearch);

    const result = await service.update(1, 1, 'New Name', {}, {}, false, 'never');

    expect(result.name).toBe('New Name');
  });

  it('should delete a saved search', async () => {
    const search = { id: 1, userId: 1, name: 'Test' };

    mockRepository.findOne.mockResolvedValue(search);
    mockRepository.remove.mockResolvedValue(search);

    await service.delete(1, 1);

    expect(mockRepository.remove).toHaveBeenCalledWith(search);
  });

  it('should search listings with saved query and filters', async () => {
    const listings = [
      { id: 1, title: 'Item 1', price: 1000 },
      { id: 2, title: 'Item 2', price: 2000 },
    ];

    mockListingsService.findAll.mockResolvedValue(listings);

    const result = await service.searchListings({}, { emirate: 'dubai' });

    expect(result).toEqual(listings);
  });
});
