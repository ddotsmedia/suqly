import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WishlistService } from './wishlist.service';
import { WishlistItem, WishlistShare } from './wishlist.entity';
import { Listing } from './listing.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('WishlistService', () => {
  let service: WishlistService;
  const mockItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };
  const mockShareRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const mockListingRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getRepositoryToken(WishlistItem),
          useValue: mockItemRepository,
        },
        {
          provide: getRepositoryToken(WishlistShare),
          useValue: mockShareRepository,
        },
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add item to wishlist', async () => {
    const item = { id: 1, userId: 1, listingId: 10 };
    mockItemRepository.findOne.mockResolvedValue(null);
    mockItemRepository.create.mockReturnValue(item);
    mockItemRepository.save.mockResolvedValue(item);

    const result = await service.addToWishlist(1, 10);
    expect(result).toEqual(item);
  });

  it('should throw ConflictException on duplicate', async () => {
    mockItemRepository.findOne.mockResolvedValue({ id: 1 });

    await expect(service.addToWishlist(1, 10)).rejects.toThrow(ConflictException);
  });

  it('should remove item from wishlist', async () => {
    mockItemRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.removeFromWishlist(1, 10);
    expect(result).toBe(true);
  });

  it('should get wishlist items', async () => {
    const items = [
      {
        id: 1,
        listingId: 10,
        listing: {
          title: 'Item 1',
          price: 100,
          category: 'goods',
          emirate: 'Dubai',
          publicLocation: 'Dubai',
          images: [{ fullUrl: 'http://example.com/image.jpg' }],
          user: { id: 1, displayName: 'Seller' },
        },
      },
    ];
    mockItemRepository.findAndCount.mockResolvedValue([items, 1]);

    const result = await service.getWishlistItems(1, 20, 0);
    expect(result.total).toBe(1);
    expect(result.items[0].title).toBe('Item 1');
  });

  it('should check if item is in wishlist', async () => {
    mockItemRepository.findOne.mockResolvedValue({ id: 1 });

    const result = await service.isInWishlist(1, 10);
    expect(result).toBe(true);
  });

  it('should create share link', async () => {
    const share = { id: 1, userId: 1, shareToken: 'abc123', isPublic: true };
    mockShareRepository.findOne.mockResolvedValue(null);
    mockShareRepository.create.mockReturnValue(share);
    mockShareRepository.save.mockResolvedValue(share);

    const result = await service.createShareLink(1);
    expect(result.isPublic).toBe(true);
  });

  it('should get public wishlist', async () => {
    const share = {
      shareToken: 'abc123',
      isPublic: true,
      user: { id: 1, displayName: 'John' },
    };
    const items = [
      {
        id: 1,
        listingId: 10,
        listing: {
          title: 'Item 1',
          price: 100,
          category: 'goods',
          emirate: 'Dubai',
          publicLocation: 'Dubai',
          images: [],
          user: { id: 1, displayName: 'Seller' },
        },
      },
    ];
    mockShareRepository.findOne.mockResolvedValue(share);
    mockItemRepository.findAndCount.mockResolvedValue([items, 1]);

    const result = await service.getPublicWishlist('abc123');
    expect(result.user.displayName).toBe('John');
    expect(result.items.length).toBe(1);
  });

  it('should throw NotFoundException for invalid share token', async () => {
    mockShareRepository.findOne.mockResolvedValue(null);

    await expect(service.getPublicWishlist('invalid')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete share link', async () => {
    mockShareRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.deleteShareLink(1);
    expect(result).toBe(true);
  });

  it('should export wishlist to CSV', async () => {
    const items = [
      {
        id: 1,
        listingId: 10,
        listing: {
          title: 'Item 1',
          price: 100,
          category: 'goods',
          emirate: 'Dubai',
          publicLocation: 'Dubai',
          images: [],
          user: { id: 1, displayName: 'Seller' },
        },
        createdAt: new Date('2024-01-01'),
      },
    ];
    mockItemRepository.findAndCount.mockResolvedValue([items, 1]);

    const result = await service.exportToCSV(1);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toContain('Item 1');
    expect(result.toString()).toContain('listingId');
  });
});
