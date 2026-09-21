import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { QuoteStateService } from './core/services/quote-state.service';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

describe('AppComponent (Routing Application Shell)', () => {
  let quoteState: QuoteStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        QuoteStateService,
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    quoteState = TestBed.inject(QuoteStateService);
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'OmniLease Quoter' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('OmniLease Quoter');
  });

  it('should render the brand title and router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-title')?.textContent).toContain('OmniLease');
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render navigation tabs with disabled state for results when no quotes exist', () => {
    quoteState.clear();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css('.nav-tab'));
    expect(tabs.length).toBe(2);

    // Results tab should have disabled class
    const resultsTab = tabs[1].nativeElement as HTMLElement;
    expect(resultsTab.classList.contains('disabled')).toBeTrue();
  });
});
