import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  me(): Promise<User> {
    return firstValueFrom(this.http.get<User>('/api/auth/me'));
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.me();
      return true;
    } catch {
      return false;
    }
  }

  login(email: string, password: string): Promise<User> {
    return firstValueFrom(this.http.post<User>('/api/auth/login', { email, password }));
  }

  register(fullName: string, email: string, password: string): Promise<User> {
    return firstValueFrom(this.http.post<User>('/api/auth/register', {
      full_name: fullName, email, password,
    }));
  }

  updateMe(data: Partial<User>): Promise<User> {
    return firstValueFrom(this.http.patch<User>('/api/auth/me', data));
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {}));
    window.location.href = '/';
  }

  redirectToLogin(from?: string): void {
    this.router.navigate(['/Login'], from ? { queryParams: { from } } : undefined);
  }
}
