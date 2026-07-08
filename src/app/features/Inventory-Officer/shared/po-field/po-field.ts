import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-po-field',
  standalone: true,
  template: `
    <div class="relative">
      <label class="absolute left-4 top-2 text-[10px] text-[#B5B5B5] uppercase">
        {{ label }}
      </label>
      <div class="w-full pt-6 pb-2 px-4 border border-[#B8EFEB] rounded-4xl bg-white text-[#2E1911] ">
        {{ value }}
      </div>
    </div>
  `
})
export class PoField {
  @Input() label: string = '';
  @Input() value: any = '';
}