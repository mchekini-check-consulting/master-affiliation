import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Plus, RefreshCw, X } from 'lucide-react';
import {
  adminCreateVeille, adminDeleteVeille, adminListVeille, adminMoveVeille,
} from '@/api/backend';
import { ViewHeader, bodyFont, formatDay, headingFont } from './common';

// Kanban de veille : une colonne par axe du plan de veille. Cartes créables,
// supprimables et déplaçables par glisser-déposer entre les axes.

const AXES = [
  {
    key: 'LEGALE',
    label: 'Veille légale et réglementaire',
    hint: 'Légifrance, ministère du Travail, France Compétences, OPCO, Caisse des Dépôts…',
    color: '#005064',
  },
  {
    key: 'METIERS',
    label: 'Veille métiers, compétences et emplois',
    hint: "CNCF, Linux Foundation, documentation Kubernetes, blogs DevOps/Cloud, offres d'emploi…",
    color: '#2451a6',
  },
  {
    key: 'INNOVATIONS',
    label: 'Veille innovations pédagogiques et technologiques',
    hint: 'Releases Kubernetes, KubeCon, outils de classe virtuelle, plateformes de lab, IA générative…',
    color: '#b7791f',
  },
  {
    key: 'HANDICAP',
    label: 'Veille handicap',
    hint: 'Agefiph, Ressource Handicap Formation (RHF), accessibilité numérique (RGAA)…',
    color: '#116632',
  },
];

function VeilleCard({ item, onDelete }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/veille-id', item.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="rounded-xl px-3.5 py-3 cursor-grab active:cursor-grabbing group"
      style={{ background: 'white', border: '1px solid #e0e8f4' }}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold"
          style={{ color: '#6b7a9b', ...headingFont }}>
          <CalendarDays className="w-3 h-3" />
          {formatDay(item.entry_date)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label="Supprimer la carte"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#a12626' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#1a1a2e', ...bodyFont }}>
        {item.content}
      </p>
    </div>
  );
}

function AddCardForm({ onAdd, onCancel, color }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onAdd(content.trim(), date || null);
      setContent('');
      setDate('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl p-3 space-y-2"
      style={{ background: 'white', border: `1.5px dashed ${color}` }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Source / information de veille…"
        rows={3}
        autoFocus
        className="w-full rounded-lg border px-2.5 py-2 text-xs outline-none focus:border-[#005064] resize-none"
        style={{ borderColor: '#e0e8f4', color: '#1a1a2e', ...bodyFont }} />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-[#005064]"
        style={{ borderColor: '#e0e8f4', color: '#1a1a2e', ...bodyFont }} />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
          style={{ background: color, color: 'white', ...headingFont }}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: '#f0f3fa', color: '#6b7a9b', ...headingFont }}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function VeilleView({ auth }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [addingTo, setAddingTo] = useState(null); // clé de l'axe en cours d'ajout
  const [dragOver, setDragOver] = useState(null); // colonne survolée pendant un drag

  const load = useCallback(() => {
    adminListVeille(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load]);

  const addCard = async (axis, content, entryDate) => {
    try {
      const created = await adminCreateVeille(auth, { axis, content, entryDate });
      setItems((prev) => [...prev, created]);
      setAddingTo(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteCard = async (item) => {
    setError(null);
    try {
      await adminDeleteVeille(auth, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      setError(e.message);
    }
  };

  const dropOn = async (axis, e) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/veille-id');
    if (!id) return;
    const item = items.find((i) => i.id === id);
    if (!item || item.axis === axis) return;
    // Mise à jour optimiste, rollback si l'API échoue
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, axis } : i)));
    try {
      await adminMoveVeille(auth, id, axis);
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  if (error && !items) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!items) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  return (
    <div>
      <ViewHeader
        title="Veille"
        subtitle="Tableau de suivi du plan de veille — une colonne par axe ; glissez-déposez les cartes pour les reclasser"
        actions={
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#005064', ...headingFont }}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        } />

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {AXES.map((axe) => {
          const cards = items
            .filter((i) => i.axis === axe.key)
            .sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
          return (
            <div
              key={axe.key}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(axe.key); }}
              onDragLeave={() => setDragOver((c) => (c === axe.key ? null : c))}
              onDrop={(e) => dropOn(axe.key, e)}
              className="rounded-2xl p-3 transition-colors"
              style={{
                background: dragOver === axe.key ? '#e8f0fe' : '#f0f3fa',
                border: `1.5px solid ${dragOver === axe.key ? axe.color : 'transparent'}`,
              }}>
              {/* En-tête de colonne */}
              <div className="px-1.5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold leading-tight" style={{ color: axe.color, ...headingFont }}>
                    {axe.label}
                  </h3>
                  <span
                    className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold"
                    style={{ background: 'white', color: axe.color, ...headingFont }}>
                    {cards.length}
                  </span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#6b7a9b', ...bodyFont }}>
                  {axe.hint}
                </p>
              </div>

              {/* Cartes */}
              <div className="space-y-2">
                {cards.map((item) => (
                  <VeilleCard key={item.id} item={item} onDelete={deleteCard} />
                ))}

                {addingTo === axe.key ? (
                  <AddCardForm
                    color={axe.color}
                    onAdd={(content, date) => addCard(axe.key, content, date)}
                    onCancel={() => setAddingTo(null)} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingTo(axe.key)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white"
                    style={{ color: axe.color, border: '1.5px dashed #c9d4e8', ...headingFont }}>
                    <Plus className="w-3.5 h-3.5" />
                    Nouvelle carte
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
