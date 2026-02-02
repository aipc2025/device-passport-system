import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanService } from './scan.service';
import { DevicePassport, IndividualExpert } from '../../database/entities';
import { PassportCodeService } from '../passport/passport-code.service';
import { ProductLine, OriginCode, DeviceStatus, ExpertType } from '@device-passport/shared';

describe('ScanService', () => {
  let service: ScanService;
  let passportRepository: jest.Mocked<Repository<DevicePassport>>;
  let expertRepository: jest.Mocked<Repository<IndividualExpert>>;
  let passportCodeService: jest.Mocked<PassportCodeService>;

  const mockPassport = {
    id: '1',
    passportCode: 'DP-MED-2601-PF-CN-000001-0A',
    productLine: ProductLine.PF,
    originCode: OriginCode.CN,
    status: DeviceStatus.IN_SERVICE,
    deviceName: 'Test Device',
    deviceModel: 'Model-123',
    manufacturer: 'Test Manufacturer',
    serialNumber: 'SN-001',
    manufactureDate: new Date('2026-01-01'),
    warrantyExpiryDate: new Date('2028-01-01'),
    currentLocation: 'Test Location',
    supplier: {
      name: 'Test Supplier',
    },
    customer: {
      name: 'Test Customer',
    },
  };

  const mockExpert = {
    id: '1',
    expertCode: 'EP-TECH-2601-000001-0A',
    personalName: 'John Expert',
    expertTypes: [ExpertType.TECHNICAL],
    phone: '+1234567890',
    professionalField: 'PLC Programming',
    servicesOffered: 'PLC, HMI, SCADA',
    yearsOfExperience: 10,
    certifications: ['Cert1', 'Cert2'],
    isAvailable: true,
    avgRating: 4.8,
    totalReviews: 50,
    completedServices: 100,
  };

  beforeEach(async () => {
    passportRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<DevicePassport>>;

    expertRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<IndividualExpert>>;

    passportCodeService = {
      validateCode: jest.fn(),
    } as unknown as jest.Mocked<PassportCodeService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        {
          provide: getRepositoryToken(DevicePassport),
          useValue: passportRepository,
        },
        {
          provide: getRepositoryToken(IndividualExpert),
          useValue: expertRepository,
        },
        {
          provide: PassportCodeService,
          useValue: passportCodeService,
        },
      ],
    }).compile();

    service = module.get<ScanService>(ScanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicInfo', () => {
    it('should return public device info for valid passport code', async () => {
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(mockPassport as any);

      const result = await service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A');

      expect(result).toBeDefined();
      expect(result.passportCode).toBe(mockPassport.passportCode);
      expect(result.deviceName).toBe(mockPassport.deviceName);
      expect(result.deviceModel).toBe(mockPassport.deviceModel);
      expect(result.manufacturer).toBe(mockPassport.manufacturer);
      expect(passportRepository.findOne).toHaveBeenCalledWith({
        where: { passportCode: 'DP-MED-2601-PF-CN-000001-0A' },
        relations: ['supplier', 'customer'],
      });
    });

    it('should throw NotFoundException if passport code is invalid', async () => {
      passportCodeService.validateCode.mockReturnValue({
        valid: false,
        error: 'Invalid format',
      });

      await expect(service.getPublicInfo('INVALID-CODE')).rejects.toThrow(NotFoundException);
      expect(passportRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if passport not found', async () => {
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(null);

      await expect(service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include warranty status in response', async () => {
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(mockPassport as any);

      const result = await service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A');

      expect(result.warrantyStatus).toBeDefined();
      expect(['valid', 'expired']).toContain(result.warrantyStatus);
    });

    it('should include supplier and customer names', async () => {
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(mockPassport as any);

      const result = await service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A');

      expect(result.supplierName).toBe('Test Supplier');
      expect(result.customerName).toBe('Test Customer');
    });
  });

  describe('validateCode', () => {
    it('should return validation result for valid code', async () => {
      passportCodeService.validateCode.mockReturnValue({
        valid: true,
        parts: {
          prefix: 'DP' as const,
          companyCode: 'MED',
          yearMonth: '2601',
          productType: ProductLine.PF,
          originCode: OriginCode.CN,
          sequence: 1,
          checksum: '0A',
        },
      });

      const result = await service.validateCode('DP-MED-2601-PF-CN-000001-0A');

      expect(result.valid).toBe(true);
      expect(result.parts).toBeDefined();
    });

    it('should return validation result for invalid code', async () => {
      passportCodeService.validateCode.mockReturnValue({
        valid: false,
        error: 'Invalid format',
      });

      const result = await service.validateCode('INVALID-CODE');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid format');
    });
  });

  describe('getExpertPublicInfo', () => {
    it('should return public expert info for valid expert code', async () => {
      expertRepository.findOne.mockResolvedValue(mockExpert as any);

      const result = await service.getExpertPublicInfo('EP-TECH-2601-000001-0A');

      expect(result).toBeDefined();
      expect(result.expertCode).toBe(mockExpert.expertCode);
      expect(result.personalName).toBe(mockExpert.personalName);
      expect(result.professionalField).toBe(mockExpert.professionalField);
      expect(expertRepository.findOne).toHaveBeenCalledWith({
        where: { expertCode: 'EP-TECH-2601-000001-0A' },
      });
    });

    it('should throw NotFoundException if expert not found', async () => {
      expertRepository.findOne.mockResolvedValue(null);

      await expect(service.getExpertPublicInfo('EP-TECH-2601-000001-0A')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include availability and rating info', async () => {
      expertRepository.findOne.mockResolvedValue(mockExpert as any);

      const result = await service.getExpertPublicInfo('EP-TECH-2601-000001-0A');

      expect(result.isAvailable).toBe(true);
      expect(result.avgRating).toBe(4.8);
      expect(result.totalReviews).toBe(50);
      expect(result.completedServices).toBe(100);
    });
  });

  describe('validateExpertCode', () => {
    it('should validate expert code format', async () => {
      const result = await service.validateExpertCode('EP-TECH-2601-000001-0A');

      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });

    it('should reject invalid expert code format', async () => {
      const result = await service.validateExpertCode('INVALID-CODE');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle passport with missing supplier', async () => {
      const passportNoSupplier = { ...mockPassport, supplier: null };
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(passportNoSupplier as any);

      const result = await service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A');

      expect(result.supplierName).toBeUndefined();
    });

    it('should handle passport with missing customer', async () => {
      const passportNoCustomer = { ...mockPassport, customer: null };
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(passportNoCustomer as any);

      const result = await service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A');

      expect(result.customerName).toBeUndefined();
    });

    it('should handle expired warranty', async () => {
      const passportExpiredWarranty = {
        ...mockPassport,
        warrantyExpiryDate: new Date('2020-01-01'), // Past date
      };
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(passportExpiredWarranty as any);

      const result = await service.getPublicInfo('DP-MED-2601-PF-CN-000001-0A');

      expect(result.warrantyStatus).toBe('expired');
    });

    it('should handle case-insensitive passport codes', async () => {
      passportCodeService.validateCode.mockReturnValue({ valid: true });
      passportRepository.findOne.mockResolvedValue(mockPassport as any);

      await service.getPublicInfo('dp-med-2601-pf-cn-000001-0a');

      expect(passportRepository.findOne).toHaveBeenCalledWith({
        where: { passportCode: 'DP-MED-2601-PF-CN-000001-0A' },
        relations: ['supplier', 'customer'],
      });
    });
  });
});
