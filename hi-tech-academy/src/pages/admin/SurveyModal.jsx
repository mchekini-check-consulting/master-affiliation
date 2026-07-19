import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { bodyFont, formatDate, headingFont } from './common';

// Affichage « grand format » des réponses à un questionnaire : une carte par
// question, libellé complet + réponse très lisible, sections numérotées.

// Une réponse libre (texte)
export function Answer({ question, answer }) {
  const empty = answer === null || answer === undefined || answer === '';
  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7a9b', ...headingFont }}>
        {question}
      </p>
      {empty ? (
        <p className="text-sm italic" style={{ color: '#a3aec7', ...bodyFont }}>Non renseigné</p>
      ) : (
        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#001a4a', ...bodyFont }}>
          {answer === true ? 'Oui' : answer === false ? 'Non' : answer}
        </p>
      )}
    </div>
  );
}

// Une auto-évaluation : toutes les options affichées, la réponse en surbrillance
export function LevelAnswer({ question, options, value }) {
  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6b7a9b', ...headingFont }}>
        {question}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <span
              key={option}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: selected ? '#005064' : 'white',
                color: selected ? 'white' : '#a3aec7',
                border: selected ? '1.5px solid #005064' : '1px solid #e0e8f4',
                ...headingFont,
              }}>
              {option}
            </span>
          );
        })}
        {!value && (
          <span className="text-sm italic self-center" style={{ color: '#a3aec7', ...bodyFont }}>
            Non renseigné
          </span>
        )}
      </div>
    </div>
  );
}

export function SurveySection({ title, children }) {
  return (
    <section className="mb-8">
      <h3 className="font-bold text-base mb-4" style={{ color: '#001a4a', ...headingFont }}>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * Modal plein écran d'affichage des réponses.
 * props : title, subtitle, submittedAt, badge (nœud optionnel, ex : note), children (sections)
 */
export default function SurveyModal({ title, subtitle, submittedAt, badge, onClose, children }) {
  // Fermeture avec Échap ; bloque le scroll de la page derrière
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,26,74,0.45)' }}
      onClick={onClose}>
      <div
        className="max-w-3xl mx-auto my-8 rounded-3xl overflow-hidden"
        style={{ background: 'white' }}
        onClick={(e) => e.stopPropagation()}>

        {/* En-tête */}
        <div className="px-6 sm:px-10 py-6 flex items-start justify-between gap-4" style={{ background: '#001a4a' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'white', ...headingFont }}>{title}</h2>
            <p className="text-sm mt-1" style={{ color: '#8ba0c4', ...bodyFont }}>
              {subtitle}
              {submittedAt ? ` · répondu le ${formatDate(submittedAt)}` : ''}
            </p>
            {badge && <div className="mt-3">{badge}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X className="w-5 h-5" style={{ color: 'white' }} />
          </button>
        </div>

        {/* Réponses */}
        <div className="px-6 sm:px-10 py-8">
          {children}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-sm"
            style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
