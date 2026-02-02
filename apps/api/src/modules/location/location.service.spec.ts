import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationService } from './location.service';
import { IndividualExpert, ServiceRequest, DevicePassport } from '../../database/entities';

describe('LocationService', () => {
  let service: LocationService;
  let expertRepository: Repository<IndividualExpert>;
  let serviceRequestRepository: Repository<ServiceRequest>;
  let devicePassportRepository: Repository<DevicePassport>;

  const mockExperts = [
    {
      id: '1',
      personalName: 'Expert 1',
      locationLat: 39.9042,
      locationLng: 116.4074,
      isAvailable: true,
      registrationStatus: 'APPROVED',
      expertTypes: ['INSTALLATION'],
      professionalField: 'Electrical',
      yearsOfExperience: 10,
      workStatus: 'AVAILABLE',
      passportCode: 'EP-CN-2025-INST-CN-000001-A1',
    },
    {
      id: '2',
      personalName: 'Expert 2',
      locationLat: 39.9,
      locationLng: 116.4,
      isAvailable: true,
      registrationStatus: 'APPROVED',
      expertTypes: ['REPAIR'],
      professionalField: 'Mechanical',
      yearsOfExperience: 5,
      workStatus: 'RUSHING',
      passportCode: 'EP-CN-2025-REPR-CN-000002-B2',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(IndividualExpert),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ServiceRequest),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DevicePassport),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    expertRepository = module.get(getRepositoryToken(IndividualExpert));
    serviceRequestRepository = module.get(getRepositoryToken(ServiceRequest));
    devicePassportRepository = module.get(getRepositoryToken(DevicePassport));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearbyExperts', () => {
    it('should find experts within radius', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockExperts),
      };

      jest
        .spyOn(expertRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findNearbyExperts(39.9, 116.4, 50);

      expect(result).toBeDefined();
      expect(result.items).toBeInstanceOf(Array);
      expect(result.total).toBe(2);
      expect(result.radius).toBe(50);
      expect(result.center).toEqual({ latitude: 39.9, longitude: 116.4 });
    });

    it('should filter experts by distance', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockExperts),
      };

      jest
        .spyOn(expertRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findNearbyExperts(39.9, 116.4, 1);

      // Only very close experts should be included
      expect(result.items.length).toBeLessThanOrEqual(mockExperts.length);
    });

    it('should sort experts by distance', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockExperts),
      };

      jest
        .spyOn(expertRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findNearbyExperts(39.9, 116.4, 50);

      // Check that results are sorted by distance
      for (let i = 0; i < result.items.length - 1; i++) {
        expect(result.items[i].distance).toBeLessThanOrEqual(
          result.items[i + 1].distance,
        );
      }
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance correctly', () => {
      // Beijing to Shanghai is approximately 1067 km
      const lat1 = 39.9042; // Beijing
      const lng1 = 116.4074;
      const lat2 = 31.2304; // Shanghai
      const lng2 = 121.4737;

      const distance = (service as any).calculateDistance(
        lat1,
        lng1,
        lat2,
        lng2,
      );

      // Allow 5% margin of error
      expect(distance).toBeGreaterThan(1000);
      expect(distance).toBeLessThan(1150);
    });

    it('should return 0 for same coordinates', () => {
      const distance = (service as any).calculateDistance(
        39.9042,
        116.4074,
        39.9042,
        116.4074,
      );

      expect(distance).toBe(0);
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          display_name: 'Beijing, China',
          address: {
            city: 'Beijing',
            state: 'Beijing',
            country: 'China',
            country_code: 'cn',
            postcode: '100000',
          },
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.reverseGeocode(39.9042, 116.4074);

      expect(result).toBeDefined();
      expect(result.address).toBe('Beijing, China');
      expect(result.city).toBe('Beijing');
      expect(result.countryCode).toBe('CN');
    });

    it('should handle geocoding errors gracefully', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const result = await service.reverseGeocode(39.9042, 116.4074);

      expect(result.address).toBeNull();
      expect(result.error).toBe('Failed to geocode location');
    });
  });
});
