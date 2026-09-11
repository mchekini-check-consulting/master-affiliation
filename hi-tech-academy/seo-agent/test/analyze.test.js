// Tests de l'agent 2 (analyse volumes & concurrence) sur wrapper mocké,
// et du contrat JSON strict de sa sortie.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAnalyzeAgent, relevanceFilter } from '../src/agents/analyze.js';
import { validateAgent2Output } from '../src/contracts.js';

// --- Wrapper DataForSEO mocké -------------------------------------------

function makeDfs({ ideas = [], related = [], volumes = {}, kds = {}, intents = {} } = {}) {
  const calls = [];
  return {
    calls,
    async keywordIdeas(seeds, params) {
      calls.push({ fn: 'keywordIdeas', seeds, params });
      return ideas.map((kw) => ({ keyword: kw }));
    },
    async relatedKeywords(seed, params) {
      calls.push({ fn: 'relatedKeywords', seed, params });
      return related.map((kw) => ({ keyword_data: { keyword: kw } }));
    },
    async searchVolume(kws) {
      calls.push({ fn: 'searchVolume', kws });
      return kws.map((kw) => volumes[kw] !== undefined ? { keyword: kw, ...volumes[kw] } : null);
    },
    async bulkKeywordDifficulty(kws) {
      calls.push({ fn: 'bulkKeywordDifficulty', kws });
      return kws.map((kw) => kds[kw] !== undefined ? { keyword: kw, keyword_difficulty: kds[kw] } : null);
    },
    async searchIntent(kws) {
      calls.push({ fn: 'searchIntent', kws });
      return kws.map((kw) => intents[kw] !== undefined
          ? { keyword: kw, keyword_intent: { label: intents[kw] } } : null);
    },
  };
}

// --- Agent 2 --------------------------------------------------------------

test('sortie au contrat : seed en tête, champs enrichis', async () => {
  const dfs = makeDfs({
    ideas: ['formation kubernetes cpf'],
    related: ['apprendre kubernetes'],
    volumes: {
      'formation kubernetes': { search_volume: 1900, cpc: 4.2, competition_index: 67 },
      'formation kubernetes cpf': { search_volume: 320, cpc: 5.1, competition_index: 80 },
      'apprendre kubernetes': { search_volume: 590, cpc: 1.1, competition_index: 12 },
    },
    kds: { 'formation kubernetes': 45, 'formation kubernetes cpf': 30, 'apprendre kubernetes': 25 },
    intents: {
      'formation kubernetes': 'commercial',
      'formation kubernetes cpf': 'transactional',
      'apprendre kubernetes': 'informational',
    },
  });
  const agent = createAnalyzeAgent({ dfs });
  const output = await agent.analyze('formation kubernetes', { keywordId: 'kw-1' });

  assert.equal(output.keyword_id, 'kw-1');
  assert.equal(output.keywords.length, 3);

  const [seed, second, third] = output.keywords;
  assert.equal(seed.kw, 'formation kubernetes');
  assert.equal(seed.source, 'seed');
  assert.equal(seed.volume, 1900);
  assert.equal(seed.cpc, 4.2);
  assert.equal(seed.competition, 0.67);
  assert.equal(seed.kd, 45);
  assert.equal(seed.intent, 'commercial');

  // le reste est trié par volume décroissant
  assert.equal(second.kw, 'apprendre kubernetes');
  assert.equal(second.source, 'related');
  assert.equal(third.kw, 'formation kubernetes cpf');
  assert.equal(third.source, 'ideas');
});

test('dédoublonnage : un candidat déjà vu garde sa première source', async () => {
  const dfs = makeDfs({
    ideas: ['Formation Kubernetes', 'kubernetes débutant'], // doublon du seed (casse différente)
    related: ['kubernetes débutant'],                        // doublon d'ideas
    volumes: { 'formation kubernetes': { search_volume: 10 }, 'kubernetes débutant': { search_volume: 5 } },
  });
  const agent = createAnalyzeAgent({ dfs });
  const output = await agent.analyze('formation kubernetes');

  assert.equal(output.keywords.length, 2);
  assert.equal(output.keywords[0].source, 'seed');
  assert.equal(output.keywords[1].kw, 'kubernetes débutant');
  assert.equal(output.keywords[1].source, 'ideas'); // ideas avant related
});

test('mots-clés de gap (agent 1) : source gap et gap_score conservés', async () => {
  const dfs = makeDfs({ volumes: {
    seed: { search_volume: 1 }, 'seed simple': { search_volume: 2 }, 'seed scoré': { search_volume: 3 },
  } });
  const agent = createAnalyzeAgent({ dfs });
  const output = await agent.analyze('seed', {
    gapKeywords: ['seed simple', { kw: 'seed scoré', gap_score: 42.5 }],
  });

  const byKw = Object.fromEntries(output.keywords.map((e) => [e.kw, e]));
  assert.equal(byKw['seed simple'].source, 'gap');
  assert.equal(byKw['seed simple'].gap_score, 0);
  assert.equal(byKw['seed scoré'].source, 'gap');
  assert.equal(byKw['seed scoré'].gap_score, 42.5);
});

test('trend_12m : monthly_searches (récent → ancien) rendu chronologique', async () => {
  const dfs = makeDfs({ volumes: { seed: {
    search_volume: 100,
    monthly_searches: [
      { year: 2026, month: 8, search_volume: 130 },
      { year: 2026, month: 7, search_volume: 120 },
      { year: 2025, month: 9, search_volume: 90 },
    ],
  } } });
  const agent = createAnalyzeAgent({ dfs });
  const output = await agent.analyze('seed');
  assert.deepEqual(output.keywords[0].trend_12m, [90, 120, 130]);
});

test('données manquantes : défauts sûrs (0 / unknown / tendance vide)', async () => {
  const dfs = makeDfs(); // aucun endpoint ne connaît le mot-clé
  const agent = createAnalyzeAgent({ dfs });
  const output = await agent.analyze('mot-clé inconnu');

  const seed = output.keywords[0];
  assert.equal(seed.volume, 0);
  assert.equal(seed.cpc, 0);
  assert.equal(seed.competition, 0);
  assert.equal(seed.kd, 0);
  assert.equal(seed.intent, 'unknown');
  assert.deepEqual(seed.trend_12m, []);
});

test('maxCandidates borne l\'univers enrichi (maîtrise du coût)', async () => {
  const dfs = makeDfs({
    ideas: Array.from({ length: 50 }, (_, i) => `seed idée ${i}`),
    volumes: { seed: { search_volume: 1 } },
  });
  const agent = createAnalyzeAgent({ dfs, maxCandidates: 10 });
  await agent.analyze('seed');

  const enriched = dfs.calls.find((c) => c.fn === 'searchVolume').kws;
  assert.equal(enriched.length, 10); // seed + 9 idées
});

test('maxResults borne la sortie mais garde toujours le seed', async () => {
  const dfs = makeDfs({
    ideas: Array.from({ length: 20 }, (_, i) => `seed idée ${i}`),
    volumes: Object.fromEntries([
      ['seed', { search_volume: 0 }], // seed sans volume : gardé quand même
      ...Array.from({ length: 20 }, (_, i) => [`seed idée ${i}`, { search_volume: 1000 - i }]),
    ]),
  });
  const agent = createAnalyzeAgent({ dfs, maxResults: 5 });
  const output = await agent.analyze('seed');

  assert.equal(output.keywords.length, 5);
  assert.equal(output.keywords[0].kw, 'seed');
  assert.equal(output.keywords[1].kw, 'seed idée 0'); // plus gros volume ensuite
});

test('paramètres transmis au wrapper : limit ideas/related, profondeur', async () => {
  const dfs = makeDfs({ volumes: { seed: { search_volume: 1 } } });
  const agent = createAnalyzeAgent({ dfs, ideasLimit: 77, relatedLimit: 33, relatedDepth: 3 });
  await agent.analyze('seed');

  const ideasCall = dfs.calls.find((c) => c.fn === 'keywordIdeas');
  assert.deepEqual(ideasCall.seeds, ['seed']);
  assert.equal(ideasCall.params.limit, 77);
  const relatedCall = dfs.calls.find((c) => c.fn === 'relatedKeywords');
  assert.equal(relatedCall.params.limit, 33);
  assert.equal(relatedCall.params.depth, 3);
});

test('mot-clé pilier manquant → erreur', async () => {
  const agent = createAnalyzeAgent({ dfs: makeDfs() });
  await assert.rejects(() => agent.analyze('   '), /pilier manquant/);
});

// --- Filtre de pertinence ---------------------------------------------------

test('relevanceFilter : les hors-sujet sont écartés, les variantes gardées', () => {
  const relevant = relevanceFilter('formation sur le raf');
  // « formation » est générique : le terme distinctif requis est « raf »
  assert.equal(relevant('youtube'), false);
  assert.equal(relevant('formation excel'), false);
  assert.equal(relevant('fiche métier raf'), true);
  assert.equal(relevant('responsable administratif et financier raf'), true);
  assert.equal(relevant('salaire raf'), true);

  const kube = relevanceFilter('formation kubernetes cpf');
  assert.equal(kube('apprendre kubernetes'), true);
  assert.equal(kube('certification kubernetes cka'), true); // racine kube- partagée
  assert.equal(kube('formation cpf comptabilité'), false);  // cpf est générique
  assert.equal(kube('meilleure formation en ligne'), false);
});

test('relevanceFilter : pilier 100 % générique → repli sur tous ses termes', () => {
  const relevant = relevanceFilter('formation cpf');
  assert.equal(relevant('formation éligible cpf'), true);
  assert.equal(relevant('youtube'), false);
});

test('l\'univers de candidats est filtré : hors-sujet ideas et gap écartés', async () => {
  const dfs = makeDfs({
    ideas: ['youtube', 'formation raf à distance', 'recette de cuisine'],
    related: ['salaire raf débutant'],
    volumes: {
      'formation sur le raf': { search_volume: 90 },
      'formation raf à distance': { search_volume: 50 },
      'salaire raf débutant': { search_volume: 30 },
      'missions du raf': { search_volume: 20 },
    },
  });
  const agent = createAnalyzeAgent({ dfs });
  const output = await agent.analyze('formation sur le raf', {
    gapKeywords: [{ kw: 'missions du raf', gap_score: 5 }, { kw: 'linkedin connexion', gap_score: 99 }],
  });

  const kws = output.keywords.map((k) => k.kw);
  assert.deepEqual(kws, [
    'formation sur le raf', 'formation raf à distance', 'salaire raf débutant', 'missions du raf',
  ]);
  // seuls les mots-clés pertinents ont été enrichis (coût maîtrisé)
  const enriched = dfs.calls.find((c) => c.fn === 'searchVolume').kws;
  assert.ok(!enriched.includes('youtube'));
  assert.ok(!enriched.includes('linkedin connexion'));
});

test('keyword_ideas est appelé en variantes proches (closely_variants)', async () => {
  const dfs = makeDfs({ volumes: { seed: { search_volume: 1 } } });
  const agent = createAnalyzeAgent({ dfs });
  await agent.analyze('seed');
  assert.equal(dfs.calls.find((c) => c.fn === 'keywordIdeas').params.closely_variants, true);
});

// --- Contrat ---------------------------------------------------------------

const validEntry = {
  kw: 'formation kubernetes', volume: 1900, cpc: 4.2, competition: 0.67,
  kd: 45, intent: 'commercial', trend_12m: [100, 120], gap_score: 0, source: 'seed',
};

test('contrat : sortie valide acceptée et renvoyée telle quelle', () => {
  const output = { keyword_id: 'id', keywords: [validEntry] };
  assert.equal(validateAgent2Output(output), output);
});

test('contrat : écarts détectés et listés', () => {
  assert.throws(() => validateAgent2Output({ keyword_id: 'id', keywords: [] }), /tableau non vide/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, kw: '' }] }), /kw doit être/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, volume: -1 }] }), /volume/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, competition: 2 }] }), /competition/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, kd: 101 }] }), /kd/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, intent: 'buying' }] }), /intent/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, source: 'serp' }] }), /source/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, trend_12m: Array(13).fill(1) }] }), /trend_12m/);
  assert.throws(() => validateAgent2Output({ keywords: [{ ...validEntry, gap_score: -1 }] }), /gap_score/);
});

test('contrat : plusieurs écarts remontés ensemble', () => {
  try {
    validateAgent2Output({ keyword_id: 42, keywords: [{ ...validEntry, kd: -5, intent: 'x' }] });
    assert.fail('aurait dû lever');
  } catch (err) {
    assert.match(err.message, /keyword_id/);
    assert.match(err.message, /kd/);
    assert.match(err.message, /intent/);
  }
});
