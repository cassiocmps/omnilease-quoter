import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { QuoteFormComponent } from './quote-form.component';

registerLocaleData(localePt);

describe('QuoteFormComponent (Typed Reactive Forms & FormArray)', () => {
  let component: QuoteFormComponent;
  let fixture: ComponentFixture<QuoteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteFormComponent, ReactiveFormsModule],
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should instantiate strictly typed quoteForm with initial values', () => {
    expect(component.quoteForm).toBeTruthy();
    expect(component.quoteForm.controls.rentAmount.value).toBe(2500);
    expect(component.quoteForm.controls.condoAmount.value).toBe(600);
    expect(component.quoteForm.controls.iptuAmount.value).toBe(150);
    expect(component.quoteForm.controls.primaryTenant.controls.fullName.value).toBe('Mariana S. Santos');
  });

  it('should dynamically push new co-tenant FormGroup into coTenants FormArray', () => {
    expect(component.coTenants.length).toBe(0);

    component.addCoTenant();
    expect(component.coTenants.length).toBe(1);

    const added = component.coTenants.at(0);
    expect(added.get('monthlyIncome')?.value).toBe(2000);
  });

  it('should dynamically remove a co-tenant from FormArray', () => {
    component.addCoTenant();
    component.addCoTenant();
    expect(component.coTenants.length).toBe(2);

    component.removeCoTenant(0);
    expect(component.coTenants.length).toBe(1);
  });

  it('should trigger cross-field insufficientIncome error and resolve when co-tenant is added', () => {
    // Initial: commitment = 2500 + 600 + 150 = 3250. 3x = 9750. Primary Income = 8000. Deficit = 1750.
    expect(component.quoteForm.errors?.['insufficientIncome']).toBeTruthy();
    expect(component.quoteForm.valid).toBeFalse();

    // Add co-tenant with R$ 2.000,00 income => Total = 8000 + 2000 = 10000 >= 9750!
    component.addCoTenant();
    fixture.detectChanges();

    // Now valid!
    expect(component.quoteForm.errors).toBeNull();
  });

  it('should emit formSubmit output when valid form is submitted', () => {
    // Make form valid by providing enough income
    component.addCoTenant(); // adds 2000 => total 10000 >= 9750
    component.coTenants.at(0).get('fullName')?.setValue('Carlos Silva');
    component.coTenants.at(0).get('cpf')?.setValue('529.982.247-25');

    let emittedPayload: any;
    component.formSubmit.subscribe(val => emittedPayload = val);

    component.onSubmit();
    expect(emittedPayload).toBeTruthy();
    expect(emittedPayload.rentAmount).toBe(2500);
  });
});
