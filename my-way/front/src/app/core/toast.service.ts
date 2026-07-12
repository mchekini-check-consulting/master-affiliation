import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(message: string): void { this.push(message, 'success'); }
  error(message: string): void { this.push(message, 'error'); }

  private push(message: string, type: Toast['type']): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== toast.id));
    }, 3500);
  }
}
