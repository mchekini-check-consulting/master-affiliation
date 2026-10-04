import { useEffect } from 'react';

// Publie la hauteur d'une barre fixée en bas d'écran dans `--bottom-bar-h`
// (sur <html>). Le bouton « retour en haut » s'en sert pour se placer
// au-dessus de la barre au lieu de la recouvrir. Une seule barre par page.
export function useBottomBar(ref, active) {
  useEffect(() => {
    const racine = document.documentElement;
    const element = ref.current;
    if (!active || !element) {
      racine.style.setProperty('--bottom-bar-h', '0px');
      return undefined;
    }

    const publier = () => {
      racine.style.setProperty('--bottom-bar-h', `${Math.round(element.getBoundingClientRect().height)}px`);
    };
    publier();

    // La hauteur change quand le libellé du bouton passe sur deux lignes.
    const observateur = new ResizeObserver(publier);
    observateur.observe(element);

    return () => {
      observateur.disconnect();
      racine.style.setProperty('--bottom-bar-h', '0px');
    };
  }, [ref, active]);
}
