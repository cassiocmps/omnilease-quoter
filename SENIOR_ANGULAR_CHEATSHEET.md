# Senior Angular Cheatsheet & Enterprise Interview Master Guide

Targeted for technical interviews at companies like **Avanade, Accenture, and Microsoft Partner networks** where candidates are evaluated on engineering depth, architecture, and full-stack integration.

---

## 1. Change Detection Internals (The #1 Senior Question)

### How does Zone.js actually work?
Zone.js monkey-patches all browser asynchronous APIs (`setTimeout`, `setInterval`, `Promise.then`, `addEventListener`, `XMLHttpRequest`).
1. When an async event finishes, Zone.js triggers an `onMicrotaskEmpty` hook.
2. Angular's `ApplicationRef` listens to this hook and calls `tick()`.
3. `tick()` executes change detection from the root component (`AppComponent`) down the entire tree.

### `Default` vs `OnPush` Under the Hood
* **`Default`:** Angular inspects every single expression in every template of every component on every tick ($O(N)$ where $N$ = total components in tree).
* **`OnPush`:** Tells Angular: *"Skip checking this component and its children unless one of these four conditions occurs:"*
  1. An `@Input()` reference changed (checked via strict equality `===`). Mutating an object property `user.name = 'New'` will **NOT** trigger change detection. You must emit a new object reference `{ ...user, name: 'New' }`.
  2. An event handler inside the component template was fired (e.g. `(click)="onSelect()"`).
  3. An Observable bound via `| async` emitted a new value.
  4. An Angular **Signal** read inside the template changed its value.

### `markForCheck()` vs `detectChanges()`
* **`cdRef.markForCheck()`:** Marks the component and **all of its ancestors** up to the root as dirty. It does *not* execute immediately; it waits for the next scheduled tick.
* **`cdRef.detectChanges()`:** Runs change detection **immediately** on the component and its direct children. Use sparingly (e.g. updating canvas or measuring DOM synchronously).

### The Zoneless Future (Angular 18+)
In Angular 18+, you can enable experimental zoneless change detection:
```typescript
// app.config.ts
provideExperimentalZonelessChangeDetection()
```
Without Zone.js, Angular relies purely on Signals and framework notification primitives. This cuts bundle size by ~35KB and eliminates unnecessary global dirty-checks.

---

## 2. RxJS Mastery Matrix

Interviewers will ask you to explain when to use which operator in an insurance quoter.

### The 4 Flattening Operators
| Operator | Behavior | Insurtech Use Case |
| :--- | :--- | :--- |
| **`switchMap`** | Cancels previous inner Observable when a new value arrives. | **CEP/Address Auto-complete or Search:** As the user types their CPF or postal code, previous in-flight HTTP lookups are canceled immediately. |
| **`exhaustMap`** | Ignores new emissions until the current inner Observable completes. | **Submit/Pay Button:** User clicks "Emitir Apólice Apex Marine". Additional rapid clicks are ignored until the transaction completes, preventing double billing. |
| **`concatMap`** | Queues emissions and runs them sequentially in order. | **Document Upload / Audit Logging:** Uploading 5 identity documents in strict order, or recording audit events where sequence integrity matters. |
| **`mergeMap`** | Runs all inner Observables concurrently without canceling. | **Parallel Insurer Quoting:** Firing independent pricing requests to Apex Marine, Beacon Assurance, and Vanguard Surety concurrently. |

### Memory Leaks: 5 Ways to Unsubscribe (Ranked by Best Practice)
1. **`| async` pipe in template (Best for views):**
   * Automatically subscribes and handles unsubscription when component is destroyed.
2. **`takeUntilDestroyed()` (Modern Angular 16+):**
   ```typescript
   private destroyRef = inject(DestroyRef);
   this.quoteService.getQuotes()
     .pipe(takeUntilDestroyed(this.destroyRef))
     .subscribe(quotes => ...);
   ```
3. **`takeUntil(this.destroy$)` (Standard pattern in Angular 6–15):**
   ```typescript
   private destroy$ = new Subject<void>();
   ngOnDestroy() {
     this.destroy$.next();
     this.destroy$.complete();
   }
   // In stream: .pipe(takeUntil(this.destroy$))
   ```
4. **`first()` or `take(1)`:** Automatically completes after the first emission (useful for one-off route resolver checks).
5. **Subscription Bag (`sub.add(...)`):** Manually adding to a `new Subscription()` and calling `this.sub.unsubscribe()`. (Prone to developer oversight).

---

## 3. Dependency Injection (DI) Internals

### Hierarchical Injector Trees
Angular has two parallel injector hierarchies:
1. **EnvironmentInjector:** Configured at application root via `provide...` in `app.config.ts` (formerly `AppModule`). Singleton scope across the app.
2. **ElementInjector:** Configured in `@Component({ providers: [...] })` or `@Directive`. Scoped only to that component instance and its projected/child DOM elements.

### Injection Parameter Decorators (or `inject()` options)
* `@Optional()` / `inject(Token, { optional: true })`: Returns `null` instead of throwing an error if token is not found.
* `@Self()` / `inject(Token, { self: true })`: Only looks in the current component's ElementInjector.
* `@SkipSelf()` / `inject(Token, { skipSelf: true })`: Starts search in parent injector, ignoring the local one.
* `@Host()` / `inject(Token, { host: true })`: Stops searching at the host component boundary.

---

## 4. Full-Stack Integration (.NET Core + Angular)

For an Avanade Full Stack role, interviewers want to see how you bridge frontend and backend:

### 1. Functional JWT Interceptor with 401 Refresh Flow
```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  let cloned = req;
  if (token && !req.headers.has('Authorization')) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Attempt refresh token exchange with ASP.NET Core endpoint
        return auth.refreshToken().pipe(
          switchMap(newToken => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            auth.forceLogout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
```

### 2. DTO Synchronization
* In enterprise teams, use tools like **NSwag**, **AutoRest**, or **TypeGen** to auto-generate TypeScript interfaces directly from C# classes on each build:
  * C# `public record QuoteResponseDto(string ProviderId, decimal MonthlyPremium);`
  * Generates: `export interface QuoteResponseDto { providerId: string; monthlyPremium: number; }`

### 3. Handling ASP.NET Core Validation ProblemDetails (RFC 7807)
* ASP.NET Core returns standard HTTP 400 with `ValidationProblemDetails`:
  ```json
  {
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
      "MonthlyIncome": ["Income must be at least 3x monthly commitment."],
      "CPF": ["Invalid Brazilian CPF document."]
    }
  }
  ```
* A senior front-end captures `error.error.errors` in an interceptor or service and maps backend errors directly onto corresponding Angular `FormControl.setErrors({ serverError: message })`.

---

## 5. Top 5 Senior Interview Questions & Concise Answers

### Q1: "Why would you choose Signals over RxJS for component state?"
> **Answer:** "Signals provide synchronous, glitch-free reactivity specifically optimized for UI rendering. When multiple dependent signals update, Angular calculates the final value without intermediate glitches. Furthermore, Signals integrate natively with Angular's template compiler, enabling fine-grained DOM updates without needing Zone.js to traverse the entire component tree."

### Q2: "How do you detect and fix memory leaks in an Angular app?"
> **Answer:** "The most common sources are unclosed RxJS subscriptions, retained DOM elements in custom directives, and uncleared window event listeners. I inspect them using Chrome DevTools Memory Profiler (taking heap snapshots before and after component navigation and searching for detached DOM nodes). Prevention is built into our architecture by strictly using `takeUntilDestroyed()`, the `| async` pipe, and `DestroyRef` cleanup callbacks."

### Q3: "What are the key performance bottlenecks in large Angular applications?"
> **Answer:** "1) Leaving change detection on `Default`, triggering full tree evaluations on every microtask. 2) Missing `track` in `@for` / `trackBy` in `*ngFor`, destroying and recreating DOM nodes. 3) Heavy logic or function calls directly inside template bindings (e.g. `{{ calculateDiscount(item) }}`), which run on every change detection cycle. 4) Large un-chunked bundle sizes, solved via lazy-loaded standalone routes and `@defer`."

### Q4: "What is the difference between `FormGroup.setValue()` and `FormGroup.patchValue()`?"
> **Answer:** "`setValue()` requires an exact match with the form structure—if a single control is omitted or extra, it throws a runtime error. It is ideal when resetting a form with a complete DTO. `patchValue()` updates only the specified controls, ignoring missing properties. In Angular 14+, both are strictly typed, catching property typos at compile time."

### Q5: "How does Angular prevent Cross-Site Scripting (XSS)?"
> **Answer:** "Angular treats all values as untrusted by default. When inserting values into DOM properties via interpolation or property binding (`[innerHTML]`), Angular automatically sanitizes values through `DomSanitizer`. If raw HTML or SVG is required, the developer must explicitly invoke `bypassSecurityTrustHtml()`, making security audits straightforward to grep in the codebase."
