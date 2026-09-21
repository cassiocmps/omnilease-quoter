/**
 * OmniLease Insurtech Platform - Core Insurance Domain Models
 * Covers multi-carrier quoting: Apex Marine Seguros, Beacon Assurance, and Vanguard Surety.
 */

export type QuoteStatus = 'APPROVED' | 'PENDING_ANALYSIS' | 'REFUSED';

export interface InstallmentOption {
  times: number;
  value: number;
  hasInterest: boolean;
}

export interface InsuranceFinancials {
  /** Monthly total commitment: Aluguel + Condomínio + IPTU + Encargos */
  totalCommitment: number;
  /** Monthly insurance premium calculated by the carrier */
  monthlyPremium: number;
  /** Total annual insurance premium */
  annualPremium: number;
  /** Payment installment options available to tenant */
  installments: InstallmentOption[];
}

export interface ProviderQuote {
  quoteId: string;
  providerId: 'apex-marine' | 'beacon-assurance' | 'vanguard-surety' | string;
  providerName: string;
  logoUrl?: string;
  status: QuoteStatus;
  creditScore: number;
  financials: InsuranceFinancials;
  highlights: string[];
  responseTimeMs: number;
}

export type PropertyType = 'RESIDENTIAL_APARTMENT' | 'RESIDENTIAL_HOUSE' | 'COMMERCIAL';

export interface PropertyDetails {
  zipCode: string;
  propertyType: PropertyType;
  rentAmount: number;
  condoAmount: number;
  iptuAmount: number;
}

export type EmploymentType = 'CLT' | 'PJ' | 'AUTONOMO' | 'PUBLIC_SERVANT';

export interface TenantDetails {
  fullName: string;
  cpf: string;
  email: string;
  monthlyIncome: number;
  employmentType: EmploymentType;
}

export interface LeaseCoverages {
  rentDefault: boolean;
  propertyDamage: boolean;
  internalPainting: boolean;
  fineBreach: boolean;
  assistance24h: boolean;
}

export interface QuotationRequest {
  property: PropertyDetails;
  tenant: TenantDetails;
  coverages: LeaseCoverages;
}
