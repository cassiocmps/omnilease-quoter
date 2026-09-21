import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProviderQuote } from '../../../../core/models/insurance.models';

/**
 * QuoteCardComponent
 * 
 * Presentational (Dumb / Pure) Component for rendering carrier quotation proposals.
 * Utilizes modern Angular 18 Signal Inputs (`input()`) and the new Output API (`output()`).
 * 
 * Architecture Note:
 * Configured with `ChangeDetectionStrategy.OnPush`. Re-renders occur only when:
 * 1. Signal inputs emit a new identity / value.
 * 2. An event originates from within the component template (e.g. click).
 */
@Component({
  selector: 'app-quote-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './quote-card.component.html',
  styleUrl: './quote-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuoteCardComponent {
  /**
   * Required signal input containing the carrier's quote data.
   * Replaces legacy `@Input({ required: true }) quote!: ProviderQuote;`
   * Compile-time safety guarantees this cannot be omitted by parent templates.
   */
  readonly quote = input.required<ProviderQuote>();

  /**
   * Optional boolean signal input to visually emphasize a recommended quote.
   * Replaces legacy `@Input() isHighlighted = false;`
   */
  readonly isHighlighted = input<boolean>(false);

  /**
   * Optional boolean signal input indicating whether this card is currently selected by the user.
   */
  readonly isSelected = input<boolean>(false);

  /**
   * Modern Angular 18 output emitter.
   * Replaces legacy `@Output() selectQuote = new EventEmitter<ProviderQuote>();`
   * Does NOT rely on RxJS Subject under the hood, producing a leaner bundle.
   */
  readonly selectQuote = output<ProviderQuote>();

  /**
   * Dispatches the selected quotation up to the smart container component.
   * Accessing the signal value requires invoking it as a function: `this.quote()`.
   */
  onSelect(): void {
    this.selectQuote.emit(this.quote());
  }
}
