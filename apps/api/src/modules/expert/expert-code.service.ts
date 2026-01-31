import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExpertSequenceCounter, IndividualExpert } from '../../database/entities';
import { ExpertType } from '@device-passport/shared';

/**
 * Expert Passport Code Service
 * Generates unique expert passport codes in the format:
 * EP-{TYPE}-{YYMM}-{SEQUENCE}-{CHECKSUM}
 * Example: EP-TECH-2501-000001-A7
 */
@Injectable()
export class ExpertCodeService {
  constructor(
    @InjectRepository(ExpertSequenceCounter)
    private counterRepository: Repository<ExpertSequenceCounter>,
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    private dataSource: DataSource,
  ) {}

  /**
   * Generate a new expert passport code
   * @param expertTypes The expert types (TECHNICAL or BUSINESS)
   * @returns The generated code
   */
  async generateCode(expertTypes: ExpertType[]): Promise<string> {
    // Determine the primary type code (TECH for technical, BIZ for business)
    const typeCode = expertTypes.includes(ExpertType.TECHNICAL) ? 'TECH' : 'BIZ';

    // Get current year and month in YYMM format
    const now = new Date();
    const yearMonth = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Use a transaction to ensure atomic sequence generation
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the counter row for this type and yearMonth
      let counter = await queryRunner.manager.findOne(ExpertSequenceCounter, {
        where: { expertType: typeCode, yearMonth },
        lock: { mode: 'pessimistic_write' },
      });

      if (!counter) {
        // Create a new counter for this type and yearMonth
        counter = queryRunner.manager.create(ExpertSequenceCounter, {
          expertType: typeCode,
          yearMonth,
          currentSequence: 0,
        });
      }

      // Increment the sequence
      counter.currentSequence += 1;
      await queryRunner.manager.save(counter);

      // Generate the code
      const sequence = String(counter.currentSequence).padStart(6, '0');
      const baseCode = `EP-${typeCode}-${yearMonth}-${sequence}`;
      const checksum = this.calculateChecksum(baseCode);
      const fullCode = `${baseCode}-${checksum}`;

      await queryRunner.commitTransaction();
      return fullCode;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calculate checksum for expert code
   * Uses a simple algorithm: sum of character codes mod 36, converted to alphanumeric
   */
  private calculateChecksum(code: string): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      sum += code.charCodeAt(i) * (i + 1);
    }
    const first = chars[sum % 36];
    const second = chars[(sum * 7) % 36];
    return `${first}${second}`;
  }

  /**
   * Validate an expert passport code
   */
  validateCode(code: string): boolean {
    // Format: EP-TECH-2501-000001-A7 or EP-BIZ-2501-000001-A7
    const regex = /^EP-(TECH|BIZ)-\d{4}-\d{6}-[A-Z0-9]{2}$/;
    if (!regex.test(code)) {
      return false;
    }

    // Verify checksum
    const parts = code.split('-');
    const baseCode = parts.slice(0, 4).join('-');
    const providedChecksum = parts[4];
    const calculatedChecksum = this.calculateChecksum(baseCode);

    return providedChecksum === calculatedChecksum;
  }

  /**
   * Parse expert code to extract components
   */
  parseCode(code: string): {
    prefix: string;
    type: string;
    yearMonth: string;
    sequence: string;
    checksum: string;
  } | null {
    if (!this.validateCode(code)) {
      return null;
    }

    const parts = code.split('-');
    return {
      prefix: parts[0],
      type: parts[1],
      yearMonth: parts[2],
      sequence: parts[3],
      checksum: parts[4],
    };
  }

  /**
   * Get expert type display name
   */
  getTypeDisplayName(typeCode: string): string {
    switch (typeCode) {
      case 'TECH':
        return 'Technical Expert';
      case 'BIZ':
        return 'Business Expert';
      default:
        return 'Expert';
    }
  }

  /**
   * Generate code for an existing expert (if they don't have one)
   */
  async generateCodeForExpert(expertId: string): Promise<string | null> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
    });

    if (!expert) {
      return null;
    }

    if (expert.expertCode) {
      return expert.expertCode; // Already has a code
    }

    const code = await this.generateCode(expert.expertTypes);

    await this.expertRepository.update(expertId, {
      expertCode: code,
      expertCodeGeneratedAt: new Date(),
    });

    return code;
  }
}
