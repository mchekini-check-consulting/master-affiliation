import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';

/** Profil retourné par /api/auth/me (JSON snake_case). */
export interface SessionUtilisateur {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface SessionOrganisme {
  id: string;
  nom: string;
  slug: string;
}

/** { MODULE: [ACTIONS...] } — modules accessibles et actions autorisées. */
export type Permissions = Record<string, string[]>;

export interface Session {
  user: SessionUtilisateur;
  organization: SessionOrganisme;
  permissions: Permissions;
}

/**
 * Authentification réelle par session (cookie) contre l'API Spring Security.
 * withCredentials envoie/reçoit le cookie de session sur chaque appel.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private static readonly API = '/api/auth';
  private static readonly OPTS = { withCredentials: true } as const;

  private readonly _session = signal<Session | null>(null);

  readonly session = this._session.asReadonly();
  readonly estConnecte = computed(() => this._session() !== null);

  login(email: string, motDePasse: string): Observable<Session> {
    return this.http
      .post<Session>(`${AuthService.API}/login`, { email, password: motDePasse }, AuthService.OPTS)
      .pipe(tap((s) => this._session.set(s)));
  }

  /** Recharge la session depuis le cookie ; renvoie false si non authentifié. */
  rafraichir(): Observable<boolean> {
    return this.http.get<Session>(`${AuthService.API}/me`, AuthService.OPTS).pipe(
      tap((s) => this._session.set(s)),
      map(() => true),
      catchError(() => {
        this._session.set(null);
        return of(false);
      }),
    );
  }

  deconnexion(): Observable<void> {
    return this.http
      .post<void>(`${AuthService.API}/logout`, {}, AuthService.OPTS)
      .pipe(tap(() => this._session.set(null)));
  }

  /** Vrai si l'utilisateur courant peut réaliser `action` sur `module`. */
  peut(module: string, action = 'VOIR'): boolean {
    const perms = this._session()?.permissions;
    return !!perms && (perms[module]?.includes(action) ?? false);
  }
}
