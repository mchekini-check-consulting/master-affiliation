// Tests de l'agent 4 (rédaction : brief → draft → audit → correction)
// sur DataForSEO et LLM mockés.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWriteAgent, slugify, extractSerpData, extractParsedPage, parseDraft } from '../src/agents/write.js';

// --- Données mockées -------------------------------------------------------

const SERP = {
  keyword: 'formation kubernetes',
  items: [
    { type: 'organic', url: 'https://a.fr/k8s', title: 'Guide Kubernetes A', description: 'desc A' },
    { type: 'organic', url: 'https://b.fr/k8s', title: 'Formation B', description: 'desc B' },
    { type: 'people_also_ask', items: [{ title: 'Quel prérequis pour Kubernetes ?' }, { title: 'Kubernetes est-il éligible au CPF ?' }] },
    { type: 'related_searches', items: ['formation kubernetes gratuite', { title: 'kubernetes certification' }] },
  ],
};

const PARSED = {
  items: [{
    page_content: {
      main_topic: [
        { h_title: 'Pourquoi Kubernetes', level: 2, primary_content: [{ text: 'mot '.repeat(300).trim() }] },
        { h_title: 'Se former', level: 2, primary_content: [{ text: 'mot '.repeat(200).trim() }] },
      ],
    },
  }],
};

const BRIEF = {
  title: 'Formation Kubernetes : le guide complet pour se lancer en 2026',
  meta_description: 'Programme, prérequis, financement OPCO : tout pour choisir votre formation Kubernetes et devenir opérationnel rapidement.',
  slug: 'formation-kubernetes-guide',
  hn_outline: [
    { level: 2, text: 'Pourquoi se former à Kubernetes' },
    { level: 2, text: 'Quel programme choisir' },
    { level: 3, text: 'Les prérequis' },
    { level: 2, text: 'Financer sa formation (OPCO)' },
  ],
  faq_questions: ['Quel prérequis pour Kubernetes ?', 'Kubernetes est-il éligible au CPF ?', 'Combien de temps pour apprendre ?'],
};

const DRAFT_TEXT = `===ARTICLE===
# Formation Kubernetes : le guide complet

${'Contenu utile et vérifiable. '.repeat(40)}

## Financer sa formation

Voir [le guide](/financements).
===FAQ===
Q: Quel prérequis pour Kubernetes ?
R: Linux et Docker de base.
Q: Kubernetes est-il éligible au CPF ?
R: Le financement passe surtout par votre OPCO.
Q: Combien de temps pour apprendre ?
R: Environ 7 h pour les fondamentaux.
===LIENS===
/financements
/formations/kubernetes-fondamentaux`;

function makeDfs() {
  const calls = [];
  return {
    calls,
    async serpOrganic(kw) { calls.push({ fn: 'serpOrganic', kw }); return SERP; },
    async contentParsing(url) { calls.push({ fn: 'contentParsing', url }); return PARSED; },
  };
}

/** LLM mocké : file d'objets pour generateJson, file de textes pour generate. */
function makeLlm(jsonResponses, textResponses = [DRAFT_TEXT]) {
  const calls = [];
  const textCalls = [];
  return {
    calls, textCalls,
    async generateJson(prompt, { validate }) {
      calls.push(prompt);
      const next = jsonResponses.shift();
      if (next === undefined) throw new Error('makeLlm : plus de réponses JSON en file');
      return validate(next);
    },
    async generate(prompt) {
      textCalls.push(prompt);
      const next = textResponses.shift();
      if (next === undefined) throw new Error('makeLlm : plus de réponses texte en file');
      return next;
    },
  };
}

const SELECTION = {
  keyword_id: 'kw-1',
  pillar_kw: 'formation kubernetes',
  secondary_kws: ['formation kubernetes cpf'],
  intent: 'commercial',
  angle: 'Le guide orienté financement OPCO.',
  target_word_count: 1400,
  avg_kd: 40,
};

// --- Extraction ------------------------------------------------------------

test('extractSerpData : organiques, PAA, recherches associées', () => {
  const { organic, paa, related } = extractSerpData(SERP);
  assert.equal(organic.length, 2);
  assert.equal(organic[0].url, 'https://a.fr/k8s');
  assert.deepEqual(paa, ['Quel prérequis pour Kubernetes ?', 'Kubernetes est-il éligible au CPF ?']);
  assert.deepEqual(related, ['formation kubernetes gratuite', 'kubernetes certification']);
});

test('extractParsedPage : Hn et volume de mots', () => {
  const page = extractParsedPage(PARSED, 'https://a.fr/k8s');
  assert.deepEqual(page.headings, ['Pourquoi Kubernetes', 'Se former']);
  assert.equal(page.wordCount, 500);
});

test('slugify : accents, apostrophes, stop-words', () => {
  assert.equal(slugify("Formation Kubernetes : le guide complet"), 'formation-kubernetes-guide-complet');
  assert.equal(slugify("L'IA générative en entreprise"), 'l-ia-generative-entreprise');
  assert.equal(slugify('***'), 'article');
});

// --- Pipeline --------------------------------------------------------------

test('parseDraft : format balisé nominal, erreurs précises sinon', () => {
  const parsed = parseDraft(DRAFT_TEXT);
  assert.match(parsed.body_md, /^# Formation Kubernetes/);
  assert.equal(parsed.faq.length, 3);
  assert.equal(parsed.faq[0].q, 'Quel prérequis pour Kubernetes ?');
  assert.deepEqual(parsed.internal_links, ['/financements', '/formations/kubernetes-fondamentaux']);

  assert.throws(() => parseDraft('# Article sans balises'), /===ARTICLE===/);
  assert.throws(() => parseDraft(`===ARTICLE===\n${'x '.repeat(300)}\n===FAQ===\nQ: une seule ?\nR: oui.\n===LIENS===\n/a`), /FAQ.*incomplète/s);
});

test('pipeline nominal : SERP → parsing → brief → draft → audit ≥ 80 (pas de correction)', async () => {
  const dfs = makeDfs();
  const llm = makeLlm([BRIEF, { score: 88, issues: [] }]);
  const steps = [];
  const agent = createWriteAgent({ dfs, llm, internalPages: [{ url: '/financements', label: 'Financements' }] });
  const article = await agent.write(SELECTION, { updateStep: (s) => steps.push(s) });

  assert.equal(article.keyword_id, 'kw-1');
  assert.equal(article.title, BRIEF.title);
  assert.equal(article.slug, 'formation-kubernetes-guide');
  assert.equal(article.audit.score, 88);
  assert.equal(llm.calls.length, 2);     // brief + audit (JSON)
  assert.equal(llm.textCalls.length, 1); // draft (format balisé)
  assert.match(llm.textCalls[0], /===ARTICLE===/); // le format est exigé dans le prompt
  assert.equal(dfs.calls.filter((c) => c.fn === 'contentParsing').length, 2); // top 2 organiques
  assert.ok(steps.some((s) => /SERP Google/.test(s)));
  assert.ok(steps.some((s) => /auto-audit/.test(s)));

  // schema.org généré côté code : Article + FAQPage alignée sur la FAQ
  const graph = article.schema_org['@graph'];
  assert.equal(graph[0]['@type'], 'Article');
  assert.equal(graph[0].headline, BRIEF.title);
  assert.equal(graph[1]['@type'], 'FAQPage');
  assert.equal(graph[1].mainEntity.length, 3);
  assert.equal(graph[1].mainEntity[0].name, 'Quel prérequis pour Kubernetes ?');
});

test('brouillon illisible : une relance avec l\'erreur, puis succès', async () => {
  const dfs = makeDfs();
  const llm = makeLlm(
      [BRIEF, { score: 90, issues: [] }],
      ['Voici votre article : blabla sans balises', DRAFT_TEXT]);
  const agent = createWriteAgent({ dfs, llm });
  const article = await agent.write(SELECTION);

  assert.equal(llm.textCalls.length, 2); // draft invalide + relance
  assert.match(llm.textCalls[1], /sortie précédente était invalide/);
  assert.equal(article.audit.score, 90);
});

test('audit < 80 : une itération de correction puis re-audit', async () => {
  const dfs = makeDfs();
  const corrected = DRAFT_TEXT.replace('## Financer sa formation',
      '## Section corrigée\n\nAjout demandé par l\'audit.\n\n## Financer sa formation');
  const llm = makeLlm(
      [BRIEF, { score: 62, issues: ['Pas de réponse directe dans les 100 premiers mots'] }, { score: 85, issues: [] }],
      [DRAFT_TEXT, corrected]);
  const agent = createWriteAgent({ dfs, llm });
  const article = await agent.write(SELECTION);

  assert.equal(llm.textCalls.length, 2); // draft + correction
  assert.match(llm.textCalls[1], /62\/100/); // le score est renvoyé au modèle
  assert.match(llm.textCalls[1], /100 premiers mots/); // les problèmes aussi
  assert.equal(article.audit.score, 85);
  assert.match(article.body_md, /Section corrigée/);
});

test('longueur cible : médiane du top 10 parsé, sinon celle de l\'agent 3', async () => {
  const dfs = makeDfs();
  const llm = makeLlm([BRIEF, { score: 90, issues: [] }]);
  const agent = createWriteAgent({ dfs, llm });
  await agent.write(SELECTION);
  assert.match(llm.calls[0], /Longueur cible : 500 mots/); // médiane des pages parsées (500)

  // SERP sans pages parsables → repli sur target_word_count de l'agent 3
  const dfsVide = {
    async serpOrganic() { return { items: [] }; },
    async contentParsing() { throw new Error('inaccessible'); },
  };
  const llm2 = makeLlm([BRIEF, { score: 90, issues: [] }]);
  const agent2 = createWriteAgent({ dfs: dfsVide, llm: llm2 });
  await agent2.write(SELECTION);
  assert.match(llm2.calls[0], /Longueur cible : 1400 mots/);
});

test('échec de parsing d\'une page : ignoré, le pipeline continue', async () => {
  const dfs = makeDfs();
  dfs.contentParsing = async (url) => {
    if (url.includes('a.fr')) throw new Error('403');
    return PARSED;
  };
  const llm = makeLlm([BRIEF, { score: 90, issues: [] }]);
  const agent = createWriteAgent({ dfs, llm });
  const article = await agent.write(SELECTION);
  assert.equal(article.audit.score, 90);
});

test('slug du brief nettoyé au contrat (minuscules-tirets)', async () => {
  const dfs = makeDfs();
  const brief = { ...BRIEF, slug: "Le Slug Invalide ! Éé" };
  const llm = makeLlm([brief, { score: 90, issues: [] }]);
  const agent = createWriteAgent({ dfs, llm });
  const article = await agent.write(SELECTION);
  assert.match(article.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});
