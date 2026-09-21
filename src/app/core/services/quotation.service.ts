import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, merge, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ProviderQuote, QuotationRequest } from '../models/insurance.models';

/**
 * QuotationService
 * 
 * Senior Concurrency Implementation: Progressive Multi-Carrier Streaming.
 * 
 * Architectural Pattern: RxJS `merge` vs `forkJoin`
 * - `forkJoin`: Waits until ALL carriers complete before emitting anything.
 *   User would stare at a spinner for 1800ms before seeing any results!
 * - `merge`: Emits each carrier result as soon as it arrives!
 *   Apex Marine arrives at ~600ms, Vanguard Surety at ~1200ms, Beacon Assurance at ~1800ms.
 *   This cuts Time-to-First-Result (TTFR) by 66%!
 */
@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly http = inject(HttpClient);

  readonly quotes = signal<ProviderQuote[]>([]);
  readonly isStreaming = signal<boolean>(false);

  /**
   * Simulates/Queries Apex Marine underwriting engine.
   * Latency Profile: Fast (~600ms), High approval rate, 3-day SLA guarantee.
   */
  fetchApexMarineQuote(request: QuotationRequest): Observable<ProviderQuote> {
    const commitment = request.property.rentAmount + request.property.condoAmount + request.property.iptuAmount;
    const monthlyPremium = Math.round(commitment * 0.0837 * 100) / 100;
    const annualPremium = Math.round(monthlyPremium * 12 * 100) / 100;

    const quote: ProviderQuote = {
      quoteId: 'APX-2026-98124',
      providerId: 'apex-marine',
      providerName: 'Apex Marine Seguros',
      status: 'APPROVED',
      creditScore: 840,
      responseTimeMs: 620,
      financials: {
        totalCommitment: commitment,
        monthlyPremium,
        annualPremium,
        installments: [
          { times: 1, value: annualPremium, hasInterest: false },
          { times: 3, value: Math.round((annualPremium / 3) * 100) / 100, hasInterest: false },
          { times: 12, value: monthlyPremium, hasInterest: false }
        ]
      },
      highlights: [
        'Aprovação imediata sem envio de holerite',
        'Indenização em até 3 dias úteis',
        'Assistência Residencial 24h inclusa'
      ]
    };

    return of(quote).pipe(delay(600));
  }

  /**
   * Simulates/Queries Vanguard Surety underwriting engine.
   * Latency Profile: Medium (~1200ms), Spot discount policy.
   */
  fetchVanguardSuretyQuote(request: QuotationRequest): Observable<ProviderQuote> {
    const commitment = request.property.rentAmount + request.property.condoAmount + request.property.iptuAmount;
    const monthlyPremium = Math.round(commitment * 0.0881 * 100) / 100;
    const annualPremium = Math.round(monthlyPremium * 12 * 100) / 100;

    const quote: ProviderQuote = {
      quoteId: 'VNG-2026-44391',
      providerId: 'vanguard-surety',
      providerName: 'Vanguard Surety',
      status: 'APPROVED',
      creditScore: 790,
      responseTimeMs: 1180,
      financials: {
        totalCommitment: commitment,
        monthlyPremium,
        annualPremium,
        installments: [
          { times: 1, value: Math.round(annualPremium * 0.95 * 100) / 100, hasInterest: false },
          { times: 12, value: monthlyPremium, hasInterest: false }
        ]
      },
      highlights: [
        'Desconto de 5% para pagamento à vista',
        'Pintura Interna e Externa básica'
      ]
    };

    return of(quote).pipe(delay(1200));
  }

  /**
   * Simulates/Queries Beacon Assurance underwriting engine.
   * Latency Profile: Slower (~1800ms), In-depth manual risk assessment.
   */
  fetchBeaconAssuranceQuote(request: QuotationRequest): Observable<ProviderQuote> {
    const commitment = request.property.rentAmount + request.property.condoAmount + request.property.iptuAmount;
    const monthlyPremium = Math.round(commitment * 0.0925 * 100) / 100;
    const annualPremium = Math.round(monthlyPremium * 12 * 100) / 100;

    const quote: ProviderQuote = {
      quoteId: 'BCN-2026-11029',
      providerId: 'beacon-assurance',
      providerName: 'Beacon Assurance',
      status: 'PENDING_ANALYSIS',
      creditScore: 680,
      responseTimeMs: 1850,
      financials: {
        totalCommitment: commitment,
        monthlyPremium,
        annualPremium,
        installments: [
          { times: 1, value: annualPremium, hasInterest: false },
          { times: 6, value: Math.round((annualPremium / 6) * 100) / 100, hasInterest: false },
          { times: 12, value: monthlyPremium, hasInterest: false }
        ]
      },
      highlights: [
        'Cobertura de Danos ao Imóvel inclusa',
        'Análise de crédito manual em até 24h úteis'
      ]
    };

    return of(quote).pipe(delay(1800));
  }

  /**
   * Streams quotes concurrently from all 3 carriers using RxJS merge.
   * Emits each quote immediately as its carrier underwriting analysis finishes.
   */
  streamQuotes(request: QuotationRequest): Observable<ProviderQuote> {
    const apex$ = this.fetchApexMarineQuote(request);
    const vanguard$ = this.fetchVanguardSuretyQuote(request);
    const beacon$ = this.fetchBeaconAssuranceQuote(request);

    return merge(apex$, vanguard$, beacon$);
  }
}
