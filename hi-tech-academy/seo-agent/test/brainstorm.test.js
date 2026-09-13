// Tests du brainstorm LLM (proposition de mots-clés ancrée sur le site).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBrainstormAgent } from '../src/agents/brainstorm.js';
import { opportunityScore } from '../src/agents/analyze.js';

function makeLlm(response) {
  const calls = [];
  return {
    calls,
    async generateJson(prompt, { system, validate }) {
      calls.push({ prompt, system });
      return validate(response);
    },
  };
}

test('le prompt ancre sur le site : catalogue dans le système, pilier et gap dans la demande', async () => {
  const llm = makeLlm({ keywords: Array.from({ length: 15 }, (_, i) => `Requête ${i}`) });
  const agent = createBrainstormAgent({ llm });
  await agent.generate('comparateur modèles ia', {
    gapKeywords: [{ kw: 'meilleur llm 2026', gap_score: 10 }],
  });

  const call = llm.calls[0];
  assert.match(call.system, /Hi-Tech Academy/);
  assert.match(call.system, /Kubernetes/);
  assert.match(call.system, /Facturation électronique/);
  assert.match(call.prompt, /comparateur modèles ia/);
  assert.match(call.prompt, /meilleur llm 2026/); // le gap sert d'inspiration
});

test('sortie nettoyée : minuscules, dédoublonnée', async () => {
  const llm = makeLlm({ keywords: [
    'ChatGPT en Entreprise', 'chatgpt en entreprise', '  formation ia  ',
    ...Array.from({ length: 10 }, (_, i) => `requête ${i}`),
  ] });
  const agent = createBrainstormAgent({ llm });
  const out = await agent.generate('formation ia');

  assert.equal(out.filter((k) => k === 'chatgpt en entreprise').length, 1);
  assert.ok(out.includes('formation ia'));
  assert.ok(out.every((k) => k === k.toLowerCase().trim()));
});

test('moins de 10 requêtes → sortie invalide (relance côté llm réel)', async () => {
  const llm = {
    async generateJson(prompt, { validate }) {
      return validate({ keywords: ['une', 'deux'] });
    },
  };
  const agent = createBrainstormAgent({ llm });
  await assert.rejects(() => agent.generate('formation ia'), /au moins 10/);
});

// --- Score d'opportunité ----------------------------------------------------

test('opportunityScore : volume élevé + faible concurrence/difficulté = meilleur score', () => {
  const pepite = opportunityScore({ volume: 1000, kd: 15, competition: 0.1 });
  const dur = opportunityScore({ volume: 1000, kd: 85, competition: 0.9 });
  const confidentiel = opportunityScore({ volume: 10, kd: 15, competition: 0.1 });
  assert.ok(pepite > dur, `${pepite} > ${dur}`);
  assert.ok(pepite > confidentiel, `${pepite} > ${confidentiel}`);
  assert.ok(dur < 10);
});

test('opportunityScore : borné 0-100, sûr sur données manquantes', () => {
  assert.equal(opportunityScore({}), 0);
  assert.equal(opportunityScore({ volume: 0, kd: 0, competition: 0 }), 0);
  const max = opportunityScore({ volume: 10_000_000, kd: 0, competition: 0 });
  assert.ok(max <= 100);
  assert.ok(opportunityScore({ volume: 500, kd: 120, competition: 2 }) >= 0);
});
