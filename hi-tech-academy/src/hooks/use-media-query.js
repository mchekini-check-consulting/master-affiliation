import { useEffect, useState } from 'react';

// Suit une media query CSS. La valeur initiale est lue tout de suite : le
// premier rendu est déjà le bon, sans bascule visible au chargement.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
