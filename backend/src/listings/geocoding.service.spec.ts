import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocodingService],
    }).compile();

    service = module.get<GeocodingService>(GeocodingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate distance correctly', () => {
    const distance = service.calculateDistance(25.2048, 55.2708, 25.1972, 55.2744);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(10);
  });

  it('should calculate distance between same coordinates as zero', () => {
    const distance = service.calculateDistance(25.2048, 55.2708, 25.2048, 55.2708);
    expect(distance).toBeLessThan(0.1);
  });

  it('should reverse geocode to fallback without API key', async () => {
    const address = await service.reverseGeocode(25.2048, 55.2708);
    expect(address).toContain('25');
  });

  it('should search nearby listings', async () => {
    const listings = [
      { id: 1, latitude: 25.2048, longitude: 55.2708 },
      { id: 2, latitude: 25.1, longitude: 55.1 },
      { id: 3, latitude: 30, longitude: 60 },
    ];

    const nearby = await service.searchNearby(25.2048, 55.2708, 100, listings);
    expect(nearby.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter listings outside radius', async () => {
    const listings = [
      { id: 1, latitude: 25.2048, longitude: 55.2708 },
      { id: 2, latitude: 30, longitude: 60 },
    ];

    const nearby = await service.searchNearby(25.2048, 55.2708, 5, listings);
    expect(nearby.length).toBe(1);
    expect(nearby[0].id).toBe(1);
  });
});
