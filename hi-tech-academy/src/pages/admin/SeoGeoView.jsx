import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, CalendarClock, ChevronDown, ChevronRight, Eye, PenLine, Play, Plus, RefreshCw,
  RotateCcw, Send, Trash2, TrendingDown, TrendingUp, X,
} from 'lucide-react';
import {
  adminCreateSeoKeyword, adminDeleteSeoKeyword, adminGetSeoArticle, adminGetSeoConfig,
  adminLaunchSeoRun, adminListSeoArticles, adminListSeoKeywords, adminListSeoRuns,
  adminListSeoSuggestions, adminPublishSeoArticleNow, adminRetrySeoKeyword,
  adminUpdateSeoArticle, adminUpdateSeoConfig, adminUpdateSeoSuggestion,
} from '@/api/backend';
import { Card, ViewHeader, bodyFont, formatDate, headingFont } from './common';

// Onglet SEO / GEO : pilotage humain du pipeline d'articles — choix des
// mots-clés piliers, activation de l'agent, lancement manuel d'un run avec
// suivi de l'étape en cours, validation et planification des articles.

const KEYWORD_STATUS = {
  to_process: { label: 'À analyser', background: '#f0f3fa', color: '#005064' },
  processing: { label: 'En cours', background: '#fdf3e2', color: '#8a5a00' },
  done: { label: 'Analysé', background: '#e5f6ec', color: '#116632' },
  error: { label: 'Erreur', background: '#fdecec', color: '#a12626' },
};

const SUGGESTION_STATUS = {
  suggested: { label: 'Proposé', background: '#f0f3fa', color: '#6b7a9b' },
  selected: { label: 'Sélectionné', background: '#e8f0fe', color: '#2451a6' },
  writing: { label: 'Rédaction…', background: '#fdf3e2', color: '#8a5a00' },
  written: { label: 'Rédigé', background: '#e5f6ec', color: '#116632' },
  error: { label: 'Erreur', background: '#fdecec', color: '#a12626' },
};

const SUGGESTION_SOURCE = {
  seed: 'Pilier',
  gap: 'Gap concurrent',
  ideas: 'Idées',
  related: 'Associé',
};

const INTENT_LABELS = {
  informational: 'Informationnelle',
  commercial: 'Commerciale',
  transactional: 'Transactionnelle',
  navigational: 'Navigationnelle',
  unknown: '—',
};

/** Tendance 12 mois : variation entre le début et la fin de la série. */
function TrendCell({ trendJson }) {
  let trend = [];
  try { trend = JSON.parse(trendJson || '[]'); } catch { /* série illisible */ }
  if (!Array.isArray(trend) || trend.length < 2 || trend[0] === 0) {
    return <span style={{ color: '#6b7a9b' }}>—</span>;
  }
  const delta = Math.round(((trend.at(-1) - trend[0]) / trend[0]) * 100);
  if (Math.abs(delta) < 10) return <span style={{ color: '#6b7a9b' }}>stable</span>;
  const up = delta > 0;
  return (
    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: up ? '#116632' : '#a12626' }}>
      {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {up ? '+' : ''}{delta} %
    </span>
  );
}

const ARTICLE_STATUS = {
  to_validate: { label: 'À valider', background: '#fdf3e2', color: '#8a5a00' },
  validated: { label: 'Validé', background: '#e5f6ec', color: '#116632' },
  rejected: { label: 'Rejeté', background: '#fdecec', color: '#a12626' },
  pending: { label: 'En attente', background: '#f0f3fa', color: '#6b7a9b' },
  published: { label: 'Publié', background: '#f0f3fa', color: '#005064' },
};

const RUN_STATUS = {
  requested: { label: 'Demandé', background: '#fdf3e2', color: '#8a5a00' },
  running: { label: 'En cours', background: '#e8f0fe', color: '#2451a6' },
  done: { label: 'Terminé', background: '#e5f6ec', color: '#116632' },
  error: { label: 'Erreur', background: '#fdecec', color: '#a12626' },
  skipped: { label: 'Ignoré', background: '#f0f3fa', color: '#6b7a9b' },
};

const RUN_TRIGGER = { cron: 'Cron', manual: 'Manuel' };

function SeoBadge({ meta, value }) {
  const m = meta[value] ?? { label: value, background: '#f0f3fa', color: '#6b7a9b' };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: m.background, color: m.color, ...headingFont }}>
      {m.label}
    </span>
  );
}

function Th({ children, className = '' }) {
  return (
    <th
      className={`px-3 py-2.5 text-left text-[11px] uppercase tracking-wide font-semibold whitespace-nowrap ${className}`}
      style={{ color: '#6b7a9b', ...headingFont }}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return (
    <td className={`px-3 py-3 text-sm align-middle ${className}`} style={{ color: '#001a4a', ...bodyFont }}>
      {children}
    </td>
  );
}

// --- Conversion publish_at ↔ input datetime-local ---------------------
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : null;
}

// --- Rendu Markdown minimal pour la prévisualisation -------------------
function renderInline(text, keyPrefix) {
  // **gras**, *italique*, `code`, [texte](url)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={key} className="px-1 rounded text-[0.9em]" style={{ background: '#f0f3fa' }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noreferrer" className="underline" style={{ color: '#005064' }}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function MarkdownPreview({ md }) {
  const blocks = useMemo(() => {
    const lines = (md ?? '').split('\n');
    const out = [];
    let list = null; // { ordered, items }
    const flushList = () => {
      if (list) { out.push(list); list = null; }
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      const heading = /^(#{1,4})\s+(.*)$/.exec(line);
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
      if (heading) {
        flushList();
        out.push({ type: `h${heading[1].length}`, text: heading[2] });
      } else if (bullet || ordered) {
        const item = (bullet ?? ordered)[1];
        const isOrdered = Boolean(ordered);
        if (!list || list.orderedList !== isOrdered) {
          flushList();
          list = { type: 'list', orderedList: isOrdered, items: [] };
        }
        list.items.push(item);
      } else if (line.trim() === '') {
        flushList();
      } else {
        flushList();
        out.push({ type: 'p', text: line });
      }
    }
    flushList();
    return out;
  }, [md]);

  const headingStyles = {
    h1: 'text-2xl font-bold mt-2 mb-3',
    h2: 'text-xl font-bold mt-6 mb-2',
    h3: 'text-lg font-bold mt-5 mb-2',
    h4: 'text-base font-bold mt-4 mb-1.5',
  };

  return (
    <div style={{ color: '#1a1a2e', ...bodyFont }}>
      {blocks.map((block, i) => {
        if (block.type === 'list') {
          const Tag = block.orderedList ? 'ol' : 'ul';
          return (
            <Tag key={i} className={`${block.orderedList ? 'list-decimal' : 'list-disc'} pl-6 mb-3 space-y-1 text-sm leading-relaxed`}>
              {block.items.map((item, j) => <li key={j}>{renderInline(item, `${i}-${j}`)}</li>)}
            </Tag>
          );
        }
        if (block.type === 'p') {
          return <p key={i} className="text-sm leading-relaxed mb-3">{renderInline(block.text, i)}</p>;
        }
        const Tag = block.type;
        return (
          <Tag key={i} className={headingStyles[block.type]} style={{ color: '#001a4a', ...headingFont }}>
            {renderInline(block.text, i)}
          </Tag>
        );
      })}
    </div>
  );
}

// --- Modale de prévisualisation d'un article ---------------------------
function PreviewModal({ article, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,26,74,0.45)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-full flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'white' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 px-6 py-4" style={{ borderBottom: '1px solid #e0e8f4' }}>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#6b7a9b', ...headingFont }}>
              Aperçu — mot-clé « {article.keyword} »
            </p>
            <h3 className="text-lg font-bold truncate" style={{ color: '#001a4a', ...headingFont }}>
              {article.title}
            </h3>
            {article.meta_description && (
              <p className="text-xs mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
                {article.meta_description}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" style={{ color: '#6b7a9b' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          {article.audit_score != null && (
            <p className="text-xs mb-4 rounded-xl px-4 py-2.5 inline-block"
              style={{ background: article.audit_score >= 80 ? '#e5f6ec' : '#fdf3e2', color: article.audit_score >= 80 ? '#116632' : '#8a5a00', ...bodyFont }}>
              Score d'auto-audit : <strong>{article.audit_score}/100</strong>
            </p>
          )}
          <MarkdownPreview md={article.body_md} />
        </div>
      </div>
    </div>
  );
}

// --- Vue principale -----------------------------------------------------
export default function SeoGeoView({ auth }) {
  const [config, setConfig] = useState(null);
  const [keywords, setKeywords] = useState(null);
  const [articles, setArticles] = useState(null);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [adding, setAdding] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [preview, setPreview] = useState(null);
  const [publishEdits, setPublishEdits] = useState({}); // id -> valeur datetime-local
  const [expanded, setExpanded] = useState({});         // keywordId -> bool
  const [suggestionsByKw, setSuggestionsByKw] = useState({}); // keywordId -> liste
  const pollRef = useRef(null);
  const loadedSuggestionsRef = useRef(new Set());       // piliers dont les suggestions sont chargées

  const load = useCallback(async () => {
    try {
      const [cfg, kws, arts, rns] = await Promise.all([
        adminGetSeoConfig(auth),
        adminListSeoKeywords(auth),
        adminListSeoArticles(auth),
        adminListSeoRuns(auth),
      ]);
      setConfig(cfg);
      setKeywords(kws);
      setArticles(arts);
      setRuns(rns);
      // Rafraîchit aussi les suggestions déjà affichées (statuts en direct)
      for (const keywordId of loadedSuggestionsRef.current) {
        adminListSeoSuggestions(auth, keywordId)
          .then((list) => setSuggestionsByKw((prev) => ({ ...prev, [keywordId]: list })))
          .catch(() => {});
      }
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [auth]);

  useEffect(() => { load(); }, [load]);

  const activeRun = runs.find((r) => r.status === 'requested' || r.status === 'running') ?? null;

  // Rafraîchissement automatique tant qu'un run est actif
  useEffect(() => {
    if (activeRun && !pollRef.current) {
      pollRef.current = setInterval(load, 5000);
    }
    if (!activeRun && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [activeRun, load]);

  const toggleAgent = async () => {
    try {
      setConfig(await adminUpdateSeoConfig(auth, !config.agent_enabled));
    } catch (e) {
      setError(e.message);
    }
  };

  const launch = async () => {
    setLaunching(true);
    setError(null);
    try {
      await adminLaunchSeoRun(auth);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await adminCreateSeoKeyword(auth, newKeyword.trim());
      setKeywords((prev) => [created, ...prev]);
      setNewKeyword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const deleteKeyword = async (kw) => {
    setError(null);
    try {
      await adminDeleteSeoKeyword(auth, kw.id);
      setKeywords((prev) => prev.filter((k) => k.id !== kw.id));
    } catch (e) {
      setError(e.message);
    }
  };

  const retryKeyword = async (kw) => {
    setError(null);
    try {
      const updated = await adminRetrySeoKeyword(auth, kw.id);
      setKeywords((prev) => prev.map((k) => (k.id === kw.id ? updated : k)));
    } catch (e) {
      setError(e.message);
    }
  };

  // Dépliage d'un pilier : charge ses mots-clés proposés
  const toggleExpand = async (kw) => {
    const isOpen = Boolean(expanded[kw.id]);
    setExpanded((prev) => ({ ...prev, [kw.id]: !isOpen }));
    if (!isOpen && !suggestionsByKw[kw.id]) {
      try {
        const list = await adminListSeoSuggestions(auth, kw.id);
        loadedSuggestionsRef.current.add(kw.id);
        setSuggestionsByKw((prev) => ({ ...prev, [kw.id]: list }));
      } catch (e) {
        setError(e.message);
      }
    }
  };

  // Cocher / décocher un mot-clé proposé (sélection pour rédaction)
  const toggleSuggestion = async (suggestion) => {
    const next = suggestion.status === 'selected' ? 'suggested' : 'selected';
    setError(null);
    try {
      const updated = await adminUpdateSeoSuggestion(auth, suggestion.id, next);
      setSuggestionsByKw((prev) => ({
        ...prev,
        [suggestion.keyword_id]: prev[suggestion.keyword_id]
          .map((s) => (s.id === suggestion.id ? updated : s)),
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  const selectedCount = Object.values(suggestionsByKw)
    .flat()
    .filter((s) => s.status === 'selected').length;

  const setArticleStatus = async (article, status) => {
    setError(null);
    try {
      const updated = await adminUpdateSeoArticle(auth, article.id, { status });
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
    } catch (e) {
      setError(e.message);
    }
  };

  // Publication immédiate : l'article est en ligne sur /blog tout de suite
  const publishNow = async (article) => {
    setError(null);
    try {
      const updated = await adminPublishSeoArticleNow(auth, article.id);
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
    } catch (e) {
      setError(e.message);
    }
  };

  const savePublishAt = async (article) => {
    const edited = publishEdits[article.id];
    if (edited === undefined || edited === toLocalInput(article.publish_at)) return;
    if (!edited) return; // pas de date vide : garder l'existante
    setError(null);
    try {
      const updated = await adminUpdateSeoArticle(auth, article.id, { publishAt: fromLocalInput(edited) });
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
      setPublishEdits((prev) => { const next = { ...prev }; delete next[article.id]; return next; });
    } catch (e) {
      setError(e.message);
    }
  };

  const openPreview = async (articleId) => {
    setError(null);
    try {
      setPreview(await adminGetSeoArticle(auth, articleId));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !config) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!config || !keywords || !articles) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  const lastFinishedRun = runs.find((r) => r.status === 'done' || r.status === 'error' || r.status === 'skipped');

  return (
    <div>
      <ViewHeader
        title="SEO / GEO"
        subtitle="Pipeline d'articles piloté par agents — mots-clés piliers, validation et planification des publications"
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

      {/* --- Pilotage de l'agent ------------------------------------- */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: config.agent_enabled ? '#e5f6ec' : '#f0f3fa' }}>
              <Bot className="w-5 h-5" style={{ color: config.agent_enabled ? '#116632' : '#6b7a9b' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#001a4a', ...headingFont }}>
                Recherche agent {config.agent_enabled ? 'activée' : 'désactivée'}
              </p>
              <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                Désactivée : aucun appel DataForSEO ni LLM (runs de 00 h et 12 h court-circuités).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle */}
            <button
              type="button"
              onClick={toggleAgent}
              role="switch"
              aria-checked={config.agent_enabled}
              aria-label="Recherche agent activée"
              className="relative w-12 h-7 rounded-full transition-colors"
              style={{ background: config.agent_enabled ? '#116632' : '#c9d4e8' }}>
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: config.agent_enabled ? 24 : 4 }} />
            </button>

            <button
              type="button"
              onClick={launch}
              disabled={!config.agent_enabled || Boolean(activeRun) || launching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              <Play className="w-4 h-4" />
              {launching ? 'Lancement…' : "Lancer l'agent"}
            </button>
          </div>
        </div>

        {/* Avancement du run actif */}
        {activeRun && (
          <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: '#e8f0fe' }}>
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" style={{ color: '#2451a6' }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#2451a6', ...headingFont }}>
                {activeRun.status === 'requested'
                  ? "Run demandé — en attente de prise en charge par l'orchestrateur"
                  : activeRun.current_step ?? 'Run en cours…'}
              </p>
              <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                {activeRun.current_keyword ? `Mot-clé : ${activeRun.current_keyword} · ` : ''}
                {activeRun.keywords_processed} mot(s)-clé(s) traité(s) · déclenché {RUN_TRIGGER[activeRun.trigger]?.toLowerCase() ?? ''} · {formatDate(activeRun.created_at)}
              </p>
            </div>
          </div>
        )}

        {/* Historique des runs */}
        {runs.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                  <Th>Déclencheur</Th>
                  <Th>Statut</Th>
                  <Th>Étape</Th>
                  <Th>Mots-clés</Th>
                  <Th>Articles publiés</Th>
                  <Th>Coût</Th>
                  <Th>Début</Th>
                  <Th>Fin</Th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 5).map((run) => (
                  <tr key={run.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                    <Td>{RUN_TRIGGER[run.trigger] ?? run.trigger}</Td>
                    <Td><SeoBadge meta={RUN_STATUS} value={run.status} /></Td>
                    <Td className="max-w-[280px]">
                      <span className="block truncate" title={run.error ?? run.current_step ?? ''}>
                        {run.status === 'error' ? (run.error ?? '—') : (run.current_step ?? '—')}
                      </span>
                    </Td>
                    <Td>{run.keywords_processed}</Td>
                    <Td>{run.articles_published}</Td>
                    <Td>{run.cost_usd != null ? `${run.cost_usd.toFixed(3)} $` : '—'}</Td>
                    <Td>{formatDate(run.started_at ?? run.created_at)}</Td>
                    <Td>{formatDate(run.finished_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {runs.length === 0 && (
          <p className="mt-4 text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
            Aucun run pour l'instant — les exécutions planifiées (00 h / 12 h) et manuelles apparaîtront ici.
          </p>
        )}
        {!activeRun && lastFinishedRun?.status === 'error' && (
          <p className="mt-3 text-xs rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
            Dernier run en erreur : {lastFinishedRun.error ?? 'erreur inconnue'}
          </p>
        )}
      </Card>

      {/* --- Section 1 : mots-clés ------------------------------------ */}
      <Card title="Choix des mots-clés" className="mb-6">
        <form onSubmit={addKeyword} className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Nouveau mot-clé pilier (ex. formation kubernetes cpf)…"
            className="flex-1 min-w-[240px] rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-[#005064]"
            style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
          <span className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>France · fr</span>
          <button
            type="submit"
            disabled={adding || !newKeyword.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            <Plus className="w-4 h-4" />
            {adding ? 'Ajout…' : 'Ajouter'}
          </button>
        </form>

        {keywords.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
            Aucun mot-clé — ajoutez les requêtes pilier : l'agent proposera ensuite les
            mots-clés proches avec leurs métriques, et vous choisirez ceux à rédiger.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                  <Th>Mot-clé pilier</Th>
                  <Th>Localisation</Th>
                  <Th>Statut</Th>
                  <Th>Ajouté le</Th>
                  <Th>Dernier run</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const isOpen = Boolean(expanded[kw.id]);
                  const list = suggestionsByKw[kw.id];
                  return (
                    <React.Fragment key={kw.id}>
                      <tr style={{ borderBottom: isOpen ? 'none' : '1px solid #f0f3fa' }}>
                        <Td>
                          <button
                            type="button"
                            onClick={() => toggleExpand(kw)}
                            className="inline-flex items-center gap-1.5 font-semibold text-left"
                            title="Voir les mots-clés proposés"
                            style={{ color: '#001a4a', ...headingFont }}>
                            {isOpen
                              ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#005064' }} />
                              : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#6b7a9b' }} />}
                            {kw.keyword}
                          </button>
                          {kw.status === 'error' && kw.error_message && (
                            <span className="block text-xs mt-0.5 pl-6" style={{ color: '#a12626' }}>{kw.error_message}</span>
                          )}
                        </Td>
                        <Td>{kw.location_code === 2250 ? 'France' : kw.location_code} · {kw.language_code}</Td>
                        <Td><SeoBadge meta={KEYWORD_STATUS} value={kw.status} /></Td>
                        <Td>{formatDate(kw.created_at)}</Td>
                        <Td>{formatDate(kw.last_run_at)}</Td>
                        <Td className="text-right whitespace-nowrap">
                          {(kw.status === 'done' || kw.status === 'error') && (
                            <button
                              type="button"
                              onClick={() => retryKeyword(kw)}
                              title="Relancer l'analyse (repasse à « À analyser »)"
                              className="inline-flex items-center gap-1 text-xs font-bold mr-3"
                              style={{ color: '#8a5a00', ...headingFont }}>
                              <RotateCcw className="w-3.5 h-3.5" />
                              Réanalyser
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteKeyword(kw)}
                            title="Supprimer le mot-clé et ses propositions"
                            className="inline-flex items-center text-xs font-bold"
                            style={{ color: '#a12626', ...headingFont }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Td>
                      </tr>

                      {/* Mots-clés proposés par la recherche : sélection manuelle */}
                      {isOpen && (
                        <tr style={{ borderBottom: '1px solid #f0f3fa' }}>
                          <td colSpan={6} className="px-3 pb-4">
                            <div className="rounded-xl p-3" style={{ background: '#f7f9fd' }}>
                              {!list ? (
                                <p className="text-xs px-1 py-2" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>
                              ) : list.length === 0 ? (
                                <p className="text-xs px-1 py-2" style={{ color: '#6b7a9b', ...bodyFont }}>
                                  {kw.status === 'done'
                                    ? 'Aucune proposition pour ce pilier.'
                                    : 'Pas encore de propositions — lancez l\'agent pour analyser ce mot-clé.'}
                                </p>
                              ) : (
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                                      <Th>Rédiger</Th>
                                      <Th>Mot-clé proposé</Th>
                                      <Th>Volume / mois</Th>
                                      <Th>Difficulté (KD)</Th>
                                      <Th>Concurrence</Th>
                                      <Th>CPC</Th>
                                      <Th>Intention</Th>
                                      <Th>Origine</Th>
                                      <Th>Tendance 12 m</Th>
                                      <Th>Statut</Th>
                                      <Th>Article</Th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {list.map((s) => {
                                      const locked = s.status === 'writing' || s.status === 'written';
                                      return (
                                        <tr key={s.id} style={{ borderBottom: '1px solid #eef1f8' }}>
                                          <Td>
                                            <input
                                              type="checkbox"
                                              checked={s.status === 'selected' || locked}
                                              disabled={locked}
                                              onChange={() => toggleSuggestion(s)}
                                              className="w-4 h-4 accent-[#005064] cursor-pointer disabled:cursor-not-allowed" />
                                          </Td>
                                          <Td>
                                            <span className="font-semibold" style={headingFont}>{s.kw}</span>
                                            {s.status === 'error' && s.error_message && (
                                              <span className="block text-xs mt-0.5" style={{ color: '#a12626' }}>{s.error_message}</span>
                                            )}
                                          </Td>
                                          <Td>{s.volume.toLocaleString('fr-FR')}</Td>
                                          <Td>{s.kd}/100</Td>
                                          <Td>{Math.round(s.competition * 100)} %</Td>
                                          <Td>{s.cpc ? `${s.cpc.toFixed(2)} €` : '—'}</Td>
                                          <Td>{INTENT_LABELS[s.intent] ?? s.intent}</Td>
                                          <Td>{SUGGESTION_SOURCE[s.source] ?? s.source}</Td>
                                          <Td><TrendCell trendJson={s.trend_12m} /></Td>
                                          <Td><SeoBadge meta={SUGGESTION_STATUS} value={s.status} /></Td>
                                          <Td>
                                            {s.article_id ? (
                                              <button
                                                type="button"
                                                onClick={() => openPreview(s.article_id)}
                                                className="inline-flex items-center gap-1 text-xs font-bold underline"
                                                style={{ color: '#005064', ...headingFont }}>
                                                <Eye className="w-3.5 h-3.5" />
                                                Voir
                                              </button>
                                            ) : '—'}
                                          </Td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Lancement de la rédaction des mots-clés sélectionnés */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: '#f0f3fa' }}>
          <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
            Dépliez un pilier analysé, cochez les mots-clés à transformer en articles
            (<strong>5 à 10 mots-clés proches conseillés</strong> — les recherches sont
            mutualisées, le coût marginal est faible), puis lancez la rédaction.
            {selectedCount > 0 && (
              <strong style={{ color: '#005064' }}> {selectedCount} sélectionné(s).</strong>
            )}
          </p>
          <button
            type="button"
            onClick={launch}
            disabled={!config.agent_enabled || Boolean(activeRun) || launching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            <PenLine className="w-4 h-4" />
            Rédiger les articles sélectionnés
          </button>
        </div>
      </Card>

      {/* --- Section 2 : planning de publication ----------------------- */}
      <Card title="Planning de publication">
        {articles.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
            Aucun article généré pour l'instant — ils arrivent ici au statut « À valider » après chaque run.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                  <Th>Titre</Th>
                  <Th>Mot-clé</Th>
                  <Th>Statut</Th>
                  <Th>Publication planifiée</Th>
                  <Th>Créé le</Th>
                  <Th>Publié</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => {
                  const published = article.status === 'published';
                  return (
                    <tr key={article.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                      <Td className="max-w-[280px]">
                        <button
                          type="button"
                          onClick={() => openPreview(article.id)}
                          className="block max-w-full truncate font-semibold underline text-left"
                          title={article.title}
                          style={{ color: '#001a4a', ...headingFont }}>
                          {article.title}
                        </button>
                      </Td>
                      <Td>{article.keyword}</Td>
                      <Td><SeoBadge meta={ARTICLE_STATUS} value={article.status} /></Td>
                      <Td>
                        {published ? formatDate(article.publish_at) : (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="w-4 h-4 shrink-0" style={{ color: '#6b7a9b' }} />
                            <input
                              type="datetime-local"
                              value={publishEdits[article.id] ?? toLocalInput(article.publish_at)}
                              onChange={(e) => setPublishEdits((prev) => ({ ...prev, [article.id]: e.target.value }))}
                              onBlur={() => savePublishAt(article)}
                              className="rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[#005064]"
                              style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
                          </span>
                        )}
                      </Td>
                      <Td>{formatDate(article.created_at)}</Td>
                      <Td>
                        {article.cms_url ? (
                          <a href={article.cms_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: '#005064' }}>
                            {formatDate(article.published_at)}
                          </a>
                        ) : formatDate(article.published_at)}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        {!published && article.status !== 'validated' && (
                          <button
                            type="button"
                            onClick={() => setArticleStatus(article, 'validated')}
                            className="text-xs font-bold mr-3"
                            style={{ color: '#116632', ...headingFont }}>
                            Valider
                          </button>
                        )}
                        {!published && article.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setArticleStatus(article, 'rejected')}
                            className="text-xs font-bold mr-3"
                            style={{ color: '#a12626', ...headingFont }}>
                            Rejeter
                          </button>
                        )}
                        {!published && article.status !== 'pending' && (
                          <button
                            type="button"
                            onClick={() => setArticleStatus(article, 'pending')}
                            className="text-xs font-bold mr-3"
                            style={{ color: '#6b7a9b', ...headingFont }}>
                            Attente
                          </button>
                        )}
                        {!published && (
                          <button
                            type="button"
                            onClick={() => publishNow(article)}
                            title="Publier immédiatement sur le blog, sans attendre le run planifié"
                            className="inline-flex items-center gap-1 text-xs font-bold mr-3 px-2.5 py-1 rounded-lg"
                            style={{ background: '#005064', color: 'white', ...headingFont }}>
                            <Send className="w-3 h-3" />
                            Publier maintenant
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openPreview(article.id)}
                          title="Prévisualiser l'article"
                          className="inline-flex items-center text-xs font-bold"
                          style={{ color: '#005064', ...headingFont }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
          Seuls les articles <strong>validés</strong> sont publiés, à partir de leur date de publication
          (avec un délai aléatoire de 1 à 40 minutes après chaque run).
        </p>
      </Card>

      {preview && <PreviewModal article={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
