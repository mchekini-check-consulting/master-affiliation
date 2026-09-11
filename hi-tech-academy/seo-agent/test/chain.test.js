// Test d'intégration de la chaîne complète (agents/index.js) :
// veille → analyse → sélection → rédaction → dépôt de l'article,
// avec DataForSEO et LLM mockés, plus le mode inactif (variables manquantes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAgents } from '../src/agents/index.js';
import { createMemorySnapshotStore } from '../src/snapshots.js';
import { createPublisher } from '../src/publisher.js';

function makeDfs() {
  return {
    async competitorsDomain() {
      return [{ domain: 'concurrent.fr', metrics: { organic: { etv: 500 } } }];
    },
    async rankedKeywords() {
      return [{ ranked_serp_element: { serp_item: { url: 'https://concurrent.fr/guide', etv: 12 } } }];
    },
    async domainIntersection() {
      return [{
        keyword_data: { keyword: 'kubernetes certification prix', keyword_info: { search_volume: 400 } },
        first_domain_serp_element: { etv: 30 },
      }];
    },
    async keywordIdeas() { return [{ keyword: 'formation kubernetes en ligne' }]; },
    async relatedKeywords() { return [{ keyword_data: { keyword: 'apprendre kubernetes' } }]; },
    async searchVolume(kws) {
      return kws.map((kw) => ({ keyword: kw, search_volume: 300, cpc: 2, competition_index: 40 }));
    },
    async bulkKeywordDifficulty(kws) {
      return kws.map((kw) => ({ keyword: kw, keyword_difficulty: 35 }));
    },
    async searchIntent(kws) {
      return kws.map((kw) => ({ keyword: kw, keyword_intent: { label: 'commercial' } }));
    },
    async serpOrganic() {
      return { items: [
        { type: 'organic', url: 'https://concurrent.fr/guide', title: 'Guide', description: '' },
        { type: 'people_also_ask', items: [{ title: 'Quel prérequis ?' }] },
      ] };
    },
    async contentParsing() {
      return { items: [{ page_content: { main_topic: [
        { h_title: 'Intro', primary_content: [{ text: 'mot '.repeat(400).trim() }] },
      ] } }] };
    },
    getTotalCost: () => 0.05,
  };
}

const LLM_RESPONSES = [
  // agent 3 — sélection
  { secondary_kws: ['formation kubernetes en ligne', 'apprendre kubernetes'],
    angle: 'Le comparatif orienté financement OPCO absent du top 10.', target_word_count: 1200 },
  // agent 4 — brief
  { title: 'Formation Kubernetes : programme, prix et financement OPCO',
    meta_description: 'Comparez les formations Kubernetes : programme détaillé, prérequis, prix et prise en charge OPCO pour les salariés et indépendants.',
    slug: 'formation-kubernetes-financement',
    hn_outline: [
      { level: 2, text: 'Pourquoi Kubernetes' }, { level: 2, text: 'Le programme' },
      { level: 2, text: 'Financer avec son OPCO' },
    ],
    faq_questions: ['Quel prérequis ?', 'Quel prix ?', 'Quelle durée ?'] },
  // agent 4 — draft
  { body_md: `# Formation Kubernetes\n\n${'Réponse directe et contenu utile. '.repeat(30)}\n\n## Financer avec son OPCO\n\n[Guide](/financements)`,
    faq: [
      { q: 'Quel prérequis ?', a: 'Linux et Docker.' },
      { q: 'Quel prix ?', a: '1 000 € HT, finançable OPCO.' },
      { q: 'Quelle durée ?', a: '7 heures.' },
    ],
    internal_links: ['/financements'] },
  // agent 4 — audit
  { score: 91, issues: [] },
];

function makeLlm() {
  const responses = [...LLM_RESPONSES];
  return {
    async generateJson(prompt, { validate }) {
      const next = responses.shift();
      if (next === undefined) throw new Error('plus de réponses LLM mockées');
      return validate(next);
    },
  };
}

test('phase recherche : suggestions déposées avec métriques, gap inclus, zéro LLM', async () => {
  const agents = createAgents({
    dfs: makeDfs(),
    llm: { async generateJson() { throw new Error('le LLM ne doit pas être appelé en recherche'); } },
    snapshots: createMemorySnapshotStore(),
  });
  assert.equal(agents.implemented, true);
  assert.equal(agents.getCost(), 0.05);

  const replaced = [];
  const steps = [];
  const ctx = {
    api: {
      async replaceSuggestions(keywordId, entries) { replaced.push({ keywordId, entries }); return entries; },
      async createArticle() { throw new Error('pas d\'article en phase recherche'); },
    },
    updateStep: (s) => steps.push(s),
    log: () => {},
  };

  const result = await agents.researchKeyword(ctx, { id: 'kw-1', keyword: 'formation kubernetes' });

  assert.equal(replaced.length, 1);
  assert.equal(replaced[0].keywordId, 'kw-1');
  assert.equal(result.suggestionsCount, replaced[0].entries.length);
  const kws = replaced[0].entries.map((e) => e.kw);
  assert.equal(kws[0], 'formation kubernetes'); // le pilier en tête
  assert.ok(kws.includes('kubernetes certification prix')); // le gap de la veille
  const seed = replaced[0].entries[0];
  assert.equal(seed.volume, 300);
  assert.equal(seed.kd, 35);
  assert.equal(seed.intent, 'commercial');
  assert.equal(seed.source, 'seed');
  assert.ok(steps.some((s) => s.includes('Agent 1')));
  assert.ok(steps.some((s) => s.includes('Agent 2')));
});

test('phase rédaction : la suggestion sélectionnée devient un article (mot-clé affiché = la suggestion)', async () => {
  const agents = createAgents({
    dfs: makeDfs(),
    llm: makeLlm(),
    snapshots: createMemorySnapshotStore(),
  });

  const posted = [];
  const steps = [];
  const ctx = {
    api: {
      async replaceSuggestions() { throw new Error('pas de dépôt en phase rédaction'); },
      async createArticle(payload) { posted.push(payload); return { id: 'article-1', ...payload }; },
    },
    updateStep: (s) => steps.push(s),
    log: () => {},
  };

  const result = await agents.writeSuggestion(ctx,
      { id: 's1', keyword_id: 'kw-1', kw: 'formation kubernetes cpf', status: 'selected' });

  assert.equal(result.articleId, 'article-1');
  const article = posted[0];
  assert.equal(article.keyword_id, 'kw-1');
  assert.equal(article.keyword, 'formation kubernetes cpf'); // la suggestion, pas le pilier
  assert.equal(article.slug, 'formation-kubernetes-financement');
  assert.equal(article.audit_score, 91);
  assert.equal(article.schema_org['@graph'][1]['@type'], 'FAQPage');

  // les 4 agents passent, dans l'ordre
  const order = ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Dépôt'];
  const firstIndex = order.map((label) => steps.findIndex((s) => s.includes(label)));
  assert.ok(firstIndex.every((i) => i >= 0), `étapes vues : ${steps.join(' | ')}`);
  assert.deepEqual([...firstIndex].sort((a, b) => a - b), firstIndex);
});

test('veille mutualisée : un seul passage pour plusieurs recherches du même run', async () => {
  const dfs = makeDfs();
  let watchCalls = 0;
  const original = dfs.competitorsDomain;
  dfs.competitorsDomain = async (...args) => { watchCalls++; return original(...args); };

  const agents = createAgents({ dfs, llm: makeLlm(), snapshots: createMemorySnapshotStore() });
  const ctx = {
    api: { async replaceSuggestions(id, entries) { return entries; } },
    updateStep: () => {},
    log: () => {},
  };
  await agents.researchKeyword(ctx, { id: 'kw-1', keyword: 'formation kubernetes' });
  await agents.researchKeyword(ctx, { id: 'kw-2', keyword: 'formation ia' });

  assert.equal(watchCalls, 1); // la veille n'a tourné qu'une fois
});

test('veille en échec : la recherche continue sans gap', async () => {
  const dfs = makeDfs();
  dfs.competitorsDomain = async () => { throw new Error('DataForSEO 50000'); };
  const agents = createAgents({ dfs, llm: makeLlm(), snapshots: createMemorySnapshotStore() });

  const replaced = [];
  const ctx = {
    api: { async replaceSuggestions(id, entries) { replaced.push(entries); return entries; } },
    updateStep: () => {},
    log: () => {},
  };
  const result = await agents.researchKeyword(ctx, { id: 'kw-1', keyword: 'formation kubernetes' });
  assert.ok(result.suggestionsCount > 0);
  assert.ok(!replaced[0].some((e) => e.source === 'gap')); // pas de gap, pas d'échec
});

test('variables manquantes : chaîne inactive, zéro consommation', async () => {
  const saved = { ...process.env };
  delete process.env.DATAFORSEO_LOGIN;
  delete process.env.DATAFORSEO_PASSWORD;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  try {
    const agents = createAgents({});
    assert.equal(agents.implemented, false);
    const research = await agents.researchKeyword({}, { keyword: 'x' });
    assert.equal(research.implemented, false);
    assert.match(research.reason, /DATAFORSEO_LOGIN/);
    assert.match(research.reason, /CLAUDE_CODE_OAUTH_TOKEN/);
    const writing = await agents.writeSuggestion({}, { kw: 'x' });
    assert.equal(writing.implemented, false);
  } finally {
    Object.assign(process.env, saved);
  }
});

test('publisher : URL publique construite depuis le slug', async () => {
  const publisher = createPublisher({ baseUrl: 'https://hi-tech-academy.fr/' });
  assert.equal(publisher.isConfigured(), true);
  assert.equal(
      await publisher.publishArticle({ id: 'a1', slug: 'formation-kubernetes-financement' }),
      'https://hi-tech-academy.fr/blog/formation-kubernetes-financement');
  await assert.rejects(() => publisher.publishArticle({ id: 'a2' }), /sans slug/);
});
