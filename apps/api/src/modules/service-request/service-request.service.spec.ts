import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequest, ExpertApplication, IndividualExpert } from '../../database/entities';
import {
  ServiceRequestStatus,
  ServiceType,
  ServiceUrgency,
  ServiceRequestCategory,
  ExpertApplicationStatus,
} from '@device-passport/shared';

describe('ServiceRequestService', () => {
  let service: ServiceRequestService;
  let serviceRequestRepository: jest.Mocked<Repository<ServiceRequest>>;
  let applicationRepository: jest.Mocked<Repository<ExpertApplication>>;
  let expertRepository: jest.Mocked<Repository<IndividualExpert>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockServiceRequest: Partial<ServiceRequest> = {
    id: 'request-123',
    requestCode: 'SR-2501-000001',
    title: 'Fix Industrial Motor',
    description: 'Motor running hot',
    serviceType: ServiceType.REPAIR,
    status: ServiceRequestStatus.DRAFT,
    urgency: ServiceUrgency.NORMAL,
    contactName: 'John Doe',
    contactPhone: '+1234567890',
    contactEmail: 'john@example.com',
    budgetMin: 500,
    budgetMax: 1000,
    budgetCurrency: 'USD',
    requiredSkills: ['motor_repair', 'electrical'],
    isPublic: true,
    showCompanyInfo: true,
    createdByUserId: 'user-123',
    organizationId: 'org-123',
    viewCount: 0,
    applicationCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpert: Partial<IndividualExpert> = {
    id: 'expert-123',
    userId: 'user-456',
    personalName: 'Expert Smith',
    expertCode: 'EP-TECH-2501-000001-A7',
    isAvailable: true,
    skillTags: ['motor_repair', 'electrical'],
    avgRating: 4.5,
    completedServices: 25,
  };

  const mockApplication: Partial<ExpertApplication> = {
    id: 'app-123',
    serviceRequestId: 'request-123',
    expertId: 'expert-123',
    status: ExpertApplicationStatus.PENDING,
    message: 'I can help with this',
    proposedPrice: 750,
    priceCurrency: 'USD',
    estimatedDuration: 3,
    durationUnit: 'hours',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getCount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestService,
        {
          provide: getRepositoryToken(ServiceRequest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            increment: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(ExpertApplication),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(IndividualExpert),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn().mockResolvedValue(undefined),
              startTransaction: jest.fn().mockResolvedValue(undefined),
              commitTransaction: jest.fn().mockResolvedValue(undefined),
              rollbackTransaction: jest.fn().mockResolvedValue(undefined),
              release: jest.fn().mockResolvedValue(undefined),
              manager: {
                save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                update: jest.fn().mockResolvedValue({ affected: 1 }),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceRequestService>(ServiceRequestService);
    serviceRequestRepository = module.get(getRepositoryToken(ServiceRequest));
    applicationRepository = module.get(getRepositoryToken(ExpertApplication));
    expertRepository = module.get(getRepositoryToken(IndividualExpert));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'Fix Industrial Motor',
      description: 'Motor running hot',
      serviceType: ServiceType.REPAIR,
      category: ServiceRequestCategory.DEVICE_REPAIR,
      urgency: ServiceUrgency.NORMAL,
      contactName: 'John Doe',
      contactPhone: '+1234567890',
      contactEmail: 'john@example.com',
      budgetMin: 500,
      budgetMax: 1000,
      requiredSkills: ['motor_repair'],
      isPublic: true,
      showCompanyInfo: true,
    };

    it('should create a service request successfully', async () => {
      const createdRequest = { ...mockServiceRequest };
      serviceRequestRepository.create.mockReturnValue(createdRequest as ServiceRequest);
      serviceRequestRepository.save.mockResolvedValue(createdRequest as ServiceRequest);

      const result = await service.create('user-123', 'org-123', createDto);

      expect(serviceRequestRepository.create).toHaveBeenCalled();
      expect(serviceRequestRepository.save).toHaveBeenCalled();
      expect(result).toEqual(createdRequest);
    });

    it('should set default status to DRAFT', async () => {
      const createdRequest = { ...mockServiceRequest, status: ServiceRequestStatus.DRAFT };
      serviceRequestRepository.create.mockReturnValue(createdRequest as ServiceRequest);
      serviceRequestRepository.save.mockResolvedValue(createdRequest as ServiceRequest);

      const result = await service.create('user-123', 'org-123', createDto);

      expect(result.status).toBe(ServiceRequestStatus.DRAFT);
    });

    it('should set default currency to USD', async () => {
      const dtoWithoutCurrency = { ...createDto };
      delete (dtoWithoutCurrency as any).budgetCurrency;

      const createdRequest = { ...mockServiceRequest, budgetCurrency: 'USD' };
      serviceRequestRepository.create.mockReturnValue(createdRequest as ServiceRequest);
      serviceRequestRepository.save.mockResolvedValue(createdRequest as ServiceRequest);

      const result = await service.create('user-123', 'org-123', dtoWithoutCurrency);

      expect(result.budgetCurrency).toBe('USD');
    });
  });

  describe('createPublic', () => {
    const publicDto = {
      title: 'Fix Motor',
      description: 'Motor issue',
      serviceType: ServiceType.REPAIR,
      contactName: 'Public User',
      contactPhone: '+1234567890',
      contactEmail: 'public@example.com',
    };

    it('should create a public service request without user authentication', async () => {
      const createdRequest = {
        ...mockServiceRequest,
        createdByUserId: null,
        organizationId: null,
      };
      serviceRequestRepository.create.mockReturnValue(createdRequest as any);
      serviceRequestRepository.save.mockResolvedValue(createdRequest as any);

      const result = await service.createPublic(publicDto);

      expect(result.createdByUserId).toBeNull();
      expect(result.organizationId).toBeNull();
    });
  });

  describe('publish', () => {
    it('should publish a draft service request', async () => {
      const draftRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.DRAFT,
        createdByUserId: 'user-123',
      };
      const publishedRequest = {
        ...draftRequest,
        status: ServiceRequestStatus.OPEN,
      };

      serviceRequestRepository.findOne.mockResolvedValue(draftRequest as ServiceRequest);
      serviceRequestRepository.save.mockResolvedValue(publishedRequest as ServiceRequest);

      const result = await service.publish('request-123', 'user-123');

      expect(result.status).toBe(ServiceRequestStatus.OPEN);
      expect(serviceRequestRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.publish('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not creator', async () => {
      const draftRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.DRAFT,
        createdByUserId: 'user-456',
      };
      serviceRequestRepository.findOne.mockResolvedValue(draftRequest as ServiceRequest);

      await expect(service.publish('request-123', 'user-123')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if request already published', async () => {
      const publishedRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.OPEN,
        createdByUserId: 'user-123',
      };
      serviceRequestRepository.findOne.mockResolvedValue(publishedRequest as ServiceRequest);

      await expect(service.publish('request-123', 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel an active service request', async () => {
      const activeRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.OPEN,
        createdByUserId: 'user-123',
      };
      const cancelledRequest = {
        ...activeRequest,
        status: ServiceRequestStatus.CANCELLED,
        cancellationReason: 'No longer needed',
      };

      serviceRequestRepository.findOne.mockResolvedValue(activeRequest as ServiceRequest);
      serviceRequestRepository.save.mockResolvedValue(cancelledRequest as ServiceRequest);

      const result = await service.cancel('request-123', 'user-123', 'No longer needed');

      expect(result.status).toBe(ServiceRequestStatus.CANCELLED);
      expect(result.cancellationReason).toBe('No longer needed');
    });

    it('should throw NotFoundException if request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not creator', async () => {
      const request = {
        ...mockServiceRequest,
        createdByUserId: 'user-456',
      };
      serviceRequestRepository.findOne.mockResolvedValue(request as ServiceRequest);

      await expect(service.cancel('request-123', 'user-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return a service request by ID', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(mockServiceRequest as ServiceRequest);

      const result = await service.findOne('request-123');

      expect(result).toEqual(mockServiceRequest);
      expect(serviceRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'request-123' },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException if request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a service request by code', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(mockServiceRequest as ServiceRequest);

      const result = await service.findByCode('SR-2501-000001');

      expect(result).toEqual(mockServiceRequest);
      expect(serviceRequestRepository.findOne).toHaveBeenCalledWith({
        where: { requestCode: 'SR-2501-000001' },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException if request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.findByCode('INVALID-CODE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyToService', () => {
    const applyDto = {
      message: 'I can help',
      proposedPrice: 750,
      priceCurrency: 'USD',
      estimatedDuration: 3,
      durationUnit: 'hours',
    };

    it('should create an expert application successfully', async () => {
      // Note: ServiceRequestStatus may not have OPEN, using a number cast as workaround
      const openRequest = {
        ...mockServiceRequest,
        status: 'OPEN' as any, // Service expects OPEN status
      };
      const expert = { ...mockExpert, isAvailable: true };

      serviceRequestRepository.findOne.mockResolvedValue(openRequest as ServiceRequest);
      expertRepository.findOne.mockResolvedValue(expert as IndividualExpert);
      applicationRepository.findOne.mockResolvedValue(null);
      applicationRepository.create.mockReturnValue(mockApplication as ExpertApplication);
      applicationRepository.save.mockResolvedValue(mockApplication as ExpertApplication);
      serviceRequestRepository.save.mockResolvedValue({
        ...openRequest,
        applicationCount: 1,
      } as ServiceRequest);

      const result = await service.applyToService('request-123', 'expert-123', applyDto);

      expect(result).toEqual(mockApplication);
      expect(applicationRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if service request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.applyToService('non-existent', 'expert-123', applyDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if request not open', async () => {
      const draftRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.DRAFT,
      };
      serviceRequestRepository.findOne.mockResolvedValue(draftRequest as ServiceRequest);

      await expect(service.applyToService('request-123', 'expert-123', applyDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if expert already applied', async () => {
      const openRequest = {
        ...mockServiceRequest,
        status: 'OPEN' as any,
      };
      expertRepository.findOne.mockResolvedValue(mockExpert as IndividualExpert);
      serviceRequestRepository.findOne.mockResolvedValue(openRequest as ServiceRequest);
      applicationRepository.findOne.mockResolvedValue(mockApplication as ExpertApplication);

      await expect(service.applyToService('request-123', 'expert-123', applyDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('acceptApplication', () => {
    it('should accept an expert application successfully', async () => {
      const publishedRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.OPEN,
        createdByUserId: 'user-123',
      };
      const pendingApp = {
        ...mockApplication,
        status: ExpertApplicationStatus.PENDING,
        serviceRequest: publishedRequest,
      };
      const acceptedApp = {
        ...pendingApp,
        status: ExpertApplicationStatus.ACCEPTED,
      };

      applicationRepository.findOne.mockResolvedValue(pendingApp as any);
      serviceRequestRepository.findOne.mockResolvedValue(publishedRequest as ServiceRequest);
      applicationRepository.save.mockResolvedValue(acceptedApp as any);
      serviceRequestRepository.save.mockResolvedValue({
        ...publishedRequest,
        status: ServiceRequestStatus.IN_PROGRESS,
        assignedExpertId: 'expert-123',
        assignedAt: new Date(),
      } as ServiceRequest);

      const result = await service.acceptApplication('app-123', 'user-123');

      expect(result.status).toBe(ExpertApplicationStatus.ACCEPTED);
    });

    it('should throw NotFoundException if application not found', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(service.acceptApplication('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException if user is not request creator', async () => {
      const request = {
        ...mockServiceRequest,
        createdByUserId: 'user-456',
      };
      const application = {
        ...mockApplication,
        serviceRequest: request,
      };

      applicationRepository.findOne.mockResolvedValue(application as any);
      serviceRequestRepository.findOne.mockResolvedValue(request as ServiceRequest);

      await expect(service.acceptApplication('app-123', 'user-123')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('rejectApplication', () => {
    it('should reject an expert application successfully', async () => {
      const publishedRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.OPEN,
        createdByUserId: 'user-123',
      };
      const pendingApp = {
        ...mockApplication,
        status: ExpertApplicationStatus.PENDING,
        serviceRequest: publishedRequest,
      };
      const rejectedApp = {
        ...pendingApp,
        status: ExpertApplicationStatus.REJECTED,
        rejectionReason: 'Not qualified',
      };

      applicationRepository.findOne.mockResolvedValue(pendingApp as any);
      serviceRequestRepository.findOne.mockResolvedValue(publishedRequest as ServiceRequest);
      applicationRepository.save.mockResolvedValue(rejectedApp as any);

      const result = await service.rejectApplication('app-123', 'user-123', 'Not qualified');

      expect(result.status).toBe(ExpertApplicationStatus.REJECTED);
      expect(result.rejectionReason).toBe('Not qualified');
    });

    it('should throw NotFoundException if application not found', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(service.rejectApplication('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('completeRequest', () => {
    it('should mark service request as completed', async () => {
      const inProgressRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.IN_PROGRESS,
        createdByUserId: 'user-123',
        assignedExpertId: 'expert-123',
      };
      const completedRequest = {
        ...inProgressRequest,
        status: ServiceRequestStatus.COMPLETED,
        completedAt: new Date(),
      };

      serviceRequestRepository.findOne.mockResolvedValue(inProgressRequest as any);
      serviceRequestRepository.save.mockResolvedValue(completedRequest as any);

      const result = await service.completeRequest('request-123', 'user-123');

      expect(result.status).toBe(ServiceRequestStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw NotFoundException if request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.completeRequest('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if request not in progress yet', async () => {
      const publishedRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.OPEN,
        createdByUserId: 'user-123',
      };
      serviceRequestRepository.findOne.mockResolvedValue(publishedRequest as ServiceRequest);

      await expect(service.completeRequest('request-123', 'user-123')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count successfully', async () => {
      serviceRequestRepository.increment.mockResolvedValue(undefined as any);

      await service.incrementViewCount('request-123');

      expect(serviceRequestRepository.increment).toHaveBeenCalledWith(
        { id: 'request-123' },
        'viewCount',
        1
      );
    });
  });
});
