import { Test, TestingModule } from '@nestjs/testing';
import {
  WishlistController,
  WishlistListController,
  WishlistCheckController,
} from './wishlist.controller';
import { WishlistService } from './wishlist.service';

describe('WishlistController', () => {
  let controller: WishlistController;
  const mockService = {
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  it('should add to wishlist', async () => {
    const req = { user: { id: 1 } };
    mockService.addToWishlist.mockResolvedValue(true);

    const result = await controller.addToWishlist(req, 10);
    expect(result.success).toBe(true);
  });

  it('should remove from wishlist', async () => {
    const req = { user: { id: 1 } };
    mockService.removeFromWishlist.mockResolvedValue(true);

    const result = await controller.removeFromWishlist(req, 10);
    expect(result.success).toBe(true);
  });
});

describe('WishlistListController', () => {
  let controller: WishlistListController;
  const mockService = {
    getWishlistItems: jest.fn(),
    createShareLink: jest.fn(),
    getPublicWishlist: jest.fn(),
    deleteShareLink: jest.fn(),
    exportToCSV: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistListController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WishlistListController>(WishlistListController);
  });

  it('should get wishlist items', async () => {
    const req = { user: { id: 1 } };
    const result = { items: [], total: 0 };
    mockService.getWishlistItems.mockResolvedValue(result);

    const response = await controller.getWishlist(req, 20, 0);
    expect(response).toEqual(result);
  });

  it('should create share link', async () => {
    const req = { user: { id: 1 } };
    mockService.createShareLink.mockResolvedValue({
      shareToken: 'abc123',
      isPublic: true,
    });

    const result = await controller.createShareLink(req);
    expect(result.shareUrl).toContain('abc123');
  });

  it('should get public wishlist', async () => {
    const result = {
      user: { id: 1, displayName: 'John' },
      items: [],
    };
    mockService.getPublicWishlist.mockResolvedValue(result);

    const response = await controller.getPublicWishlist('abc123');
    expect(response.user.displayName).toBe('John');
  });

  it('should delete share link', async () => {
    const req = { user: { id: 1 } };
    mockService.deleteShareLink.mockResolvedValue(true);

    const result = await controller.deleteShareLink(req);
    expect(result.success).toBe(true);
  });
});

describe('WishlistCheckController', () => {
  let controller: WishlistCheckController;
  const mockService = {
    isInWishlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistCheckController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WishlistCheckController>(WishlistCheckController);
  });

  it('should check if in wishlist', async () => {
    const req = { user: { id: 1 } };
    mockService.isInWishlist.mockResolvedValue(true);

    const result = await controller.checkIsInWishlist(req, 10);
    expect(result.isInWishlist).toBe(true);
  });
});
