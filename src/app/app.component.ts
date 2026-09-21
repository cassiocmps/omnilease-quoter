import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { QuoteCardComponent } from './features/quotes/components/quote-card/quote-card.component';
import { ProviderQuote } from './core/models/insurance.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, QuoteCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly title = 'OmniLease Quoter';

  /**
   * Signal state tracking the currently selected quotation.
   * Demonstrates parent-child reactive communication via signal inputs and output events.
   */
  readonly selectedQuote = signal<ProviderQuote | null>(null);

  /**
   * Initial mock quote data from underwriting carriers.
   * In Milestone 3 & 7, this will be replaced with real-time reactive streaming services.
   */
  readonly carrierQuotes = signal<ProviderQuote[]>([
    {
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
          { times: 3, value: 1249.80, hasInterest: false },
          { times: 12, value: 312.45, hasInterest: false }
        ]
      },
      highlights: [
        'Aprovação imediata sem envio de holerite',
        'Indenização em até 3 dias úteis',
        'Assistência Residencial 24h inclusa'
      ]
    },
    {
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
          { times: 6, value: 690.20, hasInterest: false },
          { times: 12, value: 345.10, hasInterest: false }
        ]
      },
      highlights: [
        'Cobertura de Danos ao Imóvel inclusa',
        'Análise de crédito manual em até 24h úteis'
      ]
    },
    {
      quoteId: 'VNG-2026-44391',
      providerId: 'vanguard-surety',
      providerName: 'Vanguard Surety',
      status: 'APPROVED',
      creditScore: 790,
      responseTimeMs: 1180,
      financials: {
        totalCommitment: 3730.00,
        monthlyPremium: 328.80,
        annualPremium: 3945.60,
        installments: [
          { times: 1, value: 3945.60, hasInterest: false },
          { times: 12, value: 328.80, hasInterest: false }
        ]
      },
      highlights: [
        'Desconto de 5% para pagamento à vista',
        'Pintura Interna e Externa básica'
      ]
    }
  ]);

  /**
   * Event handler receiving output event from QuoteCardComponent.
   */
  onQuoteSelected(quote: ProviderQuote): void {
    this.selectedQuote.set(quote);
  }
}
