import { PassportCodeParts, ProductLine, OriginCode } from '../index';

/**
 * Passport code utilities
 * Format: DP-{COMPANY}-{YEAR}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}
 * Example: DP-MED-2025-PLC-DE-000001-A7
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
 * Generate a complete passport code
 */
export function generatePassportCode(
  companyCode: string,
  year: number,
  productLine: ProductLine,
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
  if (sequence < 0 || sequence > 999999) {
    throw new Error('Sequence must be between 0 and 999999');
  }

  // Format sequence with leading zeros
  const sequenceStr = sequence.toString().padStart(6, '0');

  // Build code without checksum
  const codeWithoutChecksum = `${PASSPORT_PREFIX}-${companyCode.toUpperCase()}-${year}-${productLine}-${originCode}-${sequenceStr}`;

  // Calculate and append checksum
  const checksum = calculateChecksum(codeWithoutChecksum);

  return `${codeWithoutChecksum}-${checksum}`;
}

/**
 * Parse a passport code into its components
 */
export function parsePassportCode(code: string): PassportCodeParts | null {
  const regex =
    /^(DP)-([A-Z]{3})-(\d{4})-([A-Z]{3})-([A-Z]{2})-(\d{6})-([A-Z0-9]{2})$/;
  const match = code.toUpperCase().match(regex);

  if (!match) {
    return null;
  }

  const [, prefix, companyCode, yearStr, productLineStr, originCodeStr, sequenceStr, checksum] =
    match;

  // Validate product line
  if (!Object.values(ProductLine).includes(productLineStr as ProductLine)) {
    return null;
  }

  // Validate origin code
  if (!Object.values(OriginCode).includes(originCodeStr as OriginCode)) {
    return null;
  }

  return {
    prefix: prefix as 'DP',
    companyCode,
    year: parseInt(yearStr, 10),
    productLine: productLineStr as ProductLine,
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
  const codeWithoutChecksum = `${parts.prefix}-${parts.companyCode}-${parts.year}-${parts.productLine}-${parts.originCode}-${parts.sequence.toString().padStart(6, '0')}`;

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
