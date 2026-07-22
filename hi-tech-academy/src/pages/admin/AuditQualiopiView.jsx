import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import AuditQualiopiContent from '@/components/AuditQualiopiContent';
import { ViewHeader, headingFont } from './common';
import { AUDIT_STATS } from '@/data/auditQualiopi';

// Onglet « Audit Qualiopi » : dossier de preuves organisé par critère du
// Référentiel National Qualité (contenu partagé avec la page publique
// /audit-qualiopi).
export default function AuditQualiopiView() {
  return (
    <div>
      <ViewHeader
        title="Audit Qualiopi"
        subtitle={`Dossier de preuves — Référentiel National Qualité · Périmètre : actions de formation (art. L.6313-1) · ${AUDIT_STATS.applicable}/${AUDIT_STATS.indicators} indicateurs applicables · ${AUDIT_STATS.documents} documents`}
        actions={
          <Link
            to="/audit-qualiopi"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#005064', ...headingFont }}>
            <ExternalLink className="w-4 h-4" />
            Voir la page publique
          </Link>
        } />
      <AuditQualiopiContent />
    </div>
  );
}
