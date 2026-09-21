import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { quoteActiveGuard } from './quote-active.guard';
import { QuoteStateService } from '../services/quote-state.service';
import { ProviderQuote } from '../models/insurance.models';

describe('quoteActiveGuard (Functional Guard)', () => {
  let quoteState: QuoteStateService;
  let router: jasmine.SpyObj<Router>;

  const mockQuote: ProviderQuote = {
    quoteId: 'APX-1',
    providerId: 'apex-marine',
    providerName: 'Apex Marine',
    status: 'APPROVED',
    creditScore: 800,
    responseTimeMs: 600,
    financials: {
      totalCommitment: 3000,
      monthlyPremium: 250,
      annualPremium: 3000,
      installments: []
    },
    highlights: []
  };

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        QuoteStateService,
        { provide: Router, useValue: router }
      ]
    });

    quoteState = TestBed.inject(QuoteStateService);
  });

  it('should redirect to /quoter UrlTree when no active quotes exist', () => {
    quoteState.clear();

    const result = TestBed.runInInjectionContext(() =>
      quoteActiveGuard({} as any, {} as any)
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/quoter']);
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should allow navigation (return true) when active quotes exist', () => {
    quoteState.setQuotes([mockQuote]);

    const result = TestBed.runInInjectionContext(() =>
      quoteActiveGuard({} as any, {} as any)
    );

    expect(result).toBeTrue();
  });
});
