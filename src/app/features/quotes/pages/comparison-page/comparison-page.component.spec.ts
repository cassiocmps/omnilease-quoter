import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComparisonPageComponent } from './comparison-page.component';
import { QuoteStateService } from '../../../../core/services/quote-state.service';
import { QuotationService } from '../../../../core/services/quotation.service';
import { ProviderQuote } from '../../../../core/models/insurance.models';

registerLocaleData(localePt);

describe('ComparisonPageComponent', () => {
  let component: ComparisonPageComponent;
  let fixture: ComponentFixture<ComparisonPageComponent>;
  let router: Router;
  let quoteState: QuoteStateService;

  const mockQuote: ProviderQuote = {
    quoteId: 'APX-101',
    providerId: 'apex-marine',
    providerName: 'Apex Marine',
    status: 'APPROVED',
    creditScore: 840,
    responseTimeMs: 620,
    financials: {
      totalCommitment: 3000,
      monthlyPremium: 250,
      annualPremium: 3000,
      installments: [{ times: 1, value: 3000, hasInterest: false }]
    },
    highlights: ['Fast approval']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonPageComponent],
      providers: [
        QuoteStateService,
        QuotationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    quoteState = TestBed.inject(QuoteStateService);
    quoteState.setQuotes([mockQuote]);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ComparisonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render active carrier quote cards', () => {
    expect(component).toBeTruthy();
    expect(component.quotes().length).toBe(1);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-quote-card').length).toBe(1);
  });

  it('should set selected quote and navigate to /policy/:providerId when proceedToPolicy is clicked', () => {
    component.proceedToPolicy(mockQuote);
    expect(quoteState.selectedQuote()).toEqual(mockQuote);
    expect(router.navigate).toHaveBeenCalledWith(['/policy', 'apex-marine']);
  });

  it('should stream quotes progressively when refreshStreamingQuotes is invoked', fakeAsync(() => {
    component.refreshStreamingQuotes();
    expect(component.isStreaming()).toBeTrue();

    // After 600ms Apex Marine arrives
    tick(600);
    expect(component.quotes().length).toBe(1);
    expect(component.quotes()[0].providerId).toBe('apex-marine');

    // After 1200ms Vanguard Surety arrives
    tick(600);
    expect(component.quotes().length).toBe(2);

    // After 1800ms Beacon Assurance arrives and completes
    tick(600);
    expect(component.quotes().length).toBe(3);
    expect(component.isStreaming()).toBeFalse();
  }));
});
