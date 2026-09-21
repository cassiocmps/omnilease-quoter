import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QuoteCardComponent } from '../../components/quote-card/quote-card.component';
import { QuoteStateService } from '../../../../core/services/quote-state.service';
import { QuotationService } from '../../../../core/services/quotation.service';
import { ProviderQuote, QuotationRequest } from '../../../../core/models/insurance.models';

@Component({
  selector: 'app-comparison-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, QuoteCardComponent],
  templateUrl: './comparison-page.component.html',
  styleUrl: './comparison-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly quotationService = inject(QuotationService);
  readonly quoteState = inject(QuoteStateService);

  readonly quotes = this.quoteState.quotes;
  readonly selectedQuote = this.quoteState.selectedQuote;
  readonly isStreaming = signal<boolean>(false);

  ngOnInit(): void {
    // If no quotes exist yet, automatically trigger multi-carrier progressive streaming
    if (this.quotes().length === 0) {
      this.refreshStreamingQuotes();
    }
  }

  /**
   * Triggers concurrent progressive streaming via RxJS merge.
   * Quotes appear on screen one-by-one as each carrier finishes underwriting.
   */
  refreshStreamingQuotes(): void {
    this.isStreaming.set(true);
    this.quoteState.setQuotes([]);

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

    this.quotationService.streamQuotes(mockRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (quote) => {
          this.quoteState.setQuotes([...this.quoteState.quotes(), quote]);
        },
        complete: () => {
          this.isStreaming.set(false);
        }
      });
  }

  onSelectQuote(quote: ProviderQuote): void {
    this.quoteState.setSelectedQuote(quote);
  }

  proceedToPolicy(quote: ProviderQuote): void {
    this.quoteState.setSelectedQuote(quote);
    this.router.navigate(['/policy', quote.providerId]);
  }
}
