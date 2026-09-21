import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuotationService } from './quotation.service';
import { apiInterceptor } from '../interceptors/api.interceptor';
import { QuotationRequest, ProviderQuote } from '../models/insurance.models';

describe('QuotationService (Enterprise Testing Suite)', () => {
  let service: QuotationService;
  let httpMock: HttpTestingController;

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

  const mockQuotesResponse: ProviderQuote[] = [
    {
      quoteId: 'APX-2026-98124',
      providerId: 'apex-marine',
      providerName: 'Apex Marine Seguros',
      status: 'APPROVED',
      creditScore: 840,
      responseTimeMs: 600,
      financials: {
        totalCommitment: 3250,
        monthlyPremium: 260,
        annualPremium: 3120,
        installments: [
          { times: 1, value: 3120, hasInterest: false },
          { times: 12, value: 260, hasInterest: false }
        ]
      },
      highlights: ['Aprovação imediata']
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuotationService,
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(QuotationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched HTTP requests remain outstanding
    httpMock.verify();
  });

  describe('streamQuotes (Progressive Multi-Carrier Streaming)', () => {
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

  describe('requestUnderwritingQuote (HTTP & Interceptor Verification)', () => {
    it('should POST to /api/v1/fianca/quotes with payload, attach correlation headers, and update quotes signal', () => {
      let resultQuotes: ProviderQuote[] = [];

      service.requestUnderwritingQuote(mockRequest).subscribe(quotes => {
        resultQuotes = quotes;
      });

      // 1. Assert exactly one POST request to the expected endpoint
      const req = httpMock.expectOne('/api/v1/fianca/quotes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);

      // 2. Assert functional interceptor attached headers (X-Correlation-ID and Authorization)
      expect(req.request.headers.has('X-Correlation-ID')).toBeTrue();
      const correlationId = req.request.headers.get('X-Correlation-ID');
      expect(correlationId).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toContain('Bearer');

      // 3. Flush mock response
      req.flush(mockQuotesResponse);

      // 4. Verify subscriber received the quotes
      expect(resultQuotes).toEqual(mockQuotesResponse);

      // 5. Verify signal state accumulation
      expect(service.quotes()).toEqual(mockQuotesResponse);
    });

    it('should propagate HTTP 422 Unprocessable Entity error when credit bureau validation fails', () => {
      let capturedError: HttpErrorResponse | undefined;

      service.requestUnderwritingQuote(mockRequest).subscribe({
        next: () => fail('Expected HTTP 422 error, but quotation succeeded'),
        error: (err: HttpErrorResponse) => {
          capturedError = err;
        }
      });

      const req = httpMock.expectOne('/api/v1/fianca/quotes');
      expect(req.request.headers.has('X-Correlation-ID')).toBeTrue();

      req.flush(
        { code: 'BUREAU_DOWN', message: 'Bureau de crédito indisponível' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(capturedError).toBeDefined();
      expect(capturedError?.status).toBe(422);
    });
  });
});
