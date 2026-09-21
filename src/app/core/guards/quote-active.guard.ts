import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { QuoteStateService } from '../services/quote-state.service';

/**
 * Functional Route Guard: quoteActiveGuard
 * 
 * Modern Angular 18 `CanActivateFn`:
 * - Replaces legacy class-based `CanActivate` implementing classes.
 * - Uses functional `inject()` to resolve router and state dependencies.
 * - Returns `true` or a redirect `UrlTree` directly without RxJS wrapping.
 */
export const quoteActiveGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const quoteState = inject(QuoteStateService);
  const router = inject(Router);

  if (quoteState.hasActiveQuotes()) {
    return true;
  }

  // Functional redirect: returns UrlTree to send the user back to the wizard
  return router.createUrlTree(['/quoter']);
};
