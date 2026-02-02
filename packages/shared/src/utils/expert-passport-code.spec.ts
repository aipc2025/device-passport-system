import {
  calculateExpertChecksum,
  generateExpertPassportCode,
  parseExpertPassportCode,
  validateExpertPassportCode,
  formatExpertPassportCode,
  encodeExpertType,
  decodeExpertType,
  encodeIndustryCode,
  decodeIndustryCode,
  encodeSkillCode,
  decodeSkillCode,
} from './expert-passport-code';
import { ExpertType } from '../types';

describe('Expert Passport Code Utilities', () => {
  describe('calculateExpertChecksum', () => {
    it('should calculate checksum for a valid expert code', () => {
      const code = 'EP-TECH-2601-000001';
      const checksum = calculateExpertChecksum(code);
      expect(checksum).toBeDefined();
      expect(checksum).toHaveLength(2);
      expect(/^[A-Z0-9]{2}$/.test(checksum)).toBe(true);
    });

    it('should produce consistent checksums', () => {
      const code = 'EP-TECH-2601-000001';
      const checksum1 = calculateExpertChecksum(code);
      const checksum2 = calculateExpertChecksum(code);
      expect(checksum1).toBe(checksum2);
    });

    it('should produce different checksums for different codes', () => {
      const code1 = 'EP-TECH-2601-000001';
      const code2 = 'EP-TECH-2601-000002';
      const checksum1 = calculateExpertChecksum(code1);
      const checksum2 = calculateExpertChecksum(code2);
      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('encodeExpertType and decodeExpertType', () => {
    it('should encode TECHNICAL type', () => {
      expect(encodeExpertType([ExpertType.TECHNICAL])).toBe('T');
    });

    it('should encode BUSINESS type', () => {
      expect(encodeExpertType([ExpertType.BUSINESS])).toBe('B');
    });

    it('should encode both types as ALL', () => {
      expect(encodeExpertType([ExpertType.TECHNICAL, ExpertType.BUSINESS])).toBe('A');
    });

    it('should decode T to TECHNICAL', () => {
      expect(decodeExpertType('T')).toEqual([ExpertType.TECHNICAL]);
    });

    it('should decode B to BUSINESS', () => {
      expect(decodeExpertType('B')).toEqual([ExpertType.BUSINESS]);
    });

    it('should decode A to both types', () => {
      const result = decodeExpertType('A');
      expect(result).toContain(ExpertType.TECHNICAL);
      expect(result).toContain(ExpertType.BUSINESS);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for invalid code', () => {
      expect(decodeExpertType('X')).toEqual([]);
    });
  });

  describe('encodeIndustryCode and decodeIndustryCode', () => {
    it('should encode known industries', () => {
      expect(encodeIndustryCode(['Automotive'])).toBe('A');
      expect(encodeIndustryCode(['Building Materials'])).toBe('B');
      expect(encodeIndustryCode(['Chemical'])).toBe('C');
    });

    it('should encode multiple industries alphabetically', () => {
      const code = encodeIndustryCode(['Automotive', 'Building Materials']);
      expect(code).toBe('AB');
    });

    it('should limit to 5 industries', () => {
      const industries = [
        'Automotive',
        'Building Materials',
        'Chemical',
        'Electronics',
        'Food & Beverage',
        'General Equipment', // This should be ignored
      ];
      const code = encodeIndustryCode(industries);
      expect(code).toHaveLength(5);
    });

    it('should decode industry codes', () => {
      const industries = decodeIndustryCode('AB');
      expect(industries).toContain('Automotive');
      expect(industries).toContain('Building Materials');
      expect(industries).toHaveLength(2);
    });

    it('should handle empty industry list', () => {
      expect(encodeIndustryCode([])).toBe('');
      expect(decodeIndustryCode('')).toEqual([]);
    });
  });

  describe('encodeSkillCode and decodeSkillCode', () => {
    it('should encode known skills', () => {
      expect(encodeSkillCode(['PLC Programming'])).toContain('PL');
      expect(encodeSkillCode(['Robot Programming'])).toContain('RB');
    });

    it('should encode multiple skills', () => {
      const code = encodeSkillCode(['PLC Programming', 'HMI Development']);
      expect(code).toHaveLength(4); // PL + HM
    });

    it('should limit to 5 skills', () => {
      const skills = [
        'PLC Programming',
        'HMI Development',
        'Robot Programming',
        'Motion Control',
        'Vision System',
        'Safety System', // This should be ignored
      ];
      const code = encodeSkillCode(skills);
      expect(code).toHaveLength(10); // 5 skills * 2 chars
    });

    it('should decode skill codes', () => {
      const skills = decodeSkillCode('PLHM');
      expect(skills).toContain('PLC Programming');
      expect(skills).toContain('HMI Development');
      expect(skills).toHaveLength(2);
    });

    it('should handle empty skill list', () => {
      expect(encodeSkillCode([])).toBe('');
      expect(decodeSkillCode('')).toEqual([]);
    });
  });

  describe('generateExpertPassportCode', () => {
    it('should generate a valid expert passport code', () => {
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
      );
      expect(code).toMatch(/^EP-T[A-Z0-9]+-2601-000001-[A-Z0-9]{2}$/);
    });

    it('should include industry and skill codes', () => {
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
      );
      expect(code).toContain('TA'); // T = Technical, A = Automotive
      expect(code).toContain('PL'); // PL = PLC Programming
    });

    it('should pad sequence number with zeros', () => {
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        42,
        ['Automotive'],
        ['PLC Programming']
      );
      expect(code).toMatch(/-000042-/);
    });

    it('should throw error for invalid year', () => {
      expect(() =>
        generateExpertPassportCode([ExpertType.TECHNICAL], 1999, 1, 1, ['Automotive'], [
          'PLC Programming',
        ])
      ).toThrow('Year must be between 2000 and 2099');
    });

    it('should throw error for invalid month', () => {
      expect(() =>
        generateExpertPassportCode([ExpertType.TECHNICAL], 2026, 0, 1, ['Automotive'], [
          'PLC Programming',
        ])
      ).toThrow('Month must be between 1 and 12');
    });

    it('should throw error for invalid sequence', () => {
      expect(() =>
        generateExpertPassportCode([ExpertType.TECHNICAL], 2026, 1, -1, ['Automotive'], [
          'PLC Programming',
        ])
      ).toThrow('Sequence must be between 0 and 999999');
    });

    it('should generate different codes for different expert types', () => {
      const code1 = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
      );
      const code2 = generateExpertPassportCode(
        [ExpertType.BUSINESS],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
      );
      expect(code1).toMatch(/^EP-T/);
      expect(code2).toMatch(/^EP-B/);
    });
  });

  describe('parseExpertPassportCode', () => {
    it('should parse a valid expert passport code', () => {
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
      );
      const parts = parseExpertPassportCode(code);
      expect(parts).toBeDefined();
      expect(parts?.prefix).toBe('EP');
      expect(parts?.yearMonth).toBe('2601');
      expect(parts?.sequence).toBe(1);
    });

    it('should return null for invalid format', () => {
      expect(parseExpertPassportCode('INVALID-CODE')).toBeNull();
      expect(parseExpertPassportCode('EP-T-26-000001-A7')).toBeNull(); // Invalid year-month
    });

    it('should handle case-insensitive parsing', () => {
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
      );
      const lowerCase = code.toLowerCase();
      const parts = parseExpertPassportCode(lowerCase);
      expect(parts).toBeDefined();
    });
  });

  describe('validateExpertPassportCode', () => {
    it('should validate a correct expert passport code', () => {
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive'],
        ['PLC Programming']
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
      const code = 'EP-TAPL-2601-000001-XX';
      const result = validateExpertPassportCode(code);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid checksum');
    });
  });

  describe('formatExpertPassportCode', () => {
    it('should convert to uppercase', () => {
      expect(formatExpertPassportCode('ep-tapl-2601-000001-a7')).toBe(
        'EP-TAPL-2601-000001-A7'
      );
    });

    it('should trim whitespace', () => {
      expect(formatExpertPassportCode('  EP-TAPL-2601-000001-A7  ')).toBe(
        'EP-TAPL-2601-000001-A7'
      );
    });
  });

  describe('Integration: Full workflow', () => {
    it('should generate, validate, and parse an expert passport code', () => {
      // Generate code
      const code = generateExpertPassportCode(
        [ExpertType.TECHNICAL],
        2026,
        1,
        1,
        ['Automotive', 'Electronics'],
        ['PLC Programming', 'HMI Development']
      );

      // Validate code
      const validation = validateExpertPassportCode(code);
      expect(validation.valid).toBe(true);

      // Parse code
      const parts = parseExpertPassportCode(code);
      expect(parts).toBeDefined();
      expect(parts?.yearMonth).toBe('2601');
      expect(parts?.sequence).toBe(1);

      // Decode expert types
      const expertTypes = decodeExpertType(parts!.expertTypeCode);
      expect(expertTypes).toContain(ExpertType.TECHNICAL);

      // Decode industries
      const industries = decodeIndustryCode(parts!.industryCode);
      expect(industries).toContain('Automotive');
      expect(industries).toContain('Electronics');

      // Decode skills
      const skills = decodeSkillCode(parts!.skillCode);
      expect(skills).toContain('PLC Programming');
      expect(skills).toContain('HMI Development');
    });

    it('should handle multiple sequential codes', () => {
      const codes = [];
      for (let i = 1; i <= 100; i++) {
        const code = generateExpertPassportCode(
          [ExpertType.TECHNICAL],
          2026,
          1,
          i,
          ['Automotive'],
          ['PLC Programming']
        );
        codes.push(code);

        const validation = validateExpertPassportCode(code);
        expect(validation.valid).toBe(true);
      }

      // Ensure all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(100);
    });
  });
});
