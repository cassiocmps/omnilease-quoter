import { Routes } from '@angular/router';
import { quoteActiveGuard } from './core/guards/quote-active.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'quoter', pathMatch: 'full' },
  {
    path: 'quoter',
    loadComponent: () => import('./features/quotes/pages/wizard-page/wizard-page.component')
      .then(m => m.WizardPageComponent)
  },
  {
    path: 'results',
    canActivate: [quoteActiveGuard],
    loadComponent: () => import('./features/quotes/pages/comparison-page/comparison-page.component')
      .then(m => m.ComparisonPageComponent)
  },
  {
    path: 'policy/:providerId',
    canActivate: [quoteActiveGuard],
    loadComponent: () => import('./features/quotes/pages/policy-detail-page/policy-detail-page.component')
      .then(m => m.PolicyDetailPageComponent)
  },
  { path: '**', redirectTo: 'quoter' }
];
