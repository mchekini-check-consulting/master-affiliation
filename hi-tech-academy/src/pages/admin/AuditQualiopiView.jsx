import React from 'react';
import AuditQualiopiContent from '@/components/AuditQualiopiContent';
import { ViewHeader } from './common';
import { AUDIT_STATS } from '@/data/auditQualiopi';

// Onglet « Audit Qualiopi » : dossier de preuves organisé par critère du
// Référentiel National Qualité, consultable avec la visionneuse intégrée.
export default function AuditQualiopiView() {
  return (
    <div>
      <ViewHeader
        title="Audit Qualiopi"
        subtitle={`Dossier de preuves — Référentiel National Qualité · Périmètre : actions de formation (art. L.6313-1) · ${AUDIT_STATS.applicable}/${AUDIT_STATS.indicators} indicateurs applicables · ${AUDIT_STATS.documents} documents`} />
      <AuditQualiopiContent />
    </div>
  );
}
