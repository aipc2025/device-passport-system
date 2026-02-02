import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PassportCodeService } from './passport-code.service';
import { SequenceCounter } from '../../database/entities';
import { ProductLine, OriginCode } from '@device-passport/shared';

describe('PassportCodeService', () => {
  let service: PassportCodeService;
  let sequenceRepository: jest.Mocked<Repository<SequenceCounter>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'COMPANY_CODE') return 'MED';
      return null;
    }),
  };

  beforeEach(async () => {
    // Create mock query runner
    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    // Create mock data source
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<DataSource>;

    // Create mock repository
    sequenceRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<SequenceCounter>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportCodeService,
        {
          provide: getRepositoryToken(SequenceCounter),
          useValue: sequenceRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PassportCodeService>(PassportCodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCode', () => {
    it('should generate a passport code with new sequence counter', async () => {
      // Setup: No existing counter
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (queryRunner.manager.create as jest.Mock).mockReturnValue({
        companyCode: 'MED',
        yearMonth: expect.any(String),
        productLine: ProductLine.PF,
        originCode: OriginCode.CN,
        currentSequence: 1,
      });
      (queryRunner.manager.save as jest.Mock).mockImplementation((entity) => entity);

      const code = await service.generateCode(ProductLine.PF, OriginCode.CN);

      expect(code).toMatch(/^DP-MED-\d{4}-PF-CN-000001-[A-Z0-9]{2}$/);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should generate a passport code with existing sequence counter', async () => {
      // Setup: Existing counter with sequence 5
      const existingCounter = {
        id: '1',
        companyCode: 'MED',
        yearMonth: '2601',
        productLine: ProductLine.PF,
        originCode: OriginCode.CN,
        currentSequence: 5,
      };
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(existingCounter);
      (queryRunner.manager.save as jest.Mock).mockImplementation((entity) => ({
        ...entity,
        currentSequence: 6,
      }));

      const code = await service.generateCode(ProductLine.PF, OriginCode.CN);

      expect(code).toMatch(/^DP-MED-\d{4}-PF-CN-000006-[A-Z0-9]{2}$/);
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentSequence: 6,
        })
      );
    });

    it('should use custom supplier code when provided', async () => {
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (queryRunner.manager.create as jest.Mock).mockReturnValue({
        companyCode: 'SIE',
        yearMonth: expect.any(String),
        productLine: ProductLine.IP,
        originCode: OriginCode.DE,
        currentSequence: 1,
      });
      (queryRunner.manager.save as jest.Mock).mockImplementation((entity) => entity);

      const code = await service.generateCode(ProductLine.IP, OriginCode.DE, 'SIE');

      expect(code).toMatch(/^DP-SIE-\d{4}-IP-DE-000001-[A-Z0-9]{2}$/);
    });

    it('should handle transaction rollback on error', async () => {
      const error = new Error('Database error');
      (queryRunner.manager.findOne as jest.Mock).mockRejectedValue(error);

      await expect(service.generateCode(ProductLine.PF, OriginCode.CN)).rejects.toThrow(error);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should use pessimistic write lock', async () => {
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (queryRunner.manager.create as jest.Mock).mockReturnValue({
        companyCode: 'MED',
        yearMonth: expect.any(String),
        productLine: ProductLine.PF,
        originCode: OriginCode.CN,
        currentSequence: 1,
      });
      (queryRunner.manager.save as jest.Mock).mockImplementation((entity) => entity);

      await service.generateCode(ProductLine.PF, OriginCode.CN);

      expect(queryRunner.manager.findOne).toHaveBeenCalledWith(
        SequenceCounter,
        expect.objectContaining({
          lock: { mode: 'pessimistic_write' },
        })
      );
    });

    it('should generate sequential codes correctly', async () => {
      const codes: string[] = [];
      let currentSequence = 0;

      (queryRunner.manager.findOne as jest.Mock).mockImplementation(() => {
        if (currentSequence === 0) {
          return null;
        }
        return {
          id: '1',
          companyCode: 'MED',
          yearMonth: '2601',
          productLine: ProductLine.PF,
          originCode: OriginCode.CN,
          currentSequence,
        };
      });

      (queryRunner.manager.create as jest.Mock).mockReturnValue({
        companyCode: 'MED',
        yearMonth: '2601',
        productLine: ProductLine.PF,
        originCode: OriginCode.CN,
        currentSequence: 1,
      });

      (queryRunner.manager.save as jest.Mock).mockImplementation((entity) => {
        currentSequence = entity.currentSequence;
        return entity;
      });

      // Generate 10 codes
      for (let i = 0; i < 10; i++) {
        const code = await service.generateCode(ProductLine.PF, OriginCode.CN);
        codes.push(code);
      }

      // Verify all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(10);

      // Verify sequence numbers increment
      expect(codes[0]).toMatch(/-000001-/);
      expect(codes[9]).toMatch(/-000010-/);
    });
  });

  describe('validateCode', () => {
    it('should validate a correct passport code', () => {
      const result = service.validateCode('DP-MED-2601-PF-CN-000001-0A');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject an invalid passport code', () => {
      const result = service.validateCode('INVALID-CODE');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid passport code format');
    });

    it('should reject code with invalid checksum', () => {
      const result = service.validateCode('DP-MED-2601-PF-CN-000001-XX');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid checksum');
    });
  });

  describe('getCompanyCode', () => {
    it('should return the configured company code', () => {
      const code = service.getCompanyCode();
      expect(code).toBe('MED');
    });
  });

  describe('Integration with different product lines and origins', () => {
    beforeEach(() => {
      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
      (queryRunner.manager.save as jest.Mock).mockImplementation((entity) => entity);
    });

    it('should generate codes for different product lines', async () => {
      const productLines = [
        ProductLine.PF,
        ProductLine.IP,
        ProductLine.QI,
        ProductLine.MP,
        ProductLine.AS,
      ];

      const codes = await Promise.all(
        productLines.map((pl) => {
          (queryRunner.manager.create as jest.Mock).mockReturnValue({
            companyCode: 'MED',
            yearMonth: '2601',
            productLine: pl,
            originCode: OriginCode.CN,
            currentSequence: 1,
          });
          return service.generateCode(pl, OriginCode.CN);
        })
      );

      // Verify all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(productLines.length);

      // Verify each code contains the correct product line
      codes.forEach((code, index) => {
        expect(code).toContain(productLines[index]);
      });
    });

    it('should generate codes for different origin codes', async () => {
      const origins = [OriginCode.CN, OriginCode.DE, OriginCode.JP, OriginCode.US];

      const codes = await Promise.all(
        origins.map((origin) => {
          (queryRunner.manager.create as jest.Mock).mockReturnValue({
            companyCode: 'MED',
            yearMonth: '2601',
            productLine: ProductLine.PF,
            originCode: origin,
            currentSequence: 1,
          });
          return service.generateCode(ProductLine.PF, origin);
        })
      );

      // Verify all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(origins.length);

      // Verify each code contains the correct origin
      codes.forEach((code, index) => {
        expect(code).toContain(origins[index]);
      });
    });
  });
});
