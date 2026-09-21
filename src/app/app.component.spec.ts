import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LOCALE_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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

  it('should render UiCardComponent shell with projected title, body, and actions', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const uiCard = compiled.querySelector('app-ui-card');
    expect(uiCard).toBeTruthy();

    const titleSlot = uiCard?.querySelector('[card-title]');
    expect(titleSlot?.textContent).toContain('Perfil de Subscrição do Proponente');

    const actionsSlot = uiCard?.querySelector('[card-actions]');
    expect(actionsSlot?.textContent).toContain('Consultar Birô de Crédito (Serasa)');
  });

  it('should toggle card featured styling when toggleCardFeatured is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    expect(app.isCardFeatured()).toBeTrue();
    app.toggleCardFeatured();
    expect(app.isCardFeatured()).toBeFalse();
  });

  it('should mask CPF typing input through CpfMaskDirective', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const cpfInput = fixture.nativeElement.querySelector('#tenant-cpf-input') as HTMLInputElement;
    expect(cpfInput).toBeTruthy();

    cpfInput.value = '11122233344';
    cpfInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cpfInput.value).toBe('111.222.333-44');
    expect(app.tenantCpf()).toBe('111.222.333-44');
  });

  it('should mask CEP typing and trigger AddressLookupService pipeline', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const cepInput = fixture.nativeElement.querySelector('#property-cep-input') as HTMLInputElement;
    expect(cepInput).toBeTruthy();

    // Type 8 digits
    cepInput.value = '01310100';
    cepInput.dispatchEvent(new Event('input'));
    tick(350); // wait for debounce
    fixture.detectChanges();

    const req = httpMock.expectOne('https://viacep.com.br/ws/01310100/json/');
    req.flush({
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: 'de 611 a 1045 - lado ímpar',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP'
    });

    fixture.detectChanges();
    expect(cepInput.value).toBe('01310-100');
    expect(app.propertyAddress()?.logradouro).toBe('Avenida Paulista');
    httpMock.verify();
  }));
});

