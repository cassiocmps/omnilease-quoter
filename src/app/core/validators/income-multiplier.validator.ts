import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup, FormArray } from '@angular/forms';

/**
 * Enterprise Underwriting Cross-Field Validator
 * 
 * Verifies that the aggregate household income (primary tenant + all dynamic co-tenants)
 * meets or exceeds the required 3x income multiplier relative to the total monthly commitment
 * (rent + condo fees + IPTU).
 * 
 * Target: Attached at the root FormGroup level (`quoteForm`).
 */
export function incomeMultiplierValidator(multiplier = 3): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    if (!formGroup || !formGroup.controls) {
      return null;
    }

    const rent = Number(formGroup.get('rentAmount')?.value) || 0;
    const condo = Number(formGroup.get('condoAmount')?.value) || 0;
    const iptu = Number(formGroup.get('iptuAmount')?.value) || 0;
    const totalCommitment = rent + condo + iptu;

    const primaryIncome = Number(formGroup.get('primaryTenant.monthlyIncome')?.value) || 0;

    // Calculate dynamic co-tenant income from FormArray
    const coTenantsArray = formGroup.get('coTenants') as FormArray | null;
    let coTenantsIncome = 0;
    if (coTenantsArray && coTenantsArray.controls) {
      for (const tenantGroup of coTenantsArray.controls) {
        coTenantsIncome += Number(tenantGroup.get('monthlyIncome')?.value) || 0;
      }
    }

    const totalHouseholdIncome = primaryIncome + coTenantsIncome;
    const minimumRequired = totalCommitment * multiplier;

    if (totalHouseholdIncome < minimumRequired) {
      return {
        insufficientIncome: {
          totalCommitment,
          requiredMultiplier: multiplier,
          minimumRequired,
          actualIncome: totalHouseholdIncome,
          deficit: minimumRequired - totalHouseholdIncome
        }
      };
    }

    return null;
  };
}
