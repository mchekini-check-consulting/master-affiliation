import { Component, EventEmitter, Input, Output } from '@angular/core';

// Équivalent visuel du Slider radix/shadcn (input range stylé)
@Component({
  selector: 'app-slider',
  template: `
    <input
      type="range"
      class="ui-slider"
      [min]="min"
      [max]="max"
      [step]="step"
      [value]="value"
      [style.--fill]="fill"
      (input)="onInput($event)" />
  `,
})
export class SliderComponent {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  get fill(): string {
    const pct = ((this.value - this.min) / (this.max - this.min)) * 100;
    return `${Math.max(0, Math.min(100, pct))}%`;
  }

  onInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value);
    this.value = v;
    this.valueChange.emit(v);
  }
}
