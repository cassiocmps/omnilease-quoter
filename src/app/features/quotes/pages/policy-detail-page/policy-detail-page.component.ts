import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuoteStateService } from '../../../../core/services/quote-state.service';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { ProviderQuote } from '../../../../core/models/insurance.models';

/**
 * PolicyDetailPageComponent
 * 
 * Demonstrates Modern Angular 18 Component Input Binding for Route Parameters:
 * - When `withComponentInputBinding()` is configured in `provideRouter()`,
 *   the route parameter `:providerId` is automatically bound into the Signal input `providerId`!
 * - Completely eliminates `ActivatedRoute.snapshot.params` and `paramMap.subscribe()` boilerplate.
 */
@Component({
  selector: 'app-policy-detail-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, UiCardComponent],
  templateUrl: './policy-detail-page.component.html',
  styleUrl: './policy-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyDetailPageComponent {
  private readonly quoteState = inject(QuoteStateService);

  /**
   * Route parameter `:providerId` bound directly as a Signal input!
   */
  readonly providerId = input.required<string>();

  /**
   * Derives the active quote matching this providerId.
   */
  readonly matchedQuote = computed<ProviderQuote | null>(() => {
    const id = this.providerId();
    const found = this.quoteState.quotes().find(q => q.providerId === id);
    return found ?? this.quoteState.selectedQuote();
  });
}
