import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * CepMaskDirective
 * 
 * Custom Attribute Directive for Brazilian Postal Code (CEP) formatting (`00000-000`).
 * 
 * Architectural Highlights:
 * - Standalone Directive (`standalone: true`).
 * - Modern Host Binding: Uses `host` object in `@Directive` metadata instead of `@HostListener`.
 * - Dual-Channel Synchronization: Updates DOM element directly and synchronizes with `NgControl` if present.
 */
@Directive({
  selector: '[appCepMask]',
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
    '(paste)': 'onPaste($event)'
  }
})
export class CepMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  onInput(event: Event): void {
    const input = this.elementRef.nativeElement;
    const formatted = this.formatCep(input.value);

    input.value = formatted;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, {
        emitModelToViewChange: false,
        emitEvent: true
      });
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') ?? '';
    const formatted = this.formatCep(clipboardData);

    const input = this.elementRef.nativeElement;
    input.value = formatted;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, {
        emitModelToViewChange: false,
        emitEvent: true
      });
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private formatCep(value: string | null | undefined): string {
    if (!value) return '';

    const digits = value.replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 5) {
      return digits;
    }
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
}
