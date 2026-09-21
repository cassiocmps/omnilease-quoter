import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { incomeMultiplierValidator } from './income-multiplier.validator';

describe('incomeMultiplierValidator', () => {
  const fb = new FormBuilder();

  function buildTestForm(rent: number, condo: number, iptu: number, primaryIncome: number, coIncomes: number[]): FormGroup {
    return fb.group({
      rentAmount: [rent, [Validators.required]],
      condoAmount: [condo, [Validators.required]],
      iptuAmount: [iptu, [Validators.required]],
      primaryTenant: fb.group({
        fullName: ['Test Tenant'],
        monthlyIncome: [primaryIncome]
      }),
      coTenants: fb.array(
        coIncomes.map(inc => fb.group({
          fullName: ['Co-tenant'],
          monthlyIncome: [inc]
        }))
      )
    }, {
      validators: [incomeMultiplierValidator(3)]
    });
  }

  it('should pass validation when primary income meets 3x multiplier alone', () => {
    // Commitment: 2500 + 500 + 0 = 3000. 3x = 9000. Income = 9500
    const form = buildTestForm(2500, 500, 0, 9500, []);
    expect(form.errors).toBeNull();
  });

  it('should fail validation when primary income is below 3x multiplier', () => {
    // Commitment: 3000. 3x = 9000. Income = 7000. Deficit = 2000.
    const form = buildTestForm(2500, 500, 0, 7000, []);
    expect(form.errors).toEqual({
      insufficientIncome: {
        totalCommitment: 3000,
        requiredMultiplier: 3,
        minimumRequired: 9000,
        actualIncome: 7000,
        deficit: 2000
      }
    });
  });

  it('should pass validation when dynamic co-tenants compose sufficient aggregate income', () => {
    // Commitment: 3000. 3x = 9000. Primary = 5000, Co1 = 2500, Co2 = 2000 => Total = 9500 >= 9000
    const form = buildTestForm(2500, 500, 0, 5000, [2500, 2000]);
    expect(form.errors).toBeNull();
  });
});
