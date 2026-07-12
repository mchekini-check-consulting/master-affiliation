import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="anim-fade-up rounded-lg px-4 py-3 text-sm font-medium shadow-lg border"
          [class]="toast.type === 'success'
            ? 'bg-white border-emerald-200 text-slate-900'
            : 'bg-white border-red-200 text-red-700'">
          <span class="mr-2">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
          {{ toast.message }}
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  protected toastService = inject(ToastService);
}
