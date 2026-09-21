import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteCardComponent } from './quote-card.component';
import { ProviderQuote } from '../../../../core/models/insurance.models';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

describe('QuoteCardComponent', () => {
  let component: QuoteCardComponent;
  let fixture: ComponentFixture<QuoteCardComponent>;

  const mockApexQuote: ProviderQuote = {
    quoteId: 'APX-2026-98124',
    providerId: 'apex-marine',
    providerName: 'Apex Marine Seguros',
    status: 'APPROVED',
    creditScore: 840,
    responseTimeMs: 620,
    financials: {
      totalCommitment: 3730.00,
      monthlyPremium: 312.45,
      annualPremium: 3749.40,
      installments: [
        { times: 1, value: 3749.40, hasInterest: false },
        { times: 12, value: 312.45, hasInterest: false }
      ]
    },
    highlights: [
      'Aprovação imediata sem envio de holerite',
      'Indenização em até 3 dias úteis',
      'Assistência Residencial 24h inclusa'
    ]
  };

  const mockBeaconQuote: ProviderQuote = {
    quoteId: 'BCN-2026-11029',
    providerId: 'beacon-assurance',
    providerName: 'Beacon Assurance',
    status: 'PENDING_ANALYSIS',
    creditScore: 680,
    responseTimeMs: 1850,
    financials: {
      totalCommitment: 3730.00,
      monthlyPremium: 345.10,
      annualPremium: 4141.20,
      installments: [
        { times: 1, value: 4141.20, hasInterest: false },
        { times: 12, value: 345.10, hasInterest: false }
      ]
    },
    highlights: [
      'Análise em até 24 horas úteis'
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteCardComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    // Modern Angular 18 Signal input setting via setInput
    fixture.componentRef.setInput('quote', mockApexQuote);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the provider name and status', () => {
    fixture.componentRef.setInput('quote', mockApexQuote);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.carrier-name')?.textContent).toContain('Apex Marine Seguros');
    expect(compiled.querySelector('.status-badge')?.textContent).toContain('Aprovado');
  });

  it('should render the Apex Marine fast-track badge only for apex-marine provider', () => {
    // 1. With Apex Marine
    fixture.componentRef.setInput('quote', mockApexQuote);
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.apex-exclusive-badge')).toBeTruthy();
    expect(compiled.querySelector('.apex-exclusive-badge')?.textContent)
      .toContain('Aprovação Imediata & Indenização em 3 dias úteis');

    // 2. With Beacon Assurance
    fixture.componentRef.setInput('quote', mockBeaconQuote);
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.apex-exclusive-badge')).toBeFalsy();
  });

  it('should emit selectQuote output when the selection button is clicked', () => {
    fixture.componentRef.setInput('quote', mockApexQuote);
    fixture.detectChanges();

    let emittedQuote: ProviderQuote | undefined;
    component.selectQuote.subscribe((q) => {
      emittedQuote = q;
    });

    const selectButton = fixture.nativeElement.querySelector('.select-btn') as HTMLButtonElement;
    selectButton.click();

    expect(emittedQuote).toEqual(mockApexQuote);
  });

  it('should reflect highlighted and selected classes when inputs are true', () => {
    fixture.componentRef.setInput('quote', mockApexQuote);
    fixture.componentRef.setInput('isHighlighted', true);
    fixture.componentRef.setInput('isSelected', true);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.quote-card') as HTMLElement;
    expect(card.classList.contains('highlighted')).toBeTrue();
    expect(card.classList.contains('selected')).toBeTrue();
  });
});
