import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'OmniLease Quoter' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('OmniLease Quoter');
  });

  it('should render the brand title and carrier quote cards', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('OmniLease');

    // Should render 3 quote cards
    const cards = compiled.querySelectorAll('app-quote-card');
    expect(cards.length).toBe(3);
  });

  it('should update selectedQuote signal when onQuoteSelected is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const mockQuote = app.carrierQuotes()[0];
    app.onQuoteSelected(mockQuote);
    fixture.detectChanges();

    expect(app.selectedQuote()).toEqual(mockQuote);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.selection-banner')?.textContent).toContain('Apex Marine Seguros');
  });
});
