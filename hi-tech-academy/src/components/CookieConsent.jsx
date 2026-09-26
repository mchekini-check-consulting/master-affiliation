import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CookieIllustration from '@/components/CookieIllustration';
import {
  CATEGORIES,
  OPEN_SETTINGS_EVENT,
  allowAll,
  denyAll,
  readConsent,
  writeConsent,
} from '@/lib/cookieConsent';

// Bandeau de consentement. Deux états : la barre courte, et le panneau de
// réglages par catégorie. « Tout refuser » est au même niveau visuel que
// « Tout accepter », comme l'exige la CNIL : même taille, même graisse, même
// poids de contour, seule la couleur de fond les distingue.

const INK = '#002d74';
const LINE = '#dbebff';
const BODY = '#243037';
const MUTED = '#5f6568';

function Button({ variant = 'solid', className = '', style = {}, ...props }) {
  const base = {
    height: 44,
    padding: '0 20px',
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'background .18s ease, color .18s ease',
    whiteSpace: 'nowrap',
  };

  const variants = {
    // Aplat marine, texte blanc.
    solid: { background: INK, color: '#ffffff', border: `1px solid ${INK}` },
    // Contour marine sur fond blanc : même surface, hiérarchie égale.
    outline: { background: '#ffffff', color: INK, border: `1px solid ${INK}` },
    // Lien discret pour ouvrir les réglages.
    ghost: { background: 'transparent', color: INK, border: '1px solid transparent', padding: '0 8px' },
  };

  return <button type="button" className={className} style={{ ...base, ...variants[variant], ...style }} {...props} />;
}

/** Interrupteur d'une catégorie. Verrouillé sur les cookies nécessaires. */
function Toggle({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: 46,
        height: 26,
        borderRadius: 9999,
        border: `1px solid ${checked ? INK : '#c9d7ee'}`,
        background: checked ? INK : '#ffffff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background .18s ease, border-color .18s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: 9999,
          background: checked ? '#ffffff' : '#9cbdff',
          transition: 'left .18s ease, background .18s ease',
        }}
      />
    </button>
  );
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [draft, setDraft] = useState(denyAll);

  // Premier rendu : le bandeau ne s'ouvre que si aucun choix valide n'existe.
  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setDraft(stored);
    } else {
      setOpen(true);
    }
  }, []);

  // Le pied de page et la page cookies rouvrent le panneau par cet événement.
  useEffect(() => {
    const reopen = () => {
      setDraft(readConsent() || denyAll());
      setShowPanel(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const decide = useCallback((choice) => {
    writeConsent(choice);
    setOpen(false);
    setShowPanel(false);
  }, []);

  // Échap referme le panneau sans rien enregistrer : ne pas choisir revient à
  // refuser, aucun cookie facultatif n'est déposé entre-temps.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && showPanel) setShowPanel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, showPanel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal={showPanel ? 'true' : undefined}
      aria-label="Gestion des cookies"
      style={{
        position: 'fixed',
        inset: showPanel ? 0 : 'auto 0 0 0',
        zIndex: 2147483600,
        display: 'flex',
        alignItems: showPanel ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: 16,
        background: showPanel ? 'rgba(0,45,116,0.45)' : 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: showPanel ? 640 : 1120,
          maxHeight: showPanel ? 'calc(var(--screen-h) - 32px)' : 'none',
          overflowY: showPanel ? 'auto' : 'visible',
          padding: showPanel ? 28 : 24,
          borderRadius: 20,
          border: `1px solid ${LINE}`,
          background: '#ffffff',
          boxShadow: '0 18px 48px rgba(0,45,116,0.22)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {showPanel ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <CookieIllustration size={44} />
              <h2 style={{ margin: 0, color: BODY, fontSize: 20, fontWeight: 700 }}>Vos préférences de cookies</h2>
            </div>
            <p style={{ margin: '0 0 20px', color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
              Choisissez catégorie par catégorie. Vous pouvez revenir sur ce choix à tout moment depuis le lien
              «&nbsp;Gestion des cookies&nbsp;» en pied de page.
            </p>

            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: 16,
                    borderRadius: 14,
                    border: `1px solid ${LINE}`,
                    background: '#f0f7ff',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: INK, fontSize: 15, fontWeight: 600 }}>{category.label}</span>
                      {category.required && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 9999,
                            background: '#9cbdff',
                            color: INK,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Toujours actifs
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: MUTED, fontSize: 13, lineHeight: 1.55 }}>{category.description}</p>
                  </div>
                  <Toggle
                    label={category.label}
                    checked={category.required ? true : draft[category.id] === true}
                    disabled={category.required}
                    onChange={(next) => setDraft((prev) => ({ ...prev, [category.id]: next }))}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => decide(denyAll())}>
                Tout refuser
              </Button>
              <Button variant="outline" onClick={() => decide(draft)}>
                Enregistrer mes choix
              </Button>
              <Button onClick={() => decide(allowAll())}>Tout accepter</Button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
            <CookieIllustration size={56} />

            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <h2 style={{ margin: '0 0 6px', color: BODY, fontSize: 17, fontWeight: 700 }}>
                Un cookie avec votre formation&nbsp;?
              </h2>
              <p style={{ margin: 0, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
                Nous utilisons des cookies pour mesurer l'audience du site et évaluer nos campagnes publicitaires. Les
                cookies nécessaires au fonctionnement restent actifs. Détail dans notre{' '}
                <Link to="/politique-cookies" style={{ color: '#002d74', fontWeight: 600, textDecoration: 'underline' }}>
                  politique cookies
                </Link>
                .
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Button variant="ghost" onClick={() => setShowPanel(true)}>
                Personnaliser
              </Button>
              <Button variant="outline" onClick={() => decide(denyAll())}>
                Tout refuser
              </Button>
              <Button onClick={() => decide(allowAll())}>Tout accepter</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
