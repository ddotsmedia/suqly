import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { UsersService } from '../users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ListingsService', () => {
  let service: ListingsService;
  const mockListingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
        {
          provide: getRepositoryToken(ListingImage),
          useValue: mockImageRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException for non-existent listing', async () => {
    mockListingRepository.findOne.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when user tries to edit other user\'s listing', async () => {
    const listing = { id: 1, userId: 2, title: 'Test Listing' };
    mockListingRepository.findOne.mockResolvedValue(listing);

    await expect(
      service.update(1, 1, { title: 'Updated' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
