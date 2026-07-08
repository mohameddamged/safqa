import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Minimal inline-SVG icon set, used instead of a third-party icon library
 * to avoid pulling in @lucide/angular's per-icon-component API (each icon
 * is its own standalone component in that package's current major version,
 * which doesn't suit a single generic `[name]` input the way this app's
 * components are written). Every path below is hand-traced from the
 * Lucide icon set (ISC licensed) at a 24x24 viewBox, stroke-based, to match
 * the line-icon style used throughout the Figma frames (back chevron,
 * eye/eye-off toggle, checkmarks, mail, upload, close).
 */
export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'eye'
  | 'eye-off'
  | 'check'
  | 'mail'
  | 'upload'
  | 'file-check'
  | 'log-in'
  | 'circle-check'
  | 'circle-x'
  | 'info'
  | 'x'
  | 'trash'
  | 'plus'
  | 'clock'
  | 'grid'
  | 'file-text'
  | 'search'
  | 'bell'
  | 'filter'
  | 'sparkles'
  | 'arrow-right'
  | 'key'
  | 'log-out'
  | 'user';

const ICON_PATHS: Record<IconName, string> = {
  'chevron-left': '<path d="M15 18l-6-6 6-6"/>',
  'chevron-right': '<path d="M9 18l6-6-6-6"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off':
    '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61C4.13 8.07 2.18 10.4 1 12c0 0 4 7 11 7a9.92 9.92 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  upload: '<path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/>',
  'file-check':
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>',
  'log-in': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>',
  'circle-x': '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  x: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  'file-text':
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  sparkles:
    '<path d="M12 3v4M12 17v4M5 10h4M15 10h4M6.5 6.5l2 2M15.5 6.5l-2 2M6.5 17.5l2-2M15.5 17.5l-2-2"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5L19 11"/><path d="M11.5 11.5L15 15"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [innerHTML]="path"
      aria-hidden="true"
    ></svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
    `,
  ],
})
export class Icon {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;

  constructor(private readonly sanitizer: DomSanitizer) {}

  get path(): SafeHtml {
    // Safe: ICON_PATHS is a fixed, hand-authored constant defined above,
    // never derived from user input or external data.
    return this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name] ?? '');
  }
}
