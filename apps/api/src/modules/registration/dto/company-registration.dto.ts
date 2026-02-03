import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CompanyType,
  ContactType,
  Gender,
  PackagingType,
  PurchaseFrequency,
} from '@device-passport/shared';

export class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateContactDto {
  @ApiProperty({ enum: ContactType })
  @IsEnum(ContactType)
  contactType: ContactType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateSupplierProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hsCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3)
  priceCurrency?: string;

  @ApiPropertyOptional({ enum: PackagingType })
  @IsOptional()
  @IsEnum(PackagingType)
  packagingType?: PackagingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  netWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grossWeight?: number;
}

export class CompanyRegistrationDto {
  // User info
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  userName: string;

  // Organization info
  @ApiProperty()
  @IsString()
  organizationName: string;

  @ApiProperty({ description: '2-6 character alphanumeric organization code' })
  @IsString()
  @MinLength(2)
  @MaxLength(6)
  @Matches(/^[A-Z0-9]{2,6}$/, {
    message: 'Organization code must be 2-6 uppercase letters or numbers',
  })
  organizationCode: string;

  // Roles
  @ApiProperty()
  @IsBoolean()
  isSupplier: boolean;

  @ApiProperty()
  @IsBoolean()
  isBuyer: boolean;

  // Business License Info (Section A)
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registeredCapital?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3)
  capitalCurrency?: string;

  @ApiPropertyOptional({ enum: CompanyType })
  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  establishmentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legalRepresentative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessScope?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  registeredAddress?: AddressDto;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  businessAddress?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  businessLicenseFileId?: string;

  // Contacts (Section B)
  @ApiPropertyOptional({ type: [CreateContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts?: CreateContactDto[];

  // Invoice Info (Section C)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoicePhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceAddress?: string;

  // Supplier Products (Section D)
  @ApiPropertyOptional({ type: [CreateSupplierProductDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierProductDto)
  products?: CreateSupplierProductDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productImageFileIds?: string[];

  // Buyer Requirements (Section E)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buyerProductDescription?: string;

  @ApiPropertyOptional({ enum: PurchaseFrequency })
  @IsOptional()
  @IsEnum(PurchaseFrequency)
  purchaseFrequency?: PurchaseFrequency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchaseVolume?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredPaymentTerms?: string;
}
