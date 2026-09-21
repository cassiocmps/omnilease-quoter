import { FormControl } from '@angular/forms';
import { brazilianCpfValidator } from './cpf.validator';

describe('brazilianCpfValidator', () => {
  const validator = brazilianCpfValidator();

  it('should return null for empty values', () => {
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl(null))).toBeNull();
  });

  it('should reject CPFs with invalid length', () => {
    const res = validator(new FormControl('123.456'));
    expect(res).toEqual({ invalidCpfLength: { requiredLength: 11, actualLength: 6 } });
  });

  it('should reject blacklisted repetitive sequences', () => {
    expect(validator(new FormControl('111.111.111-11'))).toEqual({ invalidCpfChecksum: true });
    expect(validator(new FormControl('000.000.000-00'))).toEqual({ invalidCpfChecksum: true });
  });

  it('should reject CPFs with invalid checksum digits', () => {
    // 123.456.789-00 has invalid check digits
    expect(validator(new FormControl('123.456.789-00'))).toEqual({ invalidCpfChecksum: true });
  });

  it('should accept mathematically valid CPFs', () => {
    // Valid generated test CPF: 52998224725
    expect(validator(new FormControl('529.982.247-25'))).toBeNull();
  });
});
