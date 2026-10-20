import { BadRequestException } from '@nestjs/common';
import { isValidSubcategory } from './subcategories';
import { ListingsService } from './listings.service';

describe('isValidSubcategory', () => {
  it('accepts a subcategory that belongs to its category', () => {
    expect(isValidSubcategory('property', 'villas')).toBe(true);
  });

  it('rejects a subcategory from another category', () => {
    expect(isValidSubcategory('motors', 'villas')).toBe(false);
  });

  it('rejects an unknown category', () => {
    expect(isValidSubcategory('nonsense', 'villas')).toBe(false);
  });
});

describe('ListingsService subcategory rules', () => {
  const repo = { update: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const service = Object.create(ListingsService.prototype) as any;
  service.listingsRepository = repo;
  service.generateSlug = (t: string) => t.toLowerCase().replace(/\s+/g, '-');
  service.usersService = { findById: jest.fn(async () => ({})) };
  service.findById = jest.fn(async () => ({ id: 5, userId: 1, category: 'property', subcategory: 'villas' }));

  beforeEach(() => jest.clearAllMocks());

  it('rejects create with a subcategory from the wrong category', async () => {
    await expect(
      service.create(1, { title: 'x', category: 'motors', subcategory: 'villas' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rejects update that sets a subcategory not valid for the current category', async () => {
    await expect(service.update(5, 1, { subcategory: 'used-cars' })).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('clears a stale subcategory when the category changes', async () => {
    await service.update(5, 1, { category: 'motors' });
    expect(repo.update).toHaveBeenCalledWith(5, { category: 'motors', subcategory: null });
  });

  it('accepts a valid subcategory update', async () => {
    await service.update(5, 1, { subcategory: 'off-plan' });
    expect(repo.update).toHaveBeenCalledWith(5, { subcategory: 'off-plan' });
  });
});
