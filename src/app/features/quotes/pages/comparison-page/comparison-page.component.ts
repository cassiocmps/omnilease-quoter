import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QuoteCardComponent } from '../../components/quote-card/quote-card.component';
import { QuoteStateService } from '../../../../core/services/quote-state.service';
import { ProviderQuote } from '../../../../core/models/insurance.models';

@Component({
  selector: 'app-comparison-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, QuoteCardComponent],
  templateUrl: './comparison-page.component.html',
  styleUrl: './comparison-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonPageComponent {
  private readonly router = inject(Router);
  readonly quoteState = inject(QuoteStateService);

  readonly quotes = this.quoteState.quotes;
  readonly selectedQuote = this.quoteState.selectedQuote;

  onSelectQuote(quote: ProviderQuote): void {
    this.quoteState.setSelectedQuote(quote);
  }

  proceedToPolicy(quote: ProviderQuote): void {
    this.quoteState.setSelectedQuote(quote);
    this.router.navigate(['/policy', quote.providerId]);
  }
}
