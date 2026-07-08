import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

/**
 * Pill-shaped text input with an inline floating label (e.g. "E-mail *"),
 * matching the Login / Sign-up frame style exactly: thin teal border,
 * warm off-white fill, fully rounded ends.
 *
 * Implements ControlValueAccessor so it plugs directly into
 * formControlName/formControl like any native input, e.g.:
 *   <app-text-input formControlName="email" label="E-mail" type="email" />
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInput),
      multi: true,
    },
  ],
})
export class TextInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'tel' = 'text';
  @Input() required = false;
  @Input() autocomplete = 'off';
  @Input() errorMessage: string | null = null;
  @Input() hint: string | null = null;

  @Output() blurred = new EventEmitter<void>();

  value = '';
  disabled = false;
  touched = false;

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
}
