import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Icon } from '../icon/icon';

/**
 * Password field with a visibility toggle (eye / eye-off), matching every
 * password field across the Login, Sign-up, Change Password, and Reset
 * Password frames. Implements ControlValueAccessor like TextInput.
 */
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Icon],
  templateUrl: './password-input.html',
  styleUrl: './password-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInput),
      multi: true,
    },
  ],
})
export class PasswordInput implements ControlValueAccessor {
  @Input() label = 'Password';
  @Input() required = false;
  @Input() autocomplete = 'current-password';
  @Input() errorMessage: string | null = null;

  @Output() blurred = new EventEmitter<void>();

  value = '';
  disabled = false;
  touched = false;
  visible = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
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

  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
    this.blurred.emit();
  }

  toggleVisibility(): void {
    this.visible = !this.visible;
  }
}
