import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

/**
 * Square checkbox with a checkmark icon, matching "Remember Me" on Login
 * and "I agree on Brand's Terms Of Use..." on Sign-up. Label content is
 * projected so the Sign-up screen's embedded <a>Terms Of Use</a> link
 * still works without this component needing to know about routing.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true,
    },
  ],
})
export class Checkbox implements ControlValueAccessor {
  @Input() errorMessage: string | null = null;

  checked = false;
  disabled = false;
  touched = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.touched = true;
    this.onChange(this.checked);
    this.onTouched();
  }
}
