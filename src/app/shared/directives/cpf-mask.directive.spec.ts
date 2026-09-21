import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CpfMaskDirective } from './cpf-mask.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CpfMaskDirective],
  template: `
    <input type="text" id="plain-input" appCpfMask />
    <input type="text" id="form-input" appCpfMask [formControl]="cpfControl" />
  `
})
class TestHostComponent {
  readonly cpfControl = new FormControl<string>('');
}

describe('CpfMaskDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let plainInput: HTMLInputElement;
  let formInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CpfMaskDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    plainInput = fixture.debugElement.query(By.css('#plain-input')).nativeElement;
    formInput = fixture.debugElement.query(By.css('#form-input')).nativeElement;
  });

  it('should format progressive numeric typing correctly', () => {
    // 3 digits
    plainInput.value = '123';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123');

    // 4 digits
    plainInput.value = '1234';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.4');

    // 6 digits
    plainInput.value = '123456';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.456');

    // 7 digits
    plainInput.value = '1234567';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.456.7');

    // 9 digits
    plainInput.value = '123456789';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.456.789');

    // Complete 11 digits
    plainInput.value = '12345678901';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.456.789-01');
  });

  it('should strip non-numeric characters', () => {
    plainInput.value = '12a.3b-4c';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.4');
  });

  it('should truncate at 11 digits maximum', () => {
    plainInput.value = '1234567890199999';
    plainInput.dispatchEvent(new Event('input'));
    expect(plainInput.value).toBe('123.456.789-01');
  });

  it('should synchronize formatted value with reactive FormControl', () => {
    formInput.value = '98765432100';
    formInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(formInput.value).toBe('987.654.321-00');
    expect(hostComponent.cpfControl.value).toBe('987.654.321-00');
  });

  it('should format pasted content cleanly', () => {
    const pasteEvent = new CustomEvent('paste', {
      bubbles: true,
      cancelable: true
    }) as any;

    pasteEvent.clipboardData = {
      getData: (format: string) => 'CPF 55544433322 extra'
    };

    plainInput.dispatchEvent(pasteEvent);
    expect(plainInput.value).toBe('555.444.333-22');
  });
});
