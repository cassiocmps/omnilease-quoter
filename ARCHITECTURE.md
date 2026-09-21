# Angular Architecture: From Legacy (v6/v14) to Modern Senior (v18 LTS)

This guide documents the architectural shift from legacy Angular (Angular 6 & 14) to modern Angular 18 LTS, explaining both the **how** and the **why** behind every design decision.

---

## 1. Evolution Matrix: Angular 6 vs 14 vs 18

| Area | Angular 6 (Legacy) | Angular 14 (Bridge) | Angular 18 LTS (Modern) |
| :--- | :--- | :--- | :--- |
| **Component Architecture** | Mandatory `NgModule`, `declarations`, `entryComponents` | Standalone preview (`standalone: true`), optional modules | **Standalone is default**; `NgModule` is legacy |
| **Reactivity** | RxJS only (`BehaviorSubject`, `Observable`, `async` pipe) | RxJS only; template binding requires manual subscription or `async` pipe | **Signals** (`signal`, `computed`, `effect`) + RxJS interop (`toSignal`, `toObservable`) |
| **Change Detection** | Zone.js traps all async events; checks full component tree | Zone.js with `OnPush` optimization | **Zoneless ready**; fine-grained reactivity via Signals without full tree walks |
| **Control Flow** | Structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) | Structural directives (`*ngIf`, `*ngFor`) | **Built-in block syntax** (`@if`, `@for`, `@switch`, `@defer`) |
| **Forms** | Untyped `FormGroup` (`any` everywhere) | **Strictly Typed Forms** (`FormGroup<{ name: FormControl<string> }>`) | Typed forms standard, record forms, signal-based forms evolving |
| **Dependency Injection** | Constructor injection only | Constructor injection | **`inject()` function** (cleaner composition, no constructor parameter pollution) |
| **HTTP Interceptors** | Class-based `implements HttpInterceptor` + `HTTP_INTERCEPTORS` multi-provider | Class-based standard | **Functional Interceptors** (`HttpInterceptorFn` via `withInterceptors([fn])`) |
| **Routing & Guards** | Class-based `CanActivate` interfaces | Functional guards preview | **Functional guards & resolvers** (`canActivate: [authGuard]`) |
| **Compilation** | View Engine (slow, heavy bundles) | Ivy compiler fully enforced | Ivy with advanced dead-code elimination & hydration |

---

## 2. Deep Dive: Signals vs. RxJS (The Senior Perspective)

A common mistake in interviews is claiming *"Signals replace RxJS"*. **They do not.** They serve complementary roles:

```
┌────────────────────────────────────────────────────────┐
│                   Reactivity Spectrum                  │
├──────────────────────────┬─────────────────────────────┤
│      Angular Signals     │             RxJS            │
├──────────────────────────┼─────────────────────────────┤
│ Synchronous state        │ Asynchronous event streams  │
│ Value over time (current)│ Events over time (pipeline) │
│ Glitch-free computation  │ Orchestration & concurrency │
│ Component/UI state       │ WebSockets, HTTP, debounce  │
│ Always has a value       │ Can complete, error, empty  │
└──────────────────────────┴─────────────────────────────┘
```

### When to Use Signals:
* Component local state (e.g. `isModalOpen = signal(false)`).
* Derived computations that depend on other state (e.g. `totalCost = computed(() => this.rent() + this.condo() + this.iptu())`).
* Inputs and Outputs in modern components (`input()`, `model()`, `output()`).

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-cost-counter',
  standalone: true,
  template: `
    <p>Aluguel: {{ rent() }}</p>
    <p>Condomínio: {{ condo() }}</p>
    <strong>Total: {{ total() }}</strong>
  `
})
export class CostCounterComponent {
  rent = signal(2500);
  condo = signal(650);
  
  // Computed signal is pure, memoized, and glitch-free (runs only when dependencies change)
  total = computed(() => this.rent() + this.condo());
}
```

### When to Use RxJS:
* Handling user input debounce (search fields with `debounceTime(300)`).
* Coordinating multiple asynchronous HTTP calls (e.g., `forkJoin` or `switchMap` across Apex Marine, Beacon Assurance, and Vanguard Surety).
* Streaming real-time updates (Server-Sent Events or WebSockets).

### The Bridge: RxJS Interop (`toSignal` & `toObservable`)
```typescript
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

export class QuoteService {
  private http = inject(HttpClient);

  // Converts an Observable into a read-only Signal directly in the component/service
  // Handles automatic subscription and unsubscription on destroy!
  quotes = toSignal(this.http.get<ProviderQuote[]>('/api/quotes'), { initialValue: [] });
}
```

---

## 3. Native Control Flow: `@if`, `@for`, `@defer`

Angular 17 introduced built-in control flow, superseding `*ngIf` and `*ngFor`.

### Why Native Control Flow is Superior:
1. **Zero Imports:** You no longer need to import `CommonModule` or `NgIf`/`NgFor`.
2. **Mandatory Tracking in `@for`:** In `*ngFor`, developers routinely forgot `trackBy`, causing full DOM teardown and recreation on list updates. `@for (item of items; track item.id)` enforces tracking at compile time.
3. **Built-in `@empty` Block:** No more awkward `<div *ngIf="items.length === 0">`.
4. **Performance:** Up to 90% faster template rendering compared to directive-based iteration.

```html
<!-- Modern Angular 18 Control Flow -->
@if (loading()) {
  <div class="skeleton-loader">Consultando seguradoras...</div>
} @else {
  <div class="quotes-grid">
    @for (quote of quotes(); track quote.providerId) {
      <app-quote-card [quote]="quote" />
    } @empty {
      <div class="no-results">Nenhuma seguradora aprovou as condições para este perfil.</div>
    }
  </div>
}

<!-- Deferred Loading for Performance (@defer) -->
@defer (on viewport) {
  <app-apex-marine-details [quote]="selectedQuote()" />
} @placeholder {
  <div class="placeholder">Role para baixo para ver detalhes da apólice Apex Marine...</div>
} @loading (minimum 500ms) {
  <app-spinner />
}
```

---

## 4. Change Detection: How `OnPush` and Signals Work Together

### Default Change Detection (`CheckAlways`):
* Backed by `Zone.js`. Every microtask, DOM event, or HTTP response triggers a top-down check of the entire component tree.
* In enterprise apps with hundreds of inputs (like insurance quoter forms), this causes severe CPU frame drops.

### `ChangeDetectionStrategy.OnPush`:
Angular skips checking the component and its subtree **unless**:
1. An `@Input()` reference identity changes (`prevVal !== newVal`).
2. An event listener bound in the component's template fires (`(click)="doSomething()"`).
3. An Observable bound via `| async` emits a value.
4. **A Signal read inside the template changes.**

> **Senior Takeaway:** Combining `OnPush` with Signals provides nearly "zoneless" performance. Angular knows exactly which DOM node depends on which Signal and updates only that specific node without re-evaluating sibling components.

---

## 5. Functional Dependency Injection: `inject()`

In Angular 6–13, constructor parameter injection was required:

```typescript
// Legacy Constructor Injection (Angular 6 - 13)
export class QuoteWizardComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private quoteService: QuotationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
}
```

In modern Angular 18, use the **`inject()`** function:

```typescript
// Modern Functional Injection (Angular 18)
export class QuoteWizardComponent {
  private fb = inject(NonNullableFormBuilder);
  private quoteService = inject(QuotationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Custom reusable injection functions can now be written!
  private currentUser = injectCurrentUser();
}
```

### Architectural Benefits:
* **Cleaner inheritance:** Derived classes don't need to pass constructor arguments through `super(...)`.
* **Composable helper functions:** You can create factory functions like `injectDestroy()` or `injectQueryParams()` that encapsulate DI logic outside of component class bodies.

---

## 6. Functional HTTP Interceptors (`HttpInterceptorFn`)

In legacy codebases, interceptors required boilerplate classes with multi-token registration:
```typescript
// Legacy (Angular 6/14)
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

In Angular 18, interceptors are pure functions registered directly in `app.config.ts`:

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.logout();
      }
      return throwError(() => err);
    })
  );
};
```

Registered simply in `app.config.ts`:
```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```
