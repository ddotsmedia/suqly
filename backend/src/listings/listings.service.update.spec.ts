import { ForbiddenException } from '@nestjs/common';
import { ListingsService } from './listings.service';

describe('ListingsService.update', () => {
  const listing = { id: 5, userId: 1, title: 'Old', status: 'active' };
  const repo = { update: jest.fn(), findOne: jest.fn() };
  const service = Object.create(ListingsService.prototype) as any;
  service.listingsRepository = repo;
  service.findById = jest.fn(async () => ({ ...listing }));
  service.generateSlug = (t: string) => t.toLowerCase().replace(/\s+/g, '-');

  beforeEach(() => jest.clearAllMocks());

  it('refuses edits from a non-owner', async () => {
    await expect(service.update(5, 2, { title: 'x' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('ignores ownership and status fields from the request', async () => {
    await service.update(5, 1, { price: 900, userId: 2, status: 'active', slug: 'hack', createdAt: 'x' });
    expect(repo.update).toHaveBeenCalledWith(5, { price: 900 });
  });

  it('regenerates the slug when the title changes', async () => {
    await service.update(5, 1, { title: 'New Title' });
    expect(repo.update).toHaveBeenCalledWith(5, { title: 'New Title', slug: 'new-title' });
  });
});
