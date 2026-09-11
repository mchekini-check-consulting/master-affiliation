// Agent 4 — rédaction. Pipeline interne : brief (depuis la SERP réelle en
// mode Standard + parsing du top 10) → draft → auto-audit → une itération de
// correction si le score est < 80 → sortie au contrat (l'orchestrateur la
// dépose ensuite via POST /api/seo/articles, statut to_validate).
// Les standards de qualité du brief (structure, contenu, maillage, GEO) sont
// encodés dans le prompt système et vérifiés par l'auto-audit.

import { validateAgent4Brief, validateAgent4Output } from '../contracts.js';

const DEFAULTS = {
  parseTopN: 5,        // pages du top 10 analysées via content_parsing
  auditThreshold: 80,  // sous ce score : une itération de correction
};

const WRITER_SYSTEM = `Tu es le rédacteur SEO senior de Hi-Tech Academy,
organisme de formation certifié Qualiopi (formations Kubernetes, IA,
facturation électronique / Pennylane — 100 % à distance, finançables OPCO).

Standards de qualité NON NÉGOCIABLES :
STRUCTURE — un seul H1 (le titre, mot-clé principal au début) ; hiérarchie
Hn logique (H2 sections, H3 sous-parties) avec mots-clés secondaires quand
c'est naturel ; réponse directe à l'intention de recherche dans les 100
premiers mots ; longueur cible respectée sans remplissage.
CONTENU — mot-clé principal dans le premier paragraphe, densité naturelle
(0,5-1,5 %), zéro bourrage ; couvrir les entités et questions PAA fournies ;
paragraphes ≤ 4 lignes, phrases ≤ 25 mots ; listes et tableaux quand ils
clarifient ; faits vérifiables et datés, AUCUNE statistique inventée (une
donnée non sourcée se formule comme estimation ou s'omet) ; ton expert mais
accessible, pas de tournures génériques d'IA (« dans le monde d'aujourd'hui »,
« il est important de noter »…) ; 2 à 4 liens sortants vers des sites
d'autorité (sources officielles françaises de préférence).
MAILLAGE — 3 à 5 liens internes choisis UNIQUEMENT dans la liste fournie,
intégrés naturellement dans le corps en Markdown.
GEO — chaque section répond de façon autonome et citable à une question ;
définitions explicites, listes numérotées pour les processus, tableaux
comparatifs ; mentionner l'expertise Hi-Tech Academy quand c'est pertinent,
sans autopromotion lourde.
FIN D'ARTICLE — section FAQ reprenant exactement les questions du brief.
Tu réponds UNIQUEMENT en JSON valide, sans texte autour.`;

/** Slug propre : minuscules, sans accents ni stop-words vides, tirets. */
export function slugify(text) {
  return String(text)
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/['’ʼ]/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .split('-')
      .filter((w) => !['le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'en', 'a', 'au', 'aux', 'pour', 'sur', 'dans'].includes(w))
      .join('-') || 'article';
}

// --- Extraction défensive des données SERP / parsing ---------------------

export function extractSerpData(serp) {
  const items = serp?.items ?? [];
  const organic = items.filter((i) => i?.type === 'organic').slice(0, 10)
      .map((i) => ({ url: i.url, title: i.title, description: i.description ?? '' }));
  const paa = items.filter((i) => i?.type === 'people_also_ask')
      .flatMap((i) => i.items ?? [])
      .map((q) => q?.title ?? q?.question ?? null)
      .filter(Boolean);
  const related = items.filter((i) => i?.type === 'related_searches')
      .flatMap((i) => i.items ?? [])
      .map((r) => (typeof r === 'string' ? r : r?.title))
      .filter(Boolean);
  const featured = items.find((i) => i?.type === 'featured_snippet') ?? null;
  return { organic, paa, related, featuredSnippet: featured ? { title: featured.title, description: featured.description ?? '' } : null };
}

/** Hn et volume de texte d'une page parsée (structure content_parsing). */
export function extractParsedPage(parsed, url) {
  const headings = [];
  let words = 0;
  const walk = (node) => {
    if (node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node.h_title === 'string' && node.h_title.trim()) {
      headings.push(node.h_title.trim());
    }
    if (typeof node.text === 'string') {
      words += node.text.split(/\s+/).filter(Boolean).length;
    }
    Object.values(node).forEach(walk);
  };
  walk(parsed?.items ?? parsed);
  return { url, headings, wordCount: words };
}

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

// --- Agent -----------------------------------------------------------------

export function createWriteAgent(options) {
  const { dfs, llm, internalPages = [], log = () => {} } = options;
  const config = { ...DEFAULTS, ...options };

  return {
    /** @param selection sortie de l'agent 3 (pillar_kw, secondary_kws, angle…) */
    async write(selection, { updateStep = () => {} } = {}) {
      const pillar = selection.pillar_kw;

      // 1. SERP réelle (mode Standard, file d'attente)
      await updateStep(`Agent 4 — SERP Google pour « ${pillar} »`);
      const serp = await dfs.serpOrganic(pillar);
      const { organic, paa, related, featuredSnippet } = extractSerpData(serp);

      // 2. Parsing du top de la SERP (structure Hn + longueur)
      await updateStep('Agent 4 — analyse des pages du top 10');
      const parsedPages = [];
      for (const page of organic.slice(0, config.parseTopN)) {
        try {
          parsedPages.push(extractParsedPage(await dfs.contentParsing(page.url), page.url));
        } catch (err) {
          log(`content_parsing en échec pour ${page.url} : ${err.message}`);
        }
      }
      const medianWords = median(parsedPages.map((p) => p.wordCount).filter((w) => w > 100));
      const targetWords = medianWords ?? selection.target_word_count;

      // 3. Brief SEO (LLM, contrat validé, relance si invalide)
      await updateStep('Agent 4 — rédaction du brief SEO');
      const competitorOutline = parsedPages
          .map((p) => `• ${p.url} (~${p.wordCount} mots) : ${p.headings.slice(0, 8).join(' | ')}`)
          .join('\n');
      const briefPrompt = `Prépare le brief SEO d'un article pour Hi-Tech Academy.

Mot-clé principal : "${pillar}" (intention : ${selection.intent})
Mots-clés secondaires : ${selection.secondary_kws.join(', ')}
Angle éditorial imposé : ${selection.angle}
Longueur cible : ${targetWords} mots (médiane du top 10 ±20 %)

Top 10 actuel :
${organic.map((o) => `• ${o.title} — ${o.url}`).join('\n') || '(SERP vide)'}

Structures des concurrents analysés :
${competitorOutline || '(aucune page analysée)'}

Questions « Autres questions posées » (PAA) : ${paa.join(' ; ') || '(aucune)'}
Recherches associées : ${related.join(' ; ') || '(aucune)'}
${featuredSnippet ? `Featured snippet actuel : ${featuredSnippet.title}` : ''}

Contraintes : title de 50 à 60 caractères commençant par le mot-clé principal ;
meta_description de 140 à 155 caractères, incitative, mot-clé inclus ; slug
court en minuscules sans stop-words ; plan Hn qui couvre l'angle, les
secondaires et les questions PAA ; 3 à 5 questions de FAQ issues des PAA.

Réponds uniquement avec cet objet JSON :
{"title": "...", "meta_description": "...", "slug": "...",
 "hn_outline": [{"level": 2, "text": "..."}, {"level": 3, "text": "..."}],
 "faq_questions": ["..."]}`;
      const brief = await llm.generateJson(briefPrompt, {
        system: WRITER_SYSTEM,
        validate: validateAgent4Brief,
      });

      // 4. Rédaction complète
      await updateStep('Agent 4 — rédaction de l\'article');
      const draftPrompt = `Rédige l'article complet en Markdown à partir de ce brief.

Titre (H1 unique) : ${brief.title}
Plan Hn imposé :
${brief.hn_outline.map((h) => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}
Questions FAQ imposées (section « FAQ » en fin d'article + réponses concises) :
${brief.faq_questions.map((q) => `• ${q}`).join('\n')}

Mot-clé principal : "${pillar}" — secondaires : ${selection.secondary_kws.join(', ')}
Angle : ${selection.angle}
Longueur cible : ${targetWords} mots ±20 %.

Pages internes Hi-Tech Academy disponibles pour le maillage (3 à 5 liens,
uniquement dans cette liste) :
${internalPages.map((p) => `• ${p.url} — ${p.label}`).join('\n') || '(aucune)'}

Réponds uniquement avec cet objet JSON :
{"body_md": "# ... (article complet en Markdown, H1 inclus)",
 "faq": [{"q": "...", "a": "..."}],
 "internal_links": ["/chemin-1", "/chemin-2"]}`;
      const validateDraft = (out) => {
        if (typeof out.body_md !== 'string' || out.body_md.trim().length < 500) {
          throw new Error('body_md doit faire au moins 500 caractères');
        }
        if (!Array.isArray(out.faq) || out.faq.length < 3
            || out.faq.some((f) => !f?.q?.trim?.() || !f?.a?.trim?.())) {
          throw new Error('faq doit contenir au moins 3 paires { q, a } non vides');
        }
        if (!Array.isArray(out.internal_links)) {
          throw new Error('internal_links doit être un tableau');
        }
        return out;
      };
      let draft = await llm.generateJson(draftPrompt, {
        system: WRITER_SYSTEM,
        validate: validateDraft,
      });

      // 5. Auto-audit, puis une itération de correction si score < seuil
      await updateStep('Agent 4 — auto-audit de l\'article');
      const auditOnce = (body) => llm.generateJson(
          `Audite cet article par rapport aux standards du système (structure,
contenu, maillage, GEO) et au brief (mot-clé "${pillar}", ${targetWords} mots
±20 %, FAQ, 3-5 liens internes). Note de 0 à 100 et liste des problèmes
concrets et actionnables (vide si rien à signaler).

ARTICLE :
${body}

Réponds uniquement avec : {"score": 87, "issues": ["..."]}`,
          {
            system: WRITER_SYSTEM,
            validate: (out) => {
              if (typeof out.score !== 'number' || out.score < 0 || out.score > 100) {
                throw new Error('score doit être un nombre entre 0 et 100');
              }
              if (!Array.isArray(out.issues)) throw new Error('issues doit être un tableau');
              return out;
            },
          });

      let audit = await auditOnce(draft.body_md);
      if (audit.score < config.auditThreshold) {
        await updateStep(`Agent 4 — correction (audit ${audit.score}/100)`);
        log(`audit ${audit.score} < ${config.auditThreshold}, itération de correction`);
        draft = await llm.generateJson(
            `${draftPrompt}\n\nTa première version a obtenu ${audit.score}/100.
Problèmes à corriger impérativement :\n${audit.issues.map((i) => `• ${i}`).join('\n')}
Réponds avec le même format JSON, article corrigé.`,
            { system: WRITER_SYSTEM, validate: validateDraft });
        audit = await auditOnce(draft.body_md);
      }

      // 6. Données structurées (générées côté code : zéro erreur de syntaxe)
      const faq = draft.faq.slice(0, 5);
      const schemaOrg = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: brief.title,
            description: brief.meta_description,
            author: { '@type': 'Organization', name: 'Hi-Tech Academy' },
            publisher: { '@type': 'Organization', name: 'Hi-Tech Academy' },
            inLanguage: 'fr-FR',
          },
          {
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ],
      };

      return validateAgent4Output({
        keyword_id: selection.keyword_id ?? null,
        title: brief.title.trim(),
        meta_description: brief.meta_description.trim(),
        slug: slugify(brief.slug),
        hn_outline: brief.hn_outline,
        body_md: draft.body_md,
        internal_links: draft.internal_links,
        faq,
        schema_org: schemaOrg,
        audit,
      });
    },
  };
}
