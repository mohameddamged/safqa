import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

/**
 * Pill-shaped file picker matching "Add A PDF Of The Tax ID (Front/Back)" /
 * "Tax ID Photo (Front/Back)" on the Company and Vendor sign-up screens.
 * Backend's BeValidImage rule (RegisterCompanyDtoValidator /
 * RegisterVendorDtoValidator) only accepts image files despite the UI
 * label saying "PDF" - `accept` defaults to image MIME types to match the
 * actual server-side rule rather than the (seemingly inaccurate) label text.
 */
@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './file-input.html',
  styleUrl: './file-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInput),
      multi: true,
    },
  ],
})
export class FileInput implements ControlValueAccessor {
  @ViewChild('fileRef') fileRef!: ElementRef<HTMLInputElement>;

  @Input() label = 'Upload file';
  @Input() accept = 'image/png,image/jpeg,image/webp';
  @Input() errorMessage: string | null = null;

  file: File | null = null;
  disabled = false;
  touched = false;

  private onChange: (value: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: File | null): void {
    this.file = value;
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openPicker(): void {
    if (!this.disabled) {
      this.fileRef.nativeElement.click();
    }
  }

  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0] ?? null;
    this.file = selected;
    this.touched = true;
    this.onChange(selected);
    this.onTouched();
  }
}
