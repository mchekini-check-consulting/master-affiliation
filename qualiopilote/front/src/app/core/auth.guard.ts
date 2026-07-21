import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Protège l'espace back-office. Côté serveur (prérendu), on laisse passer :
 * l'app est en RenderMode.Client, la vérification réelle a lieu dans le
 * navigateur, où l'on interroge /api/auth/me pour valider le cookie de session.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  if (auth.estConnecte()) {
    return true;
  }
  return auth
    .rafraichir()
    .pipe(map((ok) => (ok ? true : router.createUrlTree(['/connexion']))));
};
