import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * UiCardComponent
 * 
 * Reusable layout shell component implementing multi-slot content projection.
 * 
 * Architectural Pattern: Multi-Slot Content Projection (<ng-content select="...">)
 * - Allows consumer components to pass arbitrary markup into designated slots:
 *   1. `[card-title]`: Projected into the card header.
 *   2. Default `<ng-content>`: Projected into the card body.
 *   3. `[card-actions]`: Projected into the card footer.
 * 
 * Performance & Reactivity:
 * - Uses `ChangeDetectionStrategy.OnPush` for optimal change detection cycles.
 * - Employs Angular 18 Signal Input `isFeatured` to toggle featured styling without dirty-checking overhead.
 */
@Component({
  selector: 'app-ui-card',
  standalone: true,
  templateUrl: './ui-card.component.html',
  styleUrl: './ui-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiCardComponent {
  /**
   * Signal input determining whether the card displays featured/elevated styling.
   * Default: false
   */
  readonly isFeatured = input<boolean>(false);
}
