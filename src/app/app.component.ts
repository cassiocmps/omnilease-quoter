import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { QuoteStateService } from './core/services/quote-state.service';

/**
 * AppComponent
 * 
 * Top-level application shell hosting:
 * 1. Global navigation header & progress badge.
 * 2. Navigation tabs (`/quoter`, `/results`).
 * 3. Modern `<router-outlet>` rendering lazy-loaded standalone pages.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly title = 'OmniLease Quoter';
  readonly quoteState = inject(QuoteStateService);
}
