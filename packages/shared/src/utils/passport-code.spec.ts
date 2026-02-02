import {
  calculateChecksum,
  formatYearMonth,
  parseYearMonth,
  generatePassportCode,
  parsePassportCode,
  validatePassportCode,
  formatPassportCode,
  generateQRCodeContent,
  extractPassportCodeFromQR,
} from './passport-code';
import { ProductLine, OriginCode } from '../enums';

describe('Passport Code Utilities', () => {
  describe('calculateChecksum', () => {
    it('should calculate checksum for a valid code', () => {
      const code = 'DP-MED-2601-PF-CN-000001';
      const checksum = calculateChecksum(code);
      expect(checksum).toBeDefined();
      expect(checksum).toHaveLength(2);
      expect(/^[A-Z0-9]{2}$/.test(checksum)).toBe(true);
    });

    it('should produce consistent checksums', () => {
      const code = 'DP-MED-2601-PF-CN-000001';
      const checksum1 = calculateChecksum(code);
      const checksum2 = calculateChecksum(code);
      expect(checksum1).toBe(checksum2);
    });

    it('should produce different checksums for different codes', () => {
      const code1 = 'DP-MED-2601-PF-CN-000001';
      const code2 = 'DP-MED-2601-PF-CN-000002';
      const checksum1 = calculateChecksum(code1);
      const checksum2 = calculateChecksum(code2);
      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('formatYearMonth', () => {
    it('should format year and month correctly', () => {
      expect(formatYearMonth(2026, 1)).toBe('2601');
      expect(formatYearMonth(2026, 12)).toBe('2612');
      expect(formatYearMonth(2025, 5)).toBe('2505');
    });

    it('should pad single-digit months with zero', () => {
      expect(formatYearMonth(2026, 1)).toBe('2601');
      expect(formatYearMonth(2026, 9)).toBe('2609');
    });
  });

  describe('parseYearMonth', () => {
    it('should parse valid YYMM format', () => {
      const result = parseYearMonth('2601');
      expect(result).toEqual({ year: 2026, month: 1 });
    });

    it('should return null for invalid format', () => {
      expect(parseYearMonth('26')).toBeNull();
      expect(parseYearMonth('260')).toBeNull();
      expect(parseYearMonth('26011')).toBeNull();
      expect(parseYearMonth('abcd')).toBeNull();
    });

    it('should return null for invalid month', () => {
      expect(parseYearMonth('2600')).toBeNull();
      expect(parseYearMonth('2613')).toBeNull();
    });
  });

  describe('generatePassportCode', () => {
    it('should generate a valid passport code', () => {
      const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      expect(code).toMatch(/^DP-MED-2601-PF-CN-000001-[A-Z0-9]{2}$/);
    });

    it('should pad sequence number with zeros', () => {
      const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 42);
      expect(code).toMatch(/^DP-MED-2601-PF-CN-000042-[A-Z0-9]{2}$/);
    });

    it('should throw error for invalid company code length', () => {
      expect(() => generatePassportCode('ME', 2026, 1, ProductLine.PF, OriginCode.CN, 1)).toThrow(
        'Company code must be exactly 3 characters'
      );
      expect(() => generatePassportCode('MEDA', 2026, 1, ProductLine.PF, OriginCode.CN, 1)).toThrow(
        'Company code must be exactly 3 characters'
      );
    });

    it('should throw error for invalid year', () => {
      expect(() => generatePassportCode('MED', 1999, 1, ProductLine.PF, OriginCode.CN, 1)).toThrow(
        'Year must be between 2000 and 2099'
      );
      expect(() => generatePassportCode('MED', 2100, 1, ProductLine.PF, OriginCode.CN, 1)).toThrow(
        'Year must be between 2000 and 2099'
      );
    });

    it('should throw error for invalid month', () => {
      expect(() => generatePassportCode('MED', 2026, 0, ProductLine.PF, OriginCode.CN, 1)).toThrow(
        'Month must be between 1 and 12'
      );
      expect(() => generatePassportCode('MED', 2026, 13, ProductLine.PF, OriginCode.CN, 1)).toThrow(
        'Month must be between 1 and 12'
      );
    });

    it('should throw error for invalid sequence', () => {
      expect(() => generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, -1)).toThrow(
        'Sequence must be between 0 and 999999'
      );
      expect(() => generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1000000)).toThrow(
        'Sequence must be between 0 and 999999'
      );
    });

    it('should generate codes with different product lines', () => {
      const code1 = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      const code2 = generatePassportCode('MED', 2026, 1, ProductLine.IP, OriginCode.CN, 1);
      expect(code1).toMatch(/PF/);
      expect(code2).toMatch(/IP/);
    });

    it('should generate codes with different origin codes', () => {
      const code1 = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      const code2 = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.DE, 1);
      expect(code1).toMatch(/CN/);
      expect(code2).toMatch(/DE/);
    });
  });

  describe('parsePassportCode', () => {
    it('should parse a valid passport code', () => {
      const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      const parts = parsePassportCode(code);
      expect(parts).toBeDefined();
      expect(parts?.prefix).toBe('DP');
      expect(parts?.companyCode).toBe('MED');
      expect(parts?.yearMonth).toBe('2601');
      expect(parts?.productType).toBe(ProductLine.PF);
      expect(parts?.originCode).toBe(OriginCode.CN);
      expect(parts?.sequence).toBe(1);
    });

    it('should return null for invalid format', () => {
      expect(parsePassportCode('INVALID-CODE')).toBeNull();
      expect(parsePassportCode('DP-ME-2601-PF-CN-000001-A7')).toBeNull(); // Company code too short
      expect(parsePassportCode('DP-MED-26-PF-CN-000001-A7')).toBeNull(); // Invalid year-month
    });

    it('should handle case-insensitive parsing', () => {
      const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      const lowerCase = code.toLowerCase();
      const parts = parsePassportCode(lowerCase);
      expect(parts).toBeDefined();
      expect(parts?.companyCode).toBe('MED');
    });
  });

  describe('validatePassportCode', () => {
    it('should validate a correct passport code', () => {
      const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      const result = validatePassportCode(code);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.parts).toBeDefined();
    });

    it('should reject code with invalid format', () => {
      const result = validatePassportCode('INVALID-CODE');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid passport code format');
    });

    it('should reject code with invalid checksum', () => {
      const code = 'DP-MED-2601-PF-CN-000001-XX';
      const result = validatePassportCode(code);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid checksum');
    });

    it('should validate codes with different product lines', () => {
      const codes = [
        generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1),
        generatePassportCode('MED', 2026, 1, ProductLine.IP, OriginCode.CN, 1),
        generatePassportCode('MED', 2026, 1, ProductLine.QI, OriginCode.CN, 1),
      ];
      codes.forEach((code) => {
        const result = validatePassportCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('formatPassportCode', () => {
    it('should convert to uppercase', () => {
      expect(formatPassportCode('dp-med-2601-pf-cn-000001-a7')).toBe(
        'DP-MED-2601-PF-CN-000001-A7'
      );
    });

    it('should trim whitespace', () => {
      expect(formatPassportCode('  DP-MED-2601-PF-CN-000001-A7  ')).toBe(
        'DP-MED-2601-PF-CN-000001-A7'
      );
    });
  });

  describe('generateQRCodeContent', () => {
    it('should generate QR code URL', () => {
      const code = 'DP-MED-2601-PF-CN-000001-A7';
      const baseUrl = 'https://example.com';
      const qrContent = generateQRCodeContent(code, baseUrl);
      expect(qrContent).toBe('https://example.com/scan/DP-MED-2601-PF-CN-000001-A7');
    });
  });

  describe('extractPassportCodeFromQR', () => {
    it('should extract code from QR URL', () => {
      const qrContent = 'https://example.com/scan/DP-MED-2601-PF-CN-000001-A7';
      const code = extractPassportCodeFromQR(qrContent);
      expect(code).toBe('DP-MED-2601-PF-CN-000001-A7');
    });

    it('should extract code from just the code itself', () => {
      const validCode = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);
      const code = extractPassportCodeFromQR(validCode);
      expect(code).toBe(validCode.toUpperCase());
    });

    it('should return null for invalid content', () => {
      expect(extractPassportCodeFromQR('invalid-content')).toBeNull();
      expect(extractPassportCodeFromQR('https://example.com/other/page')).toBeNull();
    });

    it('should handle case-insensitive extraction', () => {
      const qrContent = 'https://example.com/scan/dp-med-2601-pf-cn-000001-a7';
      const code = extractPassportCodeFromQR(qrContent);
      expect(code).toBe('DP-MED-2601-PF-CN-000001-A7');
    });
  });

  describe('Integration: Full workflow', () => {
    it('should generate, validate, and parse a passport code', () => {
      // Generate code
      const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, 1);

      // Validate code
      const validation = validatePassportCode(code);
      expect(validation.valid).toBe(true);

      // Parse code
      const parts = parsePassportCode(code);
      expect(parts).toBeDefined();
      expect(parts?.companyCode).toBe('MED');
      expect(parts?.productType).toBe(ProductLine.PF);
      expect(parts?.originCode).toBe(OriginCode.CN);
      expect(parts?.sequence).toBe(1);

      // Generate QR content
      const qrContent = generateQRCodeContent(code, 'https://example.com');
      expect(qrContent).toContain('/scan/');

      // Extract from QR
      const extracted = extractPassportCodeFromQR(qrContent);
      expect(extracted).toBe(code);
    });

    it('should handle multiple sequential codes', () => {
      const codes = [];
      for (let i = 1; i <= 100; i++) {
        const code = generatePassportCode('MED', 2026, 1, ProductLine.PF, OriginCode.CN, i);
        codes.push(code);

        const validation = validatePassportCode(code);
        expect(validation.valid).toBe(true);
      }

      // Ensure all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(100);
    });
  });
});
