import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ContactMessage } from './models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  send(message: ContactMessage): Promise<void> {
    return firstValueFrom(this.http.post<void>('/api/contact-messages', message));
  }
}
