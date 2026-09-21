import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuotationService } from './quotation.service';
import { QuotationRequest, ProviderQuote } from '../models/insurance.models';

describe('QuotationService (Progressive Multi-Carrier Streaming)', () => {
  let service: QuotationService;

  const mockRequest: QuotationRequest = {
    property: {
      zipCode: '01310-100',
      propertyType: 'RESIDENTIAL_APARTMENT',
      rentAmount: 2500,
      condoAmount: 600,
      iptuAmount: 150
    },
    tenant: {
      fullName: 'Mariana Santos',
      cpf: '529.982.247-25',
      email: 'mariana@example.com',
      monthlyIncome: 12500,
      employmentType: 'CLT'
    },
    coverages: {
      rentDefault: true,
      propertyDamage: true,
      internalPainting: false,
      fineBreach: false,
      assistance24h: true
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuotationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(QuotationService);
  });

  it('should stream quotes progressively using RxJS merge', fakeAsync(() => {
    const emittedQuotes: ProviderQuote[] = [];
    let isCompleted = false;

    service.streamQuotes(mockRequest).subscribe({
      next: (quote) => emittedQuotes.push(quote),
      complete: () => isCompleted = true
    });

    // Before 600ms: no quotes arrived yet
    tick(500);
    expect(emittedQuotes.length).toBe(0);

    // At 600ms: Apex Marine arrives! (TTFR: 600ms)
    tick(100);
    expect(emittedQuotes.length).toBe(1);
    expect(emittedQuotes[0].providerId).toBe('apex-marine');

    // At 1200ms: Vanguard Surety arrives!
    tick(600);
    expect(emittedQuotes.length).toBe(2);
    expect(emittedQuotes[1].providerId).toBe('vanguard-surety');

    // At 1800ms: Beacon Assurance arrives and stream completes!
    tick(600);
    expect(emittedQuotes.length).toBe(3);
    expect(emittedQuotes[2].providerId).toBe('beacon-assurance');
    expect(isCompleted).toBeTrue();
  }));
});
