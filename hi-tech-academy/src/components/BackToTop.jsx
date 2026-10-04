import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { INK, LINE, MINT_LIGHT } from "./design";

/**
 * Flèche fixe en bas à droite : apparaît une fois la page scrollée
 * et ramène en haut au clic.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Visible dès qu'on a scrollé au-delà de 400 px.
      setVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Revenir en haut de la page"
      // Remontée immédiate : les sections épinglées par GSAP ScrollTrigger
      // bloquent un `behavior: "smooth"` en cours de route.
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        right: "1.5rem",
        // Il se pose au-dessus de la barre fixe de la page quand il y en a une
        // (`--bottom-bar-h`), et hors de la zone réservée par l'iPhone. Il
        // recouvrait le bouton d'inscription de la page de vente.
        bottom: "calc(var(--bottom-bar-h, 0px) + 1.5rem + var(--safe-bottom, 0px))",
        zIndex: "var(--z-back-to-top)",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9999,
        border: `1px solid ${LINE}`,
        cursor: "pointer",
        // Pastille blanche : elle reste lisible sur le footer marine comme sur
        // les sections claires.
        background: hovered ? MINT_LIGHT : "#ffffff",
        color: INK,
        boxShadow: "0 6px 20px rgba(0,45,116,0.28)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity .25s ease, transform .25s ease, background .2s ease, bottom .3s ease",
      }}
    >
      <ArrowUp size={22} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
