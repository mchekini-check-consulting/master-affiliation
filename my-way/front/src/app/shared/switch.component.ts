import { Component, EventEmitter, Input, Output } from '@angular/core';

// Équivalent visuel du Switch radix/shadcn
@Component({
  selector: 'app-switch',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked"
      (click)="toggle()"
      class="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      [class.bg-primary]="checked"
      [class.bg-input]="!checked">
      <span
        class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform"
        [class.translate-x-5]="checked"
        [class.translate-x-0]="!checked"></span>
    </button>
  `,
})
export class SwitchComponent {
  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
