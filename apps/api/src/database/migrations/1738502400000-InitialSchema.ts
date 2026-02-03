import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1738502400000 implements MigrationInterface {
  name = 'InitialSchema1738502400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create Organizations table
    await queryRunner.query(`
      CREATE TABLE "organization" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "code" character varying(10) NOT NULL,
        "type" character varying NOT NULL,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "country" character varying,
        "postalCode" character varying,
        "phone" character varying,
        "email" character varying,
        "website" character varying,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organization" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organization_code" UNIQUE ("code")
      )
    `);

    // Create Users table
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying NOT NULL,
        "role" character varying NOT NULL,
        "organizationId" uuid,
        "expertId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    // Create Sequence Counter table
    await queryRunner.query(`
      CREATE TABLE "sequence_counter" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "companyCode" character varying(3) NOT NULL,
        "yearMonth" character varying(4) NOT NULL,
        "productLine" character varying NOT NULL,
        "originCode" character varying NOT NULL,
        "currentSequence" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sequence_counter" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sequence_counter" UNIQUE ("companyCode", "yearMonth", "productLine", "originCode")
      )
    `);

    // Create Device Passport table
    await queryRunner.query(`
      CREATE TABLE "device_passport" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "passportCode" character varying NOT NULL,
        "productLine" character varying NOT NULL,
        "originCode" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'CREATED',
        "deviceName" character varying NOT NULL,
        "deviceModel" character varying NOT NULL,
        "manufacturer" character varying NOT NULL,
        "manufacturerPartNumber" character varying,
        "serialNumber" character varying,
        "specifications" jsonb,
        "manufactureDate" TIMESTAMP,
        "warrantyExpiryDate" TIMESTAMP,
        "qrCodeUrl" character varying,
        "supplierId" uuid,
        "customerId" uuid,
        "currentLocation" character varying,
        "gpsCoordinates" jsonb,
        "notes" text,
        "blockchainTxHash" character varying,
        "createdBy" uuid,
        "updatedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_passport" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_device_passport_code" UNIQUE ("passportCode")
      )
    `);

    // Create Lifecycle Event table
    await queryRunner.query(`
      CREATE TABLE "lifecycle_event" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "passportId" uuid NOT NULL,
        "eventType" character varying NOT NULL,
        "eventDate" TIMESTAMP NOT NULL DEFAULT now(),
        "previousStatus" character varying,
        "newStatus" character varying,
        "location" character varying,
        "gpsCoordinates" jsonb,
        "performedBy" uuid,
        "notes" text,
        "attachments" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lifecycle_event" PRIMARY KEY ("id")
      )
    `);

    // Create Individual Expert table
    await queryRunner.query(`
      CREATE TABLE "individual_expert" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "personalName" character varying NOT NULL,
        "expertTypes" text NOT NULL,
        "phone" character varying NOT NULL,
        "professionalField" text NOT NULL,
        "servicesOffered" text NOT NULL,
        "yearsOfExperience" integer,
        "certifications" text,
        "expertCode" character varying,
        "expertCodeGeneratedAt" TIMESTAMP,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "skillTags" text,
        "serviceRadius" integer DEFAULT 50,
        "currentLocation" character varying,
        "locationLat" double precision,
        "locationLng" double precision,
        "registrationStatus" character varying NOT NULL DEFAULT 'PENDING',
        "identityDocumentUrl" character varying,
        "businessLicenseUrl" character varying,
        "certificationUrls" text,
        "avgRating" double precision DEFAULT 0,
        "totalReviews" integer DEFAULT 0,
        "completedServices" integer DEFAULT 0,
        "memberLevel" character varying DEFAULT 'BASIC',
        "workStatus" character varying DEFAULT 'IDLE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_individual_expert" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_individual_expert_code" UNIQUE ("expertCode")
      )
    `);

    // Create Service Request table
    await queryRunner.query(`
      CREATE TABLE "service_request" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requestCode" character varying,
        "requesterUserId" uuid,
        "requesterName" character varying NOT NULL,
        "requesterPhone" character varying NOT NULL,
        "requesterEmail" character varying,
        "serviceType" character varying NOT NULL,
        "problemType" character varying,
        "devicePassportId" uuid,
        "deviceInfo" jsonb,
        "description" text NOT NULL,
        "urgency" character varying NOT NULL DEFAULT 'NORMAL',
        "expectedTime" character varying,
        "specificTime" TIMESTAMP,
        "location" character varying NOT NULL,
        "locationLat" double precision,
        "locationLng" double precision,
        "budgetRange" character varying,
        "specificBudget" double precision,
        "preferredContactMethod" character varying,
        "preferredContactTime" character varying,
        "attachmentUrls" text,
        "status" character varying NOT NULL DEFAULT 'DRAFT',
        "publishedAt" TIMESTAMP,
        "assignedExpertId" uuid,
        "completedAt" TIMESTAMP,
        "cancelledAt" TIMESTAMP,
        "cancellationReason" text,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_request" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_service_request_code" UNIQUE ("requestCode")
      )
    `);

    // Create Expert Service Record table
    await queryRunner.query(`
      CREATE TABLE "expert_service_record" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceRequestId" uuid NOT NULL,
        "expertId" uuid NOT NULL,
        "customerUserId" uuid,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "agreedPrice" double precision NOT NULL,
        "priceCurrency" character varying DEFAULT 'CNY',
        "estimatedDuration" character varying,
        "scheduledStart" TIMESTAMP,
        "scheduledEnd" TIMESTAMP,
        "actualStart" TIMESTAMP,
        "actualEnd" TIMESTAMP,
        "finalPrice" double precision,
        "expertNotes" text,
        "completionNotes" text,
        "customerConfirmedAt" TIMESTAMP,
        "cancellationReason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expert_service_record" PRIMARY KEY ("id")
      )
    `);

    // Create Expert Review table
    await queryRunner.query(`
      CREATE TABLE "expert_review" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceRecordId" uuid NOT NULL,
        "expertId" uuid NOT NULL,
        "reviewerUserId" uuid NOT NULL,
        "overallRating" integer NOT NULL,
        "qualityRating" integer,
        "communicationRating" integer,
        "punctualityRating" integer,
        "professionalismRating" integer,
        "valueRating" integer,
        "title" character varying,
        "comment" text,
        "pros" text,
        "cons" text,
        "isVerified" boolean DEFAULT false,
        "expertResponse" text,
        "expertRespondedAt" TIMESTAMP,
        "isFlagged" boolean DEFAULT false,
        "flagReason" text,
        "helpfulCount" integer DEFAULT 0,
        "notHelpfulCount" integer DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expert_review" PRIMARY KEY ("id")
      )
    `);

    // Create Marketplace Product table
    await queryRunner.query(`
      CREATE TABLE "marketplace_product" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "category" character varying NOT NULL,
        "hsCode" character varying,
        "description" text NOT NULL,
        "specifications" jsonb,
        "price" double precision,
        "priceUnit" character varying,
        "currency" character varying DEFAULT 'CNY',
        "moq" integer,
        "leadTime" character varying,
        "origin" character varying,
        "certifications" text,
        "imageUrls" text,
        "videoUrls" text,
        "documentUrls" text,
        "keywords" text,
        "location" character varying,
        "locationLat" double precision,
        "locationLng" double precision,
        "isFeatured" boolean DEFAULT false,
        "status" character varying NOT NULL DEFAULT 'DRAFT',
        "viewCount" integer DEFAULT 0,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_marketplace_product" PRIMARY KEY ("id")
      )
    `);

    // Create Buyer Requirement table
    await queryRunner.query(`
      CREATE TABLE "buyer_requirement" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "category" character varying NOT NULL,
        "description" text NOT NULL,
        "specifications" jsonb,
        "targetPrice" double precision,
        "targetPriceUnit" character varying,
        "currency" character varying DEFAULT 'CNY',
        "quantity" integer,
        "deliveryDeadline" TIMESTAMP,
        "deliveryLocation" character varying,
        "locationLat" double precision,
        "locationLng" double precision,
        "qualityRequirements" text,
        "certificationRequirements" text,
        "keywords" text,
        "attachmentUrls" text,
        "status" character varying NOT NULL DEFAULT 'DRAFT',
        "validUntil" TIMESTAMP,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_buyer_requirement" PRIMARY KEY ("id")
      )
    `);

    // Create Match Result table
    await queryRunner.query(`
      CREATE TABLE "match_result" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supplierOrgId" uuid NOT NULL,
        "buyerOrgId" uuid NOT NULL,
        "productId" uuid,
        "requirementId" uuid,
        "matchScore" double precision NOT NULL,
        "matchSource" character varying NOT NULL DEFAULT 'AUTO',
        "keywordMatches" text,
        "isViewed" boolean DEFAULT false,
        "viewedAt" TIMESTAMP,
        "isDismissed" boolean DEFAULT false,
        "dismissedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_match_result" PRIMARY KEY ("id")
      )
    `);

    // Create Inquiry table
    await queryRunner.query(`
      CREATE TABLE "inquiry" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "senderOrgId" uuid NOT NULL,
        "receiverOrgId" uuid NOT NULL,
        "productId" uuid,
        "requirementId" uuid,
        "matchResultId" uuid,
        "subject" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'OPEN',
        "closeReason" character varying,
        "unreadCount" integer DEFAULT 0,
        "lastMessageAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inquiry" PRIMARY KEY ("id")
      )
    `);

    // Create Inquiry Message table
    await queryRunner.query(`
      CREATE TABLE "inquiry_message" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiryId" uuid NOT NULL,
        "senderOrgId" uuid NOT NULL,
        "messageType" character varying NOT NULL DEFAULT 'TEXT',
        "content" text,
        "quotedPrice" double precision,
        "quotedCurrency" character varying,
        "quotedQuantity" integer,
        "quotedLeadTime" character varying,
        "quotedValidUntil" TIMESTAMP,
        "attachmentUrls" text,
        "isRead" boolean DEFAULT false,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inquiry_message" PRIMARY KEY ("id")
      )
    `);

    // Create Point Account table
    await queryRunner.query(`
      CREATE TABLE "point_account" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "rewardPoints" integer DEFAULT 0,
        "creditPoints" integer DEFAULT 0,
        "penaltyPoints" integer DEFAULT 0,
        "totalPoints" integer DEFAULT 0,
        "creditLevel" character varying DEFAULT 'BRONZE',
        "frozenPoints" integer DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_point_account" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_point_account_user" UNIQUE ("userId")
      )
    `);

    // Create Point Rule table
    await queryRunner.query(`
      CREATE TABLE "point_rule" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "operationCode" character varying NOT NULL,
        "operationName" character varying NOT NULL,
        "pointType" character varying NOT NULL,
        "pointChange" integer NOT NULL,
        "description" text,
        "isActive" boolean DEFAULT true,
        "maxDailyOccurrences" integer,
        "cooldownHours" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_point_rule" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_point_rule_code" UNIQUE ("operationCode")
      )
    `);

    // Create Point Transaction table
    await queryRunner.query(`
      CREATE TABLE "point_transaction" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "accountId" uuid NOT NULL,
        "ruleId" uuid,
        "operationCode" character varying NOT NULL,
        "pointType" character varying NOT NULL,
        "pointChange" integer NOT NULL,
        "balanceBefore" integer NOT NULL,
        "balanceAfter" integer NOT NULL,
        "description" character varying,
        "referenceType" character varying,
        "referenceId" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_point_transaction" PRIMARY KEY ("id")
      )
    `);

    // Create Invitation Code table
    await queryRunner.query(`
      CREATE TABLE "invitation_code" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inviterUserId" uuid NOT NULL,
        "code" character varying NOT NULL,
        "maxUses" integer DEFAULT 1,
        "currentUses" integer DEFAULT 0,
        "expiresAt" TIMESTAMP,
        "isActive" boolean DEFAULT true,
        "campaign" character varying,
        "channel" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invitation_code" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_invitation_code" UNIQUE ("code")
      )
    `);

    // Create Invitation Record table
    await queryRunner.query(`
      CREATE TABLE "invitation_record" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invitationCodeId" uuid NOT NULL,
        "inviterUserId" uuid NOT NULL,
        "inviteeUserId" uuid NOT NULL,
        "inviteeRegisteredAt" TIMESTAMP NOT NULL,
        "rewardStatus" character varying DEFAULT 'PENDING',
        "rewardGrantedAt" TIMESTAMP,
        "inviteeFirstOrderAt" TIMESTAMP,
        "bonusRewardStatus" character varying,
        "bonusRewardGrantedAt" TIMESTAMP,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invitation_record" PRIMARY KEY ("id")
      )
    `);

    // Create Device Takeover Request table
    await queryRunner.query(`
      CREATE TABLE "device_takeover_request" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requesterUserId" uuid NOT NULL,
        "requesterOrgId" uuid,
        "deviceName" character varying NOT NULL,
        "deviceModel" character varying NOT NULL,
        "manufacturer" character varying NOT NULL,
        "serialNumber" character varying,
        "currentOwner" character varying,
        "manufactureDate" TIMESTAMP,
        "purchaseDate" TIMESTAMP,
        "currentLocation" character varying,
        "reason" character varying NOT NULL,
        "description" text NOT NULL,
        "purchaseInvoiceUrl" character varying,
        "devicePhotoUrls" text,
        "otherDocumentUrls" text,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "assignedExpertId" uuid,
        "inspectionReportUrl" character varying,
        "inspectionNotes" text,
        "adminNotes" text,
        "approvedAt" TIMESTAMP,
        "rejectedAt" TIMESTAMP,
        "rejectionReason" text,
        "generatedPassportId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_takeover_request" PRIMARY KEY ("id")
      )
    `);

    // Create additional support tables
    await queryRunner.query(`
      CREATE TABLE "organization_contact" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "title" character varying,
        "phone" character varying,
        "email" character varying,
        "isPrimary" boolean DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organization_contact" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "uploaded_file" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "originalName" character varying NOT NULL,
        "fileName" character varying NOT NULL,
        "filePath" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "size" integer NOT NULL,
        "fileCategory" character varying,
        "passportCode" character varying,
        "uploadedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_uploaded_file" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "saved_item" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "itemType" character varying NOT NULL,
        "itemId" uuid NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_item" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expert_match_result" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceRequestId" uuid NOT NULL,
        "expertId" uuid NOT NULL,
        "matchScore" double precision NOT NULL,
        "locationScore" double precision,
        "skillScore" double precision,
        "experienceScore" double precision,
        "availabilityScore" double precision,
        "ratingScore" double precision,
        "keywordScore" double precision,
        "matchSource" character varying DEFAULT 'AUTO',
        "isViewed" boolean DEFAULT false,
        "viewedAt" TIMESTAMP,
        "isDismissed" boolean DEFAULT false,
        "dismissedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expert_match_result" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(
      `CREATE INDEX "IDX_device_passport_code" ON "device_passport" ("passportCode")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_device_passport_status" ON "device_passport" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lifecycle_event_passport" ON "lifecycle_event" ("passportId")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "user" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_organization" ON "user" ("organizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_expert_code" ON "individual_expert" ("expertCode")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_expert_status" ON "individual_expert" ("registrationStatus")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_service_request_status" ON "service_request" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_marketplace_product_status" ON "marketplace_product" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_buyer_requirement_status" ON "buyer_requirement" ("status")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_inquiry_status" ON "inquiry" ("status")`);

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "device_passport" ADD CONSTRAINT "FK_device_passport_supplier" FOREIGN KEY ("supplierId") REFERENCES "organization"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "device_passport" ADD CONSTRAINT "FK_device_passport_customer" FOREIGN KEY ("customerId") REFERENCES "organization"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "lifecycle_event" ADD CONSTRAINT "FK_lifecycle_event_passport" FOREIGN KEY ("passportId") REFERENCES "device_passport"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_contact" ADD CONSTRAINT "FK_organization_contact_org" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "organization_contact" DROP CONSTRAINT "FK_organization_contact_org"`
    );
    await queryRunner.query(
      `ALTER TABLE "lifecycle_event" DROP CONSTRAINT "FK_lifecycle_event_passport"`
    );
    await queryRunner.query(
      `ALTER TABLE "device_passport" DROP CONSTRAINT "FK_device_passport_customer"`
    );
    await queryRunner.query(
      `ALTER TABLE "device_passport" DROP CONSTRAINT "FK_device_passport_supplier"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_organization"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_inquiry_status"`);
    await queryRunner.query(`DROP INDEX "IDX_buyer_requirement_status"`);
    await queryRunner.query(`DROP INDEX "IDX_marketplace_product_status"`);
    await queryRunner.query(`DROP INDEX "IDX_service_request_status"`);
    await queryRunner.query(`DROP INDEX "IDX_expert_status"`);
    await queryRunner.query(`DROP INDEX "IDX_expert_code"`);
    await queryRunner.query(`DROP INDEX "IDX_user_organization"`);
    await queryRunner.query(`DROP INDEX "IDX_user_email"`);
    await queryRunner.query(`DROP INDEX "IDX_lifecycle_event_passport"`);
    await queryRunner.query(`DROP INDEX "IDX_device_passport_status"`);
    await queryRunner.query(`DROP INDEX "IDX_device_passport_code"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "expert_match_result"`);
    await queryRunner.query(`DROP TABLE "saved_item"`);
    await queryRunner.query(`DROP TABLE "uploaded_file"`);
    await queryRunner.query(`DROP TABLE "organization_contact"`);
    await queryRunner.query(`DROP TABLE "device_takeover_request"`);
    await queryRunner.query(`DROP TABLE "invitation_record"`);
    await queryRunner.query(`DROP TABLE "invitation_code"`);
    await queryRunner.query(`DROP TABLE "point_transaction"`);
    await queryRunner.query(`DROP TABLE "point_rule"`);
    await queryRunner.query(`DROP TABLE "point_account"`);
    await queryRunner.query(`DROP TABLE "inquiry_message"`);
    await queryRunner.query(`DROP TABLE "inquiry"`);
    await queryRunner.query(`DROP TABLE "match_result"`);
    await queryRunner.query(`DROP TABLE "buyer_requirement"`);
    await queryRunner.query(`DROP TABLE "marketplace_product"`);
    await queryRunner.query(`DROP TABLE "expert_review"`);
    await queryRunner.query(`DROP TABLE "expert_service_record"`);
    await queryRunner.query(`DROP TABLE "service_request"`);
    await queryRunner.query(`DROP TABLE "individual_expert"`);
    await queryRunner.query(`DROP TABLE "lifecycle_event"`);
    await queryRunner.query(`DROP TABLE "device_passport"`);
    await queryRunner.query(`DROP TABLE "sequence_counter"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "organization"`);

    // Drop extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
