import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PolicyDetailPageComponent } from './policy-detail-page.component';
import { QuoteStateService } from '../../../../core/services/quote-state.service';
import { ProviderQuote } from '../../../../core/models/insurance.models';

registerLocaleData(localePt);

describe('PolicyDetailPageComponent', () => {
  let fixture: ComponentFixture<PolicyDetailPageComponent>;
  let component: PolicyDetailPageComponent;
  let quoteState: QuoteStateService;

  const mockQuote: ProviderQuote = {
    quoteId: 'APX-999',
    providerId: 'apex-marine',
    providerName: 'Apex Marine Seguros',
    status: 'APPROVED',
    creditScore: 840,
    responseTimeMs: 620,
    financials: {
      totalCommitment: 3500,
      monthlyPremium: 295,
      annualPremium: 3540,
      installments: [{ times: 1, value: 3540, hasInterest: false }]
    },
    highlights: ['Fast indemnity SLA']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyDetailPageComponent],
      providers: [
        QuoteStateService,
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    quoteState = TestBed.inject(QuoteStateService);
    quoteState.setQuotes([mockQuote]);

    fixture = TestBed.createComponent(PolicyDetailPageComponent);
    component = fixture.componentInstance;
    // Set route param signal input
    fixture.componentRef.setInput('providerId', 'apex-marine');
    fixture.detectChanges();
  });

  it('should resolve matchedQuote based on providerId signal input', () => {
    expect(component.providerId()).toBe('apex-marine');
    expect(component.matchedQuote()?.quoteId).toBe('APX-999');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.policy-title')?.textContent).toContain('APX-999');
    expect(compiled.querySelector('.carrier-tag')?.textContent).toContain('Apex Marine Seguros');
  });
});
