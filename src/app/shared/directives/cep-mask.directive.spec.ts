import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CepMaskDirective } from './cep-mask.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CepMaskDirective],
  template: `
    <input type="text" id="plain-cep" appCepMask />
    <input type="text" id="form-cep" appCepMask [formControl]="cepControl" />
  `
})
class TestHostComponent {
  readonly cepControl = new FormControl<string>('');
}

describe('CepMaskDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let plainInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CepMaskDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    plainInput = fixture.debugElement.query(By.css('#plain-cep')).nativeElement;
  });

  it('should format progressive numeric typing for CEP', () => {
    plainInput.value = '01310';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('01310');

    plainInput.value = '01310100';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('01310-100');
  });

  it('should strip non-digits and cap at 8 digits', () => {
    plainInput.value = '01a31b0-100999';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('01310-100');
  });
});
