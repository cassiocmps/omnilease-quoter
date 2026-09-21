import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * CpfMaskDirective
 * 
 * Custom Attribute Directive for Brazilian CPF document formatting (`000.000.000-00`).
 * 
 * Architectural Highlights:
 * - Standalone Directive (`standalone: true`): Can be imported directly by any standalone component.
 * - Modern Host Binding: Uses `host` object in `@Directive` metadata instead of `@HostListener` decorators,
 *   aligning with modern Angular style recommendations for cleaner class bodies.
 * - Non-Destructive Sanitization: Strips non-digits (`/\D/g`), caps length at 11 digits, and formats
 *   progressively so users can type and backspace without formatting glitches.
 * - Dual-Channel Synchronization: Syncs the formatted string both directly to `HTMLInputElement.value`
 *   and into Angular's `NgControl` (Reactive Forms / Template-Driven forms) if present.
 */
@Directive({
  selector: '[appCpfMask]',
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
    '(paste)': 'onPaste($event)'
  }
})
export class CpfMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  /**
   * Listens to user typing events and formats the CPF in real-time.
   */
  onInput(event: Event): void {
    const input = this.elementRef.nativeElement;
    const formatted = this.formatCpf(input.value);

    // Update the visual DOM input element
    input.value = formatted;

    // Sync to Angular Reactive / Template-Driven Form control if present
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, {
        emitModelToViewChange: false,
        emitEvent: true
      });
    }
  }

  /**
   * Formats pasted text safely, stripping clipboard noise and capping at 11 digits.
   */
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') ?? '';
    const formatted = this.formatCpf(clipboardData);

    const input = this.elementRef.nativeElement;
    input.value = formatted;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, {
        emitModelToViewChange: false,
        emitEvent: true
      });
    }

    // Dispatch input event so standard DOM listeners also register the change
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Pure formatting algorithm: transforms digits into Brazilian CPF standard mask.
   * Format: 000.000.000-00
   * 
   * Progressive masking stages:
   * - <= 3 digits: "123"
   * - 4 to 6 digits: "123.456"
   * - 7 to 9 digits: "123.456.789"
   * - 10 to 11 digits: "123.456.789-01"
   */
  private formatCpf(value: string | null | undefined): string {
    if (!value) return '';

    // 1. Strip all non-numeric characters and constrain to 11 digits (Brazilian CPF length)
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
}
