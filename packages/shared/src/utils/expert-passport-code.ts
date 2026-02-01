import { ExpertTypeCode, IndustryCode, SkillCode } from '../enums';

/**
 * Expert Passport Code Utilities
 * Format: EP-{TYPE}{INDUSTRY}{SKILL}-{BIRTH_YYMM}-{NATIONALITY}-{SEQUENCE}-{CHECKSUM}
 * Example: EP-TPRB-8506-CN-000001-1A
 */

const EXPERT_PREFIX = 'EP';
const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Expert passport code parts interface
 */
export interface ExpertPassportParts {
  prefix: 'EP';
  expertType: ExpertTypeCode;
  industry: IndustryCode;
  skill: SkillCode;
  birthYearMonth: string;
  nationality: string;
  sequence: number;
  checksum: string;
}

/**
 * Format birth date to YYMM format
 * e.g., 1985-06-15 => "8506"
 */
export function formatBirthYearMonth(dateOfBirth: Date): string {
  const year = dateOfBirth.getFullYear() % 100;
  const month = dateOfBirth.getMonth() + 1;
  return `${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
}

/**
 * Parse YYMM format to year and month
 * e.g., "8506" => { year: 1985, month: 6 }
 */
export function parseBirthYearMonth(yearMonth: string): { year: number; month: number } | null {
  if (!/^\d{4}$/.test(yearMonth)) {
    return null;
  }
  const yy = parseInt(yearMonth.substring(0, 2), 10);
  const mm = parseInt(yearMonth.substring(2, 4), 10);

  if (mm < 1 || mm > 12) {
    return null;
  }

  // Assume 19xx for yy >= 30, 20xx for yy < 30
  const year = yy >= 30 ? 1900 + yy : 2000 + yy;
  return { year, month: mm };
}

/**
 * Calculate checksum using modified Luhn algorithm (Base-36)
 * Same algorithm as Device Passport for consistency
 */
export function calculateExpertChecksum(codeWithoutChecksum: string): string {
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
 * Determine expert type code from selected types
 */
export function determineExpertTypeCode(
  hasTechnical: boolean,
  hasBusiness: boolean
): ExpertTypeCode {
  if (hasTechnical && hasBusiness) {
    return ExpertTypeCode.A;
  } else if (hasBusiness) {
    return ExpertTypeCode.B;
  } else {
    return ExpertTypeCode.T;
  }
}

/**
 * Generate a complete expert passport code
 * @param expertType - Expert type code (T/B/A)
 * @param industry - Primary industry code
 * @param skill - Primary skill code
 * @param dateOfBirth - Date of birth
 * @param nationality - 2-letter nationality code (ISO 3166-1 Alpha-2)
 * @param sequence - Sequence number (1-999999)
 */
export function generateExpertPassportCode(
  expertType: ExpertTypeCode,
  industry: IndustryCode,
  skill: SkillCode,
  dateOfBirth: Date,
  nationality: string,
  sequence: number
): string {
  // Validate inputs
  if (!Object.values(ExpertTypeCode).includes(expertType)) {
    throw new Error('Invalid expert type code');
  }
  if (!Object.values(IndustryCode).includes(industry)) {
    throw new Error('Invalid industry code');
  }
  if (!Object.values(SkillCode).includes(skill)) {
    throw new Error('Invalid skill code');
  }
  if (!/^[A-Z]{2}$/i.test(nationality)) {
    throw new Error('Nationality code must be exactly 2 letters');
  }
  if (sequence < 1 || sequence > 999999) {
    throw new Error('Sequence must be between 1 and 999999');
  }

  // Format components
  const typeIndustrySkill = `${expertType}${industry}${skill}`;
  const birthYM = formatBirthYearMonth(dateOfBirth);
  const nationalityCode = nationality.toUpperCase();
  const sequenceStr = sequence.toString().padStart(6, '0');

  // Build code without checksum
  const codeWithoutChecksum = `${EXPERT_PREFIX}-${typeIndustrySkill}-${birthYM}-${nationalityCode}-${sequenceStr}`;

  // Calculate and append checksum
  const checksum = calculateExpertChecksum(codeWithoutChecksum);

  return `${codeWithoutChecksum}-${checksum}`;
}

/**
 * Parse an expert passport code into its components
 */
export function parseExpertPassportCode(code: string): ExpertPassportParts | null {
  // Regex: EP-{T/B/A}{Industry}{Skill}-{YYMM}-{CC}-{NNNNNN}-{XX}
  const regex = /^(EP)-([TBA])([A-Z])([A-Z]{2})-(\d{4})-([A-Z]{2})-(\d{6})-([A-Z0-9]{2})$/i;
  const match = code.toUpperCase().match(regex);

  if (!match) {
    return null;
  }

  const [, prefix, expertType, industry, skill, birthYM, nationality, sequenceStr, checksum] = match;

  // Validate enum values
  if (!Object.values(ExpertTypeCode).includes(expertType as ExpertTypeCode)) {
    return null;
  }
  if (!Object.values(IndustryCode).includes(industry as IndustryCode)) {
    return null;
  }
  if (!Object.values(SkillCode).includes(skill as SkillCode)) {
    return null;
  }

  // Validate birth year month
  const parsedBirth = parseBirthYearMonth(birthYM);
  if (!parsedBirth) {
    return null;
  }

  return {
    prefix: prefix as 'EP',
    expertType: expertType as ExpertTypeCode,
    industry: industry as IndustryCode,
    skill: skill as SkillCode,
    birthYearMonth: birthYM,
    nationality,
    sequence: parseInt(sequenceStr, 10),
    checksum,
  };
}

/**
 * Validate an expert passport code (format and checksum)
 */
export function validateExpertPassportCode(code: string): {
  valid: boolean;
  error?: string;
  parts?: ExpertPassportParts;
} {
  // Parse the code
  const parts = parseExpertPassportCode(code);
  if (!parts) {
    return {
      valid: false,
      error: 'Invalid expert passport code format',
    };
  }

  // Build code without checksum and verify
  const sequenceStr = parts.sequence.toString().padStart(6, '0');
  const codeWithoutChecksum = `EP-${parts.expertType}${parts.industry}${parts.skill}-${parts.birthYearMonth}-${parts.nationality}-${sequenceStr}`;

  const expectedChecksum = calculateExpertChecksum(codeWithoutChecksum);

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
 * Format expert passport code for display (with proper casing)
 */
export function formatExpertPassportCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Generate QR code content for an expert passport
 */
export function generateExpertQRCodeContent(expertCode: string, baseUrl: string): string {
  const formattedCode = formatExpertPassportCode(expertCode);
  return `${baseUrl}/expert/scan/${formattedCode}`;
}

/**
 * Extract expert passport code from QR content (URL)
 */
export function extractExpertCodeFromQR(qrContent: string): string | null {
  // Match pattern: /expert/scan/{CODE}
  const urlMatch = qrContent.match(/\/expert\/scan\/([A-Z0-9-]+)/i);
  if (urlMatch) {
    return formatExpertPassportCode(urlMatch[1]);
  }

  // If it's just the code itself
  const validation = validateExpertPassportCode(qrContent);
  if (validation.valid) {
    return formatExpertPassportCode(qrContent);
  }

  return null;
}

/**
 * Get expert description from passport code
 */
export function getExpertDescriptionFromCode(
  code: string,
  industryNames: Record<IndustryCode, { en: string; zh: string }>,
  skillNames: Record<SkillCode, { en: string; zh: string }>,
  lang: 'en' | 'zh' = 'zh'
): string | null {
  const parts = parseExpertPassportCode(code);
  if (!parts) return null;

  const industry = industryNames[parts.industry]?.[lang] || parts.industry;
  const skill = skillNames[parts.skill]?.[lang] || parts.skill;

  if (lang === 'zh') {
    return `${industry}${skill}专家`;
  } else {
    return `${industry} ${skill} Expert`;
  }
}
