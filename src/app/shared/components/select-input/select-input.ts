import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

/**
 * Pill-shaped <select> matching TextInput's exact visual language (thin
 * teal border, floating label, same height/radius/colors) - introduced
 * for the invite-user role dropdown, since no select-style field existed
 * anywhere in the shared component set before now. Implements
 * ControlValueAccessor like every other form field in shared/components,
 * so it plugs into formControlName the same way.
 */
@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-input.html',
  styleUrl: './select-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectInput),
      multi: true,
    },
  ],
})
export class SelectInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() required = false;
  @Input() errorMessage: string | null = null;
  @Input() placeholder = 'Select...';
  @Input() options: SelectOption[] = [];

  @Output() blurred = new EventEmitter<void>();

  value: string | number | null = null;
  disabled = false;
  touched = false;

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    // Coerce back to a number when every option value is numeric (the
    // CompanyRole id case) so the emitted form value matches what the
    // backend expects rather than always being a string.
    const matched = this.options.find((o) => String(o.value) === raw);
    const value = matched ? matched.value : raw;
    this.value = value;
    this.onChange(value);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
    this.blurred.emit();
  }
}
