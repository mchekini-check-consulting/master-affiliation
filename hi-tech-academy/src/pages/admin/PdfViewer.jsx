import React, { useEffect } from 'react';
import { Download, X } from 'lucide-react';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

/**
 * Visionneuse PDF intégrée : affiche le document dans l'application
 * (iframe plein écran) avec téléchargement et fermeture — utilisée pour
 * les documents Qualiopi statiques comme pour les certificats générés.
 */
export default function PdfViewer({ title, url, onDownload, onClose }) {
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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,26,74,0.75)' }}>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-3" style={{ background: '#001a4a' }}>
        <p className="text-sm font-bold truncate" style={{ color: 'white', ...headingFont }}>
          {title}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <X className="w-5 h-5" style={{ color: 'white' }} />
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 px-2 sm:px-8 pb-4 pt-2 min-h-0" onClick={onClose}>
        <iframe
          title={title}
          src={url}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full rounded-xl"
          style={{ background: 'white', border: 'none' }} />
      </div>
    </div>
  );
}
