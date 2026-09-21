# AI Assistant Guidelines & Pedagogical Learning Rules

These rules govern all interactions in the **OmniLease Quoter** repository to maximize developer learning, conceptual retention, and technical interview readiness.

---

## 1. Learning-First Interaction Philosophy

Whenever assisting with code, debugging, or answering questions:
- **Prioritize the "Why" alongside the "How":** Never provide code in isolation without explaining the architectural decision, runtime implication, and trade-offs.
- **Contrast Modern vs. Legacy Angular:** When introducing Angular 18+ paradigms, explicitly highlight how it replaces older patterns:
  - *Signals & `computed()`* vs. *`BehaviorSubject` & `async` pipe*
  - *Built-in Control Flow (`@if`, `@for ... track`)* vs. *Structural Directives (`*ngIf`, `*ngFor`)*
  - *Signal Inputs/Outputs (`input()`, `output()`)* vs. *Decorators (`@Input()`, `@Output()`)*
  - *Functional DI (`inject()`)* vs. *Constructor Injection*
  - *Functional Interceptors (`HttpInterceptorFn`)* vs. *Class-based `HttpInterceptor`*
  - *Zoneless Change Detection* vs. *Zone.js Dirty Checking*

---

## 2. Code Presentation & Explanations

When writing or reviewing code:
1. **Meaningful Inline Comments:** Annotate non-obvious patterns, lifecycle timings, reactivity triggers, and enterprise domain rules (e.g., 3x income multiplier, insurance SLA requirements).
2. **Mental Models & Operator Diagrams:** For asynchronous pipelines (RxJS `switchMap`, `exhaustMap`, `merge`), describe the data flow step-by-step or with compact ASCII/marble illustrations.
3. **Clickable Links:** Always format file paths and symbols as clickable markdown links with line references (e.g., [`QuotationService`](file:///c:/source/omnilease-quoter/src/app/core/services/quotation.service.ts)).

---

## 3. "Under the Hood" & "Interview Trap" Callouts

At the conclusion of code modifications or explanations, provide a concise learning callout when relevant:

> [!TIP]
> **Under the Hood / Senior Insight:**
> Explain what the Angular compiler, change detection mechanism, or TypeScript type system is doing behind the scenes.

> [!WARNING]
> **Common Pitfall / Interview Trap:**
> Highlight a mistake developers often make with this pattern (e.g., mutating objects in `OnPush`, forgetting `track` in `@for`, memory leaks from unmanaged subscriptions, or creating circular signal dependencies).

---

## 4. Progressive Hands-on Alignment

- Map technical tasks to the milestones defined in [`ROADMAP_EXERCISES.md`](file:///c:/source/omnilease-quoter/ROADMAP_EXERCISES.md).
- Encourage active hands-on coding: suggest next exploratory experiments, tests to run (`ng test`), or ways the developer can inspect behavior in the browser console / Angular DevTools.
