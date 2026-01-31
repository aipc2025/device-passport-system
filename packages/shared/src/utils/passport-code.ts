import { PassportCodeParts, ProductLine, OriginCode } from '../index';

/**
 * Passport code utilities
 * Format: DP-{COMPANY}-{YYMM}-{PRODUCT_TYPE}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}
 * Example: DP-MED-2601-PF-CN-000001-A7
 * YYMM = Year (last 2 digits) + Month (2 digits)
 */

const PASSPORT_PREFIX = 'DP';
const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Calculate checksum using modified Luhn algorithm (base 36)
 */
export function calculateChecksum(codeWithoutChecksum: string): string {
  // Remove dashes and convert to uppercase
  const cleanCode = codeWithoutChecksum.replace(/-/g, '').toUpperCase();

  let sum = 0;
  let isDouble = false;

  // Process from right to left
  for (let i = cleanCode.length - 1; i >= 0; i--) {
    let value = BASE36_CHARS.indexOf(cleanCode[i]);
    if (value === -1) continue;

    if (isDouble) {
      value *= 2;
      if (value >= 36) {
        value = Math.floor(value / 36) + (value % 36);
      }
    }

    sum += value;
    isDouble = !isDouble;
  }

  // Calculate check digit to make sum divisible by 36
  const checkValue = (36 - (sum % 36)) % 36;

  // Convert to two-character base36
  const firstDigit = Math.floor(checkValue / 6) % 6;
  const secondDigit = checkValue % 6;

  return BASE36_CHARS[firstDigit] + BASE36_CHARS[secondDigit + 10]; // Use A-F for second digit
}

/**
 * Format year and month to YYMM format
 * e.g., 2026, 1 => "2601"
 */
export function formatYearMonth(year: number, month: number): string {
  const yy = (year % 100).toString().padStart(2, '0');
  const mm = month.toString().padStart(2, '0');
  return `${yy}${mm}`;
}

/**
 * Parse YYMM format to year and month
 * e.g., "2601" => { year: 2026, month: 1 }
 */
export function parseYearMonth(yearMonth: string): { year: number; month: number } | null {
  if (!/^\d{4}$/.test(yearMonth)) {
    return null;
  }
  const yy = parseInt(yearMonth.substring(0, 2), 10);
  const mm = parseInt(yearMonth.substring(2, 4), 10);

  if (mm < 1 || mm > 12) {
    return null;
  }

  // Assume 20xx century
  const year = 2000 + yy;
  return { year, month: mm };
}

/**
 * Generate a complete passport code
 * @param companyCode - 3-letter company code
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 * @param productType - Product type code
 * @param originCode - Origin country code
 * @param sequence - Sequence number
 */
export function generatePassportCode(
  companyCode: string,
  year: number,
  month: number,
  productType: ProductLine,
  originCode: OriginCode,
  sequence: number
): string {
  // Validate inputs
  if (companyCode.length !== 3) {
    throw new Error('Company code must be exactly 3 characters');
  }
  if (year < 2000 || year > 2099) {
    throw new Error('Year must be between 2000 and 2099');
  }
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  if (sequence < 0 || sequence > 999999) {
    throw new Error('Sequence must be between 0 and 999999');
  }

  // Format year-month as YYMM
  const yearMonth = formatYearMonth(year, month);

  // Format sequence with leading zeros
  const sequenceStr = sequence.toString().padStart(6, '0');

  // Build code without checksum
  const codeWithoutChecksum = `${PASSPORT_PREFIX}-${companyCode.toUpperCase()}-${yearMonth}-${productType}-${originCode}-${sequenceStr}`;

  // Calculate and append checksum
  const checksum = calculateChecksum(codeWithoutChecksum);

  return `${codeWithoutChecksum}-${checksum}`;
}

/**
 * Parse a passport code into its components
 */
export function parsePassportCode(code: string): PassportCodeParts | null {
  // Updated regex: YYMM instead of YYYY, product type can be 2-3 chars
  const regex =
    /^(DP)-([A-Z]{3})-(\d{4})-([A-Z]{2,3})-([A-Z]{2})-(\d{6})-([A-Z0-9]{2})$/;
  const match = code.toUpperCase().match(regex);

  if (!match) {
    return null;
  }

  const [, prefix, companyCode, yearMonth, productTypeStr, originCodeStr, sequenceStr, checksum] =
    match;

  // Validate year-month format
  const parsedYM = parseYearMonth(yearMonth);
  if (!parsedYM) {
    return null;
  }

  // Validate product type
  if (!Object.values(ProductLine).includes(productTypeStr as ProductLine)) {
    return null;
  }

  // Validate origin code
  if (!Object.values(OriginCode).includes(originCodeStr as OriginCode)) {
    return null;
  }

  return {
    prefix: prefix as 'DP',
    companyCode,
    yearMonth,
    productType: productTypeStr as ProductLine,
    originCode: originCodeStr as OriginCode,
    sequence: parseInt(sequenceStr, 10),
    checksum,
  };
}

/**
 * Validate a passport code (format and checksum)
 */
export function validatePassportCode(code: string): {
  valid: boolean;
  error?: string;
  parts?: PassportCodeParts;
} {
  // Parse the code
  const parts = parsePassportCode(code);
  if (!parts) {
    return {
      valid: false,
      error: 'Invalid passport code format',
    };
  }

  // Build code without checksum and verify
  const codeWithoutChecksum = `${parts.prefix}-${parts.companyCode}-${parts.yearMonth}-${parts.productType}-${parts.originCode}-${parts.sequence.toString().padStart(6, '0')}`;

  const expectedChecksum = calculateChecksum(codeWithoutChecksum);

  if (parts.checksum !== expectedChecksum) {
    return {
      valid: false,
      error: 'Invalid checksum',
    };
  }

  return {
    valid: true,
    parts,
  };
}

/**
 * Format passport code for display (with proper casing)
 */
export function formatPassportCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Generate QR code content for a passport
 * Returns a URL that can be encoded in a QR code
 */
export function generateQRCodeContent(passportCode: string, baseUrl: string): string {
  const formattedCode = formatPassportCode(passportCode);
  return `${baseUrl}/scan/${formattedCode}`;
}

/**
 * Extract passport code from QR content (URL)
 */
export function extractPassportCodeFromQR(qrContent: string): string | null {
  // Match pattern: /scan/{CODE}
  const urlMatch = qrContent.match(/\/scan\/([A-Z0-9-]+)/i);
  if (urlMatch) {
    return formatPassportCode(urlMatch[1]);
  }

  // If it's just the code itself
  const validation = validatePassportCode(qrContent);
  if (validation.valid) {
    return formatPassportCode(qrContent);
  }

  return null;
}
