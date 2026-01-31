import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import {
  MatchResult,
  MarketplaceProduct,
  BuyerRequirement,
  Organization,
} from '../../database/entities';
import { ScoreBreakdown } from '../../database/entities/match-result.entity';
import {
  MatchType,
  MatchStatus,
  MatchSource,
  MarketplaceListingStatus,
  RFQStatus,
} from '@device-passport/shared';

// Scoring weights (total 100)
const SCORING_WEIGHTS = {
  locationProximity: 25,   // Highest priority for B2B local trading
  categoryMatch: 20,
  hsCodeMatch: 20,
  priceRangeMatch: 15,
  textSimilarity: 10,
  frequencyMatch: 10,
};

// Distance scoring thresholds
const DISTANCE_SCORES = [
  { maxKm: 50, score: 25 },
  { maxKm: 100, score: 22 },
  { maxKm: 300, score: 18 },
  { maxKm: 500, score: 14 },
  { maxKm: 1000, score: 10 },
  { maxKm: Infinity, score: 5 },
];

// Minimum score to create a match
const MIN_MATCH_SCORE = 50;

// High quality match threshold for notifications
const HIGH_QUALITY_SCORE = 70;

// Auto-notify threshold
const AUTO_NOTIFY_SCORE = 85;

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectRepository(MatchResult)
    private readonly matchRepository: Repository<MatchResult>,
    @InjectRepository(MarketplaceProduct)
    private readonly productRepository: Repository<MarketplaceProduct>,
    @InjectRepository(BuyerRequirement)
    private readonly requirementRepository: Repository<BuyerRequirement>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  /**
   * Match a new product against all open requirements
   */
  async matchProductToRequirements(productId: string): Promise<MatchResult[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId, status: MarketplaceListingStatus.ACTIVE },
      relations: ['organization'],
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found or not active`);
      return [];
    }

    // Get all open requirements
    const requirements = await this.requirementRepository.find({
      where: { status: RFQStatus.OPEN, isPublic: true },
      relations: ['organization'],
    });

    const matches: MatchResult[] = [];

    for (const requirement of requirements) {
      // Skip if same organization
      if (requirement.organizationId === product.organizationId) continue;

      // Check if match already exists
      const existingMatch = await this.matchRepository.findOne({
        where: {
          marketplaceProductId: product.id,
          buyerRequirementId: requirement.id,
        },
      });

      if (existingMatch) continue;

      const score = this.calculateMatchScore(product, requirement);

      if (score.totalScore >= MIN_MATCH_SCORE) {
        const match = this.matchRepository.create({
          matchType: MatchType.PRODUCT_TO_BUYER,
          marketplaceProductId: product.id,
          supplierOrgId: product.organizationId,
          buyerRequirementId: requirement.id,
          buyerOrgId: requirement.organizationId,
          totalScore: score.totalScore,
          scoreBreakdown: score.breakdown,
          distanceKm: score.distanceKm,
          status: MatchStatus.NEW,
          matchSource: MatchSource.AI_MATCHED,
          supplierNotified: score.totalScore >= AUTO_NOTIFY_SCORE,
          buyerNotified: score.totalScore >= AUTO_NOTIFY_SCORE,
        });

        const saved = await this.matchRepository.save(match);
        matches.push(saved);
      }
    }

    this.logger.log(`Created ${matches.length} matches for product ${productId}`);
    return matches;
  }

  /**
   * Match a new requirement against all active products
   */
  async matchRequirementToProducts(requirementId: string): Promise<MatchResult[]> {
    const requirement = await this.requirementRepository.findOne({
      where: { id: requirementId, status: RFQStatus.OPEN },
      relations: ['organization'],
    });

    if (!requirement) {
      this.logger.warn(`Requirement ${requirementId} not found or not open`);
      return [];
    }

    // Get all active products
    const products = await this.productRepository.find({
      where: { status: MarketplaceListingStatus.ACTIVE },
      relations: ['organization'],
    });

    const matches: MatchResult[] = [];

    for (const product of products) {
      // Skip if same organization
      if (product.organizationId === requirement.organizationId) continue;

      // Check if match already exists
      const existingMatch = await this.matchRepository.findOne({
        where: {
          marketplaceProductId: product.id,
          buyerRequirementId: requirement.id,
        },
      });

      if (existingMatch) continue;

      const score = this.calculateMatchScore(product, requirement);

      if (score.totalScore >= MIN_MATCH_SCORE) {
        const match = this.matchRepository.create({
          matchType: MatchType.REQUIREMENT_TO_SUPPLIER,
          marketplaceProductId: product.id,
          supplierOrgId: product.organizationId,
          buyerRequirementId: requirement.id,
          buyerOrgId: requirement.organizationId,
          totalScore: score.totalScore,
          scoreBreakdown: score.breakdown,
          distanceKm: score.distanceKm,
          status: MatchStatus.NEW,
          matchSource: MatchSource.AI_MATCHED,
          supplierNotified: score.totalScore >= AUTO_NOTIFY_SCORE,
          buyerNotified: score.totalScore >= AUTO_NOTIFY_SCORE,
        });

        const saved = await this.matchRepository.save(match);
        matches.push(saved);
      }
    }

    this.logger.log(`Created ${matches.length} matches for requirement ${requirementId}`);
    return matches;
  }

  /**
   * Admin can forward a buyer requirement to specific suppliers (manual matching)
   */
  async forwardRequirementToSuppliers(
    requirementId: string,
    supplierOrgIds: string[],
    matchSource: MatchSource = MatchSource.PLATFORM_RECOMMENDED,
  ): Promise<MatchResult[]> {
    const requirement = await this.requirementRepository.findOne({
      where: { id: requirementId },
      relations: ['organization'],
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    const matches: MatchResult[] = [];

    for (const supplierOrgId of supplierOrgIds) {
      // Skip if same organization as buyer
      if (supplierOrgId === requirement.organizationId) continue;

      // Check if match already exists
      const existingMatch = await this.matchRepository.findOne({
        where: {
          buyerRequirementId: requirementId,
          supplierOrgId: supplierOrgId,
        },
      });

      if (existingMatch) {
        // Update existing match source if admin is forwarding
        existingMatch.matchSource = matchSource;
        existingMatch.supplierNotified = true;
        await this.matchRepository.save(existingMatch);
        matches.push(existingMatch);
        continue;
      }

      // Create new match without product (direct supplier recommendation)
      const match = this.matchRepository.create({
        matchType: MatchType.REQUIREMENT_TO_SUPPLIER,
        buyerRequirementId: requirementId,
        buyerOrgId: requirement.organizationId,
        supplierOrgId: supplierOrgId,
        totalScore: 100, // Admin-recommended matches get high score
        scoreBreakdown: {
          categoryMatch: 20,
          hsCodeMatch: 20,
          priceRangeMatch: 15,
          locationProximity: 25,
          textSimilarity: 10,
          frequencyMatch: 10,
        },
        distanceKm: null,
        status: MatchStatus.NEW,
        matchSource: matchSource,
        supplierNotified: true,
        buyerNotified: true,
      });

      const saved = await this.matchRepository.save(match);
      matches.push(saved);
    }

    this.logger.log(`Admin forwarded requirement ${requirementId} to ${matches.length} suppliers`);
    return matches;
  }

  /**
   * Calculate match score between product and requirement
   */
  private calculateMatchScore(
    product: MarketplaceProduct,
    requirement: BuyerRequirement,
  ): { totalScore: number; breakdown: ScoreBreakdown; distanceKm: number | null } {
    const breakdown: ScoreBreakdown = {
      categoryMatch: 0,
      hsCodeMatch: 0,
      priceRangeMatch: 0,
      locationProximity: 0,
      textSimilarity: 0,
      frequencyMatch: 0,
    };

    let distanceKm: number | null = null;

    // 1. Category Match (20 points)
    if (product.productCategory && requirement.productCategory) {
      if (product.productCategory === requirement.productCategory) {
        breakdown.categoryMatch = SCORING_WEIGHTS.categoryMatch;
      }
    }

    // 2. HS Code Match (20 points)
    if (product.hsCode && requirement.hsCode) {
      const productHs = product.hsCode.replace(/\D/g, '');
      const reqHs = requirement.hsCode.replace(/\D/g, '');

      if (productHs.substring(0, 6) === reqHs.substring(0, 6)) {
        breakdown.hsCodeMatch = 20;
      } else if (productHs.substring(0, 4) === reqHs.substring(0, 4)) {
        breakdown.hsCodeMatch = 15;
      } else if (productHs.substring(0, 2) === reqHs.substring(0, 2)) {
        breakdown.hsCodeMatch = 10;
      }
    }

    // 3. Price Range Match (15 points)
    if (product.showPrice && product.minPrice && requirement.budgetMax) {
      const productPrice = Number(product.minPrice);
      const budgetMin = Number(requirement.budgetMin) || 0;
      const budgetMax = Number(requirement.budgetMax);

      if (productPrice >= budgetMin && productPrice <= budgetMax) {
        breakdown.priceRangeMatch = SCORING_WEIGHTS.priceRangeMatch;
      } else if (productPrice <= budgetMax * 1.2) {
        // Within 20% over budget
        breakdown.priceRangeMatch = Math.round(SCORING_WEIGHTS.priceRangeMatch * 0.6);
      }
    }

    // 4. Location Proximity (25 points - highest weight)
    if (
      product.locationLat && product.locationLng &&
      requirement.buyerLocationLat && requirement.buyerLocationLng
    ) {
      distanceKm = this.calculateDistance(
        Number(product.locationLat),
        Number(product.locationLng),
        Number(requirement.buyerLocationLat),
        Number(requirement.buyerLocationLng),
      );

      for (const tier of DISTANCE_SCORES) {
        if (distanceKm <= tier.maxKm) {
          breakdown.locationProximity = tier.score;
          break;
        }
      }
    } else if (
      product.supplyRegion &&
      requirement.preferredRegions?.length
    ) {
      // Fallback to region matching
      const regionMatch = requirement.preferredRegions.some(
        (r) => r.toLowerCase() === product.supplyRegion?.toLowerCase(),
      );
      if (regionMatch) {
        breakdown.locationProximity = 15; // Partial score for region match
      }
    }

    // 5. Text Similarity (10 points) - Simple keyword matching
    if (product.description && requirement.description) {
      const productWords = this.extractKeywords(product.listingTitle + ' ' + product.description);
      const reqWords = this.extractKeywords(requirement.title + ' ' + requirement.description);

      const common = productWords.filter((w) => reqWords.includes(w));
      const similarity = common.length / Math.max(productWords.length, reqWords.length, 1);
      breakdown.textSimilarity = Math.round(similarity * SCORING_WEIGHTS.textSimilarity);
    }

    // 6. Frequency Match (10 points) - placeholder for future
    // Could match product supply capacity with buyer's purchase frequency
    breakdown.frequencyMatch = 5; // Default partial score

    const totalScore =
      breakdown.categoryMatch +
      breakdown.hsCodeMatch +
      breakdown.priceRangeMatch +
      breakdown.locationProximity +
      breakdown.textSimilarity +
      breakdown.frequencyMatch;

    return { totalScore, breakdown, distanceKm };
  }

  /**
   * Haversine formula to calculate distance between two points
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Extract keywords from text for similarity matching
   */
  private extractKeywords(text: string): string[] {
    // Simple word extraction, remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.includes(w));
  }

  /**
   * Get match recommendations for a user/organization
   */
  async getRecommendations(
    organizationId: string,
    role: 'supplier' | 'buyer',
    limit = 20,
    includeViewed = false,
  ): Promise<MatchResult[]> {
    const where: any = {};

    if (role === 'supplier') {
      where.supplierOrgId = organizationId;
    } else {
      where.buyerOrgId = organizationId;
    }

    if (!includeViewed) {
      where.status = In([MatchStatus.NEW, MatchStatus.VIEWED]);
    } else {
      where.status = Not(MatchStatus.DISMISSED);
    }

    return this.matchRepository.find({
      where,
      relations: [
        'marketplaceProduct',
        'marketplaceProduct.organization',
        'buyerRequirement',
        'buyerRequirement.organization',
      ],
      order: { totalScore: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get match by ID
   */
  async getMatchById(id: string): Promise<MatchResult> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: [
        'marketplaceProduct',
        'marketplaceProduct.organization',
        'buyerRequirement',
        'buyerRequirement.organization',
        'supplierOrg',
        'buyerOrg',
      ],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  /**
   * Mark match as viewed
   */
  async markAsViewed(id: string, organizationId: string, role: 'supplier' | 'buyer'): Promise<MatchResult> {
    const match = await this.getMatchById(id);

    // Verify ownership
    if (role === 'supplier' && match.supplierOrgId !== organizationId) {
      throw new NotFoundException('Match not found');
    }
    if (role === 'buyer' && match.buyerOrgId !== organizationId) {
      throw new NotFoundException('Match not found');
    }

    if (match.status === MatchStatus.NEW) {
      match.status = MatchStatus.VIEWED;
    }

    if (role === 'supplier') {
      match.supplierViewedAt = new Date();
    } else {
      match.buyerViewedAt = new Date();
    }

    return this.matchRepository.save(match);
  }

  /**
   * Dismiss a match
   */
  async dismissMatch(id: string, organizationId: string): Promise<MatchResult> {
    const match = await this.getMatchById(id);

    // Verify ownership
    if (match.supplierOrgId !== organizationId && match.buyerOrgId !== organizationId) {
      throw new NotFoundException('Match not found');
    }

    match.status = MatchStatus.DISMISSED;
    return this.matchRepository.save(match);
  }

  /**
   * Mark match as contacted (when inquiry is created)
   */
  async markAsContacted(id: string): Promise<MatchResult> {
    const match = await this.getMatchById(id);
    match.status = MatchStatus.CONTACTED;
    return this.matchRepository.save(match);
  }

  /**
   * Get matching statistics (for admin)
   */
  async getStatistics() {
    const total = await this.matchRepository.count();
    const byStatus = await this.matchRepository
      .createQueryBuilder('m')
      .select('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('m.status')
      .getRawMany();

    const avgScore = await this.matchRepository
      .createQueryBuilder('m')
      .select('AVG(m.totalScore)', 'avgScore')
      .getRawOne();

    const highQuality = await this.matchRepository.count({
      where: { totalScore: 70 } as any, // >= 70
    });

    return {
      total,
      byStatus: byStatus.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      averageScore: Math.round(parseFloat(avgScore?.avgScore) || 0),
      highQualityCount: highQuality,
    };
  }

  /**
   * Run full matching for all active products and requirements
   * (Used by scheduled job)
   */
  async runFullMatching(): Promise<{ productsMatched: number; requirementsMatched: number }> {
    const products = await this.productRepository.find({
      where: { status: MarketplaceListingStatus.ACTIVE },
    });

    const requirements = await this.requirementRepository.find({
      where: { status: RFQStatus.OPEN, isPublic: true },
    });

    let productsMatched = 0;
    let requirementsMatched = 0;

    for (const product of products) {
      const matches = await this.matchProductToRequirements(product.id);
      if (matches.length > 0) productsMatched++;
    }

    for (const requirement of requirements) {
      const matches = await this.matchRequirementToProducts(requirement.id);
      if (matches.length > 0) requirementsMatched++;
    }

    this.logger.log(`Full matching complete: ${productsMatched} products, ${requirementsMatched} requirements`);
    return { productsMatched, requirementsMatched };
  }
}
