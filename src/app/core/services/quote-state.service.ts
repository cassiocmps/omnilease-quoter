import { Injectable, signal, computed } from '@angular/core';
import { ProviderQuote } from '../models/insurance.models';

/**
 * QuoteStateService
 * 
 * Enterprise central quotation state service.
 * Manages calculated quotations, selected policy proposals, and underwriting session state.
 */
@Injectable({
  providedIn: 'root'
})
export class QuoteStateService {
  /**
   * List of calculated proposals from underwriting carriers.
   */
  readonly quotes = signal<ProviderQuote[]>([]);

  /**
   * The proposal selected by the user for policy issuance.
   */
  readonly selectedQuote = signal<ProviderQuote | null>(null);

  /**
   * Underwriting session status: true if valid quotes exist in memory.
   */
  readonly hasActiveQuotes = computed(() => this.quotes().length > 0);

  setQuotes(quotes: ProviderQuote[]): void {
    this.quotes.set(quotes);
  }

  setSelectedQuote(quote: ProviderQuote | null): void {
    this.selectedQuote.set(quote);
  }

  clear(): void {
    this.quotes.set([]);
    this.selectedQuote.set(null);
  }
}
