import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  ProductLine,
  OriginCode,
  generatePassportCode,
  validatePassportCode,
  formatYearMonth,
} from '@device-passport/shared';
import { SequenceCounter } from '../../database/entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PassportCodeService {
  private companyCode: string;

  constructor(
    @InjectRepository(SequenceCounter)
    private sequenceRepository: Repository<SequenceCounter>,
    private dataSource: DataSource,
    private configService: ConfigService
  ) {
    this.companyCode = this.configService.get('COMPANY_CODE') || 'MED';
  }

  async generateCode(
    productLine: ProductLine,
    originCode: OriginCode | string,
    supplierCode?: string
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const yearMonth = formatYearMonth(year, month);

    // Use supplier code if provided, otherwise use default company code
    const companyCode = supplierCode?.toUpperCase() || this.companyCode;

    // For "OTHER" origin code, we'll still use it in the sequence counter
    // but the actual code will be stored in the passport entity
    const effectiveOriginCode = originCode as OriginCode;

    // Use transaction to ensure atomic sequence increment
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the row for update
      let counter = await queryRunner.manager.findOne(SequenceCounter, {
        where: {
          companyCode,
          yearMonth,
          productLine,
          originCode: effectiveOriginCode,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!counter) {
        // Create new counter
        counter = queryRunner.manager.create(SequenceCounter, {
          companyCode,
          yearMonth,
          productLine,
          originCode: effectiveOriginCode,
          currentSequence: 0,
        });
      }

      // Increment sequence
      counter.currentSequence += 1;
      await queryRunner.manager.save(counter);

      await queryRunner.commitTransaction();

      // Generate passport code
      return generatePassportCode(
        companyCode,
        year,
        month,
        productLine,
        effectiveOriginCode,
        counter.currentSequence
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  validateCode(code: string): { valid: boolean; error?: string } {
    const result = validatePassportCode(code);
    return {
      valid: result.valid,
      error: result.error,
    };
  }

  getCompanyCode(): string {
    return this.companyCode;
  }
}
