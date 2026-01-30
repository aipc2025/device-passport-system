import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  ProductLine,
  OriginCode,
  generatePassportCode,
  validatePassportCode,
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
    private configService: ConfigService,
  ) {
    this.companyCode = this.configService.get('COMPANY_CODE') || 'MED';
  }

  async generateCode(productLine: ProductLine, originCode: OriginCode): Promise<string> {
    const year = new Date().getFullYear();

    // Use transaction to ensure atomic sequence increment
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the row for update
      let counter = await queryRunner.manager.findOne(SequenceCounter, {
        where: {
          companyCode: this.companyCode,
          year,
          productLine,
          originCode,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!counter) {
        // Create new counter
        counter = queryRunner.manager.create(SequenceCounter, {
          companyCode: this.companyCode,
          year,
          productLine,
          originCode,
          currentSequence: 0,
        });
      }

      // Increment sequence
      counter.currentSequence += 1;
      await queryRunner.manager.save(counter);

      await queryRunner.commitTransaction();

      // Generate passport code
      return generatePassportCode(
        this.companyCode,
        year,
        productLine,
        originCode,
        counter.currentSequence,
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
