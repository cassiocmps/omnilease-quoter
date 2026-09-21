import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { WizardPageComponent } from './wizard-page.component';
import { QuoteStateService } from '../../../../core/services/quote-state.service';

registerLocaleData(localePt);

describe('WizardPageComponent', () => {
  let component: WizardPageComponent;
  let fixture: ComponentFixture<WizardPageComponent>;
  let router: Router;
  let quoteState: QuoteStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardPageComponent],
      providers: [
        QuoteStateService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    quoteState = TestBed.inject(QuoteStateService);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(WizardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should instantiate wizard page and address card', () => {
    expect(component).toBeTruthy();
    expect(component.propertyAddress()?.logradouro).toBe('Avenida Paulista');
  });

  it('should calculate quotes and navigate to /results on form submit', () => {
    const mockFormData = {
      rentAmount: 3000,
      condoAmount: 500,
      iptuAmount: 100,
      primaryTenant: { fullName: 'Test', cpf: '529.982.247-25', monthlyIncome: 12000 },
      coTenants: []
    };

    component.onFormSubmit(mockFormData);

    expect(quoteState.quotes().length).toBe(3);
    expect(router.navigate).toHaveBeenCalledWith(['/results']);
  });
});
