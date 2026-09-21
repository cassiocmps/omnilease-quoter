import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { brazilianCpfValidator } from '../../../../core/validators/cpf.validator';
import { incomeMultiplierValidator } from '../../../../core/validators/income-multiplier.validator';
import { CpfMaskDirective } from '../../../../shared/directives/cpf-mask.directive';

export interface CoTenantFormValue {
  fullName: string;
  cpf: string;
  monthlyIncome: number;
}

/**
 * QuoteFormComponent
 * 
 * Enterprise Quotation Wizard form implementing:
 * 1. Strictly Typed Reactive Forms (`NonNullableFormBuilder`).
 * 2. Nested FormGroups for primary tenant and insurance coverages.
 * 3. Dynamic FormArray for adding/removing qualifying co-tenants (*co-locatários*).
 * 4. Cross-field underwriting validation enforcing the 3x gross income multiplier rule.
 */
@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, CpfMaskDirective],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuoteFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  /**
   * Event emitted when the complete quotation form is valid and submitted.
   */
  readonly formSubmit = output<any>();

  /**
   * Root strictly-typed FormGroup.
   */
  readonly quoteForm = this.fb.group({
    rentAmount: [2500, [Validators.required, Validators.min(500)]],
    condoAmount: [600, [Validators.required, Validators.min(0)]],
    iptuAmount: [150, [Validators.required, Validators.min(0)]],
    primaryTenant: this.fb.group({
      fullName: ['Mariana S. Santos', [Validators.required, Validators.minLength(3)]],
      cpf: ['529.982.247-25', [Validators.required, brazilianCpfValidator()]],
      monthlyIncome: [8000, [Validators.required, Validators.min(1000)]]
    }),
    coTenants: this.fb.array<FormGroup>([]),
    coverages: this.fb.group({
      propertyDamage: [true],
      internalPainting: [false],
      assistance24h: [true]
    })
  }, {
    validators: [incomeMultiplierValidator(3)]
  });

  /**
   * Getter typed as FormArray for template iteration with native @for.
   */
  get coTenants(): FormArray {
    return this.quoteForm.get('coTenants') as FormArray;
  }

  /**
   * Total monthly commitment derived directly from form values.
   */
  get totalCommitment(): number {
    const rent = this.quoteForm.controls.rentAmount.value || 0;
    const condo = this.quoteForm.controls.condoAmount.value || 0;
    const iptu = this.quoteForm.controls.iptuAmount.value || 0;
    return rent + condo + iptu;
  }

  /**
   * Minimum gross income required (3x rule).
   */
  get minimumRequiredIncome(): number {
    return this.totalCommitment * 3;
  }

  /**
   * Aggregate income (primary tenant + all dynamic co-tenants).
   */
  get totalHouseholdIncome(): number {
    const primary = this.quoteForm.controls.primaryTenant.controls.monthlyIncome.value || 0;
    let coIncome = 0;
    for (const ctrl of this.coTenants.controls) {
      coIncome += Number(ctrl.get('monthlyIncome')?.value) || 0;
    }
    return primary + coIncome;
  }

  /**
   * Adds a new co-tenant FormGroup into the dynamic FormArray.
   */
  addCoTenant(): void {
    const coTenantGroup = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, brazilianCpfValidator()]],
      monthlyIncome: [2000, [Validators.required, Validators.min(500)]]
    });

    this.coTenants.push(coTenantGroup);
    this.quoteForm.updateValueAndValidity();
  }

  /**
   * Removes a co-tenant at the specified index and recalculates qualifying income.
   */
  removeCoTenant(index: number): void {
    this.coTenants.removeAt(index);
    this.quoteForm.updateValueAndValidity();
  }

  /**
   * Submits the form if valid or marks all controls as touched for error rendering.
   */
  onSubmit(): void {
    if (this.quoteForm.valid) {
      this.formSubmit.emit(this.quoteForm.getRawValue());
    } else {
      this.quoteForm.markAllAsTouched();
    }
  }
}
