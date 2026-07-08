import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Six-box OTP entry, matching the "Check your e-mail" verification screens
 * used for both account verification and password reset. Exposes its value
 * as a single 6-character string through ControlValueAccessor, so
 * `formControlName="code"` on the parent form receives "123456" rather than
 * an array of digits - directly usable as VerifyAccountRequest.code /
 * VerifyResetCodeRequest.code.
 */
@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInput),
      multi: true,
    },
  ],
})
export class OtpInput implements ControlValueAccessor {
  @ViewChildren('digitBox') digitBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  readonly length = 6;
  digits: string[] = Array(this.length).fill('');
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    const chars = (value ?? '').split('').slice(0, this.length);
    this.digits = Array.from({ length: this.length }, (_, i) => chars[i] ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/\D/g, '');

    if (rawValue.length > 1) {
      // Treat a multi-character value landing in one box as a paste.
      this.distributeFromIndex(index, rawValue);
      return;
    }

    this.digits[index] = rawValue;
    this.emitValue();

    if (rawValue && index < this.length - 1) {
      this.focusBox(index + 1);
    }
  }

  handleKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusBox(index - 1);
    }
  }

  handlePaste(index: number, event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digitsOnly = pasted.replace(/\D/g, '');
    if (!digitsOnly) return;

    event.preventDefault();
    this.distributeFromIndex(index, digitsOnly);
  }

  private distributeFromIndex(startIndex: number, value: string): void {
    const chars = value.split('');
    let cursor = startIndex;

    for (const char of chars) {
      if (cursor >= this.length) break;
      this.digits[cursor] = char;
      cursor++;
    }

    this.emitValue();
    this.focusBox(Math.min(cursor, this.length - 1));
  }

  private focusBox(index: number): void {
    requestAnimationFrame(() => {
      this.digitBoxes?.get(index)?.nativeElement.focus();
    });
  }

  private emitValue(): void {
    const value = this.digits.join('');
    this.onChange(value);
    if (value.length === this.length) {
      this.onTouched();
    }
  }
}
