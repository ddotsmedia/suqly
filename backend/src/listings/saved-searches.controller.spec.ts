import { Test, TestingModule } from '@nestjs/testing';
import { SavedSearchesController } from './saved-searches.controller';
import { SavedSearchesService } from './saved-searches.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SavedSearchesController', () => {
  let controller: SavedSearchesController;
  const mockService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchListings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedSearchesController],
      providers: [
        {
          provide: SavedSearchesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SavedSearchesController>(SavedSearchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a saved search', async () => {
    const req = { user: { id: 1 } };
    const body = { name: 'Test', emailAlert: true, frequency: 'daily' };
    const result = { id: 1, ...body };

    mockService.create.mockResolvedValue(result);

    const response = await controller.create(req, body);

    expect(response).toEqual(result);
  });

  it('should throw BadRequestException if name is missing', async () => {
    const req = { user: { id: 1 } };
    const body = { emailAlert: true };

    await expect(controller.create(req, body)).rejects.toThrow(BadRequestException);
  });

  it('should list user saved searches', async () => {
    const req = { user: { id: 1 } };
    const result = { data: [{ id: 1, name: 'Test' }], total: 1 };

    mockService.findByUser.mockResolvedValue(result);

    const response = await controller.findByUser(req, 10, 0);

    expect(response).toEqual(result);
  });

  it('should get search by id', async () => {
    const req = { user: { id: 1 } };
    const result = { id: 1, name: 'Test', userId: 1 };

    mockService.findById.mockResolvedValue(result);

    const response = await controller.findById(req, 1);

    expect(response).toEqual(result);
  });

  it('should update a saved search', async () => {
    const req = { user: { id: 1 } };
    const body = { name: 'Updated', emailAlert: false };
    const result = { id: 1, ...body };

    mockService.update.mockResolvedValue(result);

    const response = await controller.update(req, 1, body);

    expect(response).toEqual(result);
  });

  it('should delete a saved search', async () => {
    const req = { user: { id: 1 } };

    mockService.delete.mockResolvedValue(undefined);

    const response = await controller.delete(req, 1);

    expect(response).toEqual({ success: true });
  });

  it('should get search results', async () => {
    const req = { user: { id: 1 } };
    const search = { id: 1, query: {}, filters: { emirate: 'dubai' } };
    const results = [{ id: 1, title: 'Item' }];

    mockService.findById.mockResolvedValue(search);
    mockService.searchListings.mockResolvedValue(results);

    const response = await controller.getResults(req, 1);

    expect(response).toEqual(results);
  });
});
