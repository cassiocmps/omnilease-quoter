# Hands-on Exercises: Zero-to-Hero Angular Roadmap

A progressive, practical path through Angular 18 LTS built directly inside `C:\source\omnilease-quoter`. This curriculum maps fundamental concepts to enterprise architecture using the **OmniLease Insurtech Platform** (*Seguro Fiança Locatícia & Incêndio* with **Apex Marine, Beacon Assurance, and Vanguard Surety**).

---

## Roadmap Overview & Phase Mapping

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          Zero-to-Hero Milestone Architecture                           │
├─────────┬─────────────────────────────────────────────────┬────────────────────────────┤
│ Phase   │ OmniLease Milestone                             │ Core Angular 18 Topics     │
├─────────┼─────────────────────────────────────────────────┼────────────────────────────┤
│ Phase 1 │ Milestone 1: Component Foundations & Signals I/O│ Standalone, input/output   │
│ Phase 1 │ Milestone 2: Content Projection & Directives    │ ng-content, Custom Direct. │
│ Phase 2 │ Milestone 3: Services, DI & RxJS Pipelines      │ inject(), switchMap, ViaCEP│
│ Phase 2 │ Milestone 4: Fine-Grained Signals & Interop     │ signal, computed, toSignal │
│ Phase 3 │ Milestone 5: Typed Forms & Dynamic FormArrays   │ FormBuilder, FormArray     │
│ Phase 3 │ Milestone 6: Routing, Lazy Loading & Guards     │ loadComponent, canActivate │
│ Phase 4 │ Milestone 7: Senior Concurrency & Streaming     │ RxJS merge, streaming      │
│ Phase 4 │ Milestone 8: Functional Interceptors & Zoneless │ HttpInterceptorFn, Zoneless│
│ Phase 4 │ Milestone 9: Unit Testing with TestBed          │ HttpTestingController, DOM │
└─────────┴─────────────────────────────────────────────────┴────────────────────────────┘
```

---

## Milestone 1: Component Foundations & Modern Signal Inputs/Outputs

### Objective
Build the presentational `QuoteCardComponent` using modern Angular 18 signal inputs, output emitters, and built-in template control flow.

### Concepts Covered
- Standalone components (`standalone: true`).
- Modern Signal inputs: `input.required<T>()` and `output<T>()` (replacing legacy `@Input()` and `@Output()`).
- Built-in control flow: `@if`, `@for (item of list; track item.id)`, and `@empty`.
- Template Reference Variables (`#cardRef`).
- `ChangeDetectionStrategy.OnPush`.

### Tasks
1. Generate component:
   ```bash
   ng generate component features/quotes/components/quote-card
   ```
2. In `quote-card.component.ts`, define signal inputs and outputs:
   ```typescript
   import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { ProviderQuote } from '../../../core/models/insurance.models';

   @Component({
     selector: 'app-quote-card',
     standalone: true,
     imports: [CommonModule],
     templateUrl: './quote-card.component.html',
     styleUrl: './quote-card.component.scss',
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   export class QuoteCardComponent {
     quote = input.required<ProviderQuote>();
     isHighlighted = input<boolean>(false);
     selectQuote = output<ProviderQuote>();

     onSelect(): void {
       this.selectQuote.emit(this.quote());
     }
   }
   ```
3. In `quote-card.component.html`, use native control flow:
   - Highlight **Apex Marine** with a special approval badge: `"Aprovação Imediata & Indenização em 3 dias úteis"`.
   - Format currency values with the Angular `CurrencyPipe`.

---

## Milestone 2: Content Projection & Custom Directives

### Objective
Create reusable UI layout components with multi-slot content projection and build a custom attribute directive for Brazilian document formatting.

### Concepts Covered
- Multi-slot content projection (`<ng-content select="...">`).
- `<ng-container>` and `<ng-template>`.
- Custom Attribute Directive with `@HostListener` or `host` property binding.

### Tasks
1. **Reusable Card Shell (`app-ui-card`):**
   Create a component that accepts projected content for header, body, and actions:
   ```html
   <div class="card-wrapper" [class.featured]="isFeatured()">
     <header class="card-header">
       <ng-content select="[card-title]"></ng-content>
     </header>
     <div class="card-body">
       <ng-content></ng-content>
     </div>
     <footer class="card-footer">
       <ng-content select="[card-actions]"></ng-content>
     </footer>
   </div>
   ```
2. **Brazilian CPF Mask Directive (`[appCpfMask]`):**
   Create `src/app/shared/directives/cpf-mask.directive.ts`:
   - Listens to `input` events on `<input>`.
   - Automatically formats text to `000.000.000-00`.
   - Strips non-numeric characters and enforces 11 digits maximum.

---

## Milestone 3: Services, Dependency Injection & RxJS Pipelines

### Objective
Create injectable services using functional `inject()` and build a real-world asynchronous address search pipeline using key RxJS operators.

### Concepts Covered
- `@Injectable({ providedIn: 'root' })`.
- Functional dependency injection with `inject()`.
- RxJS operators: `debounceTime`, `distinctUntilChanged`, `switchMap`, `catchError`, `tap`.
- HTTP queries with `HttpClient`.

### Tasks
1. Create `src/app/core/services/address-lookup.service.ts`:
   - Integrates with a simulated or real ViaCEP endpoint (`https://viacep.com.br/ws/{cep}/json/`).
2. Implement the typeahead operator pipeline:
   ```typescript
   searchAddressByCep(cepStream$: Observable<string>): Observable<AddressResult | null> {
     return cepStream$.pipe(
       map(cep => cep.replace(/\D/g, '')),
       filter(cleanCep => cleanCep.length === 8),
       debounceTime(350),
       distinctUntilChanged(),
       switchMap(cep => 
         this.http.get<AddressResult>(`https://viacep.com.br/ws/${cep}/json/`).pipe(
           catchError(err => {
             console.error('CEP lookup failed', err);
             return of(null);
           })
         )
       )
     );
   }
   ```

---

## Milestone 4: Fine-Grained Reactivity with Signals & RxJS Interop

### Objective
Model synchronous financial state and live underwriting rules using Angular Signals, and integrate asynchronous streams using `@angular/core/rxjs-interop`.

### Concepts Covered
- Core Signal primitives: `signal()`, `computed()`, and `effect()`.
- RxJS Interop: `toSignal()` and `toObservable()`.
- Glitch-free synchronous derivations.

### Tasks
1. In the quoter component, model financial parameters as signals:
   ```typescript
   rent = signal<number>(2500);
   condo = signal<number>(600);
   iptu = signal<number>(150);

   // Derived total monthly commitment:
   totalCommitment = computed(() => this.rent() + this.condo() + this.iptu());

   // Underwriting rule: Tenant required gross income (3x multiplier):
   minimumRequiredIncome = computed(() => this.totalCommitment() * 3);
   ```
2. Convert an RxJS stream into a signal:
   ```typescript
   // Automatically updates without manual .subscribe() or async pipe:
   address = toSignal(this.addressLookupService.searchAddressByCep(this.cepSubject$), { initialValue: null });
   ```
3. Use `effect()` for debugging or synchronizing external state (e.g. logging state changes to the analytics pipeline).

---

## Milestone 5: Strictly Typed Reactive Forms & Dynamic FormArrays

### Objective
Construct an enterprise quotation wizard form with `NonNullableFormBuilder`, custom cross-field underwriting validators, and a `FormArray` for co-tenants.

### Concepts Covered
- Typed Reactive Forms (`FormGroup`, `FormControl`, `FormArray`).
- `NonNullableFormBuilder` via `inject()`.
- Cross-field validator (`incomeMultiplierValidator`).
- Dynamic form controls: Adding and removing co-tenants (*co-locatários*) to compose qualifying income.

### Tasks
1. Construct the form with a nested `FormArray`:
   ```typescript
   private fb = inject(NonNullableFormBuilder);

   quoteForm = this.fb.group({
     rentAmount: [2500, [Validators.required, Validators.min(500)]],
     condoAmount: [600, [Validators.required, Validators.min(0)]],
     iptuAmount: [150, [Validators.required, Validators.min(0)]],
     primaryTenant: this.fb.group({
       fullName: ['', [Validators.required, Validators.minLength(3)]],
       cpf: ['', [Validators.required, brazilianCpfValidator()]],
       monthlyIncome: [0, [Validators.required, Validators.min(1000)]]
     }),
     coTenants: this.fb.array<FormGroup>([]),
     coverages: this.fb.group({
       propertyDamage: [true],
       internalPainting: [false],
       assistance24h: [true]
     })
   }, {
     validators: [incomeMultiplierValidator()]
   });
   ```
2. Implement dynamic methods for `coTenants`:
   - `addCoTenant()`: pushes a new tenant `FormGroup` to the array.
   - `removeCoTenant(index: number)`: removes co-tenant and recalculates combined household income.
3. Display granular validation error messages when `totalIncome < 3 * totalCommitment`.

---

## Milestone 6: Modern Routing, Lazy Loading & Functional Guards

### Objective
Architect a clean multi-page workflow using modern standalone routing, lazy-loaded components, route parameters, and functional route guards.

### Concepts Covered
- `provideRouter()`, `RouterOutlet`, `RouterLink`.
- Standalone lazy loading with `loadComponent`.
- Functional route guards (`CanActivateFn`).
- Route parameters (`:id`) and programmatic navigation with `Router`.

### Tasks
1. Configure `src/app/app.routes.ts`:
   ```typescript
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
   ```
2. Create the functional guard `src/app/core/guards/quote-active.guard.ts`:
   - Checks if the quotation state service contains valid calculated quotes.
   - Redirects to `/quoter` if a user attempts to bookmark or navigate directly to `/results` without quoting.

---

## Milestone 7: Senior Concurrency — Progressive Multi-Carrier Streaming

### Objective
Implement multi-carrier async quotation using RxJS `merge` to stream and render quotes progressively as each carrier finishes its underwriting analysis.

### Concepts Covered
- Concurrent stream orchestration (`merge` vs `forkJoin`).
- Lifecycle-safe subscription management via `takeUntilDestroyed`.
- Real-world front-end performance: Time-to-First-Result optimization.

### Carrier Latency Profile
- **Apex Marine:** 600ms latency, high approval rate, fast SLA badge.
- **Vanguard Surety:** 1200ms latency.
- **Beacon Assurance:** 1800ms latency.

### Implementation
```typescript
@Injectable({ providedIn: 'root' })
export class QuotationService {
  private http = inject(HttpClient);
  quotes = signal<ProviderQuote[]>([]);
  isStreaming = signal<boolean>(false);

  streamQuotes(request: QuoteRequest): Observable<ProviderQuote> {
    const apex$ = this.fetchApexMarineQuote(request);       // Emits at ~600ms
    const vanguard$ = this.fetchVanguardSuretyQuote(request); // Emits at ~1200ms
    const beacon$ = this.fetchBeaconAssuranceQuote(request); // Emits at ~1800ms

    return merge(apex$, vanguard$, beacon$);
  }
}

// In parent comparison component:
this.quoteService.streamQuotes(payload)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({
    next: (quote) => {
      // Apex Marine appears on screen in 600ms while others are still in flight!
      this.quotes.update(existing => [...existing, quote]);
    },
    complete: () => this.isStreaming.set(false)
  });
```

---

## Milestone 8: Functional HTTP Interceptors & Zoneless Readiness

### Objective
Implement enterprise security and observability in the HTTP pipeline using functional interceptors, and configure modern change detection.

### Concepts Covered
- Functional interceptors (`HttpInterceptorFn`).
- Correlation IDs (`X-Correlation-ID`) for distributed tracing across microservices.
- Global error handling for HTTP 422 (Bureau downtime) and HTTP 503 (Carrier timeout).
- Zoneless change detection readiness (`provideExperimentalZonelessChangeDetection()`).

### Tasks
1. Create `src/app/core/interceptors/api.interceptor.ts`:
   ```typescript
   export const apiInterceptor: HttpInterceptorFn = (req, next) => {
     const correlationId = crypto.randomUUID();
     const authReq = req.clone({
       setHeaders: {
         'X-Correlation-ID': correlationId,
         'Authorization': `Bearer ${localStorage.getItem('auth_token') ?? 'guest_token'}`
       }
     });

     return next(authReq).pipe(
       catchError((error: HttpErrorResponse) => {
         if (error.status === 422) {
           console.error(`[Correlation: ${correlationId}] Bureau validation failed`);
         }
         return throwError(() => error);
       })
     );
   };
   ```
2. Register in `src/app/app.config.ts`:
   ```typescript
   export const appConfig: ApplicationConfig = {
     providers: [
       provideExperimentalZonelessChangeDetection(),
       provideRouter(routes),
       provideHttpClient(withInterceptors([apiInterceptor]))
     ]
   };
   ```

---

## Milestone 9: Testing Suite (`TestBed` & `HttpTestingController`)

### Objective
Write automated unit tests verifying business calculations, HTTP communications, and component DOM rendering.

### Concepts Covered
- Unit testing with Jasmine and Karma (`ng test`).
- Angular `TestBed`.
- Mocking HTTP backends with `provideHttpClientTesting()` and `HttpTestingController`.
- Testing Signal-driven component DOM updates.

### Tasks
1. **Service Testing (`quotation.service.spec.ts`):**
   - Assert `POST /api/v1/fianca/quotes` is invoked with valid payload.
   - Assert headers include `X-Correlation-ID`.
   - Verify quotes signal accurately accumulates data.
2. **Component Testing (`quote-card.component.spec.ts`):**
   - Instantiate `QuoteCardComponent` inside `TestBed`.
   - Set signal input `fixture.componentRef.setInput('quote', mockQuote)`.
   - Assert premium values and carrier badges render accurately in the DOM.
   - Trigger click on the select button and verify `selectQuote` output emits.

---

## Progress Checklist

- [x] **Milestone 1:** Component Foundations & Modern Signal Inputs/Outputs
- [x] **Milestone 2:** Content Projection & Custom Directives
- [x] **Milestone 3:** Services, Dependency Injection & RxJS Pipelines
- [x] **Milestone 4:** Fine-Grained Reactivity with Signals & RxJS Interop
- [x] **Milestone 5:** Strictly Typed Reactive Forms & Dynamic FormArrays
- [x] **Milestone 6:** Modern Routing, Lazy Loading & Functional Guards
- [x] **Milestone 7:** Senior Concurrency — Progressive Multi-Carrier Streaming
- [x] **Milestone 8:** Functional HTTP Interceptors & Zoneless Readiness
- [x] **Milestone 9:** Testing Suite (`TestBed` & `HttpTestingController`)
