import {
  calculateExpertChecksum,
  generateExpertPassportCode,
  parseExpertPassportCode,
  validateExpertPassportCode,
  formatExpertPassportCode,
  formatBirthYearMonth,
  parseBirthYearMonth,
  determineExpertTypeCode,
} from './expert-passport-code';
import { ExpertTypeCode, IndustryCode, SkillCode } from '../enums';

describe('Expert Passport Code Utilities', () => {
  describe('calculateExpertChecksum', () => {
    it('should calculate checksum for a valid expert code', () => {
      const code = 'EP-TAM-8506-CN-000001';
      const checksum = calculateExpertChecksum(code);
      expect(checksum).toBeDefined();
      expect(checksum).toHaveLength(2);
      expect(/^[A-Z0-9]{2}$/.test(checksum)).toBe(true);
    });

    it('should produce consistent checksums', () => {
      const code = 'EP-TAM-8506-CN-000001';
      const checksum1 = calculateExpertChecksum(code);
      const checksum2 = calculateExpertChecksum(code);
      expect(checksum1).toBe(checksum2);
    });

    it('should produce different checksums for different codes', () => {
      const code1 = 'EP-TAM-8506-CN-000001';
      const code2 = 'EP-TAM-8506-CN-000002';
      const checksum1 = calculateExpertChecksum(code1);
      const checksum2 = calculateExpertChecksum(code2);
      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('formatBirthYearMonth', () => {
    it('should format date to YYMM', () => {
      const date = new Date('1985-06-15');
      expect(formatBirthYearMonth(date)).toBe('8506');
    });

    it('should pad month with zero', () => {
      const date = new Date('2000-01-01');
      expect(formatBirthYearMonth(date)).toBe('0001');
    });

    it('should handle December', () => {
      const date = new Date('1990-12-31');
      expect(formatBirthYearMonth(date)).toBe('9012');
    });
  });

  describe('parseBirthYearMonth', () => {
    it('should parse YYMM to year and month', () => {
      const result = parseBirthYearMonth('8506');
      expect(result).toEqual({ year: 1985, month: 6 });
    });

    it('should handle 20xx years', () => {
      const result = parseBirthYearMonth('0001');
      expect(result).toEqual({ year: 2000, month: 1 });
    });

    it('should return null for invalid format', () => {
      expect(parseBirthYearMonth('850')).toBeNull();
      expect(parseBirthYearMonth('abc')).toBeNull();
    });

    it('should return null for invalid month', () => {
      expect(parseBirthYearMonth('8513')).toBeNull();
      expect(parseBirthYearMonth('8500')).toBeNull();
    });
  });

  describe('determineExpertTypeCode', () => {
    it('should return T for technical only', () => {
      expect(determineExpertTypeCode(true, false)).toBe(ExpertTypeCode.T);
    });

    it('should return B for business only', () => {
      expect(determineExpertTypeCode(false, true)).toBe(ExpertTypeCode.B);
    });

    it('should return A for both', () => {
      expect(determineExpertTypeCode(true, true)).toBe(ExpertTypeCode.A);
    });

    it('should return T as default', () => {
      expect(determineExpertTypeCode(false, false)).toBe(ExpertTypeCode.T);
    });
  });

  describe('generateExpertPassportCode', () => {
    const testDate = new Date('1985-06-15');

    it('should generate a valid expert passport code', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'CN',
        1
      );
      expect(code).toMatch(/^EP-TAPL-8506-CN-000001-[A-Z0-9]{2}$/);
    });

    it('should include correct components', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'CN',
        1
      );
      expect(code).toContain('EP');
      expect(code).toContain('TAPL');
      expect(code).toContain('8506');
      expect(code).toContain('CN');
      expect(code).toContain('000001');
    });

    it('should pad sequence number with zeros', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'CN',
        42
      );
      expect(code).toMatch(/-000042-/);
    });

    it('should throw error for invalid expert type', () => {
      expect(() =>
        generateExpertPassportCode(
          'X' as ExpertTypeCode,
          IndustryCode.A,
          SkillCode.PL,
          testDate,
          'CN',
          1
        )
      ).toThrow('Invalid expert type code');
    });

    it('should throw error for invalid industry', () => {
      expect(() =>
        generateExpertPassportCode(
          ExpertTypeCode.T,
          'X' as IndustryCode,
          SkillCode.PL,
          testDate,
          'CN',
          1
        )
      ).toThrow('Invalid industry code');
    });

    it('should throw error for invalid skill', () => {
      expect(() =>
        generateExpertPassportCode(
          ExpertTypeCode.T,
          IndustryCode.A,
          'XX' as SkillCode,
          testDate,
          'CN',
          1
        )
      ).toThrow('Invalid skill code');
    });

    it('should throw error for invalid nationality code', () => {
      expect(() =>
        generateExpertPassportCode(
          ExpertTypeCode.T,
          IndustryCode.A,
          SkillCode.PL,
          testDate,
          'C',
          1
        )
      ).toThrow('Nationality code must be exactly 2 letters');
    });

    it('should throw error for invalid sequence', () => {
      expect(() =>
        generateExpertPassportCode(
          ExpertTypeCode.T,
          IndustryCode.A,
          SkillCode.PL,
          testDate,
          'CN',
          0
        )
      ).toThrow('Sequence must be between 1 and 999999');

      expect(() =>
        generateExpertPassportCode(
          ExpertTypeCode.T,
          IndustryCode.A,
          SkillCode.PL,
          testDate,
          'CN',
          1000000
        )
      ).toThrow('Sequence must be between 1 and 999999');
    });

    it('should generate different codes for different expert types', () => {
      const code1 = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'CN',
        1
      );
      const code2 = generateExpertPassportCode(
        ExpertTypeCode.B,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'CN',
        1
      );
      expect(code1).toMatch(/^EP-T/);
      expect(code2).toMatch(/^EP-B/);
    });

    it('should accept lowercase nationality', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'cn',
        1
      );
      expect(code).toContain('-CN-');
    });
  });

  describe('parseExpertPassportCode', () => {
    it('should parse a valid expert passport code', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        new Date('1985-06-15'),
        'CN',
        1
      );
      const parts = parseExpertPassportCode(code);
      expect(parts).toBeDefined();
      expect(parts?.prefix).toBe('EP');
      expect(parts?.expertType).toBe(ExpertTypeCode.T);
      expect(parts?.industry).toBe(IndustryCode.A);
      expect(parts?.skill).toBe(SkillCode.PL);
      expect(parts?.birthYearMonth).toBe('8506');
      expect(parts?.nationality).toBe('CN');
      expect(parts?.sequence).toBe(1);
    });

    it('should return null for invalid format', () => {
      expect(parseExpertPassportCode('INVALID-CODE')).toBeNull();
      expect(parseExpertPassportCode('EP-T-26-000001-A7')).toBeNull();
    });

    it('should return null for invalid expert type', () => {
      expect(parseExpertPassportCode('EP-XAM-8506-CN-000001-A7')).toBeNull();
    });

    it('should return null for invalid industry', () => {
      expect(parseExpertPassportCode('EP-TXM-8506-CN-000001-A7')).toBeNull();
    });

    it('should return null for invalid skill', () => {
      expect(parseExpertPassportCode('EP-TAXX-8506-CN-000001-A7')).toBeNull();
    });

    it('should return null for invalid birth month', () => {
      expect(parseExpertPassportCode('EP-TAM-8513-CN-000001-A7')).toBeNull();
    });

    it('should handle case-insensitive parsing', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        new Date('1985-06-15'),
        'CN',
        1
      );
      const lowerCase = code.toLowerCase();
      const parts = parseExpertPassportCode(lowerCase);
      expect(parts).toBeDefined();
      expect(parts?.expertType).toBe(ExpertTypeCode.T);
    });
  });

  describe('validateExpertPassportCode', () => {
    it('should validate a correct expert passport code', () => {
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        new Date('1985-06-15'),
        'CN',
        1
      );
      const result = validateExpertPassportCode(code);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.parts).toBeDefined();
    });

    it('should reject code with invalid format', () => {
      const result = validateExpertPassportCode('INVALID-CODE');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid expert passport code format');
    });

    it('should reject code with invalid checksum', () => {
      const code = 'EP-TAM-8506-CN-000001-XX';
      const result = validateExpertPassportCode(code);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid checksum');
    });

    it('should validate codes with different checksums', () => {
      const code1 = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        new Date('1985-06-15'),
        'CN',
        1
      );
      const code2 = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        new Date('1985-06-15'),
        'CN',
        2
      );
      expect(validateExpertPassportCode(code1).valid).toBe(true);
      expect(validateExpertPassportCode(code2).valid).toBe(true);
      expect(code1).not.toBe(code2);
    });
  });

  describe('formatExpertPassportCode', () => {
    it('should convert to uppercase', () => {
      expect(formatExpertPassportCode('ep-tam-8506-cn-000001-a7')).toBe(
        'EP-TAM-8506-CN-000001-A7'
      );
    });

    it('should trim whitespace', () => {
      expect(formatExpertPassportCode('  EP-TAM-8506-CN-000001-A7  ')).toBe(
        'EP-TAM-8506-CN-000001-A7'
      );
    });

    it('should handle already formatted code', () => {
      const code = 'EP-TAM-8506-CN-000001-A7';
      expect(formatExpertPassportCode(code)).toBe(code);
    });
  });

  describe('Integration: Full workflow', () => {
    it('should generate, validate, and parse an expert passport code', () => {
      const testDate = new Date('1985-06-15');

      // Generate code
      const code = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'CN',
        1
      );

      // Validate code
      const validation = validateExpertPassportCode(code);
      expect(validation.valid).toBe(true);

      // Parse code
      const parts = parseExpertPassportCode(code);
      expect(parts).toBeDefined();
      expect(parts?.birthYearMonth).toBe('8506');
      expect(parts?.sequence).toBe(1);
      expect(parts?.expertType).toBe(ExpertTypeCode.T);
      expect(parts?.industry).toBe(IndustryCode.A);
      expect(parts?.skill).toBe(SkillCode.PL);
    });

    it('should handle multiple sequential codes', () => {
      const codes = [];
      const testDate = new Date('1985-06-15');

      for (let i = 1; i <= 100; i++) {
        const code = generateExpertPassportCode(
          ExpertTypeCode.T,
          IndustryCode.A,
          SkillCode.PL,
          testDate,
          'CN',
          i
        );
        codes.push(code);

        const validation = validateExpertPassportCode(code);
        expect(validation.valid).toBe(true);
      }

      // Ensure all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(100);
    });

    it('should handle different expert profiles', () => {
      const testDate = new Date('1990-03-20');

      // Technical expert
      const techCode = generateExpertPassportCode(
        ExpertTypeCode.T,
        IndustryCode.A,
        SkillCode.PL,
        testDate,
        'US',
        1
      );
      expect(validateExpertPassportCode(techCode).valid).toBe(true);
      expect(techCode).toContain('TAPL');

      // Business expert
      const bizCode = generateExpertPassportCode(
        ExpertTypeCode.B,
        IndustryCode.C,
        SkillCode.RB,
        testDate,
        'GB',
        2
      );
      expect(validateExpertPassportCode(bizCode).valid).toBe(true);
      expect(bizCode).toContain('BCRB');

      // All-round expert
      const allCode = generateExpertPassportCode(
        ExpertTypeCode.A,
        IndustryCode.E,
        SkillCode.HM,
        testDate,
        'DE',
        3
      );
      expect(validateExpertPassportCode(allCode).valid).toBe(true);
      expect(allCode).toContain('AEHM');
    });
  });
});
