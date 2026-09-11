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

test('chaîne complète : article déposé avec audit et mots-clés de gap intégrés', async () => {
  const agents = createAgents({
    dfs: makeDfs(),
    llm: makeLlm(),
    snapshots: createMemorySnapshotStore(),
  });
  assert.equal(agents.implemented, true);
  assert.equal(agents.getCost(), 0.05);

  const posted = [];
  const steps = [];
  const ctx = {
    api: { async createArticle(payload) { posted.push(payload); return { id: 'article-1', ...payload }; } },
    updateStep: (s) => steps.push(s),
    log: () => {},
  };

  const result = await agents.processKeyword(ctx, { id: 'kw-1', keyword: 'formation kubernetes' });

  assert.equal(result.articleId, 'article-1');
  assert.equal(posted.length, 1);
  const article = posted[0];
  assert.equal(article.keyword_id, 'kw-1');
  assert.match(article.title, /^Formation Kubernetes/);
  assert.equal(article.slug, 'formation-kubernetes-financement');
  assert.equal(article.audit_score, 91);
  assert.equal(article.schema_org['@graph'][1]['@type'], 'FAQPage');

  // les 4 agents sont passés, dans l'ordre
  const order = ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Dépôt'];
  const firstIndex = order.map((label) => steps.findIndex((s) => s.includes(label)));
  assert.ok(firstIndex.every((i) => i >= 0), `étapes vues : ${steps.join(' | ')}`);
  assert.deepEqual([...firstIndex].sort((a, b) => a - b), firstIndex);
});

test('veille en échec : le pipeline continue sans gap', async () => {
  const dfs = makeDfs();
  dfs.competitorsDomain = async () => { throw new Error('DataForSEO 50000'); };
  const agents = createAgents({ dfs, llm: makeLlm(), snapshots: createMemorySnapshotStore() });

  const posted = [];
  const ctx = {
    api: { async createArticle(p) { posted.push(p); return { id: 'article-2' }; } },
    updateStep: () => {},
    log: () => {},
  };
  const result = await agents.processKeyword(ctx, { id: 'kw-1', keyword: 'formation kubernetes' });
  assert.equal(result.articleId, 'article-2');
});

test('variables manquantes : chaîne inactive, zéro consommation', async () => {
  const saved = { ...process.env };
  delete process.env.DATAFORSEO_LOGIN;
  delete process.env.DATAFORSEO_PASSWORD;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  try {
    const agents = createAgents({});
    assert.equal(agents.implemented, false);
    const out = await agents.processKeyword({}, { keyword: 'x' });
    assert.equal(out.implemented, false);
    assert.match(out.reason, /DATAFORSEO_LOGIN/);
    assert.match(out.reason, /CLAUDE_CODE_OAUTH_TOKEN/);
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
