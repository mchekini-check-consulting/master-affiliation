import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'qualiopilote-auth';

/**
 * Authentification factice (temporaire) : identifiants en dur test / test,
 * état de session conservé en localStorage. Sera remplacé par la vraie
 * authentification multi-tenant (Better Auth / Spring Security) en phase 0.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Identifiants de démonstration. */
  private static readonly IDENTIFIANT = 'test';
  private static readonly MOT_DE_PASSE = 'test';

  login(identifiant: string, motDePasse: string): boolean {
    const ok =
      identifiant.trim() === AuthService.IDENTIFIANT &&
      motDePasse === AuthService.MOT_DE_PASSE;
    if (ok && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    return ok;
  }

  estConnecte(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  deconnexion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
