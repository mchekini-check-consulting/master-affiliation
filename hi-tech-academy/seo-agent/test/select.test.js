// Tests de l'agent 3 (sélection & clustering) sur LLM mocké.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSelectAgent } from '../src/agents/select.js';

const entry = (kw, { volume = 100, kd = 40, intent = 'commercial', source = 'ideas', gap = 0 } = {}) => ({
  kw, volume, cpc: 1, competition: 0.5, kd, intent, trend_12m: [], gap_score: gap, source,
});

const analysis = (keywords, keywordId = 'kw-1') => ({ keyword_id: keywordId, keywords });

function makeLlm(responses) {
  const calls = [];
  return {
    calls,
    async generateJson(prompt, { validate }) {
      calls.push(prompt);
      return validate(responses.shift());
    },
  };
}

test('sélection nominale : secondaires filtrés, intent et avg_kd calculés côté code', async () => {
  const llm = makeLlm([{
    secondary_kws: ['formation kubernetes cpf', 'apprendre kubernetes', 'mot inventé par le llm'],
    angle: 'Le guide financement OPCO que le top 10 ne couvre pas.',
    target_word_count: 1400,
  }]);
  const agent = createSelectAgent({ llm });
  const out = await agent.select(analysis([
    entry('formation kubernetes', { kd: 50, intent: 'commercial', source: 'seed' }),
    entry('formation kubernetes cpf', { kd: 30 }),
    entry('apprendre kubernetes', { kd: 40, intent: 'informational' }),
  ]));

  assert.equal(out.keyword_id, 'kw-1');
  assert.equal(out.pillar_kw, 'formation kubernetes');
  // le mot inventé est écarté (uniquement des candidats réels)
  assert.deepEqual(out.secondary_kws, ['formation kubernetes cpf', 'apprendre kubernetes']);
  assert.equal(out.intent, 'commercial'); // celui du pilier, pas du LLM
  assert.equal(out.avg_kd, 40); // (50 + 30 + 40) / 3
  assert.equal(out.target_word_count, 1400);
});

test('le pilier ne peut pas être choisi comme secondaire', async () => {
  const llm = makeLlm([{
    secondary_kws: ['Formation Kubernetes', 'formation kubernetes cpf'],
    angle: 'Un angle suffisamment long pour le contrat.',
    target_word_count: 1200,
  }]);
  const agent = createSelectAgent({ llm });
  const out = await agent.select(analysis([
    entry('formation kubernetes', { source: 'seed' }),
    entry('formation kubernetes cpf'),
  ]));
  assert.deepEqual(out.secondary_kws, ['formation kubernetes cpf']);
});

test('sélection LLM entièrement hors candidats : repli déterministe (top volume, même intention)', async () => {
  const llm = makeLlm([{
    secondary_kws: ['inventé 1', 'inventé 2'],
    angle: 'Un angle suffisamment long pour le contrat.',
    target_word_count: 1200,
  }]);
  const agent = createSelectAgent({ llm });
  const out = await agent.select(analysis([
    entry('pilier', { intent: 'commercial', source: 'seed' }),
    entry('candidat a', { volume: 900, intent: 'commercial' }),
    entry('candidat b', { volume: 500, intent: 'informational' }),
    entry('candidat c', { volume: 100, intent: 'commercial' }),
  ]));
  assert.deepEqual(out.secondary_kws, ['candidat a', 'candidat c']); // même intention, tri volume
});

test('target_word_count hors bornes → repli sur l\'intention du pilier', async () => {
  const llm = makeLlm([{
    secondary_kws: ['candidat a'],
    angle: 'Un angle suffisamment long pour le contrat.',
    target_word_count: 99999,
  }]);
  const agent = createSelectAgent({ llm });
  const out = await agent.select(analysis([
    entry('pilier', { intent: 'informational', source: 'seed' }),
    entry('candidat a'),
  ]));
  assert.equal(out.target_word_count, 1600); // défaut informational
});

test('sortie de l\'agent 2 invalide → rejet à la réception (contrat)', async () => {
  const agent = createSelectAgent({ llm: makeLlm([]) });
  await assert.rejects(
      () => agent.select({ keyword_id: 'x', keywords: [] }),
      /Contrat agent 2 invalide/);
});

test('maxSecondary borne le cluster', async () => {
  const many = Array.from({ length: 12 }, (_, i) => `candidat ${i}`);
  const llm = makeLlm([{
    secondary_kws: many,
    angle: 'Un angle suffisamment long pour le contrat.',
    target_word_count: 1200,
  }]);
  const agent = createSelectAgent({ llm, maxSecondary: 4 });
  const out = await agent.select(analysis([
    entry('pilier', { source: 'seed' }),
    ...many.map((kw) => entry(kw)),
  ]));
  assert.equal(out.secondary_kws.length, 4);
});
