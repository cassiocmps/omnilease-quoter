import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Enterprise Brazilian CPF Checksum Validator
 * 
 * Implements the official Receita Federal 11-digit mathematical checksum algorithm:
 * 1. Rejects known repetitive patterns (e.g. 111.111.111-11).
 * 2. Computes the 1st verification digit (modulo 11 with weights 10 down to 2).
 * 3. Computes the 2nd verification digit (modulo 11 with weights 11 down to 2).
 */
export function brazilianCpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't fail empty values; use Validators.required for presence
    }

    const digits = String(value).replace(/\D/g, '');

    if (digits.length !== 11) {
      return { invalidCpfLength: { requiredLength: 11, actualLength: digits.length } };
    }

    // Known blacklisted repetitive sequences
    if (/^(\d)\1{10}$/.test(digits)) {
      return { invalidCpfChecksum: true };
    }

    // Verify 1st check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits.charAt(i), 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.charAt(9), 10)) {
      return { invalidCpfChecksum: true };
    }

    // Verify 2nd check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits.charAt(i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.charAt(10), 10)) {
      return { invalidCpfChecksum: true };
    }

    return null;
  };
}
